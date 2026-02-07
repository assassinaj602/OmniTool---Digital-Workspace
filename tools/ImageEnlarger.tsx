import React, { useState, useRef, useEffect } from 'react';
import { Dropzone } from '../components/Dropzone';
import { DownloadIcon, ExpandIcon } from '../components/Icons';
import { useNotification } from '../components/NotificationContext';

export const ImageEnlarger: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [scale, setScale] = useState(2);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { notify } = useNotification();

  const download = () => {
    if (!file || !canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `enlarged-${file.name}`;
    link.href = canvasRef.current.toDataURL(file.type);
    link.click();
    notify('Image downloaded successfully', 'success');
  };

  useEffect(() => {
    if (file && canvasRef.current) {
        const img = new Image();
        img.onload = () => {
            const canvas = canvasRef.current!;
            canvas.width = img.width * scale;
            canvas.height = img.height * scale;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                // Use browser's best available smoothing
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            }
        };
        img.src = URL.createObjectURL(file);
    }
  }, [file, scale]);

  const handleFile = (f: File) => {
      setFile(f);
      notify('Image loaded', 'info');
  };

  if (!file) {
      return (
        <div className="max-w-4xl mx-auto py-12 px-4">
            <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Image Enlarger</h2>
                <p className="text-slate-500 dark:text-slate-400">Upscale small images with high quality smoothing.</p>
            </div>
            <Dropzone onFileSelect={handleFile} accept="image/*" label="Upload Image" />
        </div>
      );
  }

  return (
      <div className="max-w-4xl mx-auto py-12 px-4">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow border border-slate-200 dark:border-slate-700 transition-colors">
              <div className="flex items-center gap-4 mb-6 justify-center">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Scale Factor:</span>
                  {[2, 4, 8].map(s => (
                      <button 
                        key={s}
                        onClick={() => setScale(s)}
                        className={`px-4 py-2 rounded-lg border transition-all ${scale === s ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600'}`}
                      >
                        {s}x
                      </button>
                  ))}
              </div>

              <div className="overflow-auto max-h-[500px] bg-slate-100 dark:bg-slate-900 rounded-xl flex justify-center p-4 mb-6 border border-slate-200 dark:border-slate-700">
                  <canvas ref={canvasRef} className="shadow-lg max-w-full" />
              </div>

              <div className="flex gap-4">
                  <button onClick={() => setFile(null)} className="flex-1 py-3 text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl transition-colors">Cancel</button>
                  <button onClick={download} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold shadow hover:bg-blue-700 transition-all">Download Enlarged Image</button>
              </div>
          </div>
      </div>
  );
};