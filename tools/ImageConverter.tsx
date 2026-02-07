import React, { useState, useRef, useEffect } from 'react';
import { Dropzone } from '../components/Dropzone';
import { DownloadIcon } from '../components/Icons';
import { ImageFormat } from '../types';
import { useNotification } from '../components/NotificationContext';

interface ImageConverterProps {
  defaultOutputFormat?: ImageFormat;
  acceptedInputFormats?: string[]; // e.g. ['image/png']
  title?: string;
}

export const ImageConverter: React.FC<ImageConverterProps> = ({ 
  defaultOutputFormat, 
  acceptedInputFormats,
  title 
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [targetFormat, setTargetFormat] = useState<ImageFormat>(defaultOutputFormat || 'image/jpeg');
  const [imageSrc, setImageSrc] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { notify } = useNotification();

  const acceptString = acceptedInputFormats ? acceptedInputFormats.join(',') : "image/*";

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setImageSrc(url);
      notify(`Loaded ${file.name}`, 'info');
      
      if (!defaultOutputFormat) {
        if (file.type === 'image/jpeg') setTargetFormat('image/png');
        else if (file.type === 'image/png') setTargetFormat('image/jpeg');
      }
    }
  }, [file, defaultOutputFormat]);

  const handleConvert = () => {
    if (!file || !canvasRef.current) return;
    setIsProcessing(true);

    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current!;
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        
        setTimeout(() => {
          const dataUrl = canvas.toDataURL(targetFormat, 0.92);
          const link = document.createElement('a');
          const ext = targetFormat.split('/')[1];
          link.download = `converted-${file.name.split('.')[0]}.${ext}`;
          link.href = dataUrl;
          link.click();
          setIsProcessing(false);
          notify('Conversion complete!', 'success');
        }, 100);
      }
    };
    img.onerror = () => {
      setIsProcessing(false);
      notify('Failed to process image', 'error');
    };
    img.src = imageSrc;
  };

  if (!file) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
             {title || (defaultOutputFormat ? `Convert to ${defaultOutputFormat.split('/')[1].toUpperCase()}` : 'Image Converter')}
          </h2>
          <p className="text-slate-500 dark:text-slate-400">
            {acceptedInputFormats 
              ? `Convert your ${acceptedInputFormats.map(f => f.split('/')[1].toUpperCase()).join('/')} files.`
              : 'Convert between JPG, PNG, and WebP formats instantly.'}
          </p>
        </div>
        <Dropzone onFileSelect={setFile} accept={acceptString} label="Upload Image to Convert" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden transition-colors">
        <div className="p-8 grid md:grid-cols-2 gap-8 items-center">
          
          <div className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-600">
            <img src={imageSrc} alt="Preview" className="max-h-64 object-contain shadow-md rounded-lg" />
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400 font-mono">{file.name}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-white">Conversion Settings</h3>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Convert to</label>
              <div className="grid grid-cols-3 gap-3">
                {(['image/jpeg', 'image/png', 'image/webp'] as const).map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => setTargetFormat(fmt)}
                    className={`
                      py-3 px-2 rounded-lg text-sm font-bold border transition-all
                      ${targetFormat === fmt 
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shadow-sm' 
                        : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'}
                    `}
                  >
                    {fmt.split('/')[1].toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleConvert}
              disabled={isProcessing}
              className={`
                w-full py-4 rounded-xl font-bold text-lg text-white shadow-lg transition-all flex items-center justify-center
                ${isProcessing ? 'bg-slate-400 cursor-wait' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-200 dark:hover:shadow-none hover:-translate-y-0.5'}
              `}
            >
              {isProcessing ? (
                <span>Converting...</span>
              ) : (
                <>
                  <DownloadIcon className="w-6 h-6 mr-2" />
                  Convert & Download
                </>
              )}
            </button>
            
            <button onClick={() => setFile(null)} className="w-full text-center text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 text-sm">
              Cancel
            </button>
          </div>
        </div>
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};