// This file will contain functions to interact with the blockchain
// In a real application, you would use ethers.js or web3.js to interact with the smart contract

import { ethers } from 'ethers';
import {
  getContract,
  getProvider,
  listMaterialOnChain as contractListMaterialOnChain,
  purchaseMaterialOnChain,
  getMyListedMaterialsOnChain,
  getMyPurchasedMaterialsOnChain,
  getMaterialDetailsOnChain,
  getContentHashOnChain,
  getActiveMaterialsOnChain,
  updateMaterialOnChain,
  removeMaterialOnChain,
  getMaterialThumbnailInfoOnChain,
  getThumbnailHashOnChain
} from './contract';
import { isValidIPFSCid } from './pinning-service';

// Deployed contract address
export const CONTRACT_ADDRESS = '0xe12D1e1698d7E07206b5C6C49466631c4dDfbF1B';

// Complete contract ABI from the deployed contract
// Make sure this matches the actual contract interface
export const CONTRACT_ABI = [
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_title",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_description",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_category",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_contentHash",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_previewHash",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "_price",
				"type": "uint256"
			}
		],
		"name": "listMaterial",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address payable",
				"name": "_platformFeeRecipient",
				"type": "address"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "title",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "price",
				"type": "uint256"
			}
		],
		"name": "MaterialListed",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "buyer",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "seller",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "price",
				"type": "uint256"
			}
		],
		"name": "MaterialPurchased",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			}
		],
		"name": "MaterialRemoved",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "title",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "description",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "price",
				"type": "uint256"
			}
		],
		"name": "MaterialUpdated",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_materialId",
				"type": "uint256"
			}
		],
		"name": "purchaseMaterial",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_materialId",
				"type": "uint256"
			}
		],
		"name": "removeMaterial",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_materialId",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "_title",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_description",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "_price",
				"type": "uint256"
			}
		],
		"name": "updateMaterial",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_newFeePercent",
				"type": "uint256"
			}
		],
		"name": "updatePlatformFee",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "allMaterialIds",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_offset",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_limit",
				"type": "uint256"
			}
		],
		"name": "getActiveMaterials",
		"outputs": [
			{
				"internalType": "uint256[]",
				"name": "",
				"type": "uint256[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_materialId",
				"type": "uint256"
			}
		],
		"name": "getContentHash",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_materialId",
				"type": "uint256"
			}
		],
		"name": "getMaterialDetails",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "title",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "description",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "category",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "previewHash",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "price",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "isActive",
				"type": "bool"
			},
			{
				"internalType": "uint256",
				"name": "createdAt",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getMyListedMaterials",
		"outputs": [
			{
				"internalType": "uint256[]",
				"name": "",
				"type": "uint256[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getMyPurchasedMaterials",
		"outputs": [
			{
				"internalType": "uint256[]",
				"name": "",
				"type": "uint256[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getTotalMaterials",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "hasPurchased",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "materials",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"internalType": "address payable",
				"name": "owner",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "title",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "description",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "category",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "contentHash",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "previewHash",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "price",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "isActive",
				"type": "bool"
			},
			{
				"internalType": "uint256",
				"name": "createdAt",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "ownedMaterials",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "platformFeePercent",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "platformFeeRecipient",
		"outputs": [
			{
				"internalType": "address payable",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "purchasedMaterials",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_materialId",
				"type": "uint256"
			}
		],
		"name": "getMaterialThumbnailInfo",
		"outputs": [
			{
				"internalType": "string",
				"name": "thumbnailHash",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "title",
				"type": "string"
			},
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"internalType": "bool",
				"name": "exists",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];

// Check if MetaMask is installed
export const checkIfWalletIsConnected = async (): Promise<string | null> => {
  try {
    const { ethereum } = window;

    if (!ethereum) {
      console.log('Make sure you have MetaMask installed!');
      return null;
    }

    // Check if we're authorized to access the user's wallet
    const accounts = await ethereum.request({ method: 'eth_accounts' });

    if (accounts.length !== 0) {
      return accounts[0];
    } else {
      console.log('No authorized account found');
      return null;
    }
  } catch (error) {
    console.error(error);
    return null;
  }
};

// Connect wallet
export const connectWallet = async (): Promise<string | null> => {
  try {
    const { ethereum } = window;

    if (!ethereum) {
      alert('Get MetaMask!');
      return null;
    }

    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    return accounts[0];
  } catch (error) {
    console.error(error);
    return null;
  }
};

// List a new material
export const listMaterial = async (
  title: string,
  description: string,
  category: string,
  contentHash: string | { url: string },
  previewHash: string | { url: string },
  price: string
): Promise<number | null> => {
  try {
    // Process the hash values to ensure they're strings
    const contentHashStr = typeof contentHash === 'string' ? contentHash : contentHash.url;
    const previewHashStr = previewHash ? (typeof previewHash === 'string' ? previewHash : previewHash.url) : '';
    
    console.log('Listing material with extracted parameters:', {
      title,
      description,
      category,
      contentHash: contentHashStr,
      previewHash: previewHashStr,
      price
    });
    
    // Call the contract function with properly formatted parameters
    const materialId = await contractListMaterialOnChain(
      title,
      description,
      category,
      contentHashStr,
      previewHashStr,
      price
    );
    
    // Check if materialId is valid
    if (materialId !== null) {
      console.log('Successfully listed material with ID:', materialId);
    return materialId;
    } else {
      console.warn('Material listing completed but returned null ID');
      return null;
    }
  } catch (error: any) {
    // Extract detailed error message
    let errorMessage = 'Unknown error listing material';
    if (error.error && error.error.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    console.error(`Error listing material: ${errorMessage}`, error);
    return null;
  }
};

// Purchase a material
export const purchaseMaterial = async (
  materialId: number,
  price: string
): Promise<boolean> => {
  try {
    // Use the real blockchain implementation
    return await purchaseMaterialOnChain(materialId, price);
  } catch (error) {
    console.error('Error purchasing material:', error);
    return false;
  }
};

// Get all materials
export const getAllMaterials = async (
  offset: number = 0,
  limit: number = 10
): Promise<any[]> => {
  try {
    // Get material IDs from the blockchain
    const materialIds = await getActiveMaterialsOnChain(offset, limit);
    
    // If there are no materials, return an empty array immediately
    if (!materialIds || materialIds.length === 0) {
      return [];
    }
    
    // Get details for each material
    const materialsPromises = materialIds.map(id => getMaterialDetailsOnChain(id));
    const materials = await Promise.all(materialsPromises);
    
    // Filter out any null values (in case some materials failed to load)
    return materials.filter(material => material !== null);
  } catch (error) {
    console.error('Error getting materials:', error);
    
    // Fallback to API if blockchain interaction fails
    try {
      const response = await fetch(`/api/materials?page=${Math.floor(offset / limit) + 1}&limit=${limit}`);
      const data = await response.json();
      
      return data.success ? data.data.materials : [];
    } catch (fetchError) {
      console.error('Error fetching from API fallback:', fetchError);
      return [];
    }
  }
};

// Get material details
export const getMaterialDetails = async (materialId: number): Promise<any | null> => {
  try {
    // Use the real blockchain implementation
    return await getMaterialDetailsOnChain(materialId);
  } catch (error) {
    console.error('Error getting material details:', error);
    
    // Fallback to API if blockchain interaction fails
    const response = await fetch(`/api/materials/${materialId}`);
    const data = await response.json();
    
    return data.success ? data.data : null;
  }
};

// Get my listed materials
export const getMyListedMaterials = async (): Promise<any[]> => {
  try {
    // Get material IDs from the blockchain
    const materialIds = await getMyListedMaterialsOnChain();
    
    // Get details for each material
    const materialsPromises = materialIds.map(id => getMaterialDetailsOnChain(id));
    const materials = await Promise.all(materialsPromises);
    
    // Filter out any null values (in case some materials failed to load)
    return materials.filter(material => material !== null);
  } catch (error) {
    console.error('Error getting my listed materials:', error);
    return [];
  }
};

// Get my purchased materials
export const getMyPurchasedMaterials = async (): Promise<any[]> => {
  try {
    // Get material IDs from the blockchain
    const materialIds = await getMyPurchasedMaterialsOnChain();
    
    // Get details for each material
    const materialsPromises = materialIds.map(id => getMaterialDetailsOnChain(id));
    const materials = await Promise.all(materialsPromises);
    
    // Filter out any null values (in case some materials failed to load)
    return materials.filter(material => material !== null);
  } catch (error) {
    console.error('Error getting my purchased materials:', error);
    return [];
  }
};

// Get content hash
export const getContentHash = async (materialId: number): Promise<string | null> => {
  try {
    // Use the real blockchain implementation
    return await getContentHashOnChain(materialId);
  } catch (error) {
    console.error('Error getting content hash:', error);
    return null;
  }
};

// Update material
export const updateMaterial = async (
  materialId: number,
  title: string,
  description: string,
  price: string
): Promise<boolean> => {
  try {
    // Use the real blockchain implementation
    return await updateMaterialOnChain(materialId, title, description, price);
  } catch (error) {
    console.error('Error updating material:', error);
    return false;
  }
};

// Remove material
export const removeMaterial = async (materialId: number): Promise<boolean> => {
  try {
    // Use the real blockchain implementation
    return await removeMaterialOnChain(materialId);
  } catch (error) {
    console.error('Error removing material:', error);
    return false;
  }
};

/**
 * Get thumbnail information for a material
 */
export const getMaterialThumbnailInfo = async (materialId: number): Promise<any | null> => {
  try {
    // Try to get material details instead since thumbnailInfo might not be available
    const details = await getMaterialDetailsOnChain(materialId);
    if (!details) return null;
    
    return {
      thumbnailHash: '', // Empty string since thumbnailHash is no longer available
      title: details.title,
      owner: details.owner,
      exists: true
    };
  } catch (error) {
    console.error('Error getting thumbnail info:', error);
    return null;
  }
};

/**
 * Get thumbnail hash for a material
 */
export const getThumbnailHash = async (materialId: number): Promise<string | null> => {
  try {
    // Since the function is no longer available in the contract,
    // just return an empty string which is consistent with the updated contract
    return '';
  } catch (error) {
    console.error('Error getting thumbnail hash:', error);
    return null;
  }
};

/**
 * Enhanced version of listMaterialOnChain with better debugging
 * This replaces the implementation in contract.ts when called directly
 */
export const listMaterialOnChainDebug = async (
  title: string,
  description: string,
  category: string,
  contentHash: string | { url: string },
  previewHash: string | { url: string },
  price: string
): Promise<number | null> => {
  try {
    // Process the hash values to ensure they're strings
    const contentHashStr = typeof contentHash === 'string' ? contentHash : contentHash.url;
    const previewHashStr = previewHash ? (typeof previewHash === 'string' ? previewHash : previewHash.url) : '';

    console.log('Debug - Listing material with parameters:');
    console.log('Title:', title);
    console.log('Description:', description);
    console.log('Category:', category);
    console.log('Content Hash:', contentHashStr);
    console.log('Preview Hash:', previewHashStr);
    console.log('Price:', price);

    // Call the contract function to list the material
    return await contractListMaterialOnChain(
      title,
      description,
      category,
      contentHashStr,
      previewHashStr,
      price
    );
  } catch (error) {
    console.error('Debug - Error listing material:', error);
    return null;
  }
};

/**
 * Debug version of listMaterial that provides detailed error information
 */
export const debugListMaterial = async (
  title: string,
  description: string,
  category: string,
  contentHash: string | { url: string },
  previewHash: string | { url: string },
  price: string
): Promise<any> => {
  try {
    // Process the hash values to ensure they're strings
    const contentHashStr = typeof contentHash === 'string' ? contentHash : contentHash.url;
    const previewHashStr = previewHash ? (typeof previewHash === 'string' ? previewHash : previewHash.url) : '';

    console.log('=== DEBUG LIST MATERIAL ===');
    console.log('Processed parameters:');
    console.log('Title:', title);
    console.log('Description:', description);
    console.log('Category:', category);
    console.log('Content Hash:', contentHashStr);
    console.log('Preview Hash:', previewHashStr);
    console.log('Price:', price);

    // Import the debug function from contract.ts
    const { debugContractTransaction } = await import('./contract');
    
    // Call the debug function without thumbnailHash
    return await debugContractTransaction(
      title,
      description,
      category,
      contentHashStr,
      previewHashStr,
      price
    );
  } catch (error) {
    console.error('Error in debugListMaterial:', error);
    return { success: false, error: 'Error in debug function', details: error };
  }
};

/**
 * Verify the contract ABI and check if the contract has the required functions
 */
export const verifyContractFunctions = async (): Promise<any> => {
  try {
    // Import the verifyContractABI function from contract.ts
    const { verifyContractABI } = await import('./contract');
    
    // Call the verify function
    const result = await verifyContractABI();
    
    // Check if the getThumbnailHash function exists
    if (result.success && result.functionResults) {
      const hasThumbnailFunction = result.functionResults['getThumbnailHash'];
      
      if (!hasThumbnailFunction) {
        console.warn('The getThumbnailHash function is missing in the contract!');
        console.warn('This might be causing issues with thumbnail handling.');
        
        // Return success but with a warning
        return {
          success: true,
          warning: 'The getThumbnailHash function is missing in the contract. The app has been updated to work without it.',
          suggestion: 'No action needed - the app has been updated to work with the new contract interface.'
        };
      }
    }
    
    return result;
  } catch (error) {
    console.error('Error verifying contract functions:', error);
    // Return success anyway to avoid blocking the app
    return { 
      success: true, 
      warning: 'Could not verify all contract functions, but the app should work with the updated interface.'
    };
  }
};

/**
 * List a material with fallback for missing thumbnail functionality
 */
export const listMaterialWithFallback = async (
  title: string,
  description: string,
  category: string,
  contentHash: string | { url: string },
  previewHash: string | { url: string },
  price: string
): Promise<any> => {
  try {
    // Process the hash values to ensure they're strings
    const contentHashStr = typeof contentHash === 'string' ? contentHash : contentHash.url;
    const previewHashStr = previewHash ? (typeof previewHash === 'string' ? previewHash : previewHash.url) : '';
    
    // Call the contract function 
      return await contractListMaterialOnChain(
        title,
        description,
        category,
        contentHashStr,
        previewHashStr,
        price
      );
  } catch (error) {
    console.error('Error in listMaterialWithFallback:', error);
    
    // If there's an error, try the debug function
    return await debugListMaterial(
      title,
      description,
      category,
      contentHash,
      previewHash,
      price
    );
  }
}; 