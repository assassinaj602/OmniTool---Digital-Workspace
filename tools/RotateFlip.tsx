import React, { useState, useRef, useEffect } from 'react';
import { Dropzone } from '../components/Dropzone';
import { DownloadIcon, RotateIcon, FlipIcon } from '../components/Icons';
import { useNotification } from '../components/NotificationContext';

export const RotateFlip: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const { notify } = useNotification();

  useEffect(() => {
    if (file) {
      updatePreview();
    }
  }, [file, rotation, flipH, flipV]);

  const updatePreview = () => {
    if (!file) return;

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      if (rotation % 180 === 0) {
        canvas.width = img.width;
        canvas.height = img.height;
      } else {
        canvas.width = img.height;
        canvas.height = img.width;
      }

      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      ctx.restore();

      setPreviewUrl(canvas.toDataURL(file.type));
    };
    img.src = URL.createObjectURL(file);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.download = `edited-${file?.name}`;
    link.href = previewUrl;
    link.click();
    notify('Image downloaded', 'success');
  };

  const rotateLeft = () => setRotation((r) => (r - 90) % 360);
  const rotateRight = () => setRotation((r) => (r + 90) % 360);

  if (!file) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Rotate & Flip Image</h2>
          <p className="text-slate-500 dark:text-slate-400">Fix orientation, turn sideways, or mirror your images.</p>
        </div>
        <Dropzone onFileSelect={(f) => { setFile(f); notify('Image loaded', 'info'); }} accept="image/*" label="Upload Image to Rotate/Flip" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Tools */}
         <div className="lg:col-span-1 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 h-fit transition-colors">
            <h3 className="font-bold text-lg mb-6 border-b border-slate-100 dark:border-slate-700 pb-2 text-slate-800 dark:text-white">Transform</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
               <button onClick={rotateLeft} className="p-4 bg-slate-50 dark:bg-slate-700 hover:bg-blue-50 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 hover:border-blue-200 rounded-xl flex flex-col items-center gap-2 transition-all group">
                  <RotateIcon className="w-6 h-6 transform -scale-x-100 text-slate-600 dark:text-slate-300 group-hover:text-blue-600" />
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Left 90°</span>
               </button>
               <button onClick={rotateRight} className="p-4 bg-slate-50 dark:bg-slate-700 hover:bg-blue-50 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 hover:border-blue-200 rounded-xl flex flex-col items-center gap-2 transition-all group">
                  <RotateIcon className="w-6 h-6 text-slate-600 dark:text-slate-300 group-hover:text-blue-600" />
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Right 90°</span>
               </button>
               <button onClick={() => setFlipH(!flipH)} className={`p-4 border rounded-xl flex flex-col items-center gap-2 transition-all ${flipH ? 'bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300' : 'bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 hover:bg-blue-50 dark:hover:bg-slate-600'}`}>
                  <FlipIcon className={`w-6 h-6 ${!flipH && 'text-slate-600 dark:text-slate-300'}`} />
                  <span className={`text-xs font-medium ${!flipH && 'text-slate-600 dark:text-slate-300'}`}>Flip Horiz</span>
               </button>
               <button onClick={() => setFlipV(!flipV)} className={`p-4 border rounded-xl flex flex-col items-center gap-2 transition-all ${flipV ? 'bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300' : 'bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 hover:bg-blue-50 dark:hover:bg-slate-600'}`}>
                  <FlipIcon className={`w-6 h-6 transform rotate-90 ${!flipV && 'text-slate-600 dark:text-slate-300'}`} />
                  <span className={`text-xs font-medium ${!flipV && 'text-slate-600 dark:text-slate-300'}`}>Flip Vert</span>
               </button>
            </div>

            <button 
              onClick={handleDownload}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center mb-3"
            >
              <DownloadIcon className="w-5 h-5 mr-2" />
              Download Image
            </button>
            <button 
              onClick={() => setFile(null)}
              className="w-full py-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 font-medium text-sm"
            >
              Reset / New Image
            </button>
         </div>

         {/* Preview */}
         <div className="lg:col-span-2 bg-slate-100 dark:bg-slate-900 rounded-2xl flex items-center justify-center p-8 border border-slate-200 dark:border-slate-700 overflow-hidden min-h-[500px]">
            {previewUrl ? (
               <img src={previewUrl} alt="Preview" className="max-w-full max-h-[600px] object-contain shadow-lg dark:shadow-black/40" />
            ) : (
               <div className="text-slate-400">Loading preview...</div>
            )}
         </div>
      </div>
    </div>
  );
};