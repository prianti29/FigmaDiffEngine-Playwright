# Figma Diff Engine - Playwright Visual Testing

A Playwright automation project for comparing Figma design images with webpage screenshots to identify visual differences and improve UI automation testing.

## Features

- 🎨 Compare Figma designs with webpage screenshots
- 📊 Generate visual diff images highlighting differences
- 📸 Side-by-side comparison views
- 🎯 Configurable difference thresholds
- 📱 Support for multiple viewports (desktop, tablet, mobile)
- 🔍 Element-level comparison
- 📈 Detailed comparison metrics

## Project Structure

```
.
├── baseline/              # Figma design images (baseline)
├── screenshots/           # Webpage screenshots
├── diff/                 # Generated diff images
├── reports/              # Test reports
├── tests/
│   ├── e2e/             # End-to-end tests
│   │   ├── visual-comparison.spec.js
│   │   └── custom-comparison.spec.js
│   └── api/             # API tests (if needed)
├── utils/
│   ├── image-comparison.js  # Image comparison utilities
│   └── figma-helper.js      # Figma baseline helpers
├── pages/               # Page Object Model (if needed)
├── fixtures/            # Test fixtures
└── playwright.config.js # Playwright configuration
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Install Playwright browsers:
```bash
npx playwright install
```

## Usage

### 1. Prepare Figma Baseline Images

Place your Figma design images in the `baseline/` folder:
- `homepage-figma.png`
- `header-figma.png`
- `homepage-desktop-figma.png`
- etc.

### 2. Run Visual Comparison Tests

```bash
# Run all tests
npm test

# Run visual comparison tests only
npm run test:visual

# Run with UI mode
npm run test:ui

# Run in headed mode (see browser)
npm run test:headed

# Debug mode
npm run test:debug
```

### 3. View Test Reports

```bash
npm run report
```

## How It Works

1. **Take Screenshot**: Playwright captures a screenshot of the webpage
2. **Load Baseline**: Load the corresponding Figma design image
3. **Compare**: Use pixel-level comparison to find differences
4. **Generate Diff**: Create visual diff images showing differences
5. **Report**: Display metrics and comparison results

## Example Test

```javascript
import { test, expect } from '@playwright/test';
import { ImageComparison } from '../../utils/image-comparison.js';
import { FigmaHelper } from '../../utils/figma-helper.js';

test('Compare homepage with Figma design', async ({ page }) => {
  const imageComparison = new ImageComparison({
    threshold: 0.1, // 10% difference threshold
    outputDir: './diff'
  });
  
  const figmaHelper = new FigmaHelper('./baseline');
  
  // Navigate to webpage
  await page.goto('https://example.com');
  
  // Take screenshot
  const screenshotPath = './screenshots/homepage-actual.png';
  await page.screenshot({ path: screenshotPath, fullPage: true });
  
  // Compare with Figma design
  const result = await imageComparison.compareImages(
    figmaHelper.getBaselinePath('homepage-figma.png'),
    screenshotPath,
    'homepage-diff'
  );
  
  // Assert difference is within threshold
  expect(result.passed).toBeTruthy();
});
```

## Configuration

### Image Comparison Options

```javascript
const imageComparison = new ImageComparison({
  threshold: 0.1,        // 10% difference threshold (0.0 - 1.0)
  outputDir: './diff'    // Directory for diff images
});
```

### Thresholds

- **0.05 (5%)**: Very strict - for critical components
- **0.1 (10%)**: Standard - for most UI elements
- **0.15 (15%)**: Lenient - for complex layouts

## Output Files

After running tests, you'll find:

- **Diff Images** (`diff/`): Highlight differences in red/green
- **Comparison Images** (`diff/*-comparison.png`): Side-by-side view (Figma | Webpage | Diff)
- **Screenshots** (`screenshots/`): Actual webpage screenshots

## Comparison Metrics

Each comparison returns:
- `diffPercentage`: Percentage of different pixels
- `diffPixels`: Number of different pixels
- `totalPixels`: Total pixels in image
- `match`: Boolean indicating exact match
- `passed`: Boolean indicating if within threshold
- `diffImagePath`: Path to diff image
- `comparisonImagePath`: Path to side-by-side comparison

## Best Practices

1. **Organize Baselines**: Use descriptive names for Figma images
2. **Set Appropriate Thresholds**: Stricter for critical components
3. **Update Baselines**: When designs change, update baseline images
4. **Review Diff Images**: Always check diff images for false positives
5. **Version Control**: Consider tracking baseline images in git

## Troubleshooting

### Baseline image not found
- Ensure Figma images are in the `baseline/` folder
- Check file names match exactly (case-sensitive)

### High difference percentage
- Check if viewport sizes match
- Verify page is fully loaded before screenshot
- Consider adjusting threshold for complex layouts

### Images not aligning
- Ensure both images have similar dimensions
- The tool automatically resizes, but matching dimensions work best

## Contributing

Feel free to extend this project with:
- Additional comparison algorithms
- CI/CD integration
- Visual regression testing workflows
- Custom reporters

## License

ISC

