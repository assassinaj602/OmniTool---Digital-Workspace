import React, { useState } from 'react';
import { Dropzone } from '../components/Dropzone';
import { DownloadIcon, PdfIcon } from '../components/Icons';
import { useNotification } from '../components/NotificationContext';

declare global {
  interface Window {
    pdfjsLib: any;
  }
}

export const PdfConverter: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { notify } = useNotification();

  const processPdf = async (f: File) => {
    setFile(f);
    setIsProcessing(true);
    setExtractedText('');
    notify('Extracting text...', 'info');

    try {
        const buffer = await f.arrayBuffer();
        const pdf = await window.pdfjsLib.getDocument(buffer).promise;
        let fullText = '';
        
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map((item: any) => item.str).join(' ');
            fullText += `--- Page ${i} ---\n\n${pageText}\n\n`;
        }
        
        setExtractedText(fullText);
        notify('Text extracted successfully!', 'success');
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
      link.href = URL.createObjectURL(blob);
      link.download = `${file?.name.replace('.pdf', '')}.txt`;
      link.click();
      notify('Text file downloaded', 'success');
  };

  const downloadDoc = () => {
      const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Export HTML To Doc</title></head><body>";
      const footer = "</body></html>";
      const sourceHTML = header + `<pre style="font-family: Arial; white-space: pre-wrap;">${extractedText}</pre>` + footer;
      
      const blob = new Blob(['\ufeff', sourceHTML], { type: 'application/msword' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${file?.name.replace('.pdf', '')}.doc`;
      link.click();
      notify('Word document downloaded', 'success');
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">PDF Converter</h2>
            <p className="text-slate-500 dark:text-slate-400">Extract text from PDF and export to Word or Text format.</p>
        </div>

        {!file ? (
            <Dropzone onFileSelect={processPdf} accept="application/pdf" label="Upload PDF" />
        ) : (
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow border border-slate-200 dark:border-slate-700 h-[600px] flex flex-col transition-colors">
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
                            Word (.doc)
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
                    <textarea 
                        className="flex-1 w-full p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 text-slate-800 dark:text-slate-300"
                        value={extractedText}
                        readOnly
                        placeholder="Extracted text will appear here..."
                    />
                )}
            </div>
        )}
    </div>
  );
};