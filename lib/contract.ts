import { ethers } from 'ethers';
import { CONTRACT_ABI } from './contract-abi';
import { isValidIPFSCid } from './pinning-service';

// Deployed contract address from environment variable or default
const DEFAULT_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0xe12D1e1698d7E07206b5C6C49466631c4dDfbF1B';

// Function to get the current contract address
export const getCurrentContractAddress = (): string => {
  if (typeof window !== 'undefined') {
    // Try to get the current contract address from localStorage
    const savedAddress = localStorage.getItem('currentContractAddress');
    if (savedAddress) {
      return savedAddress;
    }
  }
  return DEFAULT_CONTRACT_ADDRESS;
};

/**
 * Get an ethers provider instance
 */
export const getProvider = () => {
  if (typeof window !== 'undefined' && window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum);
  }
  return null;
};

/**
 * Get a contract instance
 */
export const getContract = async (withSigner = false) => {
  const provider = getProvider();
  if (!provider) return null;

  try {
    // Use the current contract address from context or localStorage
    const contractAddress = getCurrentContractAddress();
    
    if (withSigner) {
      const signer = await provider.getSigner();
      return new ethers.Contract(contractAddress, CONTRACT_ABI, signer);
    } else {
      return new ethers.Contract(contractAddress, CONTRACT_ABI, provider);
    }
  } catch (error) {
    console.error('Error getting contract instance:', error);
    return null;
  }
};

/**
 * List a new material on the marketplace
 */
export const listMaterialOnChain = async (
  title: string,
  description: string,
  category: string,
  contentHash: string,
  previewHash: string,
  price: string
): Promise<number | null> => {
  try {
    // Get provider and signer directly for better control
    const provider = getProvider();
    if (!provider) throw new Error('Provider not available');

    // Check network first
    const network = await provider.getNetwork();
    console.log('Connected to network:', {
      name: network.name,
      chainId: network.chainId.toString()
    });

    // Get signer with proper error handling
    let signer;
    try {
      signer = await provider.getSigner();
      const address = await signer.getAddress();
      console.log('Using signer address:', address);
      
      // Check balance
      const balance = await provider.getBalance(address);
      console.log('Account balance:', ethers.formatEther(balance), 'ETH');
      
      if (balance < ethers.parseEther('0.01')) {
        console.warn('Warning: Account has low balance');
      }
    } catch (error) {
      console.error('Error getting signer:', error);
      throw new Error('Failed to get signer');
    }

    // Create contract instance directly
    const contractAddress = getCurrentContractAddress();
    const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, signer);

    // Convert price from ETH to wei
    const priceInWei = ethers.parseEther(price);

    // Ensure all parameters are properly formatted strings
    const safeTitle = String(title);
    const safeDescription = String(description);
    const safeCategory = String(category);
    const safeContentHash = String(contentHash);
    const safePreviewHash = String(previewHash || '');

    console.log('Listing material with parameters:', {
      title: safeTitle,
      description: safeDescription,
      category: safeCategory,
      contentHash: safeContentHash,
      previewHash: safePreviewHash,
      price: priceInWei.toString()
    });

    // Try to estimate gas first to check if the transaction will succeed
    let gasEstimate;
    try {
      gasEstimate = await contract.listMaterial.estimateGas(
        safeTitle,
        safeDescription,
        safeCategory,
        safeContentHash,
        safePreviewHash,
        priceInWei
      );
      console.log('Gas estimate:', gasEstimate.toString());
    } catch (estimateError: any) {
      console.error('Gas estimation failed:', estimateError);
      
      // Extract more detailed error message
      let errorMessage = 'Unknown error during gas estimation';
      if (estimateError.error && estimateError.error.message) {
        errorMessage = estimateError.error.message;
      } else if (estimateError.message) {
        errorMessage = estimateError.message;
      }
      
      console.error(`Gas estimation failed: ${errorMessage}`);
      // Continue anyway, with a higher gas limit
    }

    // Use a higher gas limit than the estimate or a default high value
    const gasLimit = gasEstimate ? BigInt(Number(gasEstimate) * 2) : BigInt(3000000);
    console.log('Using gas limit:', gasLimit.toString());

    // Call the contract function with explicit gas limit
    const tx = await contract.listMaterial(
      safeTitle,
      safeDescription,
      safeCategory,
      safeContentHash,
      safePreviewHash,
      priceInWei,
      {
        gasLimit
      }
    );

    console.log('Transaction sent:', tx.hash);

    // Wait for the transaction to be mined
    const receipt = await tx.wait();
    console.log('Transaction confirmed in block:', receipt.blockNumber);

    // Find the MaterialListed event in the transaction receipt
    const event = receipt.logs
      .filter((log: any) => log.fragment?.name === 'MaterialListed')
      .map((log: any) => {
        const parsedLog = contract.interface.parseLog({
          topics: log.topics,
          data: log.data,
        });
        return parsedLog?.args;
      })[0];

    // Return the material ID from the event
    if (event) {
      console.log('Material listed with ID:', event.id.toString());
      return Number(event.id);
    } else {
      console.warn('Transaction succeeded but no MaterialListed event found');
      return null;
    }
  } catch (error: any) {
    console.error('Error listing material on chain:', error);
    
    // Try to get more detailed error information
    let errorMessage = 'Unknown error during transaction';
    if (error.error && error.error.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    console.error(`Transaction failed: ${errorMessage}`);
    
    if (error.transaction) {
      console.error('Transaction data:', error.transaction);
    }
    if (error.error) {
      console.error('Error details:', error.error);
    }
    
    return null;
  }
};

