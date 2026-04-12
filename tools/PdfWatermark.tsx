import React, { useState } from 'react';
import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib';
import { Dropzone } from '../components/Dropzone';
import { useNotification } from '../components/NotificationContext';

export const PdfWatermark: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL');
  const [isProcessing, setIsProcessing] = useState(false);
  const { notify } = useNotification();

  const applyWatermark = async () => {
    if (!file || !watermarkText.trim()) return;

    setIsProcessing(true);
    try {
      const bytes = await file.arrayBuffer();
      const doc = await PDFDocument.load(bytes);
      const font = await doc.embedFont(StandardFonts.HelveticaBold);

      doc.getPages().forEach((page) => {
        const { width, height } = page.getSize();
        const size = Math.max(28, Math.min(width, height) / 10);

        page.drawText(watermarkText, {
          x: width * 0.15,
          y: height * 0.45,
          size,
          rotate: degrees(35),
          opacity: 0.2,
          font,
          color: rgb(0.82, 0.09, 0.09),
        });
      });

      const output = await doc.save();
      const blob = new Blob([output], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${file.name.replace(/\.pdf$/i, '')}-watermarked.pdf`;
      link.click();
      URL.revokeObjectURL(link.href);
      notify('Watermarked PDF downloaded', 'success');
    } catch (error) {
      console.error(error);
      notify('Failed to watermark PDF', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Watermark PDF</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Stamp text watermark across each page.</p>
      </div>

      {!file ? (
        <Dropzone onFileSelect={setFile} accept="application/pdf" label="Upload PDF to watermark" />
      ) : (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{file.name}</p>

          <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Watermark text</label>
          <input
            value={watermarkText}
            onChange={(event) => setWatermarkText(event.target.value)}
            className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
            placeholder="CONFIDENTIAL"
          />

          <div className="mt-6 flex justify-end gap-3">
            <button onClick={() => setFile(null)} className="px-4 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-600">Cancel</button>
            <button onClick={applyWatermark} disabled={isProcessing || !watermarkText.trim()} className="px-5 py-2 text-sm font-semibold rounded-xl bg-blue-600 text-white disabled:opacity-50">
              {isProcessing ? 'Applying...' : 'Apply and Download'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
