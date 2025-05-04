import { ethers } from "ethers";
import { CONTRACT_ABI } from "./contract-abi";
import { CONTRACT_BYTECODE } from "./contract-bytecode";

/**
 * Deploy a new StudyMarketplace contract instance
 * 
 * @param platformFeeRecipient The address that will receive platform fees
 * @returns The address of the newly deployed contract
 */
export async function deployStudyMarketplace(
  platformFeeRecipient: string
): Promise<{ success: boolean; contractAddress?: string; error?: string }> {
  try {
    if (!window.ethereum) {
      throw new Error("No Ethereum wallet found. Please install MetaMask.");
    }

    // Request account access
    await window.ethereum.request({ method: "eth_requestAccounts" });
    
    // Create provider and signer
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    
    // Check the network
    const network = await provider.getNetwork();
    console.log(`Deploying on network: ${network.name} (${network.chainId})`);
    
    // Check balance
    const balance = await provider.getBalance(await signer.getAddress());
    console.log(`Deployer balance: ${ethers.formatEther(balance)} ETH`);
    
    if (balance < ethers.parseEther("0.01")) {
      console.warn("Low balance warning: Deploying a contract requires ETH for gas");
    }
    
    // Validate the platform fee recipient address
    if (!ethers.isAddress(platformFeeRecipient)) {
      // If invalid, use the sender's address
      console.warn("Invalid platform fee recipient address, using your address instead");
      platformFeeRecipient = await signer.getAddress();
    }
    
    // Create contract factory
    const factory = new ethers.ContractFactory(
      CONTRACT_ABI,
      CONTRACT_BYTECODE,
      signer
    );
    
    // Deploy contract
    console.log(`Deploying contract with platform fee recipient: ${platformFeeRecipient}`);
    const contract = await factory.deploy(platformFeeRecipient);
    
    // Wait for deployment (this can take a while)
    console.log(`Deployment transaction sent: ${contract.deploymentTransaction()?.hash}`);
    const receipt = await contract.deploymentTransaction()?.wait();
    console.log(`Contract deployed at: ${contract.target}`);
    
    // Save the new contract address in localStorage
    if (typeof window !== "undefined") {
      // Store this as the last deployed contract
      localStorage.setItem("lastDeployedContract", contract.target.toString());
      
      // Also store in deployment history
      const deploymentHistory = JSON.parse(
        localStorage.getItem("contractDeploymentHistory") || "[]"
      );
      deploymentHistory.push({
        address: contract.target.toString(),
        timestamp: new Date().toISOString(),
        platformFeeRecipient,
        network: network.name,
        chainId: network.chainId.toString(),
      });
      localStorage.setItem(
        "contractDeploymentHistory",
        JSON.stringify(deploymentHistory)
      );
    }
    
    return {
      success: true,
      contractAddress: contract.target.toString(),
    };
  } catch (error: any) {
    console.error("Contract deployment failed:", error);
    
    // Check for bytecode-related errors
    const errorMessage = error.message || String(error);
    
    if (errorMessage.includes("invalid BytesLike value") || 
        errorMessage.includes("INVALID_ARGUMENT") ||
        errorMessage.includes("bytecode")) {
      return {
        success: false,
        error: "The contract bytecode is invalid or incomplete. You need to update the bytecode in lib/contract-bytecode.ts with the complete compiled bytecode. See the Bytecode Instructions in the Organization tab for detailed steps.",
      };
    }
    
    // Network-related errors
    if (errorMessage.includes("network") || 
        errorMessage.includes("chain") || 
        errorMessage.includes("connection")) {
      return {
        success: false,
        error: "Network error. Make sure you are connected to the correct network and try again.",
      };
    }
    
    // Gas-related errors
    if (errorMessage.includes("gas") || 
        errorMessage.includes("fee") || 
        errorMessage.includes("fund")) {
      return {
        success: false,
        error: "Insufficient funds for gas. Make sure you have enough ETH to cover the deployment costs.",
      };
    }
    
    return {
      success: false,
      error: errorMessage,
    };
  }
} 