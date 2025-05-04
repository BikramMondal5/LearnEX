const fs = require('fs');
const path = require('path');

// Create the backgrounds directory if it doesn't exist
const backgroundsDir = path.join(__dirname, '../public/backgrounds');
if (!fs.existsSync(backgroundsDir)) {
  fs.mkdirSync(backgroundsDir, { recursive: true });
}

// Simple 1x1 pixel transparent PNG as base64
// This is a placeholder - in a real app, you'd want to create a proper blockchain pattern
const transparentPng = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAEtAJJXIDTjwAAAABJRU5ErkJggg==',
  'base64'
);

// Write the file
const outputPath = path.join(backgroundsDir, 'blockchain-pattern.png');
fs.writeFileSync(outputPath, transparentPng);

console.log(`Created blockchain pattern at ${outputPath}`); 