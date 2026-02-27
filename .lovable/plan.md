

# DVH-IMS V1.7.x — Hero Image Generation & Overlay Update

## Approach

Use the Nano banana pro model (`google/gemini-3-pro-image-preview`) to generate a purpose-built hero image matching the required style, then integrate it into the landing page.

## Steps

### 1. Generate Hero Image

Prompt the AI image model with:
- Scene: Surinamese community scene — smiling adults with children in a supportive, warm setting
- Tone: Hopeful, government-appropriate, professional
- Composition: Subjects centered in the middle 60% of the frame, with breathing room on edges for safe cropping at all viewports
- Aspect ratio: 16:9 landscape (1920x1080)
- No text, no watermarks

Model: `google/gemini-3-pro-image-preview` (higher quality)

### 2. Save Image to Project

Save the generated image as `src/assets/images/hero-community.png` (base64 decode from generation response).

Note: Vite will handle bundling. WebP conversion is not natively available in-browser generation — the PNG output from the model will be optimized by Vite's asset pipeline. If the file exceeds 500KB, a follow-up compression pass can be discussed.

### 3. Update `src/app/(public)/landing/page.tsx`

Two changes:
- **Import**: Change from `bg-pattern-1.png` to `hero-community.png`
- **Overlay**: Change `rgba(30, 41, 59, 0.85)` to `rgba(0, 0, 0, 0.60)`

No changes to hero height, typography, buttons, or layout structure.

### 4. Documentation

- Create `docs/restore-points/v1.7/RESTORE_POINT_V1.7_HERO_IMAGE_OVERLAY_UPDATE.md`
- Update `docs/DVH-IMS-V1.0_1.1/architecture.md` under Public UI section

### 5. Browser Verification

Desktop and mobile screenshots to confirm:
- No face cropping at standard viewports
- Text contrast remains strong with overlay
- No overflow or layout shift

## Files Changed

| File | Action |
|------|--------|
| `src/assets/images/hero-community.png` | New (AI-generated) |
| `src/app/(public)/landing/page.tsx` | Import + overlay opacity |
| `docs/restore-points/v1.7/RESTORE_POINT_V1.7_HERO_IMAGE_OVERLAY_UPDATE.md` | New |
| `docs/DVH-IMS-V1.0_1.1/architecture.md` | Updated |

## Limitation

AI image generation produces PNG. True WebP conversion requires a build plugin or external tool — not available in-project. The generated PNG will be optimized by Vite's default asset handling. File size will be assessed after generation.

