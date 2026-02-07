import React, { useState, useRef, useEffect } from 'react';
import { Dropzone } from '../components/Dropzone';
import { DownloadIcon, CollageIcon } from '../components/Icons';
import { useNotification } from '../components/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';

type LayoutType = 'grid' | 'row' | 'column';

interface CollageItem {
  id: string;
  file: File;
  img: HTMLImageElement;
}

export const CollageMaker: React.FC = () => {
  const [items, setItems] = useState<CollageItem[]>([]);
  const [layout, setLayout] = useState<LayoutType>('grid');
  const [spacing, setSpacing] = useState(10);
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [previewUrl, setPreviewUrl] = useState('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { notify } = useNotification();

  const handleFiles = (newFile: File) => {
    if (items.length >= 12) {
        notify("Maximum 12 images allowed.", 'error');
        return;
    }
    const img = new Image();
    img.onload = () => {
        const newItem = {
          id: Math.random().toString(36).substr(2, 9),
          file: newFile,
          img: img
        };
        setItems((prev) => [...prev, newItem]);
        notify(`Added ${newFile.name}`, 'info');
    };
    img.src = URL.createObjectURL(newFile);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Reordering Logic
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
    // Swap items
    const newItems = [...items];
    const draggedItem = newItems[draggedIndex];
    newItems.splice(draggedIndex, 1);
    newItems.splice(index, 0, draggedItem);
    
    setItems(newItems);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  useEffect(() => {
    if (items.length > 0) {
      drawCollage();
    } else {
        setPreviewUrl('');
    }
  }, [items, layout, spacing, backgroundColor]);

  const drawCollage = () => {
    if (items.length === 0 || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Determine dimensions based on first image as base size reference
    const baseWidth = 1200; 
    let canvasWidth = baseWidth;
    let canvasHeight = 800;

    // Layout Logic
    if (layout === 'row') {
        const targetHeight = 400;
        let totalContentWidth = 0;
        const scaledImages = items.map(item => {
            const ratio = item.img.width / item.img.height;
            const w = targetHeight * ratio;
            totalContentWidth += w;
            return { img: item.img, w, h: targetHeight };
        });
        
        canvasWidth = totalContentWidth + (spacing * (items.length + 1));
        canvasHeight = targetHeight + (spacing * 2);
        
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        
        let currentX = spacing;
        scaledImages.forEach(({ img, w, h }) => {
            ctx.drawImage(img, currentX, spacing, w, h);
            currentX += w + spacing;
        });

    } else if (layout === 'column') {
        const targetWidth = 600;
        let totalHeight = spacing;
        const scaledImages = items.map(item => {
            const ratio = item.img.height / item.img.width;
            const h = targetWidth * ratio;
            totalHeight += h + spacing;
            return { img: item.img, w: targetWidth, h };
        });
        
        canvasWidth = targetWidth + (spacing * 2);
        canvasHeight = totalHeight;
        
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        
        let currentY = spacing;
        scaledImages.forEach(({ img, w, h }) => {
            ctx.drawImage(img, spacing, currentY, w, h);
            currentY += h + spacing;
        });

    } else {
        // Grid
        const cols = Math.ceil(Math.sqrt(items.length));
        const rows = Math.ceil(items.length / cols);
        
        const cellWidth = (baseWidth - (spacing * (cols + 1))) / cols;
        const cellHeight = cellWidth; // Square cells
        
        canvasWidth = baseWidth;
        canvasHeight = (cellHeight * rows) + (spacing * (rows + 1));
        
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        
        items.forEach((item, i) => {
            const img = item.img;
            const r = Math.floor(i / cols);
            const c = i % cols;
            
            const x = spacing + (c * (cellWidth + spacing));
            const y = spacing + (r * (cellHeight + spacing));
            
            // Draw image covering the cell (center crop)
            const imgRatio = img.width / img.height;
            const cellRatio = cellWidth / cellHeight; 
            
            let sWidth, sHeight, sx, sy;
            
            if (imgRatio > cellRatio) {
                sHeight = img.height;
                sWidth = img.height * cellRatio;
                sx = (img.width - sWidth) / 2;
                sy = 0;
            } else {
                sWidth = img.width;
                sHeight = img.width / cellRatio;
                sx = 0;
                sy = (img.height - sHeight) / 2;
            }
            
            ctx.drawImage(img, sx, sy, sWidth, sHeight, x, y, cellWidth, cellHeight);
        });
    }

    setPreviewUrl(canvas.toDataURL('image/jpeg', 0.9));
  };

  const downloadCollage = () => {
    if (!previewUrl) return;
    const link = document.createElement('a');
    link.download = `collage-${Date.now()}.jpg`;
    link.href = previewUrl;
    link.click();
    notify('Collage downloaded!', 'success');
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="text-center mb-8">
         <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Collage Maker</h2>
         <p className="text-slate-500 dark:text-slate-400">Combine photos into grids or strips. Drag images to reorder.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Controls */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 h-fit space-y-6">
           <div>
             <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-2">1. Add Photos</h3>
             <Dropzone onFileSelect={handleFiles} accept="image/*" label="Add Photo" />
             
             {items.length > 0 && (
                 <motion.div layout className="flex flex-wrap gap-2 mt-4 max-h-60 overflow-y-auto">
                    <AnimatePresence>
                    {items.map((item, i) => (
                        <motion.div 
                          layout
                          key={item.id} 
                          draggable
                          onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent, i)}
                          onDragOver={(e) => handleDragOver(e as unknown as React.DragEvent, i)}
                          onDragEnd={handleDragEnd}
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.5 }}
                          className={`
                             relative w-16 h-16 rounded overflow-hidden group cursor-move transition-shadow
                             ${draggedIndex === i ? 'opacity-50 scale-90 ring-2 ring-blue-500' : 'opacity-100'}
                          `}
                        >
                           <img src={URL.createObjectURL(item.file)} className="w-full h-full object-cover pointer-events-none" />
                           <button 
                             onClick={() => removeItem(item.id)}
                             className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                           >
                             &times;
                           </button>
                        </motion.div>
                    ))}
                    </AnimatePresence>
                 </motion.div>
             )}
           </div>

           <div>
             <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-2">2. Settings</h3>
             <div className="space-y-4">
                <div>
                   <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Layout</label>
                   <div className="flex bg-slate-100 dark:bg-slate-900 rounded-lg p-1 mt-1">
                      {(['grid', 'row', 'column'] as const).map(l => (
                          <button
                            key={l}
                            onClick={() => setLayout(l)}
                            className={`flex-1 py-1 text-sm rounded capitalize transition-all ${layout === l ? 'bg-white dark:bg-slate-700 shadow text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-500 dark:text-slate-400'}`}
                          >
                            {l}
                          </button>
                      ))}
                   </div>
                </div>
                
                <div>
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Spacing: {spacing}px</label>
                    <input 
                      type="range" min="0" max="50" value={spacing} 
                      onChange={(e) => setSpacing(Number(e.target.value))}
                      className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                </div>

                <div>
                   <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Background</label>
                   <div className="flex gap-2 mt-1">
                      <input 
                         type="color" value={backgroundColor} 
                         onChange={(e) => setBackgroundColor(e.target.value)}
                         className="h-8 w-full cursor-pointer border dark:border-slate-600 rounded bg-transparent"
                      />
                   </div>
                </div>
             </div>
           </div>

           <button 
             onClick={downloadCollage}
             disabled={!previewUrl}
             className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg hover:shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all"
           >
             <DownloadIcon className="w-5 h-5 mr-2" />
             Download Collage
           </button>
        </div>

        {/* Preview */}
        <div className="lg:col-span-2 bg-slate-100 dark:bg-slate-900 rounded-2xl flex items-center justify-center p-8 border border-slate-200 dark:border-slate-700 overflow-auto min-h-[500px]">
           {previewUrl ? (
             <img src={previewUrl} alt="Collage Preview" className="max-w-full shadow-xl dark:shadow-black/50" />
           ) : (
             <div className="text-slate-400 dark:text-slate-500 flex flex-col items-center">
                <CollageIcon className="w-12 h-12 mb-2 opacity-50" />
                <p>Add photos to generate preview</p>
             </div>
           )}
           <canvas ref={canvasRef} className="hidden" />
        </div>
      </div>
    </div>
  );
};