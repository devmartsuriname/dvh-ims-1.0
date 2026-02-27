

# DVH-IMS V1.7.x — Hero Image Generation (Nano Banana Pro)

## Objective

Generate a new 1:1 hero image using `google/gemini-3-pro-image-preview` based on the uploaded reference (children + smiling adult, warm community tone). Replace existing `hero-community.png`.

## Steps

### 1. Generate Image via Nano Banana Pro

Prompt the model with composition-specific instructions:
- Scene: Warm community scene — smiling young woman with children, diverse Surinamese context
- Style: Similar to the reference — close group shot, joyful expressions, natural lighting
- Composition: 1920x1080 landscape, subjects centered within middle 60% of frame width, 10-15% breathing space at top
- No text, no watermarks, professional governmental tone

Model: `google/gemini-3-pro-image-preview`

### 2. Replace Asset

Overwrite `src/assets/images/hero-community.png` with the generated image.

### 3. No Code Changes Needed

The landing page (`src/app/(public)/landing/page.tsx`) already:
- Imports `hero-community.png`
- Uses `background-size: cover` + `background-position: center`
- Has overlay at `rgba(0, 0, 0, 0.60)`
- Hero height is unchanged

### 4. Update Restore Point

Update `docs/restore-points/v1.7/RESTORE_POINT_V1.7_HERO_IMAGE_OVERLAY_UPDATE.md` to reflect new generation pass.

### 5. Browser Verification

Desktop + mobile screenshots to confirm:
- No face cropping
- Text contrast strong
- Subjects within safe center area

## Files Changed

| File | Action |
|------|--------|
| `src/assets/images/hero-community.png` | Replaced (new generation) |
| `docs/restore-points/v1.7/RESTORE_POINT_V1.7_HERO_IMAGE_OVERLAY_UPDATE.md` | Updated |

## Limitation

PNG output from model (WebP conversion not available in-project). Vite handles asset optimization at build time.

