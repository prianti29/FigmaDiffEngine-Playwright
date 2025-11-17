# Screenshots Folder

This folder contains screenshots of webpages captured during test execution.

## Purpose

Screenshots are automatically generated when tests run and are used for comparison with Figma baseline images.

## Generated Files

The following screenshot files will be created during test execution:

- `homepage-actual.png` - Full page screenshot
- `header-actual.png` - Header element screenshot
- `homepage-desktop.png` - Desktop viewport screenshot
- `homepage-tablet.png` - Tablet viewport screenshot
- `homepage-mobile.png` - Mobile viewport screenshot
- `my-page-actual.png` - Custom page screenshot
- `critical-component-actual.png` - Critical component screenshot

## Note

This folder is in .gitignore and will not be tracked in git. Screenshots are generated fresh on each test run.
