# DVH-IMS — Phase 13: Public Service QR Codes

## Approach

Since we cannot generate binary image files (PNG/JPG/SVG) directly in the Lovable editor, the implementation will:

1. **Create stable redirect routes** in the router
2. **Build an internal QR Code Generator page** (admin-only) that renders high-quality QR codes in-browser using a QR code library, with download buttons for PNG, SVG, and JPG formats
3. **Create documentation** for print usage guidelines

The QR codes will embed the production domain `volkshuisvesting.sr` and include the ministry logo (`logo-sozavo.png`) in the center.

---

## Step 1 — Redirect Routes

Add two redirect entries to `publicRoutes` in `src/routes/index.tsx`:

- `/q/woningregistratie` → redirects to `/housing/register`
- `/q/bouwsubsidie` → redirects to `/bouwsubsidie/apply`

These use React Router `<Navigate>` components so the canonical QR URLs remain stable even if form routes change.

## Step 2 — QR Code Generator Page

**New dependency:** `qrcode` (npm package for canvas/SVG QR generation with error correction level H)

**New file:** `src/app/(admin)/qr-codes/page.tsx`

An admin-only utility page that:

- Renders two QR codes pointing to `https://volkshuisvesting.sr/q/woningregistratie` and `https://volkshuisvesting.sr/q/bouwsubsidie`
- Uses error correction level H (highest, supports logo overlay)
- Renders with rounded modules, high contrast black/white
- Overlays the SoZaVo logo in the center
- Provides download buttons for PNG (3000px), SVG, and JPG formats
- Includes a combined PDF download option

**New admin route** added to `src/routes/index.tsx`:

- `/qr-codes` → QR Code Generator page

## Step 3 — Documentation

**New file:** `docs/DVH-IMS/V1.8/QR_CODES_PUBLIC_SERVICES.md`

Contains:

- Target URLs and redirect mappings
- Print usage guidelines (minimum 3cm × 3cm, recommended A4/A3 poster placement)
- Government office placement instructions
- Instructions for downloading assets from the admin page

**NOTE — Asset Consistency**

After generating the QR codes, also export and store the final official assets inside:

/docs/assets/qr-codes/

This ensures the ministry has a single official set of QR files for:

• posters

• printed materials

• media use

These files should not require regeneration from the admin tool.  
  
Keep The Darkone 1:1, Governance Rule, Same Patrn for page creation  
  
**Files Changed**


| File                                            | Action                            |
| ----------------------------------------------- | --------------------------------- |
| `src/routes/index.tsx`                          | ADD redirect routes + admin route |
| `src/app/(admin)/qr-codes/page.tsx`             | CREATE — QR generator page        |
| `docs/DVH-IMS/V1.8/QR_CODES_PUBLIC_SERVICES.md` | CREATE — documentation            |
| `package.json`                                  | ADD `qrcode` dependency           |
