import React, { useState } from 'react';
import { Dropzone } from '../components/Dropzone';
import { useNotification } from '../components/NotificationContext';

declare global {
  interface Window {
    pdfjsLib: any;
    jspdf: any;
  }
}

export const PdfProtect: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { notify } = useNotification();

  const protect = async () => {
    if (!file || !password) {
      notify('Please provide a password', 'error');
      return;
    }

    setIsProcessing(true);
    try {
      const buffer = await file.arrayBuffer();
      const loadingTask = window.pdfjsLib.getDocument(buffer);
      const pdf = await loadingTask.promise;

      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({
        encryption: {
          userPassword: password,
          ownerPassword: password,
          userPermissions: ['print'],
        },
      });
      doc.deletePage(1);

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const context = canvas.getContext('2d');
        await page.render({ canvasContext: context, viewport }).promise;

        const baseViewport = page.getViewport({ scale: 1.0 });
        const orientation = baseViewport.width > baseViewport.height ? 'l' : 'p';
        doc.addPage([baseViewport.width, baseViewport.height], orientation);
        doc.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, baseViewport.width, baseViewport.height);
      }

      doc.save(`${file.name.replace(/\.pdf$/i, '')}-protected.pdf`);
      notify('Password-protected PDF downloaded', 'success');
    } catch (error) {
      console.error(error);
      notify('Failed to protect PDF', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Protect PDF</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Encrypt a PDF with a password for opening.</p>
      </div>

      {!file ? (
        <Dropzone onFileSelect={setFile} accept="application/pdf" label="Upload PDF to protect" />
      ) : (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{file.name}</p>
          <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Password</label>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
            placeholder="Enter password"
          />
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">This tool rasterizes pages before encryption for broad browser compatibility.</p>

          <div className="mt-6 flex justify-end gap-3">
            <button onClick={() => setFile(null)} className="px-4 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-600">Cancel</button>
            <button onClick={protect} disabled={isProcessing || !password} className="px-5 py-2 text-sm font-semibold rounded-xl bg-blue-600 text-white disabled:opacity-50">
              {isProcessing ? 'Protecting...' : 'Protect and Download'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
