import { test, expect } from '@playwright/test';
import { ImageComparison } from '../../utils/image-comparison.js';
import { FigmaHelper } from '../../utils/figma-helper.js';
import path from 'path';
import fs from 'fs';

test.describe('Visual Comparison: Figma vs Webpage', () => {
  let imageComparison;
  let figmaHelper;

  test.beforeEach(() => {
    imageComparison = new ImageComparison({
      threshold: 0.1, // 10% difference threshold
      outputDir: './diff'
    });
    figmaHelper = new FigmaHelper('./baseline');
  });

  test('Compare homepage design with webpage', async ({ page }) => {
    // Navigate to the webpage
    await page.goto('https://example.com');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of the page
    const screenshotPath = './screenshots/homepage-actual.png';
    await page.screenshot({ 
      path: screenshotPath,
      fullPage: true 
    });

    // Get Figma baseline image path
    const figmaImagePath = figmaHelper.getBaselinePath('homepage-figma.png');
    
    // Check if baseline exists
    if (!figmaHelper.baselineExists('homepage-figma.png')) {
      test.skip('Figma baseline image not found. Please add homepage-figma.png to ./baseline folder');
    }

    // Compare images
    const result = await imageComparison.compareImages(
      figmaImagePath,
      screenshotPath,
      'homepage-diff'
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
    // Navigate to the webpage
    await page.goto('https://example.com');
    
    // Wait for specific element
    const selector = 'header'; // Change this to your target selector
    await page.waitForSelector(selector);
    
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
    const viewports = [
      { name: 'desktop', width: 1920, height: 1080 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'mobile', width: 375, height: 667 }
    ];

    for (const viewport of viewports) {
      // Set viewport
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      
      // Navigate
      await page.goto('https://example.com');
      await page.waitForLoadState('networkidle');
      
      // Take screenshot
      const screenshotPath = `./screenshots/homepage-${viewport.name}.png`;
      await page.screenshot({ path: screenshotPath, fullPage: true });
      
      // Get corresponding Figma baseline
      const figmaImagePath = figmaHelper.getBaselinePath(`homepage-${viewport.name}-figma.png`);
      
      if (!figmaHelper.baselineExists(`homepage-${viewport.name}-figma.png`)) {
        console.log(`Skipping ${viewport.name} - baseline not found`);
        continue;
      }

      // Compare
      const result = await imageComparison.compareImages(
        figmaImagePath,
        screenshotPath,
        `homepage-${viewport.name}-diff`
      );

      console.log(`${viewport.name} viewport - Difference: ${result.diffPercentage}%`);
      expect(result.passed, 
        `${viewport.name} viewport difference (${result.diffPercentage}%) exceeds threshold`
      ).toBeTruthy();
    }
  });
});

