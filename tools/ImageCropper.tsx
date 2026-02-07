import React, { useState, useRef, useEffect, MouseEvent } from 'react';
import { Dropzone } from '../components/Dropzone';
import { DownloadIcon } from '../components/Icons';
import { useNotification } from '../components/NotificationContext';

export const ImageCropper: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { notify } = useNotification();

  useEffect(() => {
    if (file) {
      const img = new Image();
      img.onload = () => {
        setImage(img);
        setCrop({ x: 0, y: 0, width: img.width, height: img.height });
        notify('Image loaded', 'info');
      };
      img.onerror = () => notify('Failed to load image', 'error');
      img.src = URL.createObjectURL(file);
    }
  }, [file]);

  const handleMouseDown = (e: MouseEvent) => {
    if (!containerRef.current || !image) return;
    const rect = containerRef.current.getBoundingClientRect();
    const scaleX = image.width / rect.width;
    const scaleY = image.height / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    setStartPos({ x, y });
    setCrop({ x, y, width: 0, height: 0 });
    setIsDragging(true);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !containerRef.current || !image) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const scaleX = image.width / rect.width;
    const scaleY = image.height / rect.height;
    
    const currentX = (e.clientX - rect.left) * scaleX;
    const currentY = (e.clientY - rect.top) * scaleY;
    
    let x = startPos.x;
    let y = startPos.y;
    let width = currentX - startPos.x;
    let height = currentY - startPos.y;

    if (width < 0) {
      x = currentX;
      width = Math.abs(width);
    }
    if (height < 0) {
      y = currentY;
      height = Math.abs(height);
    }

    if (x < 0) x = 0;
    if (y < 0) y = 0;
    if (x + width > image.width) width = image.width - x;
    if (y + height > image.height) height = image.height - y;

    setCrop({ x, y, width, height });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const downloadCrop = () => {
    if (!image || !canvasRef.current || crop.width === 0 || crop.height === 0) return;
    
    const canvas = canvasRef.current;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.drawImage(
        image,
        crop.x, crop.y, crop.width, crop.height,
        0, 0, crop.width, crop.height
      );
      
      const link = document.createElement('a');
      link.download = `cropped-${file?.name}`;
      link.href = canvas.toDataURL(file?.type || 'image/png');
      link.click();
      notify('Cropped image downloaded', 'success');
    }
  };

  if (!file) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Crop Image</h2>
          <p className="text-slate-500 dark:text-slate-400">Crop JPG, PNG, or WEBP images. Click and drag to select area.</p>
        </div>
        <Dropzone onFileSelect={setFile} accept="image/*" label="Upload Image to Crop" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Controls */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 h-fit transition-colors">
          <h3 className="font-bold text-lg mb-6 border-b border-slate-100 dark:border-slate-700 pb-2 text-slate-800 dark:text-white">Crop Settings</h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">X</label>
                  <input type="number" value={Math.round(crop.x)} readOnly className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded" />
               </div>
               <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Y</label>
                  <input type="number" value={Math.round(crop.y)} readOnly className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded" />
               </div>
               <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Width</label>
                  <input type="number" value={Math.round(crop.width)} readOnly className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded" />
               </div>
               <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Height</label>
                  <input type="number" value={Math.round(crop.height)} readOnly className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded" />
               </div>
            </div>

            <p className="text-sm text-slate-500 dark:text-slate-400 italic">Click and drag on the image to select a crop area.</p>

            <button 
              onClick={downloadCrop}
              disabled={crop.width === 0 || crop.height === 0}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center"
            >
              <DownloadIcon className="w-5 h-5 mr-2" />
              Download Cropped Image
            </button>
            
            <button 
                onClick={() => setFile(null)}
                className="w-full py-2 px-4 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 font-medium text-sm transition-colors"
              >
                Upload different image
            </button>
          </div>
        </div>

        {/* Workspace */}
        <div className="lg:col-span-2 bg-slate-800 dark:bg-black rounded-2xl p-8 flex items-center justify-center overflow-hidden">
           <div 
              ref={containerRef}
              className="relative cursor-crosshair shadow-2xl"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
           >
              {image && (
                <img 
                  src={image.src} 
                  alt="Crop Target" 
                  className="max-w-full max-h-[600px] block pointer-events-none select-none"
                  style={{ touchAction: 'none' }} 
                />
              )}
              
              {/* Crop Overlay Box */}
              {image && containerRef.current && (
                <div 
                  className="absolute border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] pointer-events-none"
                  style={{
                    left: `${(crop.x / image.width) * 100}%`,
                    top: `${(crop.y / image.height) * 100}%`,
                    width: `${(crop.width / image.width) * 100}%`,
                    height: `${(crop.height / image.height) * 100}%`
                  }}
                >
                   {/* Grid lines for rule of thirds */}
                   <div className="absolute w-full h-1/3 top-1/3 border-t border-b border-white/30"></div>
                   <div className="absolute h-full w-1/3 left-1/3 border-l border-r border-white/30"></div>
                </div>
              )}
           </div>
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};