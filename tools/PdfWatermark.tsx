import React, { useState } from 'react';
import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib';
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

export const PdfWatermark: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL');
  const processState = useToolProcessState();
  const { notify } = useNotification();

  const onFileSelect = (selectedFile: File) => {
    const validation = validatePdfFile(selectedFile);
    if (!validation.valid) {
      processState.setError(validation.errorMessage || 'Please select a valid PDF file.');
      notify(validation.errorMessage || 'Please select a valid PDF file.', 'error');
      return;
    }

    setFile(selectedFile);
    processState.setReady('PDF loaded and ready to watermark.');
  };

  const resetTool = () => {
    setFile(null);
    setWatermarkText('CONFIDENTIAL');
    processState.setIdle('');
  };

  const applyWatermark = async () => {
    if (!file || !watermarkText.trim()) return;

    processState.setProcessing('Applying watermark to all pages...');
    try {
      const bytes = await file.arrayBuffer();
      const doc = await PDFDocument.load(bytes);
      const font = await doc.embedFont(StandardFonts.HelveticaBold);

      doc.getPages().forEach((page) => {
        const { width, height } = page.getSize();
        const size = Math.max(28, Math.min(width, height) / 10);

        page.drawText(watermarkText, {
          x: width * 0.15,
          y: height * 0.45,
          size,
          rotate: degrees(35),
          opacity: 0.2,
          font,
          color: rgb(0.82, 0.09, 0.09),
        });
      });

      const output = await doc.save();
      const filename = buildPdfDownloadName(file.name, 'watermarked');
      downloadPdfBytes(output, filename);
      processState.setDone('Watermark applied and PDF downloaded.');
      notify('Watermarked PDF downloaded', 'success');
    } catch (error) {
      console.error(error);
      const mapped = mapPdfError(error);
      processState.setError(mapped.userMessage);
      notify(mapped.userMessage, 'error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <ToolHeader title="Watermark PDF" subtitle="Stamp text watermark across each page." />

      {!file ? (
        <>
          <Dropzone onFileSelect={onFileSelect} accept="application/pdf" label="Upload PDF to watermark" />
          <ToolStatusNotice state={processState.state} message={processState.message} />
        </>
      ) : (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
          <ToolFileMeta fileName={file.name} />

          <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Watermark text</label>
          <input
            value={watermarkText}
            onChange={(event) => setWatermarkText(event.target.value)}
            className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
            placeholder="CONFIDENTIAL"
          />

          <ToolStatusNotice state={processState.state} message={processState.message} />

          <ToolActions
            onCancel={resetTool}
            onPrimary={applyWatermark}
            primaryLabel="Apply and Download"
            processingLabel="Applying..."
            isProcessing={processState.isProcessing}
            disablePrimary={!watermarkText.trim()}
          />
        </div>
      )}
    </div>
  );
};
