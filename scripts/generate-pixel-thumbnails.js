/**
 * 8-bit Pixel Thumbnail Generator Script
 * 
 * This script generates pixel art thumbnails for demo purposes
 * It creates SVG files in the public/pixel-thumbnails directory
 */

const fs = require('fs');
const path = require('path');

// Ensure the directories exist
const pixelDir = path.join(process.cwd(), 'public', 'pixel-thumbnails');
if (!fs.existsSync(pixelDir)) {
  fs.mkdirSync(pixelDir, { recursive: true });
}

// Color palettes for different categories (8-bit style colors)
const COLOR_PALETTES = {
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
 * @param {string} str Input string
 * @returns {number} A numeric hash value
 */
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Generate a pixel art grid based on title and category
 * @param {string} title The title of the material
 * @param {string} category The category of the material
 * @returns {number[][]} A 2D array representing the pixel grid
 */
function generatePixelGrid(title, category) {
  // Create a hash from the title
  const hash = simpleHash(title);
  
  // Initialize an 8x8 grid
  const grid = Array(8).fill(0).map(() => Array(8).fill(0));
  
  // Fill the grid with values based on the hash
  // This ensures the same title always generates the same pattern
  let value = hash;
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      // Create a mirrored pattern for symmetry (only fill left half, mirror right half)
      if (x < 4) {
        // Get a value between 0-4 (for 5 color shades)
        grid[y][x] = (value % 5);
        value = Math.floor(value / 3);
      } else {
        // Mirror the left side
        grid[y][x] = grid[y][7-x];
      }
    }
  }
  
  return grid;
}

/**
 * Convert a pixel grid to an SVG string
 * @param {number[][]} grid The pixel grid to convert
 * @param {string[]} palette The color palette to use
 * @returns {string} An SVG string representing the pixel art
 */
function gridToSVG(grid, palette) {
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
 * Generate a pixel thumbnail SVG and save it to a file
 * @param {string} title The title of the material
 * @param {string} category The category of the material
 * @param {string} outputPath The path to save the SVG file
 */
function generateAndSaveThumbnail(title, category, outputPath) {
  // Get the appropriate color palette
  const normalizedCategory = category.toLowerCase().trim();
  const palette = COLOR_PALETTES[normalizedCategory] || DEFAULT_PALETTE;
  
  // Generate the pixel grid
  const grid = generatePixelGrid(title, category);
  
  // Convert to SVG
  const svg = gridToSVG(grid, palette);
  
  // Save the SVG file
  fs.writeFileSync(outputPath, svg);
  
  console.log(`Generated pixel thumbnail for "${title}" (${category}) at ${outputPath}`);
}

// Demo data
const sampleMaterials = [
  { title: "Introduction to Blockchain", category: "blockchain" },
  { title: "Advanced JavaScript Programming", category: "programming" },
  { title: "UI/UX Design Principles", category: "design" },
  { title: "Business Analytics Fundamentals", category: "business" },
  { title: "Calculus Made Simple", category: "mathematics" },
  { title: "Physics for Beginners", category: "physics" },
  { title: "Organic Chemistry", category: "chemistry" },
  { title: "Biology and Ecosystems", category: "biology" },
  { title: "Computer Science 101", category: "computer science" },
  { title: "English Literature Classics", category: "literature" },
  { title: "World History Overview", category: "history" },
  { title: "Microeconomics", category: "economics" },
  { title: "Quantum Physics", category: "physics" },
  { title: "Introduction to Python", category: "programming" },
  { title: "Web Development Fundamentals", category: "programming" },
  { title: "Mobile App Design", category: "design" }
];

// Generate thumbnails for each sample material
sampleMaterials.forEach(material => {
  const safeName = material.title.replace(/[^a-z0-9]/gi, '-').toLowerCase();
  const outputPath = path.join(pixelDir, `${safeName}.svg`);
  generateAndSaveThumbnail(material.title, material.category, outputPath);
});

// Create an HTML file to view all the generated thumbnails
const thumbnailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>8-bit Pixel Thumbnails Gallery</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #1a1a1a;
      color: white;
      padding: 20px;
    }
    h1 {
      text-align: center;
      margin-bottom: 30px;
    }
    .gallery {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 20px;
    }
    .thumbnail {
      background-color: #2a2a2a;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 4px 8px rgba(0,0,0,0.3);
      transition: transform 0.2s;
    }
    .thumbnail:hover {
      transform: scale(1.05);
    }
    .thumbnail img {
      width: 100%;
      display: block;
    }
    .thumbnail-info {
      padding: 15px;
    }
    .thumbnail-title {
      font-weight: bold;
      margin-bottom: 5px;
    }
    .thumbnail-category {
      color: #aaa;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <h1>8-bit Pixel Thumbnails Gallery</h1>
  
  <div class="gallery">
    ${sampleMaterials.map(material => {
      const safeName = material.title.replace(/[^a-z0-9]/gi, '-').toLowerCase();
      return `
        <div class="thumbnail">
          <img src="/pixel-thumbnails/${safeName}.svg" alt="${material.title}">
          <div class="thumbnail-info">
            <div class="thumbnail-title">${material.title}</div>
            <div class="thumbnail-category">${material.category}</div>
          </div>
        </div>
      `;
    }).join('')}
  </div>
</body>
</html>
`;

fs.writeFileSync(path.join(pixelDir, 'gallery.html'), thumbnailHtml);
console.log(`\nGenerated ${sampleMaterials.length} pixel thumbnails.`);
console.log(`\nOpen public/pixel-thumbnails/gallery.html in your browser to view the gallery.`); 