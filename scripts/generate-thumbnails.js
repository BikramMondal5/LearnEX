/**
 * This script generates placeholder thumbnail images for subjects
 * Run with: node scripts/generate-thumbnails.js
 */

const fs = require('fs');
const path = require('path');

// Create the thumbnails directory if it doesn't exist
const thumbnailsDir = path.join(__dirname, '../public/thumbnails');
if (!fs.existsSync(thumbnailsDir)) {
  fs.mkdirSync(thumbnailsDir, { recursive: true });
}

// List of subjects from our thumbnails.ts file
const subjects = [
  'blockchain',
  'programming',
  'design',
  'business',
  'mathematics',
  'science',
  'language',
  'physics',
  'chemistry',
  'biology',
  'computer-science',
  'literature',
  'history',
  'economics',
  'other',
  'document',
  'video'
];

// Generate a simple SVG for each subject
subjects.forEach(subject => {
  // Generate a color based on the subject name
  const hash = subject.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  
  const h = Math.abs(hash) % 360;
  const s = 70 + (Math.abs(hash) % 20); // 70-90%
  const l = 40 + (Math.abs(hash) % 10); // 40-50%
  
  const color1 = `hsl(${h}, ${s}%, ${l}%)`;
  const color2 = `hsl(${(h + 40) % 360}, ${s}%, ${l}%)`;
  
  // Create an SVG with a gradient background and an icon
  const svg = `<svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${color1};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${color2};stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="300" height="200" fill="url(#grad)" rx="10" ry="10" />
    
    <!-- Add a visual element based on the subject -->
    ${getSubjectIcon(subject)}
    
    <!-- Subject name at the bottom -->
    <rect x="0" y="160" width="300" height="40" fill="rgba(0,0,0,0.5)" />
    <text x="150" y="185" font-family="Arial" font-size="16" fill="white" text-anchor="middle" dominant-baseline="middle">${subject}</text>
  </svg>`;
  
  // Write the SVG to a file
  const svgFilePath = path.join(thumbnailsDir, `${subject}.svg`);
  fs.writeFileSync(svgFilePath, svg);
  
  // Also save as PNG for better compatibility
  const pngFilePath = path.join(thumbnailsDir, `${subject}.png`);
  
  // We can't directly convert SVG to PNG in Node.js without additional libraries
  // For simplicity, we'll just copy the SVG content to a PNG file
  // In a real application, you would use a library like sharp or svg2png
  // or use a browser-based approach to render the SVG to a canvas and export as PNG
  
  // For now, we'll just create a simple HTML file that can be opened in a browser
  // to manually save the SVGs as PNGs
  const htmlContent = `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Save SVGs as PNGs</title>
    <style>
      body { font-family: Arial, sans-serif; padding: 20px; }
      .thumbnail { margin-bottom: 20px; }
      button { padding: 10px; margin-top: 10px; }
    </style>
  </head>
  <body>
    <h1>Save SVGs as PNGs</h1>
    <p>Right-click on each image and select "Save Image As..." to save as PNG.</p>
    ${subjects.map(s => `
      <div class="thumbnail">
        <h3>${s}</h3>
        ${svg.replace('width="300" height="200"', 'width="300" height="200" id="' + s + '"')}
        <button onclick="downloadPNG('${s}')">Download PNG</button>
      </div>
    `).join('')}
    
    <script>
      function downloadPNG(id) {
        const svg = document.getElementById(id);
        const canvas = document.createElement('canvas');
        canvas.width = 300;
        canvas.height = 200;
        const ctx = canvas.getContext('2d');
        
        // Draw white background
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Convert SVG to data URL
        const data = new XMLSerializer().serializeToString(svg);
        const img = new Image();
        const svgBlob = new Blob([data], {type: 'image/svg+xml;charset=utf-8'});
        const url = URL.createObjectURL(svgBlob);
        
        img.onload = function() {
          ctx.drawImage(img, 0, 0);
          URL.revokeObjectURL(url);
          
          // Trigger download
          const link = document.createElement('a');
          link.download = id + '.png';
          link.href = canvas.toDataURL('image/png');
          link.click();
        };
        
        img.src = url;
      }
    </script>
  </body>
  </html>
  `;
  
  // Write the HTML file
  const htmlFilePath = path.join(thumbnailsDir, 'save-as-png.html');
  fs.writeFileSync(htmlFilePath, htmlContent);
  
  console.log(`Generated thumbnail for ${subject}`);
});