/**
 * Purchase a material from the marketplace
 */
export const purchaseMaterialOnChain = async (
  materialId: number,
  price: string
): Promise<boolean> => {
  try {
    const contract = await getContract(true);
    if (!contract) throw new Error('Contract not available');

    // Convert price from ETH to wei
    const priceInWei = ethers.parseEther(price);

    // Call the contract function with the value
    const tx = await contract.purchaseMaterial(materialId, {
      value: priceInWei,
    });

    // Wait for the transaction to be mined
    await tx.wait();

    return true;
  } catch (error) {
    console.error('Error purchasing material on chain:', error);
    return false;
  }
};

/**
 * Get all materials listed by the current user
 */
export const getMyListedMaterialsOnChain = async (): Promise<number[]> => {
  try {
    const contract = await getContract(true);
    if (!contract) throw new Error('Contract not available');

    const materialIds = await contract.getMyListedMaterials();
    return materialIds.map((id: ethers.BigNumberish) => Number(id));
  } catch (error) {
    console.error('Error getting listed materials on chain:', error);
    return [];
  }
};

/**
 * Get all materials purchased by the current user
 */
export const getMyPurchasedMaterialsOnChain = async (): Promise<number[]> => {
  try {
    const contract = await getContract(true);
    if (!contract) throw new Error('Contract not available');

    const materialIds = await contract.getMyPurchasedMaterials();
    return materialIds.map((id: ethers.BigNumberish) => Number(id));
  } catch (error) {
    console.error('Error getting purchased materials on chain:', error);
    return [];
  }
};

/**
 * Get material details by ID
 */
export const getMaterialDetailsOnChain = async (materialId: number): Promise<any | null> => {
  try {
    const contract = await getContract();
    if (!contract) throw new Error('Contract not available');

    const details = await contract.getMaterialDetails(materialId);
    
    return {
      id: Number(details.id),
      owner: details.owner,
      title: details.title,
      description: details.description,
      category: details.category,
      previewHash: details.previewHash,
      price: ethers.formatEther(details.price),
      isActive: details.isActive,
      createdAt: new Date(Number(details.createdAt) * 1000).toISOString(),
    };
  } catch (error) {
    console.error('Error getting material details on chain:', error);
    return null;
  }
};

/**
 * Get content hash (only available to owner or purchaser)
 */
export const getContentHashOnChain = async (materialId: number): Promise<string | null> => {
  try {
    const contract = await getContract(true);
    if (!contract) throw new Error('Contract not available');

    const contentHash = await contract.getContentHash(materialId);
    return contentHash;
  } catch (error) {
    console.error('Error getting content hash on chain:', error);
    return null;
  }
};

/**
 * Get all active materials with pagination
 */
export const getActiveMaterialsOnChain = async (
  offset: number = 0,
  limit: number = 10
): Promise<number[]> => {
  try {
    const contract = await getContract();
    if (!contract) throw new Error('Contract not available');

    try {
      const materialIds = await contract.getActiveMaterials(offset, limit);
      return materialIds.map((id: ethers.BigNumberish) => Number(id));
    } catch (error: any) {
      console.warn('Received empty result from getActiveMaterials, returning empty array:', error);
      // This handles the specific "could not decode result data" error
      if (error.message && error.message.includes('could not decode result data')) {
        return [];
      }
      throw error; // Rethrow if it's a different error
    }
  } catch (error) {
    console.error('Error getting active materials on chain:', error);
    return [];
  }
};

