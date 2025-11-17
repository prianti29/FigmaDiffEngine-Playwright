# Baseline Images Folder

This folder contains your Figma design images that will be used as baselines for visual comparison.

## Expected Image Files

Based on the test files, you should add the following Figma images here:

### From visual-comparison.spec.js:

- `homepage-figma.png` - Full homepage design
- `header-figma.png` - Header component design
- `homepage-desktop-figma.png` - Desktop viewport design
- `homepage-tablet-figma.png` - Tablet viewport design
- `homepage-mobile-figma.png` - Mobile viewport design

### From custom-comparison.spec.js:

- `my-design-figma.png` - Custom design image
- `critical-component-figma.png` - Critical component design

## How to Add Images

### Option 1: Capture from Website (Recommended for Quick Start)

Capture actual website screenshots to use as baseline:

```bash
# Capture screenshots from a website
npm run capture:baseline https://your-website.com

# Or use the default example.com
npm run capture:baseline
```

This will automatically capture screenshots at different viewports and save them as baseline images.

### Option 2: Export from Figma

1. Export your designs from Figma as PNG images
2. Save them in this `baseline/` folder with the exact filenames listed above
3. The tests will automatically find and use these images for comparison

### Option 3: Generate Placeholder Images

If you just need placeholder images for testing:

```bash
npm run generate:placeholders
```

## Note

This folder is tracked in git (not in .gitignore), so your baseline images will be version controlled.
