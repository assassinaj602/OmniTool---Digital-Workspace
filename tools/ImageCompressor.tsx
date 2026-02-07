import React, { useState, useEffect } from 'react';
import { Dropzone } from '../components/Dropzone';
import { DownloadIcon } from '../components/Icons';
import { useNotification } from '../components/NotificationContext';

export const ImageCompressor: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState(0.8);
  const [compressedUrl, setCompressedUrl] = useState<string | null>(null);
  const [compressedSize, setCompressedSize] = useState(0);
  const [isCompressing, setIsCompressing] = useState(false);
  const { notify } = useNotification();

  useEffect(() => {
    if (file) {
      compressImage(file, quality);
    }
  }, [file, quality]);

  const compressImage = (sourceFile: File, q: number) => {
    setIsCompressing(true);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        
        let type = sourceFile.type;
        if (type === 'image/png') type = 'image/jpeg'; 

        canvas.toBlob((blob) => {
          if (blob) {
            setCompressedUrl(URL.createObjectURL(blob));
            setCompressedSize(blob.size);
            setIsCompressing(false);
          }
        }, type, q);
      }
    };
    img.onerror = () => {
        setIsCompressing(false);
        notify('Failed to load image', 'error');
    };
    img.src = URL.createObjectURL(sourceFile);
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const calculateSavings = () => {
    if (!file || compressedSize === 0) return 0;
    const savings = ((file.size - compressedSize) / file.size) * 100;
    return Math.max(0, Math.round(savings));
  };

  if (!file) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-heading font-bold text-slate-900 dark:text-white mb-4">Compress Image</h2>
          <p className="text-slate-500 dark:text-slate-400">Reduce file size while maintaining quality. Best for WebP and JPEG.</p>
        </div>
        <Dropzone onFileSelect={setFile} accept="image/*" label="Upload Image to Compress" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden transition-colors">
        <div className="p-8">
           
           <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-8">
              {/* Original */}
              <div className="text-center w-full md:w-1/2 p-4 rounded-xl bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600">
                <span className="text-xs font-bold text-slate-400 dark:text-slate-300 uppercase tracking-wider">Original</span>
                <div className="text-xl font-mono font-bold text-slate-700 dark:text-white my-2">{formatSize(file.size)}</div>
                <div className="text-xs text-slate-400 dark:text-slate-400 truncate max-w-[200px] mx-auto">{file.name}</div>
              </div>
              
              <div className="hidden md:block text-slate-300 dark:text-slate-600">
                 <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                 </svg>
              </div>

              {/* Compressed */}
              <div className="text-center w-full md:w-1/2 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800">
                <span className="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-wider">Compressed</span>
                <div className="text-xl font-mono font-bold text-green-700 dark:text-green-300 my-2">
                   {isCompressing ? '...' : formatSize(compressedSize)}
                </div>
                <div className="inline-block px-2 py-1 bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 text-xs font-mono font-bold rounded-full">
                   -{calculateSavings()}% Size
                </div>
              </div>
           </div>

           <div className="mb-8">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Compression Level: <span className="font-mono">{Math.round(quality * 100)}%</span></label>
              <input 
                type="range" 
                min="0.1" 
                max="1.0" 
                step="0.05" 
                value={quality} 
                onChange={(e) => setQuality(parseFloat(e.target.value))}
                className="w-full h-3 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-xs text-slate-400 dark:text-slate-500 mt-1">
                 <span>Low Quality</span>
                 <span>High Quality</span>
              </div>
           </div>

           <div className="flex gap-4">
              <button 
                onClick={() => setFile(null)}
                className="flex-1 py-3 border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <a 
                href={compressedUrl || '#'}
                download={`compressed-${file.name.split('.')[0]}.jpg`} 
                onClick={() => notify('Compressed image downloaded', 'success')}
                className={`
                   flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 hover:shadow-blue-200 dark:hover:shadow-none transition-all flex items-center justify-center
                   ${(!compressedUrl || isCompressing) ? 'pointer-events-none opacity-50' : ''}
                `}
              >
                <DownloadIcon className="w-5 h-5 mr-2" />
                Download
              </a>
           </div>

        </div>
      </div>
    </div>
  );
};