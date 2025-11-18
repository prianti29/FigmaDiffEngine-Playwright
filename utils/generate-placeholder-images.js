import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';

/**
 * Generate placeholder PNG images for testing
 * These are simple colored rectangles that can be used as baseline images
 */

/**
 * Create a simple colored PNG image
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @param {Array<number>} color - RGB color [r, g, b]
 * @returns {PNG} - PNG image object
 */
function createPlaceholderImage(width, height, color = [200, 200, 200]) {
     const png = new PNG({ width, height });

     for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
               const idx = (width * y + x) << 2;
               png.data[idx] = color[0];     // R
               png.data[idx + 1] = color[1]; // G
               png.data[idx + 2] = color[2]; // B
               png.data[idx + 3] = 255;      // A (opacity)
          }
     }

     return png;
}

/**
 * Save PNG image to file
 * @param {PNG} png - PNG image object
 * @param {string} filePath - Path to save the image
 * @returns {Promise<void>}
 */
function savePNG(png, filePath) {
     return new Promise((resolve, reject) => {
          const dir = path.dirname(filePath);
          if (!fs.existsSync(dir)) {
               fs.mkdirSync(dir, { recursive: true });
          }

          png.pack()
               .pipe(fs.createWriteStream(filePath))
               .on('finish', resolve)
               .on('error', reject);
     });
}

/**
 * Generate all placeholder baseline images
 */
async function generatePlaceholderImages() {
     const baselineDir = './baseline';

     // Ensure baseline directory exists
     if (!fs.existsSync(baselineDir)) {
          fs.mkdirSync(baselineDir, { recursive: true });
     }

     // Define images to create
     const images = [
          { name: 'homepage-figma.png', width: 1920, height: 1080, color: [240, 240, 245] },
          { name: 'header-figma.png', width: 1920, height: 100, color: [50, 50, 60] },
          { name: 'my-design-figma.png', width: 1200, height: 800, color: [250, 250, 250] },
          { name: 'critical-component-figma.png', width: 800, height: 600, color: [255, 255, 255] },
          { name: 'homepage-desktop-figma.png', width: 1920, height: 1080, color: [240, 240, 245] },
          { name: 'homepage-tablet-figma.png', width: 768, height: 1024, color: [245, 245, 250] },
          { name: 'homepage-mobile-figma.png', width: 375, height: 667, color: [250, 250, 255] },
     ];

     console.log('Generating placeholder images...\n');

     for (const img of images) {
          const filePath = path.join(baselineDir, img.name);

          // Skip if file already exists
          if (fs.existsSync(filePath)) {
               console.log(` Skipped: ${img.name} (already exists)`);
               continue;
          }

          try {
               const png = createPlaceholderImage(img.width, img.height, img.color);
               await savePNG(png, filePath);
               console.log(`Created: ${img.name} (${img.width}x${img.height})`);
          } catch (error) {
               console.error(` Error creating ${img.name}:`, error.message);
          }
     }

     console.log('\n✨ Placeholder images generation complete!');
     console.log('\n📝 Note: These are placeholder images. Replace them with your actual Figma designs.');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.includes('generate-placeholder-images')) {
     generatePlaceholderImages().catch(console.error);
}

export { generatePlaceholderImages, createPlaceholderImage, savePNG };

