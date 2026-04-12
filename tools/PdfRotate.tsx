import React, { useState } from 'react';
import { PDFDocument, degrees } from 'pdf-lib';
import { Dropzone } from '../components/Dropzone';
import { useNotification } from '../components/NotificationContext';
import { ToolActions, ToolFileMeta, ToolHeader, ToolStatusNotice } from '../components/tooling';
import {
  buildPdfDownloadName,
  downloadPdfBytes,
  mapPdfError,
  useToolProcessState,
  validatePdfFile,
} from '../utils/pdf';

export const PdfRotate: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [angle, setAngle] = useState(90);
  const processState = useToolProcessState();
  const { notify } = useNotification();

  const onFileSelect = (selectedFile: File) => {
    const validation = validatePdfFile(selectedFile);
    if (!validation.valid) {
      const message = validation.errorMessage || 'Please select a valid PDF file.';
      processState.setError(message);
      notify(message, 'error');
      return;
    }

    setFile(selectedFile);
    processState.setReady('PDF loaded and ready to rotate.');
  };

  const resetTool = () => {
    setFile(null);
    setAngle(90);
    processState.setIdle('');
  };

  const rotate = async () => {
    if (!file) return;

    processState.setProcessing('Rotating all pages...');
    try {
      const bytes = await file.arrayBuffer();
      const doc = await PDFDocument.load(bytes);
      doc.getPages().forEach((page) => page.setRotation(degrees(angle)));

      const output = await doc.save();
      downloadPdfBytes(output, buildPdfDownloadName(file.name, 'rotated'));
      processState.setDone('Rotation complete and PDF downloaded.');
      notify('Rotated PDF downloaded', 'success');
    } catch (error) {
      console.error(error);
      const mapped = mapPdfError(error);
      processState.setError(mapped.userMessage);
      notify(mapped.userMessage, 'error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <ToolHeader title="Rotate PDF" subtitle="Rotate all pages by a fixed angle." />

      {!file ? (
        <>
          <Dropzone onFileSelect={onFileSelect} accept="application/pdf" label="Upload PDF to rotate" />
          <ToolStatusNotice state={processState.state} message={processState.message} />
        </>
      ) : (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
          <ToolFileMeta fileName={file.name} />
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

          <ToolStatusNotice state={processState.state} message={processState.message} />

          <ToolActions
            onCancel={resetTool}
            onPrimary={rotate}
            primaryLabel="Rotate and Download"
            processingLabel="Rotating..."
            isProcessing={processState.isProcessing}
          />
        </div>
      )}
    </div>
  );
};
