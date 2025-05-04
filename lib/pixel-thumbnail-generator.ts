/**
 * 8-bit Pixel Thumbnail Generator
 * 
 * This utility creates unique 8-bit style thumbnails based on the title and category of materials.
 * It generates deterministic pixel art using a hash of the title and subject category.
 */

import { getSubjectThumbnail } from './thumbnails';

// Color palettes for different categories (8-bit style colors)
const COLOR_PALETTES: Record<string, string[]> = {
  'blockchain': ['#5928E5', '#8860F9', '#A482FC', '#D3C5FC', '#B9A8FF'],
  'programming': ['#0F52BA', '#147DF5', '#5cb2ff', '#a0d6ff', '#d2eaff'],
  'design': ['#E5287A', '#F96090', '#FCACCC', '#FCB9D3', '#FFDCEA'],
  'business': ['#254EDB', '#4169E1', '#6A8BE8', '#94A8F0', '#BDC6F7'],
  'mathematics': ['#00A36C', '#2EC4B6', '#5DDEB5', '#8EEDC7', '#C9F7E8'],
  'science': ['#1E90FF', '#47B5FF', '#70DAFF', '#9AEAFF', '#C4F5FF'],
  'language': ['#E59500', '#F9B000', '#FCC44D', '#FDD78A', '#FEEAC6'],
  'physics': ['#4169E1', '#5680E9', '#7C9DF3', '#A2BAFC', '#C8D7FF'],
  'chemistry': ['#2E8B57', '#3CB371', '#5DD999', '#7EEAAD', '#A8F0C0'],
  'biology': ['#3CB043', '#66DE93', '#90EDB3', '#BAF5D3', '#E3FCF0'],
  'computer science': ['#4B0082', '#6A00FF', '#8C46FF', '#AF84FF', '#D2BDFF'],
  'literature': ['#E08000', '#FF9F00', '#FFBD4A', '#FFD382', '#FFE8B9'],
  'history': ['#CC5500', '#FF6700', '#FF8642', '#FFA778', '#FFC8AD'],
  'economics': ['#00A550', '#00C060', '#2DDA7A', '#69FFA1', '#A5FFC8'],
  'document': ['#1560BD', '#3D7AD3', '#6598E8', '#8EB5FC', '#B6D1FF'],
  'video': ['#C71585', '#E34BA9', '#F975C8', '#FFA0DB', '#FFD0ED'],
  'other': ['#5A5A5A', '#7E7E7E', '#A0A0A0', '#C2C2C2', '#E5E5E5']
};

// Default palette if category not found
const DEFAULT_PALETTE = ['#5A5A5A', '#7E7E7E', '#A0A0A0', '#C2C2C2', '#E5E5E5'];

/**
 * Generate a simple hash from a string
 * @param str Input string
 * @returns A numeric hash value
 */
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Generate a pixel art grid based on title and category
 * @param title The title of the material
 * @param category The category of the material
 * @returns A 2D array representing the pixel grid
 */
