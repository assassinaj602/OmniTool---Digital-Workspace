import React, { useState } from 'react';
import { PDFDocument, degrees } from 'pdf-lib';
import { Dropzone } from '../components/Dropzone';
import { useNotification } from '../components/NotificationContext';

export const PdfRotate: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [angle, setAngle] = useState(90);
  const [isProcessing, setIsProcessing] = useState(false);
  const { notify } = useNotification();

  const rotate = async () => {
    if (!file) return;

    setIsProcessing(true);
    try {
      const bytes = await file.arrayBuffer();
      const doc = await PDFDocument.load(bytes);
      doc.getPages().forEach((page) => page.setRotation(degrees(angle)));

      const output = await doc.save();
      const blob = new Blob([output], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${file.name.replace(/\.pdf$/i, '')}-rotated.pdf`;
      link.click();
      URL.revokeObjectURL(link.href);
      notify('Rotated PDF downloaded', 'success');
    } catch (error) {
      console.error(error);
      notify('Failed to rotate PDF', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Rotate PDF</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Rotate all pages by a fixed angle.</p>
      </div>

      {!file ? (
        <Dropzone onFileSelect={setFile} accept="application/pdf" label="Upload PDF to rotate" />
      ) : (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{file.name}</p>
          <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Rotation angle</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[90, 180, 270, 360].map((value) => (
              <button
                key={value}
                onClick={() => setAngle(value)}
                className={`px-3 py-2 rounded-xl border text-sm ${angle === value ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-300 dark:border-slate-600'}`}
              >
                {value}°
              </button>
            ))}
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button onClick={() => setFile(null)} className="px-4 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-600">Cancel</button>
            <button onClick={rotate} disabled={isProcessing} className="px-5 py-2 text-sm font-semibold rounded-xl bg-blue-600 text-white disabled:opacity-50">
              {isProcessing ? 'Rotating...' : 'Rotate and Download'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
