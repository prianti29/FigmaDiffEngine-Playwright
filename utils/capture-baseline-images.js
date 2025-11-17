import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

/**
 * Capture website screenshots and save them as baseline images
 * This script navigates to a website and captures screenshots at different viewports
 */

/**
 * Capture baseline images from a website
 * @param {Object} options - Configuration options
 * @param {string} options.url - Website URL to capture
 * @param {string} options.outputDir - Directory to save baseline images (default: './baseline')
 * @param {Array<Object>} options.viewports - Array of viewport configurations
 */
async function captureBaselineImages(options = {}) {
  const {
    url = 'https://example.com',
    outputDir = './baseline',
    viewports = [
      { name: 'homepage', width: 1920, height: 1080, fullPage: true },
      { name: 'header', width: 1920, height: 100, selector: 'header', fullPage: false },
      { name: 'homepage-desktop', width: 1920, height: 1080, fullPage: true },
      { name: 'homepage-tablet', width: 768, height: 1024, fullPage: true },
      { name: 'homepage-mobile', width: 375, height: 667, fullPage: true },
    ]
  } = options;

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log(`\n🌐 Capturing screenshots from: ${url}\n`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Navigate to the website
    console.log('📡 Navigating to website...');
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000); // Wait for any animations/loading

    for (const viewport of viewports) {
      try {
        // Set viewport size
        await page.setViewportSize({ 
          width: viewport.width, 
          height: viewport.height 
        });

        // Wait a bit for layout to adjust
        await page.waitForTimeout(500);

        let screenshotPath;
        let imageName;

        if (viewport.selector) {
          // Capture specific element
          imageName = `${viewport.name}-figma.png`;
          screenshotPath = path.join(outputDir, imageName);
          
          console.log(`📸 Capturing ${viewport.name} (${viewport.width}x${viewport.height})...`);
          
          await page.waitForSelector(viewport.selector, { timeout: 5000 });
          const element = await page.locator(viewport.selector);
          await element.screenshot({ path: screenshotPath });
        } else {
          // Capture full page or viewport
          imageName = `${viewport.name}-figma.png`;
          screenshotPath = path.join(outputDir, imageName);
          
          console.log(`📸 Capturing ${viewport.name} (${viewport.width}x${viewport.height})...`);
          
          await page.screenshot({ 
            path: screenshotPath,
            fullPage: viewport.fullPage !== false
          });
        }

        console.log(`✅ Saved: ${imageName}\n`);
      } catch (error) {
        console.error(`❌ Error capturing ${viewport.name}:`, error.message);
      }
    }

    console.log('✨ Baseline images capture complete!\n');
    console.log(`📁 Images saved to: ${path.resolve(outputDir)}\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

/**
 * Quick capture function with default settings
 */
async function quickCapture(url) {
  await captureBaselineImages({ url });
}

// Run if called directly
const args = process.argv.slice(2);
if (args.length > 0 || import.meta.url === `file://${process.argv[1]}`) {
  const url = args[0] || 'https://example.com';
  captureBaselineImages({ url }).catch(console.error);
}

export { captureBaselineImages, quickCapture };

