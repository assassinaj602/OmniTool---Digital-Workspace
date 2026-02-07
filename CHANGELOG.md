# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2024-05-21
### 🎨 Visual Updates
- **Typography:** Switched to **Space Grotesk** for headings and **Inter** for UI to give the app a more modern, technical feel.
- **Header:** Removed redundant "Client-Side Secure" badge (information moved to footer/about).

### 🛡️ Reliability
- **Image Resizer:** Added input validation constraints.
- **PDF Generation:** Improved drag-and-drop stability in Image to PDF tool.
- **Color Picker:** Improved canvas rendering accuracy.

## [1.0.0] - 2024-05-20
### 🚀 Released
- Initial Production Release of OmniTool.

### ✨ New Features
- **Dashboard:** New grid layout with category sorting and search (Ctrl+K).
- **Dark Mode:** Deepened slate palette for better contrast.
- **Tools Added:**
    - Bulk Image Resizer (ZIP export).
    - HEIC to JPG Converter.
    - SVG Vectorizer (Raster to SVG).
    - PDF to GIF Converter.
    - PDF Compressor with quality presets.

### 💎 Improvements
- **UX:** Added micro-interactions and hover states to all cards.
- **Performance:** Optimized `pdf.js` worker loading.
- **Animations:** Added `framer-motion` for smooth list reordering in PDF/Collage tools.

### 🐛 Fixed
- Fixed aspect ratio drift in Image Resizer.
- Resolved mobile drag-and-drop issues in Collage Maker.
