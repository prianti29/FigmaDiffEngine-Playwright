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
import { ImageComparison } from "./utils/image-comparison.js";
import { FigmaHelper } from "./utils/figma-helper.js";

const imageComparison = new ImageComparison({
  threshold: 0.1,
  outputDir: "./diff",
});

const figmaHelper = new FigmaHelper("./baseline");

const result = await imageComparison.compareImages(
  figmaHelper.getBaselinePath("my-design-figma.png"),
  "./screenshots/my-page-actual.png",
  "my-comparison"
);

console.log(`Difference: ${result.diffPercentage}%`);
```

### Option C: Password-Protected Sites

For password-protected sites (e.g., Shopify stores):

```javascript
import { AuthHelper } from "./utils/auth-helper.js";

// Authenticate first
await AuthHelper.authenticateShopifyStore(
  page,
  "https://store.myshopify.com/password",
  "your-password"
);

// Then navigate and take screenshot
await page.goto("https://store.myshopify.com/pages/contact", {
  waitUntil: "networkidle",
});
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
- Adjust threshold based on component criticality:
  - 0.05 (5%) for critical components
  - 0.1 (10%) for standard UI elements
  - 0.12 (12%) for full-page comparisons (recommended)
  - 0.15 (15%) for complex layouts
- Always review diff images to understand what changed
- Wait for `networkidle` before taking screenshots to ensure page is fully loaded
- Use `AuthHelper` for password-protected sites

## Troubleshooting

**"Baseline image not found"**

- Check file name matches exactly (case-sensitive)
- Ensure image is in `baseline/` folder

**"High difference percentage"**

- Verify viewport sizes match
- Wait for page to fully load before screenshot (use `waitUntil: 'networkidle'`)
- Wait for images to load completely
- Check for dynamic content (ads, timestamps, etc.)
- Consider using 12% threshold for full-page comparisons
- Review diff images to identify specific problem areas

**"Images not aligning"**

- Ensure both images have similar dimensions
- The tool auto-resizes, but matching dimensions work best
