import React, { useMemo, useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { Dropzone } from '../components/Dropzone';
import { useNotification } from '../components/NotificationContext';

declare global {
  interface Window {
    JSZip: any;
  }
}

const parseRange = (input: string, totalPages: number) => {
  const pageSet = new Set<number>();
  const tokens = input.split(',').map((token) => token.trim()).filter(Boolean);

  for (const token of tokens) {
    if (token.includes('-')) {
      const [startRaw, endRaw] = token.split('-').map((v) => Number(v.trim()));
      if (Number.isNaN(startRaw) || Number.isNaN(endRaw)) continue;
      const start = Math.max(1, Math.min(startRaw, endRaw));
      const end = Math.min(totalPages, Math.max(startRaw, endRaw));
      for (let p = start; p <= end; p++) pageSet.add(p - 1);
    } else {
      const page = Number(token);
      if (!Number.isNaN(page) && page >= 1 && page <= totalPages) pageSet.add(page - 1);
    }
  }

  return Array.from(pageSet).sort((a, b) => a - b);
};

export const PdfSplit: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [range, setRange] = useState('1');
  const [isProcessing, setIsProcessing] = useState(false);
  const { notify } = useNotification();

  const rangeHint = useMemo(() => `Enter pages like 1,3,5-8 (max ${pageCount || '?'})`, [pageCount]);

  const onFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    try {
      const bytes = await selectedFile.arrayBuffer();
      const doc = await PDFDocument.load(bytes);
      setPageCount(doc.getPageCount());
      setRange('1');
      notify(`Loaded ${doc.getPageCount()} pages`, 'success');
    } catch (error) {
      console.error(error);
      notify('Could not read PDF', 'error');
      setFile(null);
      setPageCount(0);
    }
  };

  const split = async () => {
    if (!file || pageCount === 0) return;

    const pages = parseRange(range, pageCount);
    if (pages.length === 0) {
      notify('Invalid page range', 'error');
      return;
    }

    setIsProcessing(true);
    try {
      const bytes = await file.arrayBuffer();
      const source = await PDFDocument.load(bytes);
      const zip = new window.JSZip();
      const base = file.name.replace(/\.pdf$/i, '');

      for (const pageIndex of pages) {
        const out = await PDFDocument.create();
        const [copied] = await out.copyPages(source, [pageIndex]);
        out.addPage(copied);
        const data = await out.save();
        zip.file(`${base}-page-${pageIndex + 1}.pdf`, data);
      }

      const archive = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(archive);
      link.download = `${base}-split.zip`;
      link.click();
      URL.revokeObjectURL(link.href);
      notify('Split files downloaded as ZIP', 'success');
    } catch (error) {
      console.error(error);
      notify('Failed to split PDF', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Split PDF</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Extract selected pages into separate PDF files.</p>
      </div>

      {!file ? (
        <Dropzone onFileSelect={onFileSelect} accept="application/pdf" label="Upload PDF to split" />
      ) : (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{file.name} • {pageCount} pages</p>
          <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Page Range</label>
          <input
            value={range}
            onChange={(event) => setRange(event.target.value)}
            className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
            placeholder="1,2,4-6"
          />
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">{rangeHint}</p>

          <div className="mt-6 flex justify-end gap-3">
            <button onClick={() => setFile(null)} className="px-4 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-600">Cancel</button>
            <button onClick={split} disabled={isProcessing} className="px-5 py-2 text-sm font-semibold rounded-xl bg-blue-600 text-white disabled:opacity-50">
              {isProcessing ? 'Splitting...' : 'Split and Download'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
