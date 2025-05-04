import { encrypt } from './encryption';
import { useWallet } from '@/hooks/use-wallet';

/**
 * Secure Content Utilities
 * These utilities help manage secure access to content without exposing sensitive information.
 */

/**
 * Normalizes an IPFS content hash to a consistent format
 * Handles both ipfs:// and direct CID formats
 * 
 * @param contentHash - The IPFS content hash in any format
 * @returns The normalized content hash
 */
function normalizeContentHash(contentHash: string): string {
  // Remove ipfs:// prefix if present
  if (contentHash.startsWith('ipfs://')) {
    return contentHash;
  }
  
  // Add ipfs:// prefix if not present
  return `ipfs://${contentHash}`;
}

/**
 * Generates a secure access token for content
 * The token is an encrypted JSON object containing the content hash, user ID, and expiry time
 * 
 * @param contentHash - The IPFS content hash
 * @param type - The content type (pdf, video, etc.)
 * @param userId - The user's wallet address
 * @param expiryMinutes - Optional expiry time in minutes (default: 60 minutes)
 * @returns The secure access token
 */
export function generateSecureToken(
  contentHash: string,
  type: string,
  userId: string,
  expiryMinutes: number = 60
): string {
  if (!contentHash || !type || !userId) {
    throw new Error('Missing required parameters for token generation');
  }

  // Normalize the content hash
  const normalizedContentHash = normalizeContentHash(contentHash);
  
  // Calculate expiry time
  const expiry = new Date(Date.now() + expiryMinutes * 60 * 1000).toISOString();
  
  // Create token data
  const tokenData = {
    contentHash: normalizedContentHash,
    type,
    expiry,
    userId,
    // Add a random component to prevent token prediction
    nonce: Math.random().toString(36).substring(2, 15)
  };
  
  try {
    // Encrypt token data
    return encrypt(JSON.stringify(tokenData));
  } catch (error) {
    console.error('Error encrypting token data:', error);
    throw new Error('Failed to generate secure token');
  }
}

/**
 * Generates a secure content URL using the secure content proxy API
 * 
 * @param contentHash - The IPFS content hash
 * @param type - The content type (pdf, video, etc.)
 * @param userId - The user's wallet address
 * @param expiryMinutes - Optional expiry time in minutes (default: 60 minutes)
 * @returns The secure content URL
 */
export function getSecureContentUrl(
  contentHash: string,
  type: string,
  userId: string,
  expiryMinutes: number = 60
): string {
  if (!userId) {
    throw new Error('User ID (wallet address) is required to generate secure content URL');
  }
  
  if (!contentHash) {
    throw new Error('Content hash is required to generate secure content URL');
  }
  
  try {
    const token = generateSecureToken(contentHash, type, userId, expiryMinutes);
    return `/api/secure-content?token=${encodeURIComponent(token)}`;
  } catch (error) {
    console.error('Error generating secure content URL:', error);
    throw error;
  }
}

/**
 * Hook to get a secure content URL with proper error handling
 * 
 * @param contentHash - The IPFS content hash
 * @param type - The content type (pdf, video, etc.)
 * @param expiryMinutes - Optional expiry time in minutes (default: 60 minutes)
 * @returns Object containing the URL and any error state
 */
export function useSecureContentUrl(
  contentHash: string,
  type: string,
  expiryMinutes: number = 60
): { url: string | null; error: string | null } {
  const { currentAccount } = useWallet();
  
  if (!currentAccount) {
    return { url: null, error: 'Wallet must be connected' };
  }
  
  try {
    const url = getSecureContentUrl(contentHash, type, currentAccount, expiryMinutes);
    return { url, error: null };
  } catch (error) {
    console.error('Error generating secure content URL:', error);
    return { url: null, error: 'Failed to generate secure URL' };
  }
} 