# OmniTool - Privacy-First Digital Workspace 🛡️

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/react-v19.0.0-61dafb.svg)
![PWA](https://img.shields.io/badge/PWA-Ready-purple.svg)
![Privacy](https://img.shields.io/badge/privacy-100%25%20Client--Side-green.svg)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)

> **The all-in-one digital workspace that runs entirely in your browser.**  
> No uploads. No servers. No waiting. Just instant, secure file processing.

## 🌟 Why OmniTool?

Most online tools upload your sensitive documents to a remote server to process them. **OmniTool is different.**

By leveraging **WebAssembly** and modern browser APIs, OmniTool processes files directly on your device. This means:
1.  **🔒 Zero Privacy Risk:** Your files never leave your computer.
2.  **⚡ Instant Speed:** No upload or download latency.
3.  **📡 Offline Capable:** Works perfectly without an internet connection (PWA).

## 🚀 Features

### 🖼️ Image Tools
*   **Resizer:** Pixel-perfect scaling with preset aspects (Instagram, LinkedIn, HD).
*   **Compressor:** Reduce file size (WebP/JPEG) without visible quality loss.
*   **Cropper:** Interactive cropping with rule-of-thirds grid.
*   **Converter:** Universal format swapper (JPG ↔ PNG ↔ WebP).
*   **Collage Maker:** Drag-and-drop grid and layout creator.
*   **Enlarger:** Client-side upscaling.
*   **Rotate/Flip:** Orientation fixes.
*   **Color Picker:** Extract HEX/RGB from any pixel.

### 📄 PDF Tools
*   **Image to PDF:** Combine photos into professional documents.
*   **Compress PDF:** Optimize vector PDFs for email/web.
*   **PDF to Image:** Extract pages as high-res PNG/JPG.
*   **PDF to GIF:** Turn slides into animated loops.
*   **Converter:** Extract text and export to Word (.doc).

### 🛠️ Advanced Utilities
*   **Vectorization:** Convert Raster images (PNG/JPG) to SVG vectors.
*   **HEIC Support:** Native conversion for Apple image formats.
*   **Bulk Processing:** Resize multiple images at once (ZIP export).

## 💻 Tech Stack

*   **Frontend:** React 19, TypeScript
*   **Styling:** Tailwind CSS, Framer Motion
*   **Typography:** Space Grotesk (Headings), Inter (UI), JetBrains Mono (Data)
*   **Core Libraries:**
    *   `pdf.js` / `jspdf` (Document manipulation)
    *   `imagetracerjs` (Vectorization)
    *   `heic2any` (HEIC decoding)
    *   `jszip` (Archive generation)

## ⚡ Getting Started

### Prerequisites
*   Node.js (v18+)
*   npm or yarn

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/omnitool.git
    cd omnitool
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Start the development server**
    ```bash
    npm run start
    ```

4.  **Build for production**
    ```bash
    npm run build
    ```

## 🤝 Contributing

We love contributions! Whether it's a bug fix, a new tool, or a documentation improvement, your help is welcome.

Please read our [Contributing Guide](CONTRIBUTING.md) to get started.

## 🛡️ Privacy Policy

OmniTool is a **static web application**. It does not have a backend database. It does not use analytics cookies. All processing is performed using the client's hardware.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <sub>Built with ❤️ by the Open Source Community.</sub>
</div>
