# OmniTool

Privacy-first digital workspace for file processing in the browser.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/react-v19.0.0-61dafb.svg)
![PWA](https://img.shields.io/badge/PWA-ready-6b7280.svg)
![Privacy](https://img.shields.io/badge/privacy-client--side-green.svg)

## Product Overview

OmniTool is a browser-native workspace for image and document workflows. It is designed to feel like a production SaaS interface without requiring backend infrastructure.

Core principles:

- Client-side processing only
- No server uploads
- Fast, low-friction workflows
- Top-navigation tool discovery
- Dark and light mode support
- Accessible, keyboard-friendly interactions

## Recent Updates

- Fixed invalid nested interactive elements in tool cards for better accessibility.
- Corrected archive category naming consistency across navigation and footer.
- Added a global footer view counter.
- Migrated runtime processing dependencies from CDN script tags to npm-bundled imports.
- Added integration smoke tests for core PDF workflows.
- Improved object URL cleanup across conversion/export tools to prevent memory leaks.

## Current Capabilities

### Image workflows

- Resize and bulk resize
- Compress and convert formats
- Crop, rotate, and flip
- Background removal
- Collage builder
- Meme editor
- Color extraction
- Image upscaling

### Document workflows

- Image to PDF
- JPG to PDF
- PNG to PDF
- PDF compression
- PDF to image
- PDF to GIF
- PDF text and document conversion
- PDF merge/split/rotate/watermark
- PDF protect/unlock
- PDF organize and page numbering

### Archive workflows

- ZIP create
- ZIP extract

### Conversion workflows

- HEIC to JPG
- PNG to SVG
- SVG conversion modes
- WebP to JPG
- PNG to JPG
- JPG to PNG

## UX and Product Layer

The app includes a product-oriented shell instead of a flat tool list:

- Category-first top navigation with hover tool discovery
- Pinned tools and recent tools
- Category filters and searchable tool discovery
- Unified premium tool workspace shell
- Drag, browse, and paste upload pathways
- Footer quick navigation and live view count

## Runtime and Performance Notes

OmniTool now uses bundled npm dependencies for processing libraries (for example `pdfjs-dist`, `jspdf`, `jszip`, `heic2any`, `gif.js`, `imagetracerjs`) instead of runtime CDN globals. This keeps behavior consistent with the privacy/offline model and avoids third-party script dependency at runtime.

To keep initial load fast, heavy tools are lazy-loaded. The HEIC conversion path uses a large decoder bundle that is only fetched when the HEIC tool is opened.

Bundle budget enforcement is strict by default (`500KB` per JS asset), with a targeted override for the lazily loaded HEIC tool chunk.

## Tech Stack

- React 19
- TypeScript
- Tailwind CSS
- Framer Motion
- Vite

## Local Development

### Prerequisites

- Node.js 18+
- npm

### Install

```bash
npm install
```

### Run

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Test and Quality Gates

```bash
npm run test:coverage
npm run perf:check
```

## Deployment

This project is configured for Vercel:

- Build command: `npm run build`
- Output directory: `dist`
- GitHub push to the deployment branch should trigger Vercel deployments when the repo is linked.

## Privacy Model

OmniTool is a static web app without a server-side processing layer. Files are handled in-browser by the client runtime.

## License

MIT License