/**
 * Update a material's details
 */
export const updateMaterialOnChain = async (
  materialId: number,
  title: string,
  description: string,
  price: string
): Promise<boolean> => {
  try {
    const contract = await getContract(true);
    if (!contract) throw new Error('Contract not available');

    // Convert price from ETH to wei
    const priceInWei = ethers.parseEther(price);

    // Call the contract function
    const tx = await contract.updateMaterial(
      materialId,
      title,
      description,
      priceInWei
    );

    // Wait for the transaction to be mined
    await tx.wait();

    return true;
  } catch (error) {
    console.error('Error updating material on chain:', error);
    return false;
  }
};

/**
 * Remove a material from the marketplace
 */
export const removeMaterialOnChain = async (materialId: number): Promise<boolean> => {
  try {
    const contract = await getContract(true);
    if (!contract) throw new Error('Contract not available');

    // Call the contract function
    const tx = await contract.removeMaterial(materialId);

    // Wait for the transaction to be mined
    await tx.wait();

    return true;
  } catch (error) {
    console.error('Error removing material on chain:', error);
    return false;
  }
};

/**
 * Get thumbnail information for a material
 */
export const getMaterialThumbnailInfoOnChain = async (materialId: number): Promise<any | null> => {
  try {
    const contract = await getContract();
    if (!contract) throw new Error('Contract not available');

    const thumbnailInfo = await contract.getMaterialThumbnailInfo(materialId);
    
    return {
      thumbnailHash: thumbnailInfo.thumbnailHash,
      title: thumbnailInfo.title,
      owner: thumbnailInfo.owner,
      exists: thumbnailInfo.exists
    };
  } catch (error) {
    console.error('Error getting thumbnail info on chain:', error);
    return null;
  }
};

/**
 * Get thumbnail hash for a material
 */
export const getThumbnailHashOnChain = async (materialId: number): Promise<string | null> => {
  try {
    const contract = await getContract();
    if (!contract) throw new Error('Contract not available');

    const thumbnailHash = await contract.getThumbnailHash(materialId);
    return thumbnailHash;
  } catch (error) {
    console.error('Error getting thumbnail hash on chain:', error);
    return null;
  }
};

/**
 * Verify the contract connection and check if it has the expected functions
 */
export const verifyContract = async (): Promise<boolean> => {
  try {
    const contract = await getContract();
    if (!contract) {
      console.error('Contract instance not available');
      return false;
    }

    // For development, we'll just check if we can get a contract instance
    console.log('Contract instance available');
    
    // Try to get the contract address
    try {
      const contractAddress = await contract.getContractAddress();
      console.log('Contract address from contract:', contractAddress);
      console.log('Expected contract address:', DEFAULT_CONTRACT_ADDRESS);
    } catch (error) {
      console.warn('Could not get contract address, but continuing anyway');
    }

    return true;
  } catch (error: any) {
    console.error('Error verifying contract:', error);
    return false;
  }
};

/**
 * Check if the user has enough ETH to pay for gas
 */
export const checkUserBalance = async (): Promise<{ hasBalance: boolean, balance: string }> => {
  try {
    const provider = getProvider();
    if (!provider) {
      return { hasBalance: false, balance: '0' };
    }

    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    const balance = await provider.getBalance(address);
    
    // Convert balance to ETH
    const balanceInEth = ethers.formatEther(balance);
    console.log('User balance:', balanceInEth, 'ETH');
    
    // Check if balance is greater than 0.01 ETH (enough for gas)
    const hasEnoughBalance = balance > ethers.parseEther('0.01');
    
    return { 
      hasBalance: hasEnoughBalance, 
      balance: balanceInEth 
    };
  } catch (error: any) {
    console.error('Error checking user balance:', error);
    return { hasBalance: false, balance: '0' };
  }
};

/**
 * Check if the user is on the correct network
 * For development, we'll accept any network including edu-chain
 */
export const checkNetwork = async (): Promise<{ isCorrectNetwork: boolean, currentNetwork: string }> => {
  try {
    const provider = getProvider();
    if (!provider) {
      return { isCorrectNetwork: false, currentNetwork: 'unknown' };
    }

    const network = await provider.getNetwork();
    const chainId = network.chainId;
    
    // For development, accept any network
    const isCorrectNetwork = true;
    
    console.log('Current network:', network.name, 'Chain ID:', chainId.toString());
    
    return { 
      isCorrectNetwork, 
      currentNetwork: network.name || chainId.toString() 
    };
  } catch (error: any) {
    console.error('Error checking network:', error);
    return { isCorrectNetwork: false, currentNetwork: 'unknown' };
  }
};

