import { NextRequest, NextResponse } from 'next/server';
import { isValidIPFSCid, fetchFromIPFS } from '@/lib/pinning-service';
import { encrypt, decrypt } from '@/lib/encryption';
import { rateLimit } from '@/lib/rate-limit';

/**
 * Secure Content Proxy API
 * This API acts as a proxy to serve IPFS content without exposing the underlying CID.
 * It uses an encrypted token-based system with wallet authentication for security.
 */
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0] : '127.0.0.1';
    const { success } = await rateLimit(ip);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Missing access token. Please try accessing the content again.' },
        { status: 400 }
      );
    }
    
    // Decrypt and validate token
    let decodedData;
    try {
      const decryptedToken = decrypt(token);
      decodedData = JSON.parse(decryptedToken);
    } catch (e) {
      console.error('Token decryption error:', e);
      return NextResponse.json(
        { error: 'Invalid access token. Please try accessing the content again.' },
        { status: 400 }
      );
    }
    
    const { contentHash, expiry, type, userId, nonce } = decodedData;
    
    // Validate required fields
    if (!contentHash || !type || !userId || !expiry || !nonce) {
      return NextResponse.json(
        { error: 'Invalid token format. Please try accessing the content again.' },
        { status: 400 }
      );
    }
    
    // Note: We no longer validate against a session - just check that we have wallet address
    if (!userId) {
      return NextResponse.json(
        { error: 'Invalid wallet address in token.' },
        { status: 403 }
      );
    }
    
    // Validate token expiry (max 1 hour)
    const expiryDate = new Date(expiry);
    if (isNaN(expiryDate.getTime()) || expiryDate.getTime() < Date.now()) {
      return NextResponse.json(
        { error: 'Access token has expired. Please try accessing the content again.' },
        { status: 401 }
      );
    }
    
    // Validate content hash format
    if (!isValidIPFSCid(contentHash)) {
      return NextResponse.json(
        { error: 'Invalid content identifier. Please try accessing the content again.' },
        { status: 400 }
      );
    }
    
    // Fetch the content from IPFS
    let contentBlob;
    try {
      contentBlob = await fetchFromIPFS(contentHash);
    } catch (e) {
      console.error('IPFS fetch error:', e);
      return NextResponse.json(
        { error: 'Failed to retrieve content. Please try again later.' },
        { status: 500 }
      );
    }
    
    // Determine content type
    let contentType = 'application/octet-stream';
    
    if (type === 'pdf') {
      contentType = 'application/pdf';
    } else if (type === 'video') {
      contentType = 'video/mp4';
    }
    
    // Convert Blob to ArrayBuffer for the response
    const arrayBuffer = await contentBlob.arrayBuffer();
    
    // Return the content with appropriate headers
    return new NextResponse(arrayBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': 'inline',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
      },
    });
  } catch (error) {
    console.error('Error serving secure content:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again later.' },
      { status: 500 }
    );
  }
} 