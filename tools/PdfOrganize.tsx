import React, { useMemo, useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { Dropzone } from '../components/Dropzone';
import { useNotification } from '../components/NotificationContext';

interface PageItem {
  pageIndex: number;
  label: string;
}

export const PdfOrganize: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PageItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { notify } = useNotification();

  const totalPages = useMemo(() => pages.length, [pages]);

  const onFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    try {
      const bytes = await selectedFile.arrayBuffer();
      const doc = await PDFDocument.load(bytes);
      const nextPages = Array.from({ length: doc.getPageCount() }, (_, i) => ({
        pageIndex: i,
        label: `Page ${i + 1}`,
      }));
      setPages(nextPages);
      notify(`Loaded ${doc.getPageCount()} pages`, 'success');
    } catch (error) {
      console.error(error);
      notify('Failed to load PDF', 'error');
      setFile(null);
      setPages([]);
    }
  };

  const move = (index: number, direction: 'up' | 'down') => {
    setPages((prev) => {
      const target = direction === 'up' ? index - 1 : index + 1;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const remove = (index: number) => {
    setPages((prev) => prev.filter((_, i) => i !== index));
  };

  const exportOrganized = async () => {
    if (!file || pages.length === 0) return;

    setIsProcessing(true);
    try {
      const sourceBytes = await file.arrayBuffer();
      const sourceDoc = await PDFDocument.load(sourceBytes);
      const outDoc = await PDFDocument.create();

      for (const page of pages) {
        const [copied] = await outDoc.copyPages(sourceDoc, [page.pageIndex]);
        outDoc.addPage(copied);
      }

      const output = await outDoc.save();
      const blob = new Blob([new Uint8Array(output)], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${file.name.replace(/\.pdf$/i, '')}-organized.pdf`;
      link.click();
      URL.revokeObjectURL(link.href);
      notify('Organized PDF downloaded', 'success');
    } catch (error) {
      console.error(error);
      notify('Failed to export organized PDF', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Organize PDF</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Reorder pages and remove unwanted pages before download.</p>
      </div>

      {!file ? (
        <Dropzone onFileSelect={onFileSelect} accept="application/pdf" label="Upload PDF to organize" />
      ) : (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">{file.name}</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">{totalPages} pages in output</p>
          </div>

          <div className="max-h-96 overflow-y-auto space-y-2">
            {pages.map((page, index) => (
              <div key={`${page.pageIndex}-${index}`} className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2">
                <div className="text-sm text-slate-700 dark:text-slate-300">{index + 1}. {page.label}</div>
                <div className="flex items-center gap-2">
                  <button onClick={() => move(index, 'up')} disabled={index === 0} className="px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-600 disabled:opacity-40">Up</button>
                  <button onClick={() => move(index, 'down')} disabled={index === pages.length - 1} className="px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-600 disabled:opacity-40">Down</button>
                  <button onClick={() => remove(index)} className="px-2 py-1 text-xs rounded border border-red-300 text-red-600 dark:border-red-700">Delete</button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button onClick={() => { setFile(null); setPages([]); }} className="px-4 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-600">Cancel</button>
            <button onClick={exportOrganized} disabled={isProcessing || pages.length === 0} className="px-5 py-2 text-sm font-semibold rounded-xl bg-blue-600 text-white disabled:opacity-50">
              {isProcessing ? 'Exporting...' : 'Export Organized PDF'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
