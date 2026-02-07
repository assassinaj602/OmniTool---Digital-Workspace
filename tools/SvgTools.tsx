import React, { useState } from 'react';
import { Dropzone } from '../components/Dropzone';
import { DownloadIcon, SvgIcon } from '../components/Icons';
import { useNotification } from '../components/NotificationContext';

declare global {
  interface Window {
    ImageTracer: any;
  }
}

interface SvgToolsProps {
  defaultMode?: 'svg-to-png' | 'png-to-svg';
}

export const SvgTools: React.FC<SvgToolsProps> = ({ defaultMode }) => {
  const [file, setFile] = useState<File | null>(null);
  const [outputUrl, setOutputUrl] = useState('');
  const [mode, setMode] = useState<'svg-to-png' | 'png-to-svg'>(defaultMode || 'svg-to-png');
  const [isProcessing, setIsProcessing] = useState(false);
  const { notify } = useNotification();

  const handleFile = (f: File) => {
      setFile(f);
      notify('File uploaded successfully', 'info');
      if (!defaultMode) {
        if (f.type.includes('svg')) {
            setMode('svg-to-png');
        } else {
            setMode('png-to-svg');
        }
      }
  };

  const processFile = () => {
      if (!file) return;
      setIsProcessing(true);

      if (mode === 'svg-to-png') {
          // SVG to PNG
          const img = new Image();
          img.onload = () => {
              const canvas = document.createElement('canvas');
              // Use explicit dimensions if available, else default
              canvas.width = (img.width > 0 ? img.width : 800); 
              canvas.height = (img.height > 0 ? img.height : 600);
              const ctx = canvas.getContext('2d');
              ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
              setOutputUrl(canvas.toDataURL('image/png'));
              setIsProcessing(false);
              notify('Conversion complete!', 'success');
          };
          img.src = URL.createObjectURL(file);
      } else {
          // PNG/JPG to SVG (Vectorization)
          const reader = new FileReader();
          reader.onload = (e) => {
              if (e.target?.result) {
                  const src = e.target.result as string;
                  window.ImageTracer.imageToSVG(
                      src,
                      (svgstr: string) => {
                          const blob = new Blob([svgstr], { type: 'image/svg+xml' });
                          setOutputUrl(URL.createObjectURL(blob));
                          setIsProcessing(false);
                          notify('Vectorization complete!', 'success');
                      },
                      { 
                          ltres: 1, 
                          qtres: 1, 
                          pathomit: 8, 
                          rightangleenhance: false, 
                          colorsampling: 1, 
                          numberofcolors: 16, 
                          mincolorratio: 0.02, 
                          colorquantcycles: 3 
                      } 
                  );
              }
          };
          reader.readAsDataURL(file);
      }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                {mode === 'svg-to-png' ? 'SVG to PNG Converter' : 'Image to SVG Vectorizer'}
            </h2>
            <p className="text-slate-500 dark:text-slate-400">
                {mode === 'svg-to-png' ? 'Convert scalable vectors to transparent PNG images.' : 'Convert raster images into scalable SVG vectors.'}
            </p>
        </div>

        {!file ? (
            <Dropzone 
                onFileSelect={handleFile} 
                accept={mode === 'svg-to-png' ? ".svg,image/svg+xml" : "image/jpeg,image/png"} 
                label={mode === 'svg-to-png' ? "Upload SVG File" : "Upload Image to Vectorize"} 
            />
        ) : (
            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow flex flex-col items-center border border-slate-100 dark:border-slate-700 transition-colors">
                <div className="flex gap-4 mb-6">
                    <button 
                        onClick={() => setMode('svg-to-png')} 
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${mode === 'svg-to-png' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' : 'text-slate-400 dark:text-slate-500'}`}
                    >
                        SVG to PNG
                    </button>
                    <button 
                        onClick={() => setMode('png-to-svg')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${mode === 'png-to-svg' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' : 'text-slate-400 dark:text-slate-500'}`}
                    >
                        Image to SVG
                    </button>
                </div>

                {!outputUrl ? (
                    <button 
                        onClick={processFile}
                        disabled={isProcessing}
                        className="px-8 py-3 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 disabled:opacity-50 transition-all shadow-lg"
                    >
                        {isProcessing ? 'Processing...' : `Convert to ${mode === 'svg-to-png' ? 'PNG' : 'SVG'}`}
                    </button>
                ) : (
                    <>
                         <div className="p-4 bg-slate-100 dark:bg-slate-700 rounded-lg mb-6 w-full max-w-md flex justify-center overflow-hidden border border-slate-200 dark:border-slate-600">
                            <img src={outputUrl} alt="Preview" className="max-h-64 object-contain" />
                        </div>
                        <a 
                            href={outputUrl}
                            download={file.name.replace(/\.[^/.]+$/, "") + (mode === 'svg-to-png' ? '.png' : '.svg')}
                            className="px-8 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 flex items-center shadow-lg hover:shadow-green-500/30 transition-all"
                        >
                            <DownloadIcon className="w-5 h-5 mr-2" />
                            Download {mode === 'svg-to-png' ? 'PNG' : 'SVG'}
                        </a>
                    </>
                )}
                <button onClick={() => { setFile(null); setOutputUrl(''); }} className="mt-4 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200">Convert Another</button>
            </div>
        )}
    </div>
  );
};