import React, { useState } from 'react';
import { Dropzone } from '../components/Dropzone';
import { DownloadIcon, CompressIcon } from '../components/Icons';
import { useNotification } from '../components/NotificationContext';

declare global {
  interface Window {
    pdfjsLib: any;
    jspdf: any;
  }
}

export const PdfCompressor: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [compressionLevel, setCompressionLevel] = useState(0.5);
  const { notify } = useNotification();

  const compressPdf = async () => {
    if (!file) return;
    setIsProcessing(true);
    notify('Starting compression...', 'info');
    
    try {
        const buffer = await file.arrayBuffer();
        const loadingTask = window.pdfjsLib.getDocument(buffer);
        const pdf = await loadingTask.promise;
        
        const { jsPDF } = window.jspdf;
        const newDoc = new jsPDF();
        newDoc.deletePage(1); 
        
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const scale = 1.5; 
            const viewport = page.getViewport({ scale });
            
            const canvas = document.createElement('canvas');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            const ctx = canvas.getContext('2d');
            
            await page.render({ canvasContext: ctx, viewport }).promise;
            
            const imgData = canvas.toDataURL('image/jpeg', compressionLevel);
            const originalViewport = page.getViewport({ scale: 1.0 });
            const isLandscape = originalViewport.width > originalViewport.height;
            
            newDoc.addPage([originalViewport.width, originalViewport.height], isLandscape ? 'l' : 'p');
            newDoc.addImage(imgData, 'JPEG', 0, 0, originalViewport.width, originalViewport.height);
        }
        
        newDoc.save(`compressed-${file.name}`);
        notify('Compressed PDF downloaded!', 'success');

    } catch (e) {
        console.error(e);
        notify('Error processing PDF', 'error');
    } finally {
        setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Compress PDF</h2>
            <p className="text-slate-500 dark:text-slate-400">Reduce PDF size by optimizing pages into efficient images.</p>
        </div>

        {!file ? (
            <Dropzone onFileSelect={setFile} accept="application/pdf" label="Upload PDF" />
        ) : (
            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow border border-slate-200 dark:border-slate-700 text-center transition-colors">
                <div className="mb-6 flex items-center justify-center">
                    <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                        <CompressIcon className="w-8 h-8 text-red-600 dark:text-red-400" />
                    </div>
                </div>
                <p className="font-bold text-lg mb-6 text-slate-800 dark:text-white">{file.name}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">
                    Note: This tool converts vector PDFs into optimized image-based PDFs to save space. Text selection may be lost.
                </p>
                
                <div className="max-w-md mx-auto mb-8 text-left">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Compression Mode</label>
                    <div className="flex gap-2 mb-4">
                        <button 
                            onClick={() => setCompressionLevel(0.3)} 
                            className={`flex-1 py-2 px-3 text-sm rounded border ${compressionLevel === 0.3 ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900/30 dark:border-blue-500 dark:text-blue-300' : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300'}`}
                        >
                            <span className="block font-bold">Email Size</span>
                            <span className="text-xs opacity-75">Max compression</span>
                        </button>
                        <button 
                            onClick={() => setCompressionLevel(0.6)} 
                            className={`flex-1 py-2 px-3 text-sm rounded border ${compressionLevel === 0.6 ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900/30 dark:border-blue-500 dark:text-blue-300' : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300'}`}
                        >
                            <span className="block font-bold">Balanced</span>
                            <span className="text-xs opacity-75">Best for web</span>
                        </button>
                        <button 
                            onClick={() => setCompressionLevel(0.9)} 
                            className={`flex-1 py-2 px-3 text-sm rounded border ${compressionLevel === 0.9 ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900/30 dark:border-blue-500 dark:text-blue-300' : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300'}`}
                        >
                            <span className="block font-bold">Print</span>
                            <span className="text-xs opacity-75">High quality</span>
                        </button>
                    </div>

                    <input 
                        type="range" 
                        min="0.1" 
                        max="1.0" 
                        step="0.1"
                        value={compressionLevel}
                        onChange={(e) => setCompressionLevel(Number(e.target.value))}
                        className="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-red-600"
                    />
                    <div className="text-center text-xs font-mono text-slate-500 dark:text-slate-400 mt-2">
                        Quality Factor: {Math.round(compressionLevel * 100)}%
                    </div>
                </div>

                <button 
                    onClick={compressPdf}
                    disabled={isProcessing}
                    className="px-8 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 disabled:opacity-50 flex items-center mx-auto transition-all shadow-lg hover:shadow-red-500/30"
                >
                    {isProcessing ? 'Compressing...' : 'Compress & Download'}
                </button>
                <button onClick={() => setFile(null)} className="mt-4 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 text-sm">Cancel</button>
            </div>
        )}
    </div>
  );
};