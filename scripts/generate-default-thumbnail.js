const fs = require('fs');
const path = require('path');

// Ensure thumbnails directory exists
const thumbnailsDir = path.join(__dirname, '../public/thumbnails');
if (!fs.existsSync(thumbnailsDir)) {
  fs.mkdirSync(thumbnailsDir, { recursive: true });
}

// Generate a simple SVG default thumbnail
const defaultThumbnail = `<svg width="400" height="400" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6D28D9;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#4338CA;stop-opacity:1" />
    </linearGradient>
    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="400" height="400" fill="url(#grad)" />
  <rect width="400" height="400" fill="url(#grid)" />
  <rect x="100" y="150" width="200" height="100" rx="10" fill="rgba(0,0,0,0.3)" />
  <text x="200" y="190" font-family="Arial" font-size="24" fill="white" text-anchor="middle" dominant-baseline="middle">LearnEX</text>
  <text x="200" y="225" font-family="Arial" font-size="16" fill="rgba(255,255,255,0.8)" text-anchor="middle" dominant-baseline="middle">Educational Material</text>
</svg>`;

// Write the default thumbnail to file
fs.writeFileSync(path.join(thumbnailsDir, 'default.svg'), defaultThumbnail);
console.log('Default thumbnail created at: ' + path.join(thumbnailsDir, 'default.svg'));

// Create an HTML file to help convert SVG to PNG
const htmlConverter = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Default Thumbnail</title>
  <style>
    body { margin: 0; padding: 20px; background: #f0f0f0; font-family: Arial, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    h1 { color: #6D28D9; }
    .thumbnail { width: 400px; height: 400px; margin: 20px 0; }
    .btn { display: inline-block; background: #6D28D9; color: white; padding: 10px 15px; border-radius: 4px; text-decoration: none; margin-top: 10px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Default Thumbnail</h1>
    <p>Right-click on the image below and choose "Save Image As..." to save as PNG.</p>
    <img src="default.svg" alt="Default Thumbnail" class="thumbnail" id="thumbnail">
    <br>
    <a href="#" class="btn" id="downloadBtn">Download PNG</a>
  </div>
  
  <script>
    document.getElementById('downloadBtn').addEventListener('click', function() {
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 400;
      const ctx = canvas.getContext('2d');
      const img = document.getElementById('thumbnail');
      
      ctx.drawImage(img, 0, 0, 400, 400);
      
      const link = document.createElement('a');
      link.download = 'default.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    });
  </script>
</body>
</html>`;

fs.writeFileSync(path.join(thumbnailsDir, 'convert-default.html'), htmlConverter);
console.log('HTML converter created at: ' + path.join(thumbnailsDir, 'convert-default.html'));
console.log('Instructions: Open convert-default.html in a browser and use the Download PNG button to save the thumbnail as PNG.'); 