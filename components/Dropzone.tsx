import React, { useCallback, useState } from 'react';
import { UploadIcon } from './Icons';

interface DropzoneProps {
  onFileSelect: (file: File) => void;
  accept: string;
  label?: string;
}

export const Dropzone: React.FC<DropzoneProps> = ({ onFileSelect, accept, label = "Drop your file here, or browse" }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  }, [onFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  }, [onFileSelect]);

  const prettyAccept = accept.replace(/image\//g, '').replace(/application\//g, '').replace(/\./g, '').toUpperCase();

  return (
    <div 
      className={`
        relative w-full max-w-2xl mx-auto h-72 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group overflow-hidden
        ${isDragging 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-[1.01] shadow-2xl shadow-blue-500/10' 
            : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/50 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-slate-50 dark:hover:bg-slate-800'}
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => document.getElementById('file-upload')?.click()}
    >
      <input 
        type="file" 
        id="file-upload" 
        className="hidden" 
        accept={accept} 
        onChange={handleFileInput} 
      />
      
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-slate-100 dark:bg-grid-slate-800 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] pointer-events-none opacity-50"></div>

      <div className={`
        relative z-10 p-5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 mb-5 
        transition-transform duration-300 shadow-lg shadow-blue-500/10
        ${isDragging ? 'scale-110 rotate-3' : 'group-hover:scale-110 group-hover:-rotate-3'}
      `}>
        <UploadIcon className="w-10 h-10" />
      </div>
      
      <h3 className="relative z-10 text-xl font-bold text-slate-800 dark:text-slate-200 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
        {isDragging ? 'Drop it like it\'s hot!' : label}
      </h3>
      <p className="relative z-10 text-sm text-slate-500 dark:text-slate-400">
        Supports <span className="font-mono bg-slate-100 dark:bg-slate-700 px-1 py-0.5 rounded text-slate-700 dark:text-slate-300">{prettyAccept}</span>
      </p>
      
      <div className="mt-6 relative z-10">
          <span className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-md transition-all group-hover:shadow-lg hover:-translate-y-0.5">
            Browse Files
          </span>
      </div>
    </div>
  );
};