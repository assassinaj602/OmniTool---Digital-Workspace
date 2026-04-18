import React, { useState } from 'react';
import JSZip from 'jszip';
import { useNotification } from '../components/NotificationContext';

interface ExtractedItem {
  name: string;
  blob: Blob;
  size: number;
}

export const ZipExtractor: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [items, setItems] = useState<ExtractedItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { notify } = useNotification();

  const onFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    setIsProcessing(true);
    try {
      const zip = await JSZip.loadAsync(selected);
      const entries = Object.values(zip.files).filter((entry: any) => !entry.dir);
      const extracted: ExtractedItem[] = [];

      for (const entry of entries) {
        const blob = await (entry as any).async('blob');
        extracted.push({ name: (entry as any).name, blob, size: blob.size });
      }

      setItems(extracted);
      notify(`Extracted ${extracted.length} files`, 'success');
    } catch (error) {
      console.error(error);
      notify('Failed to extract ZIP file', 'error');
      setFile(null);
      setItems([]);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadOne = (item: ExtractedItem) => {
    const link = document.createElement('a');
    const url = URL.createObjectURL(item.blob);
    link.href = url;
    link.download = item.name.split('/').pop() || item.name;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 100);
  };

  const downloadAll = async () => {
    const pack = new JSZip();
    items.forEach((item) => pack.file(item.name.split('/').pop() || item.name, item.blob));
    const out = await pack.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(out);
    link.href = url;
    link.download = `${file?.name.replace(/\.zip$/i, '') || 'extracted'}-files.zip`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 100);
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Extract ZIP</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Inspect and download files from a ZIP archive.</p>
      </div>

      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
        <label className="block w-full cursor-pointer border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-2xl p-8 text-center hover:border-blue-500 transition-colors">
          <input type="file" accept=".zip,application/zip" className="hidden" onChange={onFile} />
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Upload ZIP file</span>
        </label>

        {isProcessing && <p className="text-sm text-slate-500 dark:text-slate-400 mt-4">Extracting...</p>}

        {items.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-slate-600 dark:text-slate-400">{items.length} files extracted</p>
              <button onClick={downloadAll} className="px-4 py-2 text-sm rounded-xl bg-blue-600 text-white font-semibold">Download All</button>
            </div>
            <div className="max-h-80 overflow-y-auto space-y-2">
              {items.map((item) => (
                <div key={item.name} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2">
                  <div className="min-w-0">
                    <p className="text-sm truncate text-slate-700 dark:text-slate-300">{item.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{(item.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <button onClick={() => downloadOne(item)} className="px-3 py-1.5 text-xs rounded border border-slate-300 dark:border-slate-600">Download</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