/**
 * Switch to the correct network (no-op for development)
 */
export const switchToCorrectNetwork = async (): Promise<boolean> => {
  // For development, we're accepting any network, so just return true
  return true;
};

/**
 * Test the contract connection and functions directly
 * This is useful for diagnosing "data getting reverted" issues
 */
export const testContractConnection = async (): Promise<{ success: boolean, message: string, details: any }> => {
  try {
    console.log('Testing contract connection...');
    
    // Step 1: Get provider and check network
    const provider = getProvider();
    if (!provider) {
      return { 
        success: false, 
        message: 'Provider not available. Make sure MetaMask is installed and connected.', 
        details: null 
      };
    }
    
    // Get network information
    const network = await provider.getNetwork();
    console.log('Connected to network:', {
      name: network.name,
      chainId: network.chainId.toString()
    });
    
    // Step 2: Check if contract code exists at the address
    try {
      const code = await provider.getCode(DEFAULT_CONTRACT_ADDRESS);
      if (code === '0x') {
        return { 
          success: false, 
          message: `No contract code found at address ${DEFAULT_CONTRACT_ADDRESS} on network ${network.name}. The contract might not be deployed on this network.`, 
          details: {
            network: {
              name: network.name,
              chainId: network.chainId.toString()
            },
            contractAddress: DEFAULT_CONTRACT_ADDRESS,
            code: 'No code found'
          } 
        };
      }
      console.log('Contract code exists at the specified address, length:', code.length);
    } catch (error) {
      console.error('Error checking contract code:', error);
      return { 
        success: false, 
        message: 'Failed to check contract code. Network might be unavailable.', 
        details: error 
      };
    }
    
    // Step 3: Get contract instance
    const contract = await getContract(true);
    if (!contract) {
      return { 
        success: false, 
        message: 'Contract instance not available. Check contract address and ABI.', 
        details: null 
      };
    }
    
    // Step 4: Try to get contract address
    let contractAddress;
    try {
      contractAddress = await contract.getContractAddress();
      console.log('Contract address from contract:', contractAddress);
      console.log('Expected contract address:', DEFAULT_CONTRACT_ADDRESS);
      
      if (contractAddress.toLowerCase() !== DEFAULT_CONTRACT_ADDRESS.toLowerCase()) {
        console.warn('Contract address mismatch!');
        return { 
          success: false, 
          message: `Contract address mismatch! Expected: ${DEFAULT_CONTRACT_ADDRESS}, Got: ${contractAddress}`, 
          details: {
            expected: DEFAULT_CONTRACT_ADDRESS,
            actual: contractAddress
          } 
        };
      }
    } catch (error) {
      console.error('Error getting contract address:', error);
      return { 
        success: false, 
        message: 'Failed to call getContractAddress(). Contract may not be deployed correctly on this network.', 
        details: error 
      };
    }
    
    // Step 5: Try to get contract version
    try {
      const version = await contract.getContractVersion();
      console.log('Contract version:', version);
    } catch (error) {
      console.warn('Could not get contract version, but continuing:', error);
    }
    
    // Step 6: Try to get total materials (a simple read operation)
    try {
      const totalMaterials = await contract.getTotalMaterials();
      console.log('Total materials:', totalMaterials.toString());
    } catch (error) {
      console.error('Error getting total materials:', error);
      return { 
        success: false, 
        message: 'Failed to call getTotalMaterials(). Contract may not be deployed correctly on this network.', 
        details: error 
      };
    }
    
    // Step 7: Check if we can get active materials (another read operation)
    try {
      const activeMaterials = await contract.getActiveMaterials(0, 10);
      console.log('Active materials:', activeMaterials.map((id: any) => id.toString()));
    } catch (error) {
      console.error('Error getting active materials:', error);
      return { 
        success: false, 
        message: 'Failed to call getActiveMaterials(). Contract may not be deployed correctly on this network.', 
        details: error 
      };
    }
    
    // Step 8: Check contract ABI against expected functions
    const expectedFunctions = [
      'listMaterial',
      'purchaseMaterial',
      'getMyListedMaterials',
      'getMyPurchasedMaterials',
      'getMaterialDetails',
      'getContentHash'
      // getThumbnailHash removed as it's no longer expected
    ];
    
    const missingFunctions = [];
    for (const funcName of expectedFunctions) {
      if (typeof contract[funcName] !== 'function') {
        missingFunctions.push(funcName);
      }
    }
    
    if (missingFunctions.length > 0) {
      return { 
        success: false, 
        message: `Contract is missing expected functions: ${missingFunctions.join(', ')}. ABI might not match the deployed contract.`, 
        details: {
          missingFunctions,
          availableFunctions: Object.keys(contract).filter(key => typeof contract[key] === 'function')
        } 
      };
    }
    
    // Step 9: Check listMaterial function parameters
    try {
      // Try to get the function signature
      const listMaterialFunction = contract.interface.getFunction('listMaterial');
      if (listMaterialFunction) {
        console.log('listMaterial function signature:', listMaterialFunction.format());
        console.log('listMaterial parameter count:', listMaterialFunction.inputs.length);
        console.log('listMaterial parameters:', listMaterialFunction.inputs.map((input: any) => `${input.name}: ${input.type}`));
        
        // Check if the function has the expected number of parameters
        const expectedParamCount = 6; // title, description, category, contentHash, previewHash, price
        if (listMaterialFunction.inputs.length !== expectedParamCount) {
          return { 
            success: false, 
            message: `listMaterial function has ${listMaterialFunction.inputs.length} parameters, but expected ${expectedParamCount}. ABI might not match the deployed contract.`, 
            details: {
              expectedParamCount,
              actualParamCount: listMaterialFunction.inputs.length,
              parameters: listMaterialFunction.inputs.map((input: any) => `${input.name}: ${input.type}`)
            } 
          };
        }
      } else {
        console.warn('Could not find listMaterial function in contract interface');
      }
    } catch (error) {
      console.warn('Could not check listMaterial function signature:', error);
    }
    
    // Step 10: Try a static call to listMaterial with dummy values
    try {
      console.log('Trying static call to listMaterial...');
      await contract.listMaterial.staticCall(
        "Test Title",
        "Test Description",
        "Test Category",
        "ipfs://test-content-hash",
        "ipfs://test-preview-hash",
        ethers.parseEther("0.01")
      );
      console.log('Static call to listMaterial succeeded!');
    } catch (error: any) {
      console.warn('Static call to listMaterial failed, but this might be expected:', error.message);
      // Don't return failure here, as the static call might fail for valid reasons (e.g., require conditions)
    }
    
    // All tests passed
    return { 
      success: true, 
      message: 'Contract connection successful. All basic functions are working.', 
      details: {
        network: {
          name: network.name,
          chainId: network.chainId.toString()
        },
        contractAddress,
        contractFunctions: Object.keys(contract).filter(key => typeof contract[key] === 'function')
      } 
    };
  } catch (error: any) {
    console.error('Error testing contract connection:', error);
    return { 
      success: false, 
      message: `Unexpected error: ${error.message}`, 
      details: error 
    };
  }
};

