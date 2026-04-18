import React, { useState } from 'react';
import { Dropzone } from '../components/Dropzone';
import { DownloadIcon, PdfIcon } from '../components/Icons';
import { useNotification } from '../components/NotificationContext';
import { pdfjsLib } from '../utils/pdf';

interface TextRun {
    text: string;
    x: number;
    y: number;
    fontSize: number;
    fontFamily: string;
    isBold: boolean;
    isItalic: boolean;
}

interface PageLayout {
    pageNumber: number;
    width: number;
    height: number;
    runs: TextRun[];
}

const escapeHtml = (value: string) =>
    value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

export const PdfConverter: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState('');
    const [pageLayouts, setPageLayouts] = useState<PageLayout[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { notify } = useNotification();

  const processPdf = async (f: File) => {
    setFile(f);
    setIsProcessing(true);
    setExtractedText('');
        setPageLayouts([]);
    notify('Extracting text...', 'info');

    try {
        const buffer = await f.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(buffer).promise;
        let fullText = '';
                const layouts: PageLayout[] = [];
        
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
                        const viewport = page.getViewport({ scale: 1.0 });
            const textContent = await page.getTextContent();
                        const items = textContent.items as any[];
                        const pageText = items.map((item: any) => item.str).join(' ');
            fullText += `--- Page ${i} ---\n\n${pageText}\n\n`;

                        const runs: TextRun[] = items
                            .filter((item) => typeof item.str === 'string' && item.str.trim().length > 0)
                            .map((item) => {
                                const tx = item.transform?.[4] ?? 0;
                                const ty = item.transform?.[5] ?? 0;
                                const baseFontSize = Math.max(8, Math.min(42, Math.abs(item.height || item.transform?.[0] || 12)));
                                const fontName = String(item.fontName || 'sans-serif');

                                return {
                                    text: item.str,
                                    x: Math.max(0, Math.min(viewport.width, tx)),
                                    y: Math.max(0, Math.min(viewport.height, viewport.height - ty)),
                                    fontSize: baseFontSize,
                                    fontFamily: fontName,
                                    isBold: /bold/i.test(fontName),
                                    isItalic: /italic|oblique/i.test(fontName),
                                };
                            });

                        layouts.push({
                            pageNumber: i,
                            width: viewport.width,
                            height: viewport.height,
                            runs,
                        });
        }
        
        setExtractedText(fullText);
                setPageLayouts(layouts);

                const textCount = layouts.reduce((sum, page) => sum + page.runs.length, 0);
                if (textCount === 0) {
                    notify('No selectable text found. This PDF may be scanned/image-only.', 'error');
                } else {
                    notify('Text extracted successfully!', 'success');
                }
    } catch (e) {
        console.error(e);
        notify('Failed to extract text. PDF might be scanned/image-only.', 'error');
    } finally {
        setIsProcessing(false);
    }
  };

  const downloadText = () => {
      const blob = new Blob([extractedText], { type: 'text/plain' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.download = `${file?.name.replace('.pdf', '')}.txt`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 100);
      notify('Text file downloaded', 'success');
  };

  const downloadDoc = () => {
            const pageMarkup = pageLayouts
                .map((page) => {
                    const runs = page.runs
                        .map((run) => {
                            const fontWeight = run.isBold ? '700' : '400';
                            const fontStyle = run.isItalic ? 'italic' : 'normal';

                            return `<span style="position:absolute; left:${run.x.toFixed(2)}px; top:${run.y.toFixed(2)}px; font-size:${run.fontSize.toFixed(2)}px; font-family:${escapeHtml(run.fontFamily)}, Arial, sans-serif; font-weight:${fontWeight}; font-style:${fontStyle}; white-space:pre;">${escapeHtml(run.text)}</span>`;
                        })
                        .join('');

                    return `<section style="position:relative; width:${page.width.toFixed(2)}px; height:${page.height.toFixed(2)}px; margin:0 auto 20px auto; border:1px solid #d4d4d8; background:#fff; overflow:hidden; page-break-after:always;"><div style="position:absolute; top:6px; right:10px; font-size:10px; color:#64748b;">Page ${page.pageNumber}</div>${runs}</section>`;
                })
                .join('');

            const fallbackText = `<pre style="font-family:Arial, sans-serif; white-space:pre-wrap;">${escapeHtml(extractedText)}</pre>`;
            const content = pageLayouts.length > 0 ? pageMarkup : fallbackText;

            const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Export HTML To Doc</title></head><body style='margin:20px; background:#f8fafc;'>";
      const footer = "</body></html>";
            const sourceHTML = header + content + footer;
      
      const blob = new Blob(['\ufeff', sourceHTML], { type: 'application/msword' });
      const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
      link.download = `${file?.name.replace('.pdf', '')}.doc`;
      link.click();
    setTimeout(() => URL.revokeObjectURL(url), 100);
            notify('Word document downloaded (layout-preserving best effort)', 'success');
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">PDF Converter</h2>
            <p className="text-slate-500 dark:text-slate-400">Extract text from PDF and export to Word or Text format with layout-aware best effort.</p>
        </div>

        {!file ? (
            <Dropzone onFileSelect={processPdf} accept="application/pdf" label="Upload PDF" />
        ) : (
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow border border-slate-200 dark:border-slate-700 h-150 flex flex-col transition-colors">
                <div className="flex justify-between items-center mb-4 border-b border-slate-100 dark:border-slate-700 pb-4 flex-wrap gap-2">
                    <h3 className="font-bold text-lg truncate max-w-xs text-slate-800 dark:text-white">{file.name}</h3>
                    <div className="flex gap-2">
                        <button 
                            onClick={downloadText} 
                            disabled={!extractedText}
                            className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50 flex items-center transition-colors"
                        >
                            <DownloadIcon className="w-4 h-4 mr-2" />
                            TXT
                        </button>
                        <button 
                            onClick={downloadDoc} 
                            disabled={!extractedText}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 disabled:opacity-50 flex items-center shadow transition-all"
                        >
                            <DownloadIcon className="w-4 h-4 mr-2" />
                            Styled Word (.doc)
                        </button>
                        <button onClick={() => setFile(null)} className="px-4 py-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 text-sm">
                            New File
                        </button>
                    </div>
                </div>

                {isProcessing ? (
                    <div className="flex-1 flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                        <p className="text-slate-500 dark:text-slate-400">Extracting text...</p>
                    </div>
                ) : (
                    <div className="flex-1 grid grid-rows-[1fr_auto] gap-3 min-h-0">
                        <textarea 
                            className="w-full p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 text-slate-800 dark:text-slate-300"
                            value={extractedText}
                            readOnly
                            placeholder="Extracted text will appear here..."
                        />
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Word export keeps layout and font hints when text objects exist in the PDF. Scanned/image PDFs may still lose styling without OCR.
                        </p>
                    </div>
                )}
            </div>
        )}
    </div>
  );
};