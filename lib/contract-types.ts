/**
 * Contract-related type definitions
 */

export interface TestContractResult {
  success: boolean;
  message: string;
  details?: any;
}

export interface ContractDeployment {
  address: string;
  timestamp: string;
  platformFeeRecipient: string;
  network: string;
  chainId: string;
}

export interface ContractVerificationResult {
  success: boolean;
  error?: string;
  warning?: string;
  details?: any;
}

export interface ListMaterialResult {
  success: boolean;
  materialId?: number;
  error?: string;
  tx?: string;
} 