console.log('All thumbnails generated successfully!');
console.log('Open public/thumbnails/save-as-png.html in a browser to save the SVGs as PNGs');

// Helper function to get an icon SVG for a subject
function getSubjectIcon(subject) {
  const icons = {
    'blockchain': `<g transform="translate(150,80)">
      <rect x="-30" y="-30" width="60" height="60" fill="white" opacity="0.2" rx="5" />
      <rect x="-20" y="-20" width="40" height="40" fill="white" opacity="0.3" rx="5" />
      <rect x="-10" y="-10" width="20" height="20" fill="white" opacity="0.4" rx="5" />
    </g>`,
    
    'programming': `<g transform="translate(150,80)">
      <rect x="-40" y="-25" width="80" height="10" fill="white" opacity="0.3" rx="2" />
      <rect x="-40" y="-10" width="60" height="10" fill="white" opacity="0.4" rx="2" />
      <rect x="-40" y="5" width="70" height="10" fill="white" opacity="0.5" rx="2" />
      <rect x="-40" y="20" width="50" height="10" fill="white" opacity="0.6" rx="2" />
    </g>`,
    
    'design': `<g transform="translate(150,80)">
      <circle cx="-20" cy="-20" r="15" fill="white" opacity="0.3" />
      <circle cx="20" cy="-20" r="15" fill="white" opacity="0.4" />
      <circle cx="0" cy="20" r="15" fill="white" opacity="0.5" />
    </g>`,
    
    'business': `<g transform="translate(150,80)">
      <rect x="-40" y="20" width="20" height="30" fill="white" opacity="0.3" />
      <rect x="-15" y="0" width="20" height="50" fill="white" opacity="0.4" />
      <rect x="10" y="-20" width="20" height="70" fill="white" opacity="0.5" />
      <rect x="35" y="-40" width="20" height="90" fill="white" opacity="0.6" />
    </g>`,
    
    'mathematics': `<g transform="translate(150,80)">
      <text x="0" y="0" font-family="Arial" font-size="60" fill="white" opacity="0.5" text-anchor="middle" dominant-baseline="middle">∑</text>
    </g>`,
    
    'science': `<g transform="translate(150,80)">
      <circle cx="0" cy="0" r="25" fill="white" opacity="0.3" />
      <ellipse cx="0" cy="0" rx="40" ry="10" fill="none" stroke="white" opacity="0.4" stroke-width="2" />
      <ellipse cx="0" cy="0" rx="40" ry="10" fill="none" stroke="white" opacity="0.4" stroke-width="2" transform="rotate(60)" />
      <ellipse cx="0" cy="0" rx="40" ry="10" fill="none" stroke="white" opacity="0.4" stroke-width="2" transform="rotate(120)" />
    </g>`,
    
    'language': `<g transform="translate(150,80)">
      <text x="0" y="0" font-family="Arial" font-size="60" fill="white" opacity="0.5" text-anchor="middle" dominant-baseline="middle">A</text>
    </g>`,
    
    'physics': `<g transform="translate(150,80)">
      <circle cx="0" cy="0" r="15" fill="white" opacity="0.5" />
      <circle cx="0" cy="0" r="30" fill="none" stroke="white" opacity="0.3" stroke-width="2" />
      <circle cx="30" cy="0" r="5" fill="white" opacity="0.6" />
    </g>`,
    
    'chemistry': `<g transform="translate(150,80)">
      <circle cx="-15" cy="-15" r="10" fill="white" opacity="0.4" />
      <circle cx="15" cy="-15" r="10" fill="white" opacity="0.5" />
      <circle cx="0" cy="15" r="10" fill="white" opacity="0.6" />
      <line x1="-15" y1="-15" x2="15" y2="-15" stroke="white" opacity="0.7" stroke-width="2" />
      <line x1="-15" y1="-15" x2="0" y2="15" stroke="white" opacity="0.7" stroke-width="2" />
      <line x1="15" y1="-15" x2="0" y2="15" stroke="white" opacity="0.7" stroke-width="2" />
    </g>`,
    
    'biology': `<g transform="translate(150,80)">
      <path d="M0,-30 C30,-30 30,30 0,30 C-30,30 -30,-30 0,-30 Z" fill="none" stroke="white" opacity="0.5" stroke-width="2" />
      <path d="M0,-20 C20,-20 20,20 0,20 C-20,20 -20,-20 0,-20 Z" fill="none" stroke="white" opacity="0.6" stroke-width="2" />
    </g>`,
    
    'computer-science': `<g transform="translate(150,80)">
      <rect x="-30" y="-20" width="60" height="40" fill="white" opacity="0.3" rx="5" />
      <rect x="-25" y="-15" width="50" height="30" fill="white" opacity="0.1" rx="3" />
      <rect x="-20" y="30" width="40" height="5" fill="white" opacity="0.3" rx="2" />
    </g>`,
    
    'literature': `<g transform="translate(150,80)">
      <rect x="-25" y="-35" width="15" height="70" fill="white" opacity="0.3" rx="2" />
      <rect x="-5" y="-35" width="15" height="70" fill="white" opacity="0.4" rx="2" />
      <rect x="15" y="-35" width="15" height="70" fill="white" opacity="0.5" rx="2" />
    </g>`,
    
    'history': `<g transform="translate(150,80)">
      <circle cx="0" cy="0" r="30" fill="none" stroke="white" opacity="0.4" stroke-width="3" />
      <line x1="0" y1="0" x2="0" y2="-20" stroke="white" opacity="0.5" stroke-width="3" />
      <line x1="0" y1="0" x2="15" y2="10" stroke="white" opacity="0.6" stroke-width="3" />
    </g>`,
    
    'economics': `<g transform="translate(150,80)">
      <text x="0" y="0" font-family="Arial" font-size="60" fill="white" opacity="0.5" text-anchor="middle" dominant-baseline="middle">$</text>
    </g>`,
    
    'document': `<g transform="translate(150,80)">
      <rect x="-25" y="-35" width="50" height="70" fill="white" opacity="0.3" rx="3" />
      <line x1="-15" y1="-20" x2="15" y2="-20" stroke="white" opacity="0.5" stroke-width="2" />
      <line x1="-15" y1="-10" x2="15" y2="-10" stroke="white" opacity="0.5" stroke-width="2" />
      <line x1="-15" y1="0" x2="15" y2="0" stroke="white" opacity="0.5" stroke-width="2" />
      <line x1="-15" y1="10" x2="15" y2="10" stroke="white" opacity="0.5" stroke-width="2" />
      <line x1="-15" y1="20" x2="5" y2="20" stroke="white" opacity="0.5" stroke-width="2" />
    </g>`,
    
    'video': `<g transform="translate(150,80)">
      <rect x="-30" y="-20" width="60" height="40" fill="white" opacity="0.3" rx="5" />
      <polygon points="0,-10 -15,5 0,20 15,5" fill="white" opacity="0.6" />
    </g>`,
    
    'other': `<g transform="translate(150,80)">
      <circle cx="0" cy="0" r="25" fill="white" opacity="0.3" />
      <text x="0" y="0" font-family="Arial" font-size="30" fill="white" opacity="0.7" text-anchor="middle" dominant-baseline="middle">?</text>
    </g>`
  };
  
  return icons[subject] || icons['other'];
} 