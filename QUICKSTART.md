# Quick Start Guide

## Step 1: Install Dependencies

```bash
npm install
npx playwright install
```

## Step 2: Add Figma Design Images

Place your Figma design images (PNG format) in the `baseline/` folder:

```
baseline/
  ├── homepage-figma.png
  ├── header-figma.png
  └── homepage-desktop-figma.png
```

## Step 3: Run Your First Test

### Option A: Using the Test Files

1. Update the test file (`tests/e2e/visual-comparison.spec.js`) with your website URL
2. Ensure you have corresponding Figma images in `baseline/` folder
3. Run the test:

```bash
npm run test:visual
```

### Option B: Custom Comparison

1. Take a screenshot of your webpage manually or using Playwright
2. Save it in `screenshots/` folder
3. Use the comparison utility:

```javascript
import { ImageComparison } from './utils/image-comparison.js';

const imageComparison = new ImageComparison({
  threshold: 0.1,
  outputDir: './diff'
});

const result = await imageComparison.compareImages(
  './baseline/my-design-figma.png',
  './screenshots/my-page-actual.png',
  'my-comparison'
);

console.log(`Difference: ${result.diffPercentage}%`);
```

## Step 4: View Results

After running tests, check:

- **Diff images**: `diff/` folder - Shows differences highlighted in red/green
- **Comparison images**: `diff/*-comparison.png` - Side-by-side view
- **Test report**: Run `npm run report` to see HTML report

## Example Workflow

1. **Design in Figma** → Export as PNG → Save to `baseline/`
2. **Develop webpage** → Take screenshot → Save to `screenshots/`
3. **Run comparison** → Get diff percentage and visual diff
4. **Review differences** → Adjust design or code
5. **Re-run test** → Verify improvements

## Tips

- Use descriptive names for baseline images (e.g., `homepage-desktop-figma.png`)
- Match viewport sizes between Figma and webpage screenshots
- Adjust threshold based on component criticality (0.05 for critical, 0.1 for standard)
- Always review diff images to understand what changed

## Troubleshooting

**"Baseline image not found"**
- Check file name matches exactly (case-sensitive)
- Ensure image is in `baseline/` folder

**"High difference percentage"**
- Verify viewport sizes match
- Wait for page to fully load before screenshot
- Check for dynamic content (ads, timestamps, etc.)

**"Images not aligning"**
- Ensure both images have similar dimensions
- The tool auto-resizes, but matching dimensions work best

