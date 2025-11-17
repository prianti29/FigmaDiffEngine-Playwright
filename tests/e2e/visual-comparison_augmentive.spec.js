import { test, expect } from '@playwright/test';
import { ImageComparison } from '../../utils/image-comparison.js';
import { FigmaHelper } from '../../utils/figma-helper.js';
import path from 'path';
import fs from 'fs';

const WEBSITE_URL = 'https://augmentive.health/login';

test.describe('Visual Comparison: Figma vs Webpage', () => {
  let imageComparison;
  let figmaHelper;

  // Increase test timeout to 60 seconds
  test.setTimeout(60000);

  test.beforeEach(() => {
    imageComparison = new ImageComparison({
      threshold: 0.1, // 10% difference threshold
      outputDir: './diff'
    });
    figmaHelper = new FigmaHelper('./baseline');
  });

  test('Compare login page design with webpage', async ({ page }) => {
    // Set viewport to match Figma design (1920x1080)
    await page.setViewportSize({ width: 1920, height: 1080 });

    // Navigate to the webpage with increased timeout and better wait strategy
    await page.goto(WEBSITE_URL, {
      waitUntil: 'domcontentloaded', // Faster than networkidle
      timeout: 60000 // 60 seconds timeout
    });

    // Wait for page to be ready (more reliable than networkidle)
    await page.waitForLoadState('domcontentloaded');
    // Give page a moment to render
    await page.waitForTimeout(2000);

    // Take screenshot of the page
    const screenshotPath = './screenshots/loginPage-actual.png';
    await page.screenshot({
      path: screenshotPath,
      fullPage: true
    });

    // Get Figma baseline image path from loginPage folder
    // Note: getBaselinePath() already adds './baseline' prefix, so just pass the relative path
    const figmaImagePath = figmaHelper.getBaselinePath('loginPage/1920.png');

    // Check if baseline exists
    if (!figmaHelper.baselineExists('loginPage/1920.png')) {
      test.skip('Figma baseline image not found. Please add loginPage/1920.png to ./baseline folder');
    }

    // Compare images
    const result = await imageComparison.compareImages(
      figmaImagePath,
      screenshotPath,
      'loginPage-diff'
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
      { name: 'desktop-1920', width: 1920, height: 1080, figmaImage: 'loginPage/1920.png' },
      { name: 'desktop-1440', width: 1440, height: 900, figmaImage: 'loginPage/1440.png' },
      { name: 'tablet-1024', width: 1024, height: 768, figmaImage: 'loginPage/1024.png' },
      { name: 'tablet-768', width: 768, height: 1024, figmaImage: 'loginPage/768.png' }
    ];

    for (const viewport of viewports) {
      // Set viewport
      await page.setViewportSize({ width: viewport.width, height: viewport.height });

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
      const screenshotPath = `./screenshots/loginPage-${viewport.name}.png`;
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
        `loginPage-${viewport.name}-diff`
      );

      console.log(`${viewport.name} (${viewport.width}x${viewport.height}) - Difference: ${result.diffPercentage}%`);
      expect(result.passed,
        `${viewport.name} viewport difference (${result.diffPercentage}%) exceeds threshold`
      ).toBeTruthy();
    }
  });
});

