import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

/**
 * Image comparison utility for comparing Figma designs with webpage screenshots
 */
export class ImageComparison {
  constructor(options = {}) {
    this.threshold = options.threshold || 0.1; // Default threshold (10% difference)
    this.outputDir = options.outputDir || './diff';
    this.ensureOutputDir();
  }

  ensureOutputDir() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * Load PNG image from file
   * @param {string} imagePath - Path to the image file
   * @returns {Promise<PNG>} - PNG object
   */
  async loadImage(imagePath) {
    return new Promise((resolve, reject) => {
      if (!fs.existsSync(imagePath)) {
        reject(new Error(`Image file not found: ${imagePath}`));
        return;
      }

      const img = fs.createReadStream(imagePath)
        .pipe(new PNG())
        .on('parsed', () => resolve(img))
        .on('error', reject);
    });
  }

  /**
   * Resize image to match dimensions
   * @param {PNG} img - PNG image object
   * @param {number} width - Target width
   * @param {number} height - Target height
   * @returns {PNG} - Resized PNG object
   */
  resizeImage(img, width, height) {
    const resized = new PNG({ width, height });
    
    // Simple nearest-neighbor resize
    const xRatio = img.width / width;
    const yRatio = img.height / height;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const srcX = Math.floor(x * xRatio);
        const srcY = Math.floor(y * yRatio);
        const srcIdx = (srcY * img.width + srcX) << 2;
        const dstIdx = (y * width + x) << 2;

        resized.data[dstIdx] = img.data[srcIdx];
        resized.data[dstIdx + 1] = img.data[srcIdx + 1];
        resized.data[dstIdx + 2] = img.data[srcIdx + 2];
        resized.data[dstIdx + 3] = img.data[srcIdx + 3];
      }
    }

    return resized;
  }

  /**
   * Compare two images and generate diff
   * @param {string} figmaImagePath - Path to Figma design image
   * @param {string} webpageImagePath - Path to webpage screenshot
   * @param {string} outputName - Name for the output diff image
   * @returns {Promise<Object>} - Comparison result with metrics
   */
  async compareImages(figmaImagePath, webpageImagePath, outputName = 'diff') {
    try {
      // Load both images
      const figmaImg = await this.loadImage(figmaImagePath);
      const webpageImg = await this.loadImage(webpageImagePath);

      // Get dimensions
      const width = Math.max(figmaImg.width, webpageImg.width);
      const height = Math.max(figmaImg.height, webpageImg.height);

      // Resize images if dimensions don't match
      const figmaResized = figmaImg.width !== width || figmaImg.height !== height
        ? this.resizeImage(figmaImg, width, height)
        : figmaImg;

      const webpageResized = webpageImg.width !== width || webpageImg.height !== height
        ? this.resizeImage(webpageImg, width, height)
        : webpageImg;

      // Create diff image
      const diff = new PNG({ width, height });
      
      // Compare images using pixelmatch
      const numDiffPixels = pixelmatch(
        figmaResized.data,
        webpageResized.data,
        diff.data,
        width,
        height,
        {
          threshold: this.threshold,
          alpha: 0.1,
          diffColor: [255, 0, 0], // Red color for differences
          diffColorAlt: [0, 255, 0], // Green color for differences (alternative)
        }
      );

      // Calculate difference percentage
      const totalPixels = width * height;
      const diffPercentage = (numDiffPixels / totalPixels) * 100;

      // Save diff image
      const diffPath = path.join(this.outputDir, `${outputName}.png`);
      await this.saveImage(diff, diffPath);

      // Create side-by-side comparison
      const comparisonPath = path.join(this.outputDir, `${outputName}-comparison.png`);
      await this.createSideBySideComparison(figmaResized, webpageResized, diff, comparisonPath);

      return {
        match: numDiffPixels === 0,
        diffPixels: numDiffPixels,
        totalPixels: totalPixels,
        diffPercentage: diffPercentage.toFixed(2),
        threshold: this.threshold,
        diffImagePath: diffPath,
        comparisonImagePath: comparisonPath,
        passed: diffPercentage <= (this.threshold * 100)
      };
    } catch (error) {
      throw new Error(`Image comparison failed: ${error.message}`);
    }
  }

  /**
   * Create side-by-side comparison image
   * @param {PNG} img1 - First image (Figma)
   * @param {PNG} img2 - Second image (Webpage)
   * @param {PNG} diff - Diff image
   * @param {string} outputPath - Output path
   */
  async createSideBySideComparison(img1, img2, diff, outputPath) {
    const spacing = 10;
    const width = img1.width + img2.width + diff.width + (spacing * 2);
    const height = Math.max(img1.height, img2.height, diff.height);

    const comparison = new PNG({ width, height });

    // Fill with white background
    for (let i = 0; i < comparison.data.length; i += 4) {
      comparison.data[i] = 255;     // R
      comparison.data[i + 1] = 255; // G
      comparison.data[i + 2] = 255; // B
      comparison.data[i + 3] = 255; // A
    }

    // Copy images side by side
    this.copyImage(comparison, img1, 0, 0);
    this.copyImage(comparison, img2, img1.width + spacing, 0);
    this.copyImage(comparison, diff, img1.width + img2.width + (spacing * 2), 0);

    await this.saveImage(comparison, outputPath);
  }

  /**
   * Copy image to another image at specified position
   * @param {PNG} target - Target image
   * @param {PNG} source - Source image
   * @param {number} x - X position
   * @param {number} y - Y position
   */
  copyImage(target, source, x, y) {
    for (let sy = 0; sy < source.height; sy++) {
      for (let sx = 0; sx < source.width; sx++) {
        const srcIdx = (sy * source.width + sx) << 2;
        const tx = x + sx;
        const ty = y + sy;

        if (tx >= 0 && tx < target.width && ty >= 0 && ty < target.height) {
          const dstIdx = (ty * target.width + tx) << 2;
          target.data[dstIdx] = source.data[srcIdx];
          target.data[dstIdx + 1] = source.data[srcIdx + 1];
          target.data[dstIdx + 2] = source.data[srcIdx + 2];
          target.data[dstIdx + 3] = source.data[srcIdx + 3];
        }
      }
    }
  }

  /**
   * Save PNG image to file
   * @param {PNG} img - PNG image object
   * @param {string} outputPath - Output file path
   * @returns {Promise<void>}
   */
  async saveImage(img, outputPath) {
    return new Promise((resolve, reject) => {
      const stream = fs.createWriteStream(outputPath);
      img.pack().pipe(stream)
        .on('finish', resolve)
        .on('error', reject);
    });
  }

  /**
   * Take screenshot of a page element
   * @param {Page} page - Playwright page object
   * @param {string} selector - CSS selector
   * @param {string} outputPath - Output path for screenshot
   * @returns {Promise<void>}
   */
  async takeElementScreenshot(page, selector, outputPath) {
    const element = await page.locator(selector);
    await element.screenshot({ path: outputPath });
  }
}

