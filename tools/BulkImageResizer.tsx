import React, { useState } from 'react';
import { Dropzone } from '../components/Dropzone';
import { DownloadIcon, BulkIcon } from '../components/Icons';
import { useNotification } from '../components/NotificationContext';

declare global {
  interface Window {
    JSZip: any;
  }
}

export const BulkImageResizer: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [width, setWidth] = useState(800);
  const [isProcessing, setIsProcessing] = useState(false);
  const { notify } = useNotification();

  const handleFiles = (newFile: File) => {
    setFiles(prev => [...prev, newFile]);
    notify(`Added ${newFile.name}`, 'info');
  };

  const processImages = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);

    try {
      const zip = new window.JSZip();
      
      const processPromises = files.map(file => {
        return new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const ratio = img.width / img.height;
            canvas.width = width;
            canvas.height = width / ratio;
            
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                canvas.toBlob(blob => {
                   if (blob) zip.file(`resized-${file.name}`, blob);
                   resolve();
                }, file.type, 0.9);
            } else {
                resolve();
            }
          };
          img.src = URL.createObjectURL(file);
        });
      });

      await Promise.all(processPromises);
      
      const content = await zip.generateAsync({ type: "blob" });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = "resized_images.zip";
      link.click();
      notify('Batch processing complete!', 'success');
      
    } catch (err) {
      console.error(err);
      notify('Error processing images', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Bulk Image Resizer</h2>
        <p className="text-slate-500 dark:text-slate-400">Resize multiple images at once and download as a ZIP.</p>
      </div>

      <Dropzone onFileSelect={handleFiles} accept="image/*" label="Add Images to Queue" />

      {files.length > 0 && (
        <div className="mt-8 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
           <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-slate-800 dark:text-white">Queue ({files.length} images)</h3>
              <button onClick={() => setFiles([])} className="text-red-500 text-sm hover:text-red-600">Clear All</button>
           </div>
           
           <div className="flex flex-wrap gap-2 mb-6">
              {files.map((f, i) => (
                  <span key={i} className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs text-slate-600 dark:text-slate-300 truncate max-w-[150px]">{f.name}</span>
              ))}
           </div>

           <div className="flex items-center gap-4">
              <div className="flex-1">
                 <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Target Width (px)</label>
                 <input 
                   type="number" 
                   value={width} 
                   onChange={(e) => setWidth(Number(e.target.value))}
                   className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg"
                 />
              </div>
              <button 
                onClick={processImages}
                disabled={isProcessing}
                className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 mt-6 transition-all"
              >
                {isProcessing ? 'Processing...' : 'Resize & Zip'}
              </button>
           </div>
        </div>
      )}
    </div>
  );
};