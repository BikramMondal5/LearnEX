import { NextRequest, NextResponse } from 'next/server';
import { getMaterialDetails, purchaseMaterial, getContentHash } from '@/lib/blockchain';

// This is a mock database for now - in a real application, you would use a proper database
// or directly interact with the blockchain
const MATERIALS_DB: any[] = [];
const PURCHASES_DB: any[] = [];

/**
 * POST /api/materials/[id]/purchase
 * Purchase a specific material
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();
    const { price } = body; // Price should be provided by the frontend
    
    // Try to get material from the blockchain first
    try {
      const material = await getMaterialDetails(parseInt(id));
      
      if (!material) {
        return NextResponse.json(
          { success: false, message: 'Material not found' },
          { status: 404 }
        );
      }
      
      if (!material.isActive) {
        return NextResponse.json(
          { success: false, message: 'Material is not available for purchase' },
          { status: 400 }
        );
      }
      
      // Purchase the material on the blockchain
      const success = await purchaseMaterial(parseInt(id), material.price);
      
      if (success) {
        // Get the content hash
        const contentHash = await getContentHash(parseInt(id));
        
        return NextResponse.json({
          success: true,
          data: {
            purchase: {
              materialId: id,
              price: material.price,
              purchaseDate: Date.now()
            },
            contentHash
          }
        });
      }
    } catch (error) {
      console.error('Error purchasing material on blockchain:', error);
      // Fall back to mock database if blockchain fails
    }
    
    // Fallback to mock database
    const material = MATERIALS_DB.find(m => m.id === id);
    
    if (!material) {
      return NextResponse.json(
        { success: false, message: 'Material not found' },
        { status: 404 }
      );
    }
    
    if (!material.isActive) {
      return NextResponse.json(
        { success: false, message: 'Material is not available for purchase' },
        { status: 400 }
      );
    }
    
    // Mock buyer address - in a real app, this would be the authenticated user's wallet
    const buyerAddress = '0xabcdef1234567890abcdef1234567890abcdef12';
    
    // Check if already purchased
    const alreadyPurchased = PURCHASES_DB.some(
      p => p.materialId === id && p.buyer === buyerAddress
    );
    
    if (alreadyPurchased) {
      return NextResponse.json(
        { success: false, message: 'You have already purchased this material' },
        { status: 400 }
      );
    }
    
    // Record the purchase
    const purchase = {
      id: (PURCHASES_DB.length + 1).toString(),
      materialId: id,
      buyer: buyerAddress,
      seller: material.owner,
      price: material.price,
      purchaseDate: Date.now()
    };
    
    PURCHASES_DB.push(purchase);
    
    // Update material stats
    material.sales += 1;
    
    return NextResponse.json({
      success: true,
      data: {
        purchase,
        contentHash: material.contentHash // In a real app, this would be securely delivered
      }
    });
  } catch (error) {
    console.error('Error purchasing material:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to purchase material' },
      { status: 500 }
    );
  }
} 