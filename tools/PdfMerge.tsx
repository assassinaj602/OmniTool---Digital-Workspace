import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { useNotification } from '../components/NotificationContext';

export const PdfMerge: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { notify } = useNotification();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []).filter((file) => file.type === 'application/pdf');
    setFiles(selectedFiles);
  };

  const move = (index: number, direction: 'up' | 'down') => {
    setFiles((prev) => {
      const next = [...prev];
      const target = direction === 'up' ? index - 1 : index + 1;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const merge = async () => {
    if (files.length < 2) {
      notify('Please select at least 2 PDF files', 'error');
      return;
    }

    setIsProcessing(true);
    try {
      const merged = await PDFDocument.create();

      for (const file of files) {
        const bytes = await file.arrayBuffer();
        const source = await PDFDocument.load(bytes);
        const copiedPages = await merged.copyPages(source, source.getPageIndices());
        copiedPages.forEach((page) => merged.addPage(page));
      }

      const output = await merged.save();
      const blob = new Blob([new Uint8Array(output)], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'merged.pdf';
      link.click();
      URL.revokeObjectURL(link.href);
      notify('Merged PDF downloaded', 'success');
    } catch (error) {
      console.error(error);
      notify('Failed to merge PDF files', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Merge PDF</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Combine multiple PDFs in your preferred order.</p>
      </div>

      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
        <label className="block w-full cursor-pointer border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-2xl p-8 text-center hover:border-blue-500 transition-colors">
          <input type="file" accept="application/pdf" multiple className="hidden" onChange={handleFileSelect} />
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Select PDF files</span>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">You can choose multiple files at once.</p>
        </label>

        {files.length > 0 && (
          <div className="mt-6 space-y-2">
            {files.map((file, index) => (
              <div key={`${file.name}-${index}`} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3">
                <div className="truncate text-sm text-slate-700 dark:text-slate-300">{index + 1}. {file.name}</div>
                <div className="flex items-center gap-2">
                  <button disabled={index === 0} onClick={() => move(index, 'up')} className="px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-600 disabled:opacity-40">Up</button>
                  <button disabled={index === files.length - 1} onClick={() => move(index, 'down')} className="px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-600 disabled:opacity-40">Down</button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={() => setFiles([])} className="px-4 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-600">Clear</button>
          <button onClick={merge} disabled={isProcessing || files.length < 2} className="px-5 py-2 text-sm font-semibold rounded-xl bg-blue-600 text-white disabled:opacity-50">
            {isProcessing ? 'Merging...' : 'Merge and Download'}
          </button>
        </div>
      </div>
    </div>
  );
};
