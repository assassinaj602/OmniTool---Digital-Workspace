import React, { useState } from 'react';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { Dropzone } from '../components/Dropzone';
import { useNotification } from '../components/NotificationContext';

type NumberPosition = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';

export const PdfPageNumbers: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [position, setPosition] = useState<NumberPosition>('bottom-center');
  const [fontSize, setFontSize] = useState(12);
  const [isProcessing, setIsProcessing] = useState(false);
  const { notify } = useNotification();

  const getCoords = (width: number, height: number, textWidth: number, size: number, pos: NumberPosition) => {
    const margin = 24;
    switch (pos) {
      case 'top-left': return { x: margin, y: height - margin - size };
      case 'top-center': return { x: (width - textWidth) / 2, y: height - margin - size };
      case 'top-right': return { x: width - textWidth - margin, y: height - margin - size };
      case 'bottom-left': return { x: margin, y: margin };
      case 'bottom-center': return { x: (width - textWidth) / 2, y: margin };
      case 'bottom-right': return { x: width - textWidth - margin, y: margin };
      default: return { x: (width - textWidth) / 2, y: margin };
    }
  };

  const addNumbers = async () => {
    if (!file) return;

    setIsProcessing(true);
    try {
      const bytes = await file.arrayBuffer();
      const doc = await PDFDocument.load(bytes);
      const font = await doc.embedFont(StandardFonts.Helvetica);
      const pages = doc.getPages();

      pages.forEach((page, index) => {
        const label = `${index + 1}`;
        const textWidth = font.widthOfTextAtSize(label, fontSize);
        const { width, height } = page.getSize();
        const coords = getCoords(width, height, textWidth, fontSize, position);

        page.drawText(label, {
          x: coords.x,
          y: coords.y,
          size: fontSize,
          font,
          color: rgb(0.12, 0.12, 0.12),
        });
      });

      const out = await doc.save();
      const blob = new Blob([new Uint8Array(out)], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${file.name.replace(/\.pdf$/i, '')}-numbered.pdf`;
      link.click();
      URL.revokeObjectURL(link.href);
      notify('Page numbers added and downloaded', 'success');
    } catch (error) {
      console.error(error);
      notify('Failed to add page numbers', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">PDF Page Numbers</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Add page numbers to every page with custom placement.</p>
      </div>

      {!file ? (
        <Dropzone onFileSelect={setFile} accept="application/pdf" label="Upload PDF to add page numbers" />
      ) : (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 space-y-5">
          <p className="text-sm text-slate-600 dark:text-slate-400">{file.name}</p>

          <div>
            <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Position</label>
            <select value={position} onChange={(event) => setPosition(event.target.value as NumberPosition)} className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm">
              <option value="top-left">Top Left</option>
              <option value="top-center">Top Center</option>
              <option value="top-right">Top Right</option>
              <option value="bottom-left">Bottom Left</option>
              <option value="bottom-center">Bottom Center</option>
              <option value="bottom-right">Bottom Right</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Font size ({fontSize}px)</label>
            <input type="range" min={8} max={32} step={1} value={fontSize} onChange={(event) => setFontSize(Number(event.target.value))} className="w-full" />
          </div>

          <div className="flex justify-end gap-3">
            <button onClick={() => setFile(null)} className="px-4 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-600">Cancel</button>
            <button onClick={addNumbers} disabled={isProcessing} className="px-5 py-2 text-sm font-semibold rounded-xl bg-blue-600 text-white disabled:opacity-50">
              {isProcessing ? 'Applying...' : 'Add Numbers & Download'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
