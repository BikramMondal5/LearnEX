/**
 * IPFS Pinning Service Utility
 * 
 * This utility provides functions to interact with Pinata's IPFS pinning service.
 * It allows pinning content to IPFS and retrieving pinned content.
 */

import axios from 'axios';
import { CID } from 'multiformats/cid';

// Pinata API configuration
// In a production environment, these would be stored in environment variables
const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY || '';
const PINATA_API_SECRET = process.env.NEXT_PUBLIC_PINATA_API_SECRET || '';
const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT || '';

// Pinata API endpoints
const PINATA_API_URL = 'https://api.pinata.cloud';
const PINATA_GATEWAY = 'https://gateway.pinata.cloud/ipfs/';

/**
 * Pins a file to IPFS using Pinata
 * 
 * @param file - The file to pin
 * @param progressCallback - Optional callback for upload progress (0-1)
 * @param name - Optional name for the file
 * @returns The IPFS CID and gateway URL
 */
export async function pinFileToIPFS(
  file: File, 
  progressCallback?: (progress: number) => void,
  name?: string
): Promise<{ cid: string, url: string, gatewayUrl: string }> {
  try {
    // If progress callback is a string, it's the name (for backward compatibility)
    if (typeof progressCallback === 'string') {
      name = progressCallback;
      progressCallback = undefined;
    }

    // Create form data
    const formData = new FormData();
    formData.append('file', file);
    
    // Add metadata if name is provided
    if (name) {
      const metadata = JSON.stringify({
        name,
        keyvalues: {
          source: 'study-marketplace',
          timestamp: Date.now()
        }
      });
      formData.append('pinataMetadata', metadata);
    }
    
    // Configure pinning options
    const pinataOptions = JSON.stringify({
      cidVersion: 1,
      wrapWithDirectory: false
    });
    formData.append('pinataOptions', pinataOptions);
    
    // Make API request to Pinata
    const response = await axios.post(
      `${PINATA_API_URL}/pinning/pinFileToIPFS`,
      formData,
      {
        headers: {
          'Content-Type': `multipart/form-data;`,
          Authorization: `Bearer ${PINATA_JWT}`
        },
        onUploadProgress: (progressEvent) => {
          if (progressCallback && progressEvent.total) {
            const progress = progressEvent.loaded / progressEvent.total;
            progressCallback(progress);
          }
        }
      }
    );
    
    // Extract CID from response
    const cid = response.data.IpfsHash;
    const url = `ipfs://${cid}`;
    const gatewayUrl = `${PINATA_GATEWAY}${cid}`;
    
    return { cid, url, gatewayUrl };
  } catch (error) {
    console.error('Error pinning file to IPFS:', error);
    throw new Error('Failed to pin file to IPFS');
  }
}

/**
 * Pins JSON data to IPFS using Pinata
 * 
 * @param jsonData - The JSON data to pin
 * @param name - Optional name for the data
 * @returns The IPFS CID and gateway URL
 */
export async function pinJSONToIPFS(jsonData: any, name?: string): Promise<{ cid: string, url: string, gatewayUrl: string }> {
  try {
    // Prepare metadata if name is provided
    const metadata = name ? {
      name,
      keyvalues: {
        source: 'study-marketplace',
        timestamp: Date.now()
      }
    } : undefined;
    
    // Make API request to Pinata
    const response = await axios.post(
      `${PINATA_API_URL}/pinning/pinJSONToIPFS`,
      {
        pinataContent: jsonData,
        pinataMetadata: metadata,
        pinataOptions: {
          cidVersion: 1
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${PINATA_JWT}`
        }
      }
    );
    
    // Extract CID from response
    const cid = response.data.IpfsHash;
    const url = `ipfs://${cid}`;
    const gatewayUrl = `${PINATA_GATEWAY}${cid}`;
    
    return { cid, url, gatewayUrl };
  } catch (error) {
    console.error('Error pinning JSON to IPFS:', error);
    throw new Error('Failed to pin JSON to IPFS');
  }
}

/**
 * Normalizes a content hash to remove the ipfs:// prefix
 * @param contentHash 
 * @returns 
 */
export function normalizeContentHash(contentHash: string): string {
  // Remove ipfs:// prefix if present
  if (contentHash.startsWith('ipfs://')) {
    return contentHash.substring(7);
  }
  return contentHash;
}

/**
 * Validates if a string is a valid IPFS CID
 * @param contentHash The content hash to validate
 * @returns boolean indicating if it's valid
 */
export function isValidIPFSCid(contentHash: string): boolean {
  if (!contentHash) return false;
  
  try {
    // Normalize the hash by removing the ipfs:// prefix if present
    const normalizedHash = normalizeContentHash(contentHash);
    
    // Try to create a CID object to validate it
    CID.parse(normalizedHash);
    return true;
  } catch (error) {
    console.error('Invalid CID format:', error);
    return false;
  }
}

/**
 * Gets the gateway URL for an IPFS CID
 * 
 * @param cid - The IPFS CID
 * @returns The gateway URL
 */
export function getIPFSGatewayUrl(cid: string): string {
  // Remove ipfs:// prefix if present
  const cleanCid = cid.startsWith('ipfs://') ? cid.replace('ipfs://', '') : cid;
  return `${PINATA_GATEWAY}${cleanCid}`;
}

/**
 * Fetches content from IPFS using the content hash
 * @param contentHash The IPFS content hash
 * @returns A blob containing the content
 */
export async function fetchFromIPFS(contentHash: string): Promise<Blob> {
  if (!contentHash) {
    throw new Error('Content hash is required');
  }
  
  try {
    // Normalize the hash by removing the ipfs:// prefix if present
    const normalizedHash = normalizeContentHash(contentHash);
    
    // Use public IPFS gateway
    const response = await fetch(`https://gateway.ipfs.io/ipfs/${normalizedHash}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch content: ${response.status} ${response.statusText}`);
    }
    
    return await response.blob();
  } catch (error) {
    console.error('Error fetching from IPFS:', error);
    throw new Error('Failed to retrieve content from IPFS');
  }
}

/**
 * Pins content by its hash using Pinata
 * @param contentHash The IPFS content hash
 * @param name The name to give to the pinned content
 * @returns boolean indicating success
 */
export async function pinByHash(contentHash: string, name: string): Promise<boolean> {
  if (!contentHash) {
    throw new Error('Content hash is required');
  }
  
  try {
    // Normalize the hash by removing the ipfs:// prefix if present
    const normalizedHash = normalizeContentHash(contentHash);
    
    // For demo purposes, we'll just consider it successful
    // In a real implementation, you would call the Pinata API here
    console.log(`[DEMO] Content pinned successfully: ${normalizedHash}`);
    return true;
  } catch (error) {
    console.error('Error pinning content:', error);
    return false;
  }
}

/**
 * Lists pins from Pinata
 * 
 * @param status - Optional status filter (all, pinned, unpinned)
 * @param limit - Optional limit for number of results
 * @returns Array of pins
 */
export async function listPins(status: 'all' | 'pinned' | 'unpinned' = 'all', limit: number = 10): Promise<any[]> {
  try {
    const response = await axios.get(
      `${PINATA_API_URL}/pinning/pinList?status=${status}&pageLimit=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${PINATA_JWT}`
        }
      }
    );
    
    return response.data.rows;
  } catch (error) {
    console.error('Error listing pins:', error);
    return [];
  }
} 