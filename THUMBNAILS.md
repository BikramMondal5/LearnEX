# Subject Thumbnails Implementation

This document explains how the subject-specific thumbnails are implemented in the Study Marketplace application.

## Overview

The application uses a system of subject-specific thumbnails to provide a visually appealing and consistent look for different educational materials. Each subject category (like mathematics, programming, physics, etc.) has its own unique thumbnail with appropriate colors and icons.

## Components

The implementation consists of the following components:

1. **Thumbnail Utilities (`lib/thumbnails.ts`)**: Contains utility functions for mapping subject categories to their respective thumbnail configurations, including gradients and icons.

2. **Subject Thumbnail Component (`components/subject-thumbnail.tsx`)**: A React component that renders the appropriate thumbnail for a given subject category.

3. **Integration with Cards**: The thumbnails are integrated into the `NFTCard` and `MaterialCard` components to display subject-specific visuals.

4. **Placeholder Thumbnails**: SVG placeholders are generated for each subject category using the `scripts/generate-thumbnails.js` script.

## How It Works

1. When a material is displayed in the marketplace, the system first checks if it has a custom image or thumbnail hash.
2. If a custom image is available, it's displayed directly.
3. If no custom image is available, the system falls back to the subject-specific thumbnail based on the material's category.
4. The subject thumbnail component first tries to load an image from the `/public/thumbnails/` directory.
5. If the image fails to load, it falls back to a gradient background with an appropriate icon.

## Supported Subject Categories

The system supports the following subject categories:

- Blockchain
- Programming
- Design
- Business
- Mathematics
- Science
- Language
- Physics
- Chemistry
- Biology
- Computer Science
- Literature
- History
- Economics
- Other (fallback for unknown categories)
- Document (for PDF files)
- Video (for video files)

## Customization

### Adding New Subject Categories

To add a new subject category:

1. Add the new category to the `SubjectCategory` type in `lib/thumbnails.ts`.
2. Add a new entry to the `SUBJECT_THUMBNAILS` object with appropriate gradient and icon.
3. Run the `scripts/generate-thumbnails.js` script to generate a placeholder thumbnail.
4. For best results, add a custom image to the `/public/thumbnails/` directory with the name `your-category.jpg`.

### Customizing Thumbnails

To customize the appearance of thumbnails:

1. **Custom Images**: Add JPG images to the `/public/thumbnails/` directory with filenames matching the category (e.g., `mathematics.jpg`).
2. **Gradients**: Modify the gradient values in the `SUBJECT_THUMBNAILS` object in `lib/thumbnails.ts`.
3. **Icons**: Change the icon names in the `SUBJECT_THUMBNAILS` object. Make sure the icons are imported and added to the `ICON_MAP` in `components/subject-thumbnail.tsx`.

## Generating Placeholder Thumbnails

The repository includes a script to generate SVG placeholder thumbnails for all subject categories:

```bash
node scripts/generate-thumbnails.js
```

This script creates SVG files with gradient backgrounds for each subject category in the `/public/thumbnails/` directory. 