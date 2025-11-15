import fs from 'fs';
import path from 'path';

/**
 * Helper utilities for working with Figma design images
 */
export class FigmaHelper {
  constructor(baselineDir = './baseline') {
    this.baselineDir = baselineDir;
    this.ensureBaselineDir();
  }

  ensureBaselineDir() {
    if (!fs.existsSync(this.baselineDir)) {
      fs.mkdirSync(this.baselineDir, { recursive: true });
    }
  }

  /**
   * Get path to Figma baseline image
   * @param {string} imageName - Name of the image file
   * @returns {string} - Full path to the baseline image
   */
  getBaselinePath(imageName) {
    return path.join(this.baselineDir, imageName);
  }

  /**
   * Check if baseline image exists
   * @param {string} imageName - Name of the image file
   * @returns {boolean} - True if baseline exists
   */
  baselineExists(imageName) {
    const baselinePath = this.getBaselinePath(imageName);
    return fs.existsSync(baselinePath);
  }

  /**
   * List all baseline images
   * @returns {string[]} - Array of baseline image names
   */
  listBaselines() {
    if (!fs.existsSync(this.baselineDir)) {
      return [];
    }
    return fs.readdirSync(this.baselineDir)
      .filter(file => /\.(png|jpg|jpeg)$/i.test(file));
  }

  /**
   * Save image as baseline
   * @param {string} imagePath - Path to source image
   * @param {string} baselineName - Name for baseline
   * @returns {Promise<void>}
   */
  async saveBaseline(imagePath, baselineName) {
    const baselinePath = this.getBaselinePath(baselineName);
    await fs.promises.copyFile(imagePath, baselinePath);
  }
}

