import { test, expect } from '@playwright/test';
import { ImageComparison } from '../../utils/image-comparison.js';
import path from 'path';

/**
 * Example test showing how to compare any two images
 * This is useful for comparing Figma designs with webpage screenshots
 */
test.describe('Custom Image Comparison', () => {
  test('Compare two custom images', async ({ page }) => {
    const imageComparison = new ImageComparison({
      threshold: 0.15, // 15% difference threshold
      outputDir: './diff'
    });

    // Path to your Figma design image
    const figmaImagePath = './baseline/my-design-figma.png';
    
    // Navigate and take screenshot
    await page.goto('https://example.com');
    await page.waitForLoadState('networkidle');
    
    const webpageImagePath = './screenshots/my-page-actual.png';
    await page.screenshot({ 
      path: webpageImagePath,
      fullPage: true 
    });

    // Compare the images
    const result = await imageComparison.compareImages(
      figmaImagePath,
      webpageImagePath,
      'my-comparison-diff'
    );

    // Display results
    console.log('\n=== Visual Comparison Results ===');
    console.log(`Figma Design: ${figmaImagePath}`);
    console.log(`Webpage Screenshot: ${webpageImagePath}`);
    console.log(`Difference: ${result.diffPercentage}%`);
    console.log(`Different Pixels: ${result.diffPixels} out of ${result.totalPixels}`);
    console.log(`Threshold: ${result.threshold * 100}%`);
    console.log(`Status: ${result.passed ? 'PASSED ✓' : 'FAILED ✗'}`);
    console.log(`\nDiff Image: ${result.diffImagePath}`);
    console.log(`Comparison Image: ${result.comparisonImagePath}`);
    console.log('================================\n');

    // Assert based on your requirements
    if (result.passed) {
      console.log('✅ Visual comparison passed!');
    } else {
      console.log('❌ Visual comparison failed!');
      console.log(`   Difference (${result.diffPercentage}%) exceeds threshold (${result.threshold * 100}%)`);
    }

    // You can adjust the assertion based on your needs
    expect(result.diffPercentage).toBeLessThanOrEqual(result.threshold * 100);
  });

  test('Compare with custom threshold', async ({ page }) => {
    // Use a stricter threshold for critical components
    const imageComparison = new ImageComparison({
      threshold: 0.05, // 5% difference threshold (stricter)
      outputDir: './diff'
    });

    const figmaImagePath = './baseline/critical-component-figma.png';
    
    await page.goto('https://example.com');
    await page.waitForSelector('.critical-component'); // Wait for specific component
    
    const webpageImagePath = './screenshots/critical-component-actual.png';
    await page.locator('.critical-component').screenshot({ path: webpageImagePath });

    const result = await imageComparison.compareImages(
      figmaImagePath,
      webpageImagePath,
      'critical-component-diff'
    );

    console.log(`Critical Component Difference: ${result.diffPercentage}%`);
    
    // Stricter assertion for critical components
    expect(result.diffPercentage, 
      `Critical component has ${result.diffPercentage}% difference, which exceeds the strict threshold of 5%`
    ).toBeLessThanOrEqual(5);
  });
});

