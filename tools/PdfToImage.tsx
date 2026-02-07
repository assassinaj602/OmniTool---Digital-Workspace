import React, { useState, useEffect } from 'react';
import { Dropzone } from '../components/Dropzone';
import { DownloadIcon, PdfImageIcon } from '../components/Icons';
import { useNotification } from '../components/NotificationContext';

declare global {
  interface Window {
    pdfjsLib: any;
    JSZip: any;
  }
}

interface PdfToImageProps {
  defaultOutputFormat?: 'png' | 'jpeg';
}

export const PdfToImage: React.FC<PdfToImageProps> = ({ defaultOutputFormat = 'png' }) => {
  const [file, setFile] = useState<File | null>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [pageImages, setPageImages] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [format, setFormat] = useState<'png' | 'jpeg'>(defaultOutputFormat);
  const { notify } = useNotification();

  useEffect(() => {
    if (file) {
      loadPdf(file);
    }
  }, [file]);

  useEffect(() => {
      if (file && pdfDoc) {
          renderPages();
      }
  }, [format]);

  const loadPdf = async (file: File) => {
    setIsProcessing(true);
    try {
      const buffer = await file.arrayBuffer();
      const loadingTask = window.pdfjsLib.getDocument(buffer);
      const pdf = await loadingTask.promise;
      setPdfDoc(pdf);
      notify(`Loaded PDF with ${pdf.numPages} pages`, 'success');
      setTimeout(() => renderPages(pdf), 100);
    } catch (error) {
      console.error('Error loading PDF:', error);
      notify('Could not load PDF. It might be password protected.', 'error');
      setIsProcessing(false);
    }
  };

  const renderPages = async (pdf = pdfDoc) => {
    if (!pdf) return;
    setIsProcessing(true);
    const images: string[] = [];
    const maxPages = Math.min(pdf.numPages, 20); 
    
    try {
        for (let i = 1; i <= maxPages; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 1.5 });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            await page.render({ canvasContext: context, viewport: viewport }).promise;
            
            if (format === 'jpeg') {
                const composite = document.createElement('canvas');
                composite.width = canvas.width;
                composite.height = canvas.height;
                const ctx = composite.getContext('2d');
                if (ctx) {
                    ctx.fillStyle = "#FFFFFF";
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(canvas, 0, 0);
                    images.push(composite.toDataURL('image/jpeg', 0.9));
                }
            } else {
                images.push(canvas.toDataURL('image/png'));
            }
        }
        setPageImages(images);
    } catch (e) {
        console.error(e);
        notify('Error rendering PDF pages', 'error');
    } finally {
        setIsProcessing(false);
    }
  };

  const downloadPage = (dataUrl: string, index: number) => {
    const link = document.createElement('a');
    link.download = `page-${index + 1}.${format === 'png' ? 'png' : 'jpg'}`;
    link.href = dataUrl;
    link.click();
    notify(`Downloaded Page ${index + 1}`, 'success');
  };

  const downloadAllZip = async () => {
      if (pageImages.length === 0) return;
      setIsZipping(true);
      try {
          const zip = new window.JSZip();
          const folder = zip.folder("pages");
          
          pageImages.forEach((dataUrl, i) => {
              const base64Data = dataUrl.split(',')[1];
              folder.file(`page-${i + 1}.${format === 'png' ? 'png' : 'jpg'}`, base64Data, { base64: true });
          });
          
          const content = await zip.generateAsync({ type: "blob" });
          const link = document.createElement('a');
          link.href = URL.createObjectURL(content);
          link.download = `${file?.name.replace('.pdf', '')}-pages.zip`;
          link.click();
          notify('ZIP file downloaded', 'success');
      } catch (e) {
          console.error(e);
          notify('Error creating ZIP file', 'error');
      } finally {
          setIsZipping(false);
      }
  };

  if (!file) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">PDF to {format === 'png' ? 'PNG' : 'JPG'}</h2>
          <p className="text-slate-500 dark:text-slate-400">Convert PDF pages into high-quality images. Extract all pages at once.</p>
        </div>
        <Dropzone onFileSelect={setFile} accept="application/pdf" label="Upload PDF" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 transition-colors">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 border-b border-slate-100 dark:border-slate-700 pb-4 gap-4">
           <div>
             <h3 className="font-bold text-lg text-slate-800 dark:text-white">{file.name}</h3>
             <p className="text-sm text-slate-500 dark:text-slate-400">{pdfDoc?.numPages} pages found</p>
           </div>
           
           <div className="flex flex-wrap items-center gap-4">
               <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-lg">
                   <button 
                    onClick={() => setFormat('png')}
                    className={`px-3 py-1 text-sm font-bold rounded transition-colors ${format === 'png' ? 'bg-white dark:bg-slate-700 shadow text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}
                   >
                       PNG
                   </button>
                   <button 
                    onClick={() => setFormat('jpeg')}
                    className={`px-3 py-1 text-sm font-bold rounded transition-colors ${format === 'jpeg' ? 'bg-white dark:bg-slate-700 shadow text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}
                   >
                       JPG
                   </button>
               </div>
               
               {pageImages.length > 0 && (
                   <button 
                    onClick={downloadAllZip}
                    disabled={isZipping}
                    className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg text-sm hover:bg-blue-700 shadow-sm disabled:opacity-50"
                   >
                       {isZipping ? 'Zipping...' : 'Download All (ZIP)'}
                   </button>
               )}

               <button onClick={() => setFile(null)} className="text-sm text-red-500 hover:underline">
                    Remove
               </button>
           </div>
        </div>

        {isProcessing && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
            <p className="mt-4 text-slate-500 dark:text-slate-400">Processing pages...</p>
          </div>
        )}

        {!isProcessing && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pageImages.map((imgSrc, idx) => (
                <div key={idx} className="group relative bg-slate-100 dark:bg-slate-900 rounded-lg p-2 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all">
                <div className="aspect-[1/1.4] overflow-hidden rounded shadow-sm bg-white">
                    <img src={imgSrc} alt={`Page ${idx + 1}`} className="w-full h-full object-contain" />
                </div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <button 
                    onClick={() => downloadPage(imgSrc, idx)}
                    className="bg-white text-slate-900 px-4 py-2 rounded-full font-bold shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all flex items-center"
                    >
                    <DownloadIcon className="w-4 h-4 mr-2" />
                    Download
                    </button>
                </div>
                <div className="mt-2 text-center text-xs font-semibold text-slate-500 dark:text-slate-400">Page {idx + 1}</div>
                </div>
            ))}
            </div>
        )}
      </div>
    </div>
  );
};