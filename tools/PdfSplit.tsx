import React, { useMemo, useState } from 'react';
import JSZip from 'jszip';
import { PDFDocument } from 'pdf-lib';
import { Dropzone } from '../components/Dropzone';
import { useNotification } from '../components/NotificationContext';
import { ToolActions, ToolFileMeta, ToolHeader, ToolStatusNotice } from '../components/tooling';
import {
  detectEncryptedPdf,
  isPdfFile,
  mapPdfError,
  triggerBlobDownload,
  useToolProcessState,
  validatePdfFile,
} from '../utils/pdf';

const parseRange = (input: string, totalPages: number) => {
  const pageSet = new Set<number>();
  const tokens = input.split(',').map((token) => token.trim()).filter(Boolean);

  for (const token of tokens) {
    if (token.includes('-')) {
      const [startRaw, endRaw] = token.split('-').map((v) => Number(v.trim()));
      if (Number.isNaN(startRaw) || Number.isNaN(endRaw)) continue;
      const start = Math.max(1, Math.min(startRaw, endRaw));
      const end = Math.min(totalPages, Math.max(startRaw, endRaw));
      for (let p = start; p <= end; p++) pageSet.add(p - 1);
    } else {
      const page = Number(token);
      if (!Number.isNaN(page) && page >= 1 && page <= totalPages) pageSet.add(page - 1);
    }
  }

  return Array.from(pageSet).sort((a, b) => a - b);
};

export const PdfSplit: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [range, setRange] = useState('1');
  const processState = useToolProcessState();
  const { notify } = useNotification();

  const rangeHint = useMemo(() => `Enter pages like 1,3,5-8 (max ${pageCount || '?'})`, [pageCount]);

  const onFileSelect = async (selectedFile: File) => {
    const validation = validatePdfFile(selectedFile);
    if (!validation.valid || !isPdfFile(selectedFile)) {
      const message = validation.errorMessage || 'Please select a valid PDF file.';
      processState.setError(message);
      notify(message, 'error');
      return;
    }

    try {
      const encrypted = await detectEncryptedPdf(selectedFile);
      if (encrypted) {
        const message = 'This PDF is password-protected. Unlock it before splitting.';
        processState.setError(message);
        notify(message, 'error');
        return;
      }

      const bytes = await selectedFile.arrayBuffer();
      const doc = await PDFDocument.load(bytes);
      setFile(selectedFile);
      setPageCount(doc.getPageCount());
      setRange('1');
      processState.setReady(`Loaded ${doc.getPageCount()} pages. Select a page range to split.`);
      notify(`Loaded ${doc.getPageCount()} pages`, 'success');
    } catch (error) {
      const mapped = mapPdfError(error);
      processState.setError(mapped.userMessage);
      notify(mapped.userMessage, 'error');
      setFile(null);
      setPageCount(0);
    }
  };

  const split = async () => {
    if (!file || pageCount === 0) return;

    const pages = parseRange(range, pageCount);
    if (pages.length === 0) {
      const message = 'Invalid page range.';
      processState.setError(message);
      notify(message, 'error');
      return;
    }

    processState.setProcessing('Splitting selected pages...');
    try {
      const bytes = await file.arrayBuffer();
      const source = await PDFDocument.load(bytes);
      const zip = new JSZip();
      const base = file.name.replace(/\.pdf$/i, '');

      for (const pageIndex of pages) {
        const out = await PDFDocument.create();
        const [copied] = await out.copyPages(source, [pageIndex]);
        out.addPage(copied);
        const data = await out.save();
        zip.file(`${base}-page-${pageIndex + 1}.pdf`, data);
      }

      const archive = await zip.generateAsync({ type: 'blob' });
      triggerBlobDownload(archive, `${base}-split.zip`);
      processState.setDone('Split complete and ZIP downloaded.');
      notify('Split files downloaded as ZIP', 'success');
    } catch (error) {
      const mapped = mapPdfError(error);
      processState.setError(mapped.userMessage);
      notify(mapped.userMessage, 'error');
    }
  };

  const resetTool = () => {
    setFile(null);
    setPageCount(0);
    setRange('1');
    processState.setIdle('');
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <ToolHeader title="Split PDF" subtitle="Extract selected pages into separate PDF files." />

      {!file ? (
        <>
          <Dropzone onFileSelect={onFileSelect} accept="application/pdf" label="Upload PDF to split" />
          <ToolStatusNotice state={processState.state} message={processState.message} />
        </>
      ) : (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
          <ToolFileMeta fileName={file.name} details={`${pageCount} pages`} />
          <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Page Range</label>
          <input
            value={range}
            onChange={(event) => setRange(event.target.value)}
            className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
            placeholder="1,2,4-6"
          />
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">{rangeHint}</p>

          <ToolStatusNotice state={processState.state} message={processState.message} />

          <ToolActions
            onCancel={resetTool}
            onPrimary={split}
            primaryLabel="Split and Download"
            processingLabel="Splitting..."
            isProcessing={processState.isProcessing}
          />
        </div>
      )}
    </div>
  );
};
