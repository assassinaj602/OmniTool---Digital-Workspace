import React, { useState, useRef, useEffect } from 'react';
import { Dropzone } from '../components/Dropzone';
import { DownloadIcon } from '../components/Icons';
import { useNotification } from '../components/NotificationContext';

export const ImageResizer: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [imageBitmap, setImageBitmap] = useState<HTMLImageElement | null>(null);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [aspectRatio, setAspectRatio] = useState(1);
  const [maintainAspect, setMaintainAspect] = useState(true);
  const [quality, setQuality] = useState(0.9);
  const [outputName, setOutputName] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { notify } = useNotification();

  useEffect(() => {
    if (file) {
      const img = new Image();
      img.onload = () => {
        setImageBitmap(img);
        setWidth(img.width);
        setHeight(img.height);
        setAspectRatio(img.width / img.height);
        setOutputName(`resized-${file.name.split('.')[0]}`);
        notify('Image loaded successfully', 'success');
      };
      img.onerror = () => notify('Failed to load image', 'error');
      img.src = URL.createObjectURL(file);
    }
  }, [file]);

  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value) || 0;
    setWidth(val);
    if (maintainAspect) {
      setHeight(Math.round(val / aspectRatio));
    }
  };

  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value) || 0;
    setHeight(val);
    if (maintainAspect) {
      setWidth(Math.round(val * aspectRatio));
    }
  };

  const applyPreset = (w: number, h: number) => {
    setWidth(w);
    setHeight(h);
    setMaintainAspect(false); 
    notify(`Applied preset: ${w}x${h}`, 'info');
  };

  const downloadImage = () => {
    if (!imageBitmap || !canvasRef.current) return;
    
    try {
      const canvas = canvasRef.current;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(imageBitmap, 0, 0, width, height);
        
        const format = file?.type === 'image/png' ? 'image/png' : 'image/jpeg';
        const dataUrl = canvas.toDataURL(format, quality);
        
        const link = document.createElement('a');
        link.download = `${outputName}.${format === 'image/png' ? 'png' : 'jpg'}`;
        link.href = dataUrl;
        link.click();
        notify('Image downloaded!', 'success');
      }
    } catch (e) {
      notify('Error resizing image', 'error');
    }
  };

  if (!file) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-heading font-bold text-slate-900 dark:text-white mb-4">Resize Image</h2>
          <p className="text-slate-500 dark:text-slate-400">Resize JPG, PNG, or WEBP images pixel-perfectly for social media or web.</p>
        </div>
        <Dropzone onFileSelect={setFile} accept="image/*" label="Upload Image to Resize" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Sidebar Controls */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 h-fit transition-colors">
          <h3 className="font-heading font-bold text-lg mb-6 border-b border-slate-100 dark:border-slate-700 pb-2 text-slate-800 dark:text-white">Resize Options</h3>
          
          <div className="space-y-6">
            
            {/* Presets */}
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Quick Presets</label>
              <div className="grid grid-cols-2 gap-2">
                 <button onClick={() => applyPreset(1080, 1080)} className="px-2 py-1.5 text-xs bg-slate-100 dark:bg-slate-700 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-slate-700 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-600 transition-colors">Instagram Sq (1080px)</button>
                 <button onClick={() => applyPreset(1080, 1350)} className="px-2 py-1.5 text-xs bg-slate-100 dark:bg-slate-700 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-slate-700 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-600 transition-colors">Insta Portrait</button>
                 <button onClick={() => applyPreset(1920, 1080)} className="px-2 py-1.5 text-xs bg-slate-100 dark:bg-slate-700 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-slate-700 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-600 transition-colors">Full HD (1920px)</button>
                 <button onClick={() => applyPreset(1200, 630)} className="px-2 py-1.5 text-xs bg-slate-100 dark:bg-slate-700 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-slate-700 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-600 transition-colors">Open Graph</button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Width (px)</label>
                <input
                  type="number"
                  value={width}
                  onChange={handleWidthChange}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Height (px)</label>
                <input
                  type="number"
                  value={height}
                  onChange={handleHeightChange}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono"
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="aspect"
                type="checkbox"
                checked={maintainAspect}
                onChange={(e) => setMaintainAspect(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 bg-white dark:bg-slate-900 dark:border-slate-600"
              />
              <label htmlFor="aspect" className="ml-2 text-sm text-slate-600 dark:text-slate-400">Maintain aspect ratio</label>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Quality: <span className="font-mono">{Math.round(quality * 100)}%</span></label>
              <input 
                type="range" 
                min="0.1" 
                max="1" 
                step="0.05" 
                value={quality} 
                onChange={(e) => setQuality(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            <div>
               <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Filename</label>
               <input 
                 type="text" 
                 value={outputName}
                 onChange={(e) => setOutputName(e.target.value)}
                 className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg text-sm"
               />
            </div>
            
            <div className="pt-4 space-y-3">
              <button 
                onClick={downloadImage}
                className="w-full flex items-center justify-center py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95"
              >
                <DownloadIcon className="w-5 h-5 mr-2" />
                Resize & Download
              </button>
              
              <button 
                onClick={() => setFile(null)}
                className="w-full py-2 px-4 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 font-medium text-sm transition-colors"
              >
                Upload different image
              </button>
            </div>
          </div>
        </div>

        {/* Preview Area */}
        <div className="lg:col-span-2 bg-slate-100 dark:bg-slate-900 rounded-2xl flex items-center justify-center p-8 border border-slate-200 dark:border-slate-700 overflow-hidden relative min-h-[500px]">
           <div 
             style={{ 
               width: `${width}px`, 
               height: `${height}px`,
               maxWidth: '100%',
               maxHeight: '100%',
               backgroundImage: `url(${imageBitmap?.src})`,
               backgroundSize: 'contain',
               backgroundRepeat: 'no-repeat',
               backgroundPosition: 'center',
               transition: 'all 0.3s ease'
             }} 
             className="shadow-2xl dark:shadow-black/50"
           />
           <canvas ref={canvasRef} className="hidden" />
           
           <div className="absolute top-4 right-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur px-3 py-1 rounded-full text-xs font-mono border dark:border-slate-700 shadow-sm text-slate-700 dark:text-slate-300">
              Original: {imageBitmap?.naturalWidth} x {imageBitmap?.naturalHeight}
           </div>
        </div>

      </div>
    </div>
  );
};