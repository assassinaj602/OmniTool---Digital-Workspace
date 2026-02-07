import React, { useState, useRef, useEffect, MouseEvent } from 'react';
import { Dropzone } from '../components/Dropzone';
import { PaletteIcon } from '../components/Icons';
import { useNotification } from '../components/NotificationContext';

export const ColorPicker: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [imgSrc, setImgSrc] = useState<string>('');
  const [hoverColor, setHoverColor] = useState<string>('');
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const { notify } = useNotification();

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setImgSrc(url);
    }
  }, [file]);

  const rgbToHex = (r: number, g: number, b: number) => {
    return "#" + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    }).join("");
  };

  const handleMouseMove = (e: MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas || !imageRef.current) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Scale coordinates to match canvas internal resolution
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
       const pixel = ctx.getImageData(x * scaleX, y * scaleY, 1, 1).data;
       const hex = rgbToHex(pixel[0], pixel[1], pixel[2]);
       setHoverColor(hex);
    }
  };

  const handleClick = () => {
    if (hoverColor && !selectedColors.includes(hoverColor)) {
        setSelectedColors(prev => [hoverColor, ...prev].slice(0, 10)); // Keep last 10
        notify(`Selected color: ${hoverColor}`, 'success');
    }
  };

  const handleImageLoad = () => {
      const img = imageRef.current;
      const canvas = canvasRef.current;
      if (img && canvas) {
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0);
          notify('Image loaded. Click to pick colors.', 'info');
      }
  };

  const copyToClipboard = (color: string) => {
      navigator.clipboard.writeText(color);
      notify(`Copied ${color} to clipboard!`, 'success');
  };

  if (!file) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Image Color Picker</h2>
          <p className="text-slate-500 dark:text-slate-400">Upload an image and click on any pixel to get the HEX/RGB color code.</p>
        </div>
        <Dropzone onFileSelect={setFile} accept="image/*" label="Upload Image" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Sidebar */}
         <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
               <h3 className="font-bold text-lg mb-4 text-slate-800 dark:text-white">Selected Color</h3>
               <div className="flex items-center gap-4 mb-6">
                  <div 
                    className="w-16 h-16 rounded-full border-4 border-slate-100 dark:border-slate-700 shadow-inner" 
                    style={{ backgroundColor: hoverColor || '#ffffff' }}
                  ></div>
                  <div>
                     <p className="text-2xl font-mono font-bold text-slate-800 dark:text-white">{hoverColor || '#------'}</p>
                     <p className="text-xs text-slate-400 dark:text-slate-500">Current Pixel</p>
                  </div>
               </div>
               
               <h4 className="font-bold text-sm text-slate-500 dark:text-slate-400 uppercase mb-3">History</h4>
               <div className="grid grid-cols-5 gap-2">
                  {selectedColors.map((color, i) => (
                      <button 
                        key={i}
                        onClick={() => copyToClipboard(color)}
                        className="w-10 h-10 rounded-lg border border-slate-200 dark:border-slate-600 shadow-sm hover:scale-110 transition-transform"
                        style={{ backgroundColor: color }}
                        title="Click to copy"
                      />
                  ))}
                  {selectedColors.length === 0 && <span className="text-sm text-slate-400 dark:text-slate-500 col-span-5">Click image to pick colors</span>}
               </div>
            </div>
            
            <button 
                onClick={() => setFile(null)}
                className="w-full py-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold rounded-xl transition-colors"
            >
                Upload New Image
            </button>
         </div>

         {/* Canvas Area */}
         <div className="lg:col-span-2 bg-slate-800 dark:bg-black rounded-2xl p-8 flex items-center justify-center overflow-auto shadow-inner border border-slate-700">
             <div className="relative cursor-crosshair inline-block shadow-2xl">
                 <img 
                    ref={imageRef}
                    src={imgSrc} 
                    alt="Target" 
                    className="max-w-full block" 
                    onLoad={handleImageLoad}
                    style={{ pointerEvents: 'none', visibility: 'hidden', position: 'absolute' }}
                 />
                 <canvas 
                    ref={canvasRef}
                    onMouseMove={handleMouseMove}
                    onClick={handleClick}
                    className="max-w-full"
                    style={{ maxWidth: '100%', maxHeight: '600px', objectFit: 'contain' }}
                 />
             </div>
         </div>
      </div>
    </div>
  );
};