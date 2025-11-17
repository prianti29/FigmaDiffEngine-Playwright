# Diff Images Folder

This folder contains visual difference images generated during comparison tests.

## Purpose

When comparing Figma designs with webpage screenshots, diff images are created to highlight the differences between them.

## Generated Files

The following diff files will be created during test execution:

- `homepage-diff.png` - Difference image for homepage comparison
- `header-diff.png` - Difference image for header comparison
- `homepage-desktop-diff.png` - Difference image for desktop viewport
- `homepage-tablet-diff.png` - Difference image for tablet viewport
- `homepage-mobile-diff.png` - Difference image for mobile viewport
- `my-comparison-diff.png` - Custom comparison diff image
- `critical-component-diff.png` - Critical component diff image

## Understanding Diff Images

- **Black areas**: Identical pixels (no difference)
- **Colored areas**: Different pixels (showing the differences)
- **Comparison images**: Side-by-side view of baseline vs actual

## Note

This folder is in .gitignore and will not be tracked in git. Diff images are generated fresh on each test run.
