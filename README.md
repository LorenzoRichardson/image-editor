# AVNAC — Photo Editor (Vite + React)

A lightweight, local-only photo editor built with Vite + React. Uses Canvas 2D's `ctx.filter` to apply adjustments (brightness, contrast, saturation, hue, sepia, invert, blur). Exports final images as PNG.

### Features
- Upload image (client-side only)
- Floating sidebar drawer (press **E** to toggle)
- Adjustments: Brightness, Contrast, Saturation, Hue, Warm (sepia), Cool (invert), Blur
- Resize canvas (width/height) and show natural size
- Reset & Download as PNG

### Quickstart
```bash
npm install
npm run dev
```

Then open the printed local URL (default http://localhost:5173).

### Notes
- All processing is local in the browser; no server required.
- You can deploy this anywhere that serves static files (e.g., Vercel, GitHub Pages, S3, EC2 nginx).
- If you want Tailwind/MUI added later, it's straightforward—this version keeps dependencies minimal.
