import { NextRequest, NextResponse } from 'next/server';
import { getAllMaterials, listMaterial } from '@/lib/blockchain';

// This is a mock database for now - in a real application, you would use a proper database
// or directly interact with the blockchain
const MATERIALS_DB: any[] = [];

/**
 * GET /api/materials
 * Get all materials with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search')?.toLowerCase();
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // Try to get materials from the blockchain first
    try {
      const offset = (page - 1) * limit;
      const materials = await getAllMaterials(offset, limit);
      
      // Apply category filter
      let filteredMaterials = materials;
      if (category && category !== 'all') {
        filteredMaterials = filteredMaterials.filter(
          material => material.category.toLowerCase() === category.toLowerCase()
        );
      }
      
      // Apply search filter
      if (search) {
        filteredMaterials = filteredMaterials.filter(
          material => 
            material.title.toLowerCase().includes(search) || 
            material.description.toLowerCase().includes(search)
        );
      }
      
      return NextResponse.json({
        success: true,
        data: {
          materials: filteredMaterials,
          pagination: {
            total: materials.length, // This is not accurate for the total, but it's the best we can do without querying the total count
            page,
            limit,
            pages: Math.ceil(materials.length / limit)
          }
        }
      });
    } catch (error) {
      console.error('Error fetching materials from blockchain:', error);
      // Fall back to mock database if blockchain fails
    }
    
    // Fallback to mock database
    let filteredMaterials = [...MATERIALS_DB];
    
    // Apply category filter
    if (category && category !== 'all') {
      filteredMaterials = filteredMaterials.filter(
        material => material.category.toLowerCase() === category.toLowerCase()
      );
    }
    
    // Apply search filter
    if (search) {
      filteredMaterials = filteredMaterials.filter(
        material => 
          material.title.toLowerCase().includes(search) || 
          material.description.toLowerCase().includes(search)
      );
    }
    
    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedMaterials = filteredMaterials.slice(startIndex, endIndex);
    
    return NextResponse.json({
      success: true,
      data: {
        materials: paginatedMaterials,
        pagination: {
          total: filteredMaterials.length,
          page,
          limit,
          pages: Math.ceil(filteredMaterials.length / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching materials:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch materials' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/materials
 * Create a new material
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const { title, description, category, contentHash, previewHash, thumbnailHash, price } = body;
    
    if (!title || !description || !category || !contentHash || !price) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Ensure hashes are strings, not objects
    const contentHashStr = typeof contentHash === 'object' ? contentHash.url : contentHash;
    const previewHashStr = previewHash ? (typeof previewHash === 'object' ? previewHash.url : previewHash) : '';
    const thumbnailHashStr = thumbnailHash ? (typeof thumbnailHash === 'object' ? thumbnailHash.url : thumbnailHash) : '';
    
    // Try to list the material on the blockchain
    try {
      const materialId = await listMaterial(
        title,
        description,
        category,
        contentHashStr,
        previewHashStr,
        price
      );
      
      if (materialId) {
        return NextResponse.json({
          success: true,
          data: {
            id: materialId.toString(),
            title,
            description,
            category,
            contentHash: contentHashStr,
            previewHash: previewHashStr,
            thumbnailHash: thumbnailHashStr,
            price,
            isActive: true,
            createdAt: Date.now()
          }
        }, { status: 201 });
      }
    } catch (error) {
      console.error('Error listing material on blockchain:', error);
      // Fall back to mock database if blockchain fails
    }
    
    // Fallback to mock database
    const newMaterial = {
      id: (MATERIALS_DB.length + 1).toString(),
      owner: '0x1234567890123456789012345678901234567890', // This would be the user's wallet address
      title,
      description,
      category,
      contentHash: contentHashStr,
      previewHash: previewHashStr,
      thumbnailHash: thumbnailHashStr,
      price,
      isActive: true,
      createdAt: Date.now(),
      rating: 0,
      sales: 0
    };
    
    MATERIALS_DB.push(newMaterial);
    
    return NextResponse.json({
      success: true,
      data: newMaterial
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating material:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create material' },
      { status: 500 }
    );
  }
} 