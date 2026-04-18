import React, { useState } from 'react';
import JSZip from 'jszip';
import { useNotification } from '../components/NotificationContext';

export const ZipCreator: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { notify } = useNotification();

  const onFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files || []);
    setFiles(selected);
  };

  const createZip = async () => {
    if (!files.length) {
      notify('Select at least one file', 'error');
      return;
    }

    setIsProcessing(true);
    try {
      const zip = new JSZip();
      files.forEach((file) => zip.file(file.name, file));

      const output = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(output);
      link.href = url;
      link.download = 'archive.zip';
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 100);
      notify('ZIP archive downloaded', 'success');
    } catch (error) {
      console.error(error);
      notify('Failed to create ZIP', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Create ZIP</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Bundle multiple files into one ZIP archive.</p>
      </div>

      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
        <label className="block w-full cursor-pointer border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-2xl p-8 text-center hover:border-blue-500 transition-colors">
          <input type="file" multiple className="hidden" onChange={onFiles} />
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Select files to archive</span>
        </label>

        {files.length > 0 && (
          <div className="mt-6 space-y-2 max-h-72 overflow-y-auto">
            {files.map((file, index) => (
              <div key={`${file.name}-${index}`} className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-sm text-slate-700 dark:text-slate-300">
                {file.name} • {(file.size / 1024).toFixed(1)} KB
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={() => setFiles([])} className="px-4 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-600">Clear</button>
          <button onClick={createZip} disabled={isProcessing || files.length === 0} className="px-5 py-2 text-sm font-semibold rounded-xl bg-blue-600 text-white disabled:opacity-50">
            {isProcessing ? 'Creating...' : 'Create ZIP'}
          </button>
        </div>
      </div>
    </div>
  );
};
