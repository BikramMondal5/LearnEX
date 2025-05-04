# 8-bit Pixel Thumbnail Generator

The LearnEX platform now features an automatic 8-bit pixel art thumbnail generator that creates unique, deterministic thumbnails for learning materials based on their titles and categories.

## Features

- **Automatic Generation**: When no thumbnail is uploaded, an 8-bit pixel art thumbnail is automatically generated
- **Title-Based Uniqueness**: Each thumbnail is uniquely determined by the material's title
- **Category-Specific Color Palettes**: Different subject categories have their own color themes
- **Deterministic Algorithm**: The same title and category will always generate the same thumbnail
- **Symmetric Design**: All thumbnails feature symmetrical designs for aesthetic appeal
- **Small File Size**: SVG-based thumbnails are extremely lightweight

## How It Works

The pixel art generator creates an 8x8 grid of colored squares using a hashing algorithm based on the material's title. The hash value is used to determine the color and pattern of the pixels, ensuring that each title generates a consistent, unique pattern.

The colors used in the thumbnails are based on the category of the learning material. For example:
- Blockchain materials use purple hues
- Programming materials use blue tones
- Mathematics materials use green shades
- And so on for each subject category

## Implementation

The thumbnail generator is implemented in two key files:

1. `lib/pixel-thumbnail-generator.ts` - The core utility that generates the SVG thumbnails
2. `scripts/generate-pixel-thumbnails.js` - A script to pre-generate thumbnails for the demo gallery

## Viewing the Gallery

To see examples of the generated thumbnails, run the pixel thumbnail generator script:

```bash
cd LearnEX
node scripts/generate-pixel-thumbnails.js
```

Then open the gallery in your browser:
```
http://localhost:3000/pixel-thumbnails/gallery.html
```

## Technical Details

- Each thumbnail is an SVG image with a resolution of 400x400 viewbox units
- The thumbnails use a 5-color palette specific to each category
- The algorithm creates symmetrical patterns by mirroring the left half of the grid
- The colors are consistent across the application, matching the category's theme
- On the frontend, thumbnails are displayed at various sizes while maintaining their aspect ratio

## Benefits

- Provides visually appealing thumbnails even when users don't upload their own
- Creates a consistent visual identity for materials across the marketplace
- Adds a unique retro aesthetic that distinguishes LearnEX from other learning platforms
- Reduces storage requirements compared to traditional image thumbnails
- Improves page load performance due to the small file size of SVG graphics 