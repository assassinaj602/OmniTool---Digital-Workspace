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
- Command-driven navigation
- Dark and light mode support

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

### Conversion workflows

- HEIC to JPG
- PNG to SVG
- SVG conversion modes
- WebP to JPG
- PNG to JPG
- JPG to PNG

## UX and Product Layer

The app includes a product-oriented shell instead of a flat tool list:

- Command palette with command-style actions and navigation
- Pinned tools and recent tools
- Category filters and searchable tool discovery
- Unified premium tool workspace shell
- Drag, browse, and paste upload pathways

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

## Deployment

This project is configured for Vercel:

- Build command: `npm run build`
- Output directory: `dist`

## Privacy Model

OmniTool is a static web app without a server-side processing layer. Files are handled in-browser by the client runtime.

## License

MIT License
