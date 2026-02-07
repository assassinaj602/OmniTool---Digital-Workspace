import React, { useState } from 'react';
import { Dropzone } from '../components/Dropzone';
import { DownloadIcon, GifIcon } from '../components/Icons';
import { useNotification } from '../components/NotificationContext';

declare global {
  interface Window {
    pdfjsLib: any;
    GIF: any;
  }
}

export const PdfToGif: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [gifUrl, setGifUrl] = useState('');
  const [delay, setDelay] = useState(1000); // ms
  const { notify } = useNotification();

  const process = async () => {
      if (!file) return;
      setIsProcessing(true);
      notify('Starting GIF rendering...', 'info');
      try {
          const buffer = await file.arrayBuffer();
          const pdf = await window.pdfjsLib.getDocument(buffer).promise;
          
          const gif = new window.GIF({
              workers: 2,
              quality: 10,
              width: 600,
              height: 600 * (1.414),
              workerScript: 'https://cdnjs.cloudflare.com/ajax/libs/gif.js/0.2.0/gif.worker.js'
          });
          
          const page1 = await pdf.getPage(1);
          const v1 = page1.getViewport({ scale: 1 });
          const targetWidth = 600;
          const scale = targetWidth / v1.width;
          
          gif.options.width = targetWidth;
          gif.options.height = v1.height * scale;

          for (let i = 1; i <= pdf.numPages; i++) {
              const page = await pdf.getPage(i);
              const viewport = page.getViewport({ scale: scale });
              
              const canvas = document.createElement('canvas');
              canvas.width = viewport.width;
              canvas.height = viewport.height;
              const ctx = canvas.getContext('2d');
              
              ctx!.fillStyle = '#ffffff';
              ctx!.fillRect(0, 0, canvas.width, canvas.height);
              
              await page.render({ canvasContext: ctx!, viewport: viewport }).promise;
              
              gif.addFrame(canvas, { delay: delay });
          }
          
          gif.on('finished', (blob: Blob) => {
              setGifUrl(URL.createObjectURL(blob));
              setIsProcessing(false);
              notify('GIF generated successfully!', 'success');
          });
          
          gif.render();
          
      } catch (e) {
          console.error(e);
          notify('Error creating GIF', 'error');
          setIsProcessing(false);
      }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">PDF to GIF</h2>
            <p className="text-slate-500 dark:text-slate-400">Turn PDF pages into an animated GIF slideshow.</p>
        </div>

        {!file ? (
            <Dropzone onFileSelect={setFile} accept="application/pdf" label="Upload PDF" />
        ) : (
            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow text-center border border-slate-100 dark:border-slate-700 transition-colors">
                {!gifUrl ? (
                    <div className="max-w-md mx-auto">
                        <h3 className="font-bold text-lg mb-6 text-slate-800 dark:text-white">{file.name}</h3>
                        
                        <div className="mb-8 text-left">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Speed (Delay per page)</label>
                            <input 
                                type="range" min="100" max="3000" step="100" 
                                value={delay} 
                                onChange={(e) => setDelay(Number(e.target.value))}
                                className="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-purple-600"
                            />
                            <div className="flex justify-between text-xs text-slate-400 dark:text-slate-500 mt-2">
                                <span>Fast (0.1s)</span>
                                <span className="font-bold text-purple-600 dark:text-purple-400">{delay}ms</span>
                                <span>Slow (3s)</span>
                            </div>
                        </div>

                        <button 
                            onClick={process} 
                            disabled={isProcessing}
                            className="w-full px-8 py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 disabled:opacity-50 transition-all shadow-md hover:shadow-purple-500/30"
                        >
                            {isProcessing ? 'Rendering GIF...' : 'Convert to GIF'}
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center">
                        <img src={gifUrl} alt="Result" className="max-h-96 shadow-lg rounded-lg mb-6 border dark:border-slate-600" />
                        <a href={gifUrl} download="slideshow.gif" className="px-8 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 shadow-md flex items-center transition-all">
                            <DownloadIcon className="w-5 h-5 mr-2" />
                            Download GIF
                        </a>
                    </div>
                )}
                 <button onClick={() => { setFile(null); setGifUrl(''); }} className="mt-6 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 text-sm">Convert Another File</button>
            </div>
        )}
    </div>
  );
};