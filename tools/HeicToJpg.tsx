import React, { useState } from 'react';
import { Dropzone } from '../components/Dropzone';
import { DownloadIcon } from '../components/Icons';
import { useNotification } from '../components/NotificationContext';

declare global {
  interface Window {
    heic2any: any;
  }
}

export const HeicToJpg: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [convertedUrl, setConvertedUrl] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { notify } = useNotification();

  const processFile = async (f: File) => {
    setFile(f);
    setIsProcessing(true);
    notify('Converting HEIC file...', 'info');
    try {
        const resultBlob = await window.heic2any({
            blob: f,
            toType: "image/jpeg",
            quality: 0.9
        });
        
        // heic2any can return Blob or Blob[]
        const blob = Array.isArray(resultBlob) ? resultBlob[0] : resultBlob;
        setConvertedUrl(URL.createObjectURL(blob));
        notify('Conversion successful!', 'success');
    } catch (e) {
        console.error(e);
        notify('Could not convert HEIC file. Ensure the file is valid.', 'error');
    } finally {
        setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">HEIC to JPG Converter</h2>
        <p className="text-slate-500 dark:text-slate-400">Convert iPhone HEIC photos to widely supported JPG format.</p>
      </div>

      {!file ? (
         <Dropzone onFileSelect={processFile} accept=".heic" label="Upload .HEIC file" />
      ) : (
         <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 flex flex-col items-center transition-colors">
            {isProcessing ? (
                <div className="py-12 flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-slate-500 dark:text-slate-400">Converting HEIC...</p>
                </div>
            ) : (
                <>
                   <img src={convertedUrl} alt="Converted" className="max-h-96 rounded-lg shadow-md mb-6" />
                   <a 
                     href={convertedUrl} 
                     download={file.name.replace(/\.heic$/i, '.jpg')}
                     className="px-8 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 flex items-center shadow-lg hover:shadow-green-500/30 transition-all"
                   >
                     <DownloadIcon className="w-5 h-5 mr-2" />
                     Download JPG
                   </a>
                   <button onClick={() => { setFile(null); setConvertedUrl(''); }} className="mt-4 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200">
                     Convert Another
                   </button>
                </>
            )}
         </div>
      )}
    </div>
  );
};