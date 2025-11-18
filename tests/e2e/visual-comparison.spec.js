import { test, expect } from '@playwright/test';
import { ImageComparison } from '../../utils/image-comparison.js';
import { FigmaHelper } from '../../utils/figma-helper.js';
import { AuthHelper } from '../../utils/auth-helper.js';
import path from 'path';
import fs from 'fs';

const WEBSITE_URL = 'https://thebestcamo-dev.myshopify.com/pages/contact';

test.describe('Visual Comparison: Figma vs Webpage', () => {
  let imageComparison;
  let figmaHelper;

  // Increase test timeout to 60 seconds
  test.setTimeout(60000);

  test.beforeEach(() => {
    imageComparison = new ImageComparison({
      threshold: 0.12, // 12% difference threshold (slightly more lenient for full-page comparisons)
      outputDir: './diff'
    });
    figmaHelper = new FigmaHelper('./baseline');
  });

  test('Compare login page design with webpage', async ({ page }) => {
    // Set viewport to match Figma design (1920x1080)
    await page.setViewportSize({ width: 1920, height: 1080 });

    // Handle password-protected Shopify store
    await AuthHelper.authenticateShopifyStore(
      page,
      'https://thebestcamo-dev.myshopify.com/password',
      '1'
    );

    // Navigate to the target webpage with increased timeout and better wait strategy
    await page.goto(WEBSITE_URL, {
      waitUntil: 'networkidle', // Wait for all network requests to complete
      timeout: 60000 // 60 seconds timeout
    });

    // Wait for page to be fully loaded and stable
    await page.waitForLoadState('networkidle');

    // Wait for key content to be visible
    await page.waitForSelector('h2', { timeout: 10000 });

    // Wait for images to load
    await page.evaluate(() => {
      return Promise.all(
        Array.from(document.images).map(img => {
          if (img.complete) return Promise.resolve();
          return new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            setTimeout(reject, 5000);
          });
        })
      );
    }).catch(() => { }); // Ignore image load errors

    // Give page additional time to render and stabilize
    await page.waitForTimeout(1000);

    // Take screenshot of the page
    const screenshotPath = './screenshots/theBestCamo/contactPage-actual.png';
    await page.screenshot({
      path: screenshotPath,
      fullPage: true
    });

    // Get Figma baseline image path from loginPage folder
    // Note: getBaselinePath() already adds './baseline' prefix, so just pass the relative path
    const figmaImagePath = figmaHelper.getBaselinePath('thebestcamo-contact-us/Contact.png');

    // Check if baseline exists
    if (!figmaHelper.baselineExists('thebestcamo-contact-us/Contact.png')) {
      test.skip('Figma baseline image not found. Please add thebestcamo-contact-us/Contact.png to ./baseline folder');
    }

    // Compare images
    const result = await imageComparison.compareImages(
      figmaImagePath,
      screenshotPath,
      'theBestCamo/contactPage-diff'
    );

    // Log comparison results
    console.log('Comparison Results:');
    console.log(`- Difference: ${result.diffPercentage}%`);
    console.log(`- Different Pixels: ${result.diffPixels} / ${result.totalPixels}`);
    console.log(`- Diff Image: ${result.diffImagePath}`);
    console.log(`- Comparison Image: ${result.comparisonImagePath}`);

    // Assert that the difference is within threshold
    expect(result.passed,
      `Visual difference (${result.diffPercentage}%) exceeds threshold (${result.threshold * 100}%). ` +
      `See diff image: ${result.diffImagePath}`
    ).toBeTruthy();
  });

  test('Compare specific element with Figma design', async ({ page }) => {
    // Handle password-protected Shopify store
    await AuthHelper.authenticateShopifyStore(
      page,
      'https://thebestcamo-dev.myshopify.com/password',
      '1'
    );

    // Navigate to the webpage with increased timeout
    await page.goto(WEBSITE_URL, {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    // Wait for page to be ready
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    // Wait for specific element
    const selector = 'header'; // Change this to your target selector
    await page.waitForSelector(selector, { timeout: 10000 });

    // Take screenshot of the element
    const screenshotPath = './screenshots/header-actual.png';
    await imageComparison.takeElementScreenshot(page, selector, screenshotPath);

    // Get Figma baseline
    const figmaImagePath = figmaHelper.getBaselinePath('header-figma.png');

    if (!figmaHelper.baselineExists('header-figma.png')) {
      test.skip('Figma baseline image not found. Please add header-figma.png to ./baseline folder');
    }

    // Compare images
    const result = await imageComparison.compareImages(
      figmaImagePath,
      screenshotPath,
      'header-diff'
    );

    console.log('Header Comparison Results:');
    console.log(`- Difference: ${result.diffPercentage}%`);
    console.log(`- Match: ${result.match}`);

    expect(result.passed).toBeTruthy();
  });

  test('Compare multiple viewports', async ({ page }) => {
    // Map viewport widths to your Figma images in loginPage folder
    const viewports = [
      { name: 'desktop-1920', width: 1920, height: 1080, figmaImage: 'thebestcamo-contact-us/Contact.png' },

    ];

    for (const viewport of viewports) {
      // Set viewport
      await page.setViewportSize({ width: viewport.width, height: viewport.height });

      // Handle password-protected Shopify store (only on first iteration)
      if (viewport === viewports[0]) {
        await AuthHelper.authenticateShopifyStore(
          page,
          'https://thebestcamo-dev.myshopify.com/password',
          '1'
        );
      }

      // Navigate with increased timeout and better wait strategy
      await page.goto(WEBSITE_URL, {
        waitUntil: 'domcontentloaded',
        timeout: 60000
      });

      // Wait for page to be ready
      await page.waitForLoadState('domcontentloaded');
      // Give page time to render
      await page.waitForTimeout(2000);

      // Take screenshot
      const screenshotPath = `./screenshots/theBestCamo/contactPage-${viewport.name}.png`;
      await page.screenshot({ path: screenshotPath, fullPage: true });

      // Get corresponding Figma baseline from loginPage folder
      const figmaImagePath = figmaHelper.getBaselinePath(viewport.figmaImage);

      if (!figmaHelper.baselineExists(viewport.figmaImage)) {
        console.log(`Skipping ${viewport.name} - baseline not found: ${viewport.figmaImage}`);
        continue;
      }

      // Compare
      const result = await imageComparison.compareImages(
        figmaImagePath,
        screenshotPath,
        `theBestCamo/contactPage-${viewport.name}-diff`
      );

      console.log(`${viewport.name} (${viewport.width}x${viewport.height}) - Difference: ${result.diffPercentage}%`);
      expect(result.passed,
        `${viewport.name} viewport difference (${result.diffPercentage}%) exceeds threshold`
      ).toBeTruthy();
    }
  });
});

