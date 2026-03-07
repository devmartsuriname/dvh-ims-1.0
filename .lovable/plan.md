

# Replace Left Panel Image

**Task:** Replace the current `hero-community.png` with the external side image from the wizard-form template.

## Approach

Since Lovable cannot download external files directly into the assets folder, the image will be referenced via its external URL directly in the `backgroundImage` style property. This avoids needing a local asset.

**File:** `src/app/(public)/landing/page.tsx`

### Changes

1. Remove the `import heroImage` line (no longer needed for left panel)
2. Replace `backgroundImage: url(${heroImage})` with `backgroundImage: url(https://jthemes.net/themes/html/wizard-form/v1/assets/img/side-img.jpg)` in both the desktop and mobile image panels
3. Remove `filter: 'grayscale(100%)'` — the new image is a designed illustration, not a photo requiring B&W treatment
4. Remove the dark overlay div — the new image has its own visual treatment and does not need a contrast overlay

### What does NOT change
- Header / Footer
- Right column content
- Service cards
- Routing / i18n
- Any other files

