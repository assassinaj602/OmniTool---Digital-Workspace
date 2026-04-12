import React, { useState } from 'react';
import { Dropzone } from '../components/Dropzone';
import { useNotification } from '../components/NotificationContext';
import { ToolActions, ToolFileMeta, ToolHeader, ToolStatusNotice } from '../components/tooling';
import {
  buildPdfDownloadName,
  isPdfFile,
  mapPdfError,
  triggerBlobDownload,
  useToolProcessState,
  validatePdfFile,
} from '../utils/pdf';

declare global {
  interface Window {
    pdfjsLib: any;
    jspdf: any;
  }
}

export const PdfUnlock: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const processState = useToolProcessState();
  const { notify } = useNotification();

  const onFileSelect = (selectedFile: File) => {
    const validation = validatePdfFile(selectedFile);
    if (!validation.valid || !isPdfFile(selectedFile)) {
      const message = validation.errorMessage || 'Please select a valid PDF file.';
      processState.setError(message);
      notify(message, 'error');
      return;
    }

    setFile(selectedFile);
    processState.setReady('Protected PDF loaded. Enter current password.');
  };

  const resetTool = () => {
    setFile(null);
    setPassword('');
    processState.setIdle('');
  };

  const unlock = async () => {
    if (!file || !password) {
      const message = 'Please provide the current PDF password.';
      processState.setError(message);
      notify(message, 'error');
      return;
    }

    processState.setProcessing('Unlocking PDF...');
    try {
      const buffer = await file.arrayBuffer();
      const loadingTask = window.pdfjsLib.getDocument({ data: buffer, password });
      const pdf = await loadingTask.promise;

      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
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

      const pdfBuffer = doc.output('arraybuffer');
      const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
      triggerBlobDownload(blob, buildPdfDownloadName(file.name, 'unlocked'));
      processState.setDone('Unlock complete and PDF downloaded.');
      notify('Unlocked PDF downloaded', 'success');
    } catch (error) {
      const mapped = mapPdfError(error);
      processState.setError(mapped.userMessage);
      notify(mapped.userMessage, 'error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <ToolHeader title="Unlock PDF" subtitle="Remove password protection when you know the password." />

      {!file ? (
        <>
          <Dropzone onFileSelect={onFileSelect} accept="application/pdf" label="Upload protected PDF" />
          <ToolStatusNotice state={processState.state} message={processState.message} />
        </>
      ) : (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
          <ToolFileMeta fileName={file.name} />
          <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Current password</label>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
            placeholder="Enter current password"
          />
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">This tool exports an unlocked copy for easier sharing.</p>

          <ToolStatusNotice state={processState.state} message={processState.message} />

          <ToolActions
            onCancel={resetTool}
            onPrimary={unlock}
            primaryLabel="Unlock and Download"
            processingLabel="Unlocking..."
            isProcessing={processState.isProcessing}
            disablePrimary={!password}
          />
        </div>
      )}
    </div>
  );
};
