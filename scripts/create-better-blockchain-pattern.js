const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

// Create the backgrounds directory if it doesn't exist
const backgroundsDir = path.join(__dirname, '../public/backgrounds');
if (!fs.existsSync(backgroundsDir)) {
  fs.mkdirSync(backgroundsDir, { recursive: true });
}

// Create a canvas
const width = 800;
const height = 800;
const canvas = createCanvas(width, height);
const ctx = canvas.getContext('2d');

// Fill with dark background
ctx.fillStyle = '#0f172a';
ctx.fillRect(0, 0, width, height);

// Draw blockchain pattern
function drawBlockchainPattern() {
  // Draw hexagon grid
  const hexSize = 40;
  const hexHeight = hexSize * Math.sqrt(3);
  const hexWidth = hexSize * 2;
  const hexVerticalOffset = hexHeight * 0.75;
  
  // Draw hexagons
  for (let row = -1; row < height / hexVerticalOffset + 1; row++) {
    const isOddRow = row % 2 === 1;
    const xOffset = isOddRow ? hexWidth / 2 : 0;
    
    for (let col = -1; col < width / hexWidth + 1; col++) {
      const x = col * hexWidth + xOffset;
      const y = row * hexVerticalOffset;
      
      // Random opacity for variety
      const opacity = 0.1 + Math.random() * 0.2;
      
      // Random color from blockchain-themed palette
      const colors = [
        `rgba(147, 51, 234, ${opacity})`, // Purple
        `rgba(59, 130, 246, ${opacity})`, // Blue
        `rgba(79, 70, 229, ${opacity})`,  // Indigo
        `rgba(236, 72, 153, ${opacity})`, // Pink
      ];
      
      const colorIndex = Math.floor(Math.random() * colors.length);
      ctx.strokeStyle = colors[colorIndex];
      ctx.lineWidth = 1;
      
      // Draw hexagon
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        const hx = x + hexSize * Math.cos(angle);
        const hy = y + hexSize * Math.sin(angle);
        
        if (i === 0) {
          ctx.moveTo(hx, hy);
        } else {
          ctx.lineTo(hx, hy);
        }
      }
      ctx.closePath();
      ctx.stroke();
      
      // Occasionally draw connection lines between hexagons
      if (Math.random() < 0.3) {
        const nextCol = col + (Math.random() > 0.5 ? 1 : -1);
        const nextRow = row + (Math.random() > 0.5 ? 1 : -1);
        
        const nextXOffset = nextRow % 2 === 1 ? hexWidth / 2 : 0;
        const nextX = nextCol * hexWidth + nextXOffset;
        const nextY = nextRow * hexVerticalOffset;
        
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(nextX, nextY);
        ctx.stroke();
      }
    }
  }
  
  // Add some random dots for data points
  for (let i = 0; i < 200; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const radius = 1 + Math.random() * 2;
    
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.5})`;
    ctx.fill();
  }
}

// Draw the pattern
drawBlockchainPattern();

// Save the image
const buffer = canvas.toBuffer('image/png');
fs.writeFileSync(path.join(backgroundsDir, 'blockchain-pattern.png'), buffer);

console.log(`Created blockchain pattern at ${path.join(backgroundsDir, 'blockchain-pattern.png')}`); 