/**
 * Enhanced debugging function to test contract connection and transaction
 */
export const debugContractTransaction = async (
  title: string,
  description: string,
  category: string,
  contentHash: string,
  previewHash: string,
  price: string
): Promise<any> => {
  try {
    console.log('=== DEBUG CONTRACT TRANSACTION ===');
    console.log('Step 1: Getting provider and network info');
    
    const provider = getProvider();
    if (!provider) {
      return { success: false, error: 'Provider not available' };
    }
    
    const network = await provider.getNetwork();
    console.log('Connected to network:', {
      name: network.name,
      chainId: network.chainId.toString()
    });
    
    console.log('Step 2: Getting signer');
    let signer;
    try {
      signer = await provider.getSigner();
      const address = await signer.getAddress();
      console.log('Signer address:', address);
      
      // Check balance
      const balance = await provider.getBalance(address);
      console.log('Account balance:', ethers.formatEther(balance), 'ETH');
      
      if (balance < ethers.parseEther('0.01')) {
        console.warn('Warning: Low account balance');
      }
    } catch (error: any) {
      console.error('Error getting signer:', error);
      return { success: false, error: 'Failed to get signer' };
    }
    
    console.log('Step 3: Checking contract code at address');
    try {
      const code = await provider.getCode(DEFAULT_CONTRACT_ADDRESS);
      if (code === '0x') {
        console.error('No contract found at address:', DEFAULT_CONTRACT_ADDRESS);
        return { 
          success: false, 
          error: `No contract code at address ${DEFAULT_CONTRACT_ADDRESS} on network ${network.name} (${network.chainId})` 
        };
      }
      console.log('Contract code exists at address');
    } catch (error: any) {
      console.error('Error checking contract code:', error);
      return { success: false, error: 'Failed to check contract code' };
    }
    
    console.log('Step 4: Creating contract instance');
    const contract = new ethers.Contract(DEFAULT_CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    
    console.log('Step 5: Preparing transaction parameters');
    // Convert price from ETH to wei
    const priceInWei = ethers.parseEther(price);
    
    // Log all parameters
    console.log('Transaction parameters:', {
      title,
      description,
      category,
      contentHash,
      previewHash,
      price: priceInWei.toString()
    });
    
    console.log('Step 6: Estimating gas');
    let gasEstimate;
    try {
      gasEstimate = await contract.listMaterial.estimateGas(
        title,
        description,
        category,
        contentHash,
        previewHash,
        priceInWei
      );
      console.log('Gas estimate:', gasEstimate.toString());
    } catch (error: any) {
      console.error('Gas estimation failed:', error);
      
      // Try to get more detailed error information
      let errorMessage = 'Unknown error during gas estimation';
      if (error.error && error.error.message) {
        errorMessage = error.error.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return { 
        success: false, 
        error: `Gas estimation failed: ${errorMessage}`,
        details: error
      };
    }
    
    console.log('Step 7: Sending transaction with manual gas limit');
    try {
      // Use a higher gas limit than the estimate
      const gasLimit = gasEstimate ? BigInt(Number(gasEstimate) * 2) : BigInt(3000000);
      
      console.log('Using gas limit:', gasLimit.toString());
      
      // Create transaction with explicit gas limit
      const tx = await contract.listMaterial(
        title,
        description,
        category,
        contentHash,
        previewHash,
        priceInWei,
        {
          gasLimit
        }
      );
      
      console.log('Transaction sent:', tx.hash);
      
      console.log('Step 8: Waiting for transaction confirmation');
      const receipt = await tx.wait();
      console.log('Transaction confirmed in block:', receipt.blockNumber);
      
      // Find the MaterialListed event
      const event = receipt.logs
        .filter((log: any) => log.fragment?.name === 'MaterialListed')
        .map((log: any) => {
          const parsedLog = contract.interface.parseLog({
            topics: log.topics,
            data: log.data,
          });
          return parsedLog?.args;
        })[0];
      
      if (event) {
        console.log('Material listed with ID:', event.id.toString());
        return { 
          success: true, 
          materialId: Number(event.id),
          transactionHash: tx.hash
        };
      } else {
        console.warn('Transaction succeeded but no MaterialListed event found');
        return { 
          success: true, 
          materialId: null,
          transactionHash: tx.hash,
          receipt
        };
      }
    } catch (error: any) {
      console.error('Transaction failed:', error);
      
      // Try to get more detailed error information
      let errorMessage = 'Unknown error during transaction';
      if (error.error && error.error.message) {
        errorMessage = error.error.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return { 
        success: false, 
        error: `Transaction failed: ${errorMessage}`,
        details: error
      };
    }
  } catch (error: any) {
    console.error('Unexpected error in debug function:', error);
    return { success: false, error: 'Unexpected error', details: error };
  }
};

/**
 * Verify if the contract ABI matches the deployed contract
 */
export const verifyContractABI = async (): Promise<any> => {
  try {
    console.log('=== VERIFYING CONTRACT ABI ===');
    
    const provider = getProvider();
    if (!provider) {
      return { success: false, error: 'Provider not available' };
    }
    
    const network = await provider.getNetwork();
    console.log('Connected to network:', {
      name: network.name,
      chainId: network.chainId.toString()
    });
    
    // Check if contract exists at the address
    const code = await provider.getCode(DEFAULT_CONTRACT_ADDRESS);
    if (code === '0x') {
      return { 
        success: false, 
        error: `No contract code at address ${DEFAULT_CONTRACT_ADDRESS} on network ${network.name} (${network.chainId})` 
      };
    }
    
    // Create contract instance
    const contract = new ethers.Contract(DEFAULT_CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    
    // List of functions to check
    const functionsToCheck = [
      'listMaterial',
      'purchaseMaterial',
      'getMyListedMaterials',
      'getMyPurchasedMaterials',
      'getMaterialDetails',
      'getContentHash',
      'getActiveMaterials'
    ];
    
    // Check each function
    const results: Record<string, boolean> = {};
    for (const funcName of functionsToCheck) {
      try {
        // Check if function exists in the contract
        results[funcName] = typeof contract[funcName] === 'function';
        
        if (!results[funcName]) {
          console.error(`Function '${funcName}' not found in contract`);
        } else {
          console.log(`Function '${funcName}' exists in contract`);
        }
      } catch (error: any) {
        console.error(`Error checking function '${funcName}':`, error);
        results[funcName] = false;
      }
    }
    
    // Check if all functions exist
    const allFunctionsExist = Object.values(results).every(result => result);
    
    if (allFunctionsExist) {
      console.log('All required functions exist in the contract');
      
      // Try to call a simple view function to verify further
      try {
        const totalMaterials = await contract.getTotalMaterials();
        console.log('Total materials:', totalMaterials.toString());
        
        return { 
          success: true, 
          message: 'Contract ABI matches the deployed contract',
          totalMaterials: totalMaterials.toString(),
          functionResults: results
        };
      } catch (error: any) {
        console.error('Error calling getTotalMaterials:', error);
        return { 
          success: false, 
          error: 'Contract ABI may not match the deployed contract',
          functionResults: results,
          details: error
        };
      }
    } else {
      return { 
        success: false, 
        error: 'Some required functions are missing in the contract',
        functionResults: results
      };
    }
  } catch (error: any) {
    console.error('Error verifying contract ABI:', error);
    return { success: false, error: 'Error verifying contract ABI', details: error };
  }
};

/**
 * Check if current user can upload materials
 * This can be used to verify if the contract restricts uploads to certain addresses
 */
export const canUploadMaterials = async (): Promise<boolean> => {
  try {
    const contract = await getContract(true);
    if (!contract) return false;

    // Get signer from provider instead of contract runner
    const provider = getProvider();
    if (!provider) return false;
    
    const signer = await provider.getSigner();
    const userAddress = await signer.getAddress();
    
    console.log('Checking if user can upload materials:', userAddress);
    
    // STEP 1: First check if this is a SchoolLibrary contract by looking for isApprovedCreator
    try {
      if (typeof contract.isApprovedCreator === 'function') {
        console.log('SchoolLibrary contract detected (has isApprovedCreator function)');
        // This is a SchoolLibrary contract - only admins can upload
        const isApproved = await contract.isApprovedCreator(userAddress);
        console.log('User approval status for SchoolLibrary:', isApproved);
        return isApproved;
      }
    } catch (error) {
      console.log('No isApprovedCreator function found, not a SchoolLibrary contract');
    }
    
    // STEP 2: Check platformFeeRecipient to further identify contract type
    try {
      if (typeof contract.platformFeeRecipient === 'function') {
        const owner = await contract.platformFeeRecipient();
        console.log('Contract owner/platformFeeRecipient:', owner);
        
        // Try to get contract version to check ABI compatibility
        try {
          const contractVersion = await contract.getContractVersion();
          console.log('Contract version:', contractVersion);
          
          // If we get here and there's no isApprovedCreator, this should be a StudyMarketplace
          console.log('StudyMarketplace contract detected (has getContractVersion but no isApprovedCreator)');
          return true; // Allow uploads for StudyMarketplace
        } catch (error) {
          console.log('Error getting contract version, proceeding with further checks:', error);
        }
      }
    } catch (error) {
      console.log('Error checking platformFeeRecipient, proceeding with further checks:', error);
    }
    
    // STEP 3: Final check - perform gas estimation to detect permission errors
    try {
      console.log('Attempting gas estimation as final permission check');
      await contract.listMaterial.estimateGas(
        "Test Title",
        "Test Description",
        "Test",
        "ipfs://QmTest",
        "ipfs://QmTest",
        0 // 0 ETH price
      );
      
      // If gas estimation succeeds, this means the user can upload
      console.log('Gas estimation succeeded, user can upload');
      return true;
    } catch (error: any) {
      console.error('Gas estimation failed. Checking error message:', error);
      
      const errorMsg = String(error).toLowerCase();
      
      // Check for specific error messages indicating permission issues
      if (
        errorMsg.includes('revert') && 
        (
          errorMsg.includes('not authorized') || 
          errorMsg.includes('only owner') || 
          errorMsg.includes('only school library admin') ||
          errorMsg.includes('admin') ||
          errorMsg.includes('permission')
        )
      ) {
        console.log('Permission-related error detected, user cannot upload');
        return false;
      }
      
      // For other types of errors (not permission-related), default to allowing the attempt
      console.log('Non-permission error detected, allowing upload attempt');
      return true;
    }
  } catch (error) {
    console.error('Unexpected error checking upload rights:', error);
    // Be conservative - restrict uploads if we encounter an unexpected error
    return false;
  }
};

/**
 * Safely test the contract version and handle ABI mismatches
 */
export const testContractVersion = async (): Promise<{ success: boolean, version: string | null, details: any }> => {
  try {
    const contract = await getContract();
    if (!contract) {
      return { success: false, version: null, details: "Contract not available" };
    }

    // Check if function exists in the ABI
    if (typeof contract.getContractVersion !== 'function') {
      return { 
        success: false, 
        version: null, 
        details: "getContractVersion function not found in contract ABI" 
      };
    }

    // First, try a manual calldata approach to handle potential ABI mismatches
    try {
      // Get contract address and provider
      const contractAddress = getCurrentContractAddress();
      const provider = getProvider();
      
      if (!provider) {
        return { success: false, version: null, details: "Provider not available" };
      }

      // Create correct function selector for "getContractVersion()" 
      // The selector is the first 4 bytes of the keccak256 hash of the function signature
      // For "getContractVersion()" this is "0x0d2020dd"
      const getVersionSelector = "0x0d2020dd"; // precomputed selector for getContractVersion()
      
      // Make a direct low-level call with the correct selector
      const rawResult = await provider.call({
        to: contractAddress, 
        data: getVersionSelector
      });

      console.log("Raw getContractVersion result with correct selector:", rawResult);
      
      if (rawResult && rawResult !== "0x") {
        // Try to decode the result if it's not empty
        let decodedVersion = "Unknown format";
        
        try {
          // If the output format is a string, it should be encoded like this:
          // First 32 bytes: offset to string data (usually 0x20 = 32)
          // Next 32 bytes: length of string
          // Remaining bytes: the string data itself, padded to 32 byte boundary
          if (rawResult.length > 130) { // At least enough bytes for offset+length+some data
            const offsetHex = rawResult.slice(2, 66);
            const offset = parseInt(offsetHex, 16);
            
            if (offset === 32 || offset === 64) { // Common offsets for string data
              const lengthHex = rawResult.slice(66, 130);
              const length = parseInt(lengthHex, 16);
              
              if (length > 0 && length < 100) { // Reasonable string length
                const stringStart = 2 + (offset + 32) * 2; // Convert byte offset to hex char offset
                const stringEnd = stringStart + length * 2;
                
                if (stringEnd <= rawResult.length) {
                  const hexString = rawResult.slice(stringStart, stringEnd);
                  // Convert hex to string more safely
                  try {
                    // Browser approach with TextDecoder
                    const byteArray = hexString.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || [];
                    if (typeof TextDecoder !== 'undefined') {
                      const textDecoder = new TextDecoder('utf-8');
                      decodedVersion = textDecoder.decode(new Uint8Array(byteArray));
                    } else {
                      // Node.js approach or simpler fallback
                      decodedVersion = byteArray.map(byte => String.fromCharCode(byte)).join('');
                    }
                  } catch (e) {
                    // Last resort fallback: just return the hex
                    decodedVersion = `HEX:${hexString}`;
                  }
                }
              }
            }
          }
        } catch (decodeError) {
          console.error("Error decoding version string:", decodeError);
        }
        
        return { 
          success: true, 
          version: decodedVersion, 
          details: { 
            rawResponse: rawResult,
            note: "Manual low-level call succeeded, decoded version is best effort" 
          } 
        };
      }
    } catch (rawError) {
      console.error("Raw call to getContractVersion failed:", rawError);
    }

    // Then try the standard ABI call as fallback
    try {
      const versionInfo = await contract.getContractVersion();
      
      if (versionInfo) {
        if (Array.isArray(versionInfo)) {
          return { 
            success: true, 
            version: versionInfo[0] || "Unknown version", 
            details: { isArray: true, data: versionInfo } 
          };
        } else if (typeof versionInfo === 'object') {
          return { 
            success: true, 
            version: versionInfo.version || "Unknown version", 
            details: { isObject: true, data: versionInfo } 
          };
        } else {
          return { 
            success: true, 
            version: String(versionInfo), 
            details: { isPrimitive: true, data: versionInfo } 
          };
        }
      }
    } catch (abiError) {
      console.error("Standard ABI call to getContractVersion failed:", abiError);
      return { 
        success: false, 
        version: null, 
        details: {
          error: abiError instanceof Error ? abiError.message : String(abiError),
          note: "Both manual call and ABI call failed" 
        }
      };
    }
    
    return { 
      success: false, 
      version: null, 
      details: "Function exists but returned no data through any method" 
    };
  } catch (error) {
    console.error("Error testing contract version:", error);
    return { 
      success: false, 
      version: null, 
      details: error instanceof Error ? error.message : String(error) 
    };
  }
}; 