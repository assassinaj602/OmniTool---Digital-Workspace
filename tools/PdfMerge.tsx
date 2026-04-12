import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { useNotification } from '../components/NotificationContext';
import { ToolActions, ToolHeader, ToolStatusNotice } from '../components/tooling';
import {
  buildPdfDownloadName,
  downloadPdfBytes,
  isPdfFile,
  mapPdfError,
  useToolProcessState,
} from '../utils/pdf';

export const PdfMerge: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const processState = useToolProcessState();
  const { notify } = useNotification();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const allFiles = Array.from(event.target.files || []);
    const selectedFiles = allFiles.filter((file) => isPdfFile(file));
    const skipped = allFiles.length - selectedFiles.length;

    if (skipped > 0) {
      notify(`${skipped} non-PDF file(s) were skipped.`, 'error');
    }

    setFiles(selectedFiles);
    if (selectedFiles.length >= 2) {
      processState.setReady(`${selectedFiles.length} files ready to merge.`);
    } else {
      processState.setIdle('Select at least 2 PDF files.');
    }
  };

  const move = (index: number, direction: 'up' | 'down') => {
    setFiles((prev) => {
      const next = [...prev];
      const target = direction === 'up' ? index - 1 : index + 1;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const merge = async () => {
    if (files.length < 2) {
      notify('Please select at least 2 PDF files', 'error');
      processState.setError('Please select at least 2 PDF files.');
      return;
    }

    processState.setProcessing('Merging selected PDF files...');
    try {
      const merged = await PDFDocument.create();

      for (const file of files) {
        const bytes = await file.arrayBuffer();
        const source = await PDFDocument.load(bytes);
        const copiedPages = await merged.copyPages(source, source.getPageIndices());
        copiedPages.forEach((page) => merged.addPage(page));
      }

      const output = await merged.save();
      const fileName = buildPdfDownloadName(files[0]?.name || 'document.pdf', 'merged');
      downloadPdfBytes(output, fileName);
      processState.setDone('Merge complete and PDF downloaded.');
      notify('Merged PDF downloaded', 'success');
    } catch (error) {
      console.error(error);
      const mapped = mapPdfError(error);
      processState.setError(mapped.userMessage);
      notify(mapped.userMessage, 'error');
    }
  };

  const resetTool = () => {
    setFiles([]);
    processState.setIdle('');
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <ToolHeader title="Merge PDF" subtitle="Combine multiple PDFs in your preferred order." />

      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
        <label className="block w-full cursor-pointer border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-2xl p-8 text-center hover:border-blue-500 transition-colors">
          <input type="file" accept="application/pdf" multiple className="hidden" onChange={handleFileSelect} />
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Select PDF files</span>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">You can choose multiple files at once.</p>
        </label>

        <ToolStatusNotice state={processState.state} message={processState.message} />

        {files.length > 0 && (
          <div className="mt-6 space-y-2">
            {files.map((file, index) => (
              <div key={`${file.name}-${index}`} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3">
                <div className="truncate text-sm text-slate-700 dark:text-slate-300">{index + 1}. {file.name}</div>
                <div className="flex items-center gap-2">
                  <button disabled={index === 0} onClick={() => move(index, 'up')} className="px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-600 disabled:opacity-40">Up</button>
                  <button disabled={index === files.length - 1} onClick={() => move(index, 'down')} className="px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-600 disabled:opacity-40">Down</button>
                </div>
              </div>
            ))}
          </div>
        )}

        <ToolActions
          onCancel={resetTool}
          onPrimary={merge}
          cancelLabel="Clear"
          primaryLabel="Merge and Download"
          processingLabel="Merging..."
          isProcessing={processState.isProcessing}
          disablePrimary={files.length < 2}
        />
      </div>
    </div>
  );
};
