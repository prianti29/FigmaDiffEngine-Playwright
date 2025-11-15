/**
 * Example usage of the Image Comparison utility
 * This demonstrates how to compare Figma designs with webpage screenshots
 */

import { ImageComparison } from '../utils/image-comparison.js';
import { FigmaHelper } from '../utils/figma-helper.js';

async function exampleComparison() {
  // Initialize the image comparison tool
  const imageComparison = new ImageComparison({
    threshold: 0.1, // 10% difference threshold
    outputDir: './diff'
  });

  // Initialize Figma helper
  const figmaHelper = new FigmaHelper('./baseline');

  // Example 1: Compare two images directly
  console.log('Example 1: Direct image comparison');
  try {
    const result = await imageComparison.compareImages(
      './baseline/homepage-figma.png',  // Figma design
      './screenshots/homepage-actual.png', // Webpage screenshot
      'homepage-comparison'
    );

    console.log('Comparison Results:');
    console.log(`  Difference: ${result.diffPercentage}%`);
    console.log(`  Different Pixels: ${result.diffPixels} / ${result.totalPixels}`);
    console.log(`  Status: ${result.passed ? 'PASSED ✓' : 'FAILED ✗'}`);
    console.log(`  Diff Image: ${result.diffImagePath}`);
    console.log(`  Comparison Image: ${result.comparisonImagePath}`);
  } catch (error) {
    console.error('Error:', error.message);
    console.log('Note: Make sure you have baseline and screenshot images in the correct folders');
  }

  // Example 2: List all available baselines
  console.log('\nExample 2: List available Figma baselines');
  const baselines = figmaHelper.listBaselines();
  if (baselines.length > 0) {
    console.log('Available baseline images:');
    baselines.forEach(baseline => console.log(`  - ${baseline}`));
  } else {
    console.log('No baseline images found. Add Figma design images to ./baseline folder');
  }

  // Example 3: Check if baseline exists
  console.log('\nExample 3: Check baseline existence');
  const baselineName = 'homepage-figma.png';
  if (figmaHelper.baselineExists(baselineName)) {
    console.log(`✓ Baseline found: ${baselineName}`);
    console.log(`  Path: ${figmaHelper.getBaselinePath(baselineName)}`);
  } else {
    console.log(`✗ Baseline not found: ${baselineName}`);
    console.log('  Please add this image to the ./baseline folder');
  }
}

// Run the example
exampleComparison().catch(console.error);

