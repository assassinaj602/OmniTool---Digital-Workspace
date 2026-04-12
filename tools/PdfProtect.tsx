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

export const PdfProtect: React.FC = () => {
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
    processState.setReady('PDF loaded. Set a password to continue.');
  };

  const resetTool = () => {
    setFile(null);
    setPassword('');
    processState.setIdle('');
  };

  const protect = async () => {
    if (!file || !password) {
      const message = 'Please provide a password.';
      processState.setError(message);
      notify(message, 'error');
      return;
    }

    processState.setProcessing('Applying password protection...');
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

      const pdfBuffer = doc.output('arraybuffer');
      const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
      triggerBlobDownload(blob, buildPdfDownloadName(file.name, 'protected'));
      processState.setDone('Protection applied and PDF downloaded.');
      notify('Password-protected PDF downloaded', 'success');
    } catch (error) {
      const mapped = mapPdfError(error);
      processState.setError(mapped.userMessage);
      notify(mapped.userMessage, 'error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <ToolHeader title="Protect PDF" subtitle="Encrypt a PDF with a password for opening." />

      {!file ? (
        <>
          <Dropzone onFileSelect={onFileSelect} accept="application/pdf" label="Upload PDF to protect" />
          <ToolStatusNotice state={processState.state} message={processState.message} />
        </>
      ) : (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
          <ToolFileMeta fileName={file.name} />
          <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Password</label>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
            placeholder="Enter password"
          />
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">This tool rasterizes pages before encryption for broad browser compatibility.</p>

          <ToolStatusNotice state={processState.state} message={processState.message} />

          <ToolActions
            onCancel={resetTool}
            onPrimary={protect}
            primaryLabel="Protect and Download"
            processingLabel="Protecting..."
            isProcessing={processState.isProcessing}
            disablePrimary={!password}
          />
        </div>
      )}
    </div>
  );
};