function generatePixelGrid(title: string, category: string): number[][] {
  // Create a hash from the title
  const hash = simpleHash(title);
  
  // Initialize an 8x8 grid
  const grid: number[][] = Array(8).fill(0).map(() => Array(8).fill(0));
  
  // Normalize category for special handling
  const normalizedCategory = category.toLowerCase().trim();
  
  // Fill the grid with values based on the hash
  // This ensures the same title always generates the same pattern
  let value = hash;
  
  // Different pattern generation based on category
  if (normalizedCategory === 'blockchain') {
    // Complete redesign for blockchain category - solid pattern with no gaps
    
    // First, fill in a base pattern with medium-dark colors
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        // Default to color index 2 (medium shade from the palette)
        grid[y][x] = 2;
      }
    }
    
    // Then, apply a randomized pattern on top based on the hash
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 4; x++) {
        const colorValue = value % 5;
        
        // Top part (face-like area) - lighter colors
        if (y < 4) {
          // Make corners lighter
          if (y < 2 && (x < 2 || x > 5)) {
            grid[y][x] = Math.max(3, colorValue);
          } 
          // Always fill the middle section with darker colors (no gaps)
          else if (y === 3 && (x >= 1 && x <= 2)) {
            grid[y][x] = Math.min(1, colorValue);
          }
          // Random variation for other pixels
          else {
            grid[y][x] = colorValue;
          }
        }
        // Bottom part - more consistent dark colors
        else {
          grid[y][x] = Math.min(2, colorValue); // Ensures no light colors in bottom
        }
        
        // Mirror to right side
        grid[y][7-x] = grid[y][x];
        
        value = Math.floor(value / 3);
      }
    }
    
    // Force-fill the middle areas where gaps typically occur
    for (let x = 2; x <= 5; x++) {
      for (let y = 2; y <= 4; y++) {
        // Ensure these critical middle pixels are always filled with a visible color
        if (grid[y][x] > 2) {
          grid[y][x] = 1; // Use a darker color to ensure visibility
        }
      }
    }
  } else {
    // Standard pattern for other categories
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 4; x++) {
        // Create a mirrored pattern for symmetry (only fill left half, mirror right half)
        // Get a value between 0-4 (for 5 color shades)
        grid[y][x] = (value % 5);
        value = Math.floor(value / 3);
        
        // Mirror the left side
        grid[y][7-x] = grid[y][x];
      }
    }
  }
  
  return grid;
}

/**
 * Convert a pixel grid to an SVG string
 * @param grid The pixel grid to convert
 * @param palette The color palette to use
 * @returns An SVG string representing the pixel art
 */
function gridToSVG(grid: number[][], palette: string[]): string {
  const svgSize = 400; // SVG viewbox size
  const pixelSize = svgSize / 8; // Size of each pixel
  
  let svgContent = '';
  
  // Create rectangles for each pixel
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const colorIndex = grid[y][x];
      const color = palette[colorIndex];
      
      svgContent += `<rect x="${x * pixelSize}" y="${y * pixelSize}" width="${pixelSize}" height="${pixelSize}" fill="${color}" />`;
    }
  }
  
  // Assemble the complete SVG
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgSize} ${svgSize}" width="100%" height="100%">
    ${svgContent}
  </svg>`;
  
  return svg;
}

/**
 * Generate a base64 data URL for an 8-bit style thumbnail
 * @param title The title of the material
 * @param category The category of the material
 * @returns A data URL containing the SVG thumbnail
 */
export function generatePixelThumbnail(title: string, category: string): string {
  // Get the appropriate color palette
  const normalizedCategory = category.toLowerCase().trim();
  const palette = COLOR_PALETTES[normalizedCategory] || DEFAULT_PALETTE;
  
  // Generate the pixel grid
  const grid = generatePixelGrid(title, category);
  
  // Convert to SVG
  const svg = gridToSVG(grid, palette);
  
  // Convert to data URL
  const dataURL = `data:image/svg+xml;base64,${btoa(svg)}`;
  
  return dataURL;
}

/**
 * Convert a string to a valid IPFS CID-like hash (for testing only)
 * This is NOT a real IPFS CID, just a simulation for frontend development
 * @param title The title to convert
 * @returns A string that looks like an IPFS CID
 */
export function getTitleToCID(title: string, category: string): string {
  const hash = simpleHash(`${title}-${category}`).toString(16).padStart(32, '0');
  return `ipfs://Qm${hash}`;
}

/**
 * Generate an SVG string for the pixel thumbnail
 * @param title The title of the material
 * @param category The category of the material
 * @returns An SVG string for the thumbnail
 */
export function generatePixelThumbnailSVG(title: string, category: string): string {
  // Get the appropriate color palette
  const normalizedCategory = category.toLowerCase().trim();
  const palette = COLOR_PALETTES[normalizedCategory] || DEFAULT_PALETTE;
  
  // Generate the pixel grid
  const grid = generatePixelGrid(title, category);
  
  // Convert to SVG
  return gridToSVG(grid, palette);
} 