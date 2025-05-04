import { NextRequest, NextResponse } from 'next/server';
import { getMaterialDetails, updateMaterial, removeMaterial } from '@/lib/blockchain';

// This is a mock database for now - in a real application, you would use a proper database
// or directly interact with the blockchain
const MATERIALS_DB: any[] = [];

/**
 * GET /api/materials/[id]
 * Get a specific material by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // Try to get material from the blockchain first
    try {
      const material = await getMaterialDetails(parseInt(id));
      
      if (material) {
        return NextResponse.json({
          success: true,
          data: material
        });
      }
    } catch (error) {
      console.error('Error fetching material from blockchain:', error);
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
    
    return NextResponse.json({
      success: true,
      data: material
    });
  } catch (error) {
    console.error('Error fetching material:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch material' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/materials/[id]
 * Update a specific material
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();
    
    // Validate required fields
    const { title, description, price } = body;
    
    if (!title || !description || !price) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Try to update material on the blockchain first
    try {
      const success = await updateMaterial(
        parseInt(id),
        title,
        description,
        price
      );
      
      if (success) {
        // Get the updated material details
        const updatedMaterial = await getMaterialDetails(parseInt(id));
        
        return NextResponse.json({
          success: true,
          data: updatedMaterial
        });
      }
    } catch (error) {
      console.error('Error updating material on blockchain:', error);
      // Fall back to mock database if blockchain fails
    }
    
    // Fallback to mock database
    const materialIndex = MATERIALS_DB.findIndex(m => m.id === id);
    
    if (materialIndex === -1) {
      return NextResponse.json(
        { success: false, message: 'Material not found' },
        { status: 404 }
      );
    }
    
    // Update the material
    if (title) MATERIALS_DB[materialIndex].title = title;
    if (description) MATERIALS_DB[materialIndex].description = description;
    if (price) MATERIALS_DB[materialIndex].price = price;
    
    return NextResponse.json({
      success: true,
      data: MATERIALS_DB[materialIndex]
    });
  } catch (error) {
    console.error('Error updating material:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update material' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/materials/[id]
 * Remove a material from the marketplace
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // Try to remove material on the blockchain first
    try {
      const success = await removeMaterial(parseInt(id));
      
      if (success) {
        return NextResponse.json({
          success: true,
          message: 'Material removed successfully'
        });
      }
    } catch (error) {
      console.error('Error removing material on blockchain:', error);
      // Fall back to mock database if blockchain fails
    }
    
    // Fallback to mock database
    const materialIndex = MATERIALS_DB.findIndex(m => m.id === id);
    
    if (materialIndex === -1) {
      return NextResponse.json(
        { success: false, message: 'Material not found' },
        { status: 404 }
      );
    }
    
    // Mark as inactive instead of actually deleting
    MATERIALS_DB[materialIndex].isActive = false;
    
    return NextResponse.json({
      success: true,
      message: 'Material removed successfully'
    });
  } catch (error) {
    console.error('Error removing material:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to remove material' },
      { status: 500 }
    );
  }
} 