import React, { useState } from 'react';
import { Dropzone } from '../components/Dropzone';
import { DownloadIcon, PdfIcon } from '../components/Icons';
import { useNotification } from '../components/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';

declare global {
  interface Window {
    jspdf: any;
  }
}

interface ImageItem {
  id: string;
  file: File;
}

interface ImageToPdfProps {
  acceptedFormats?: string[]; 
  title?: string;
}

export const ImageToPdf: React.FC<ImageToPdfProps> = ({ acceptedFormats, title }) => {
  const [items, setItems] = useState<ImageItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [pageSize, setPageSize] = useState<'a4' | 'fit'>('a4');
  const [margin, setMargin] = useState(10);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  
  const { notify } = useNotification();

  const acceptString = acceptedFormats ? acceptedFormats.join(',') : "image/*";

  const handleFiles = (newFile: File) => {
    const newItem = { id: Math.random().toString(36).substr(2, 9), file: newFile };
    setItems((prev) => [...prev, newItem]);
    notify(`Added ${newFile.name}`, 'info');
  };

  const removeFile = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Drag and Drop Logic
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
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

  const generatePDF = async () => {
    if (items.length === 0) return;
    setIsGenerating(true);

    try {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF(); 
      
      for (let i = 0; i < items.length; i++) {
        const file = items[i].file;
        const imgData = await readFileAsDataURL(file);
        const imgProps = await getImageProperties(imgData);

        const imgWidth = imgProps.width;
        const imgHeight = imgProps.height;
        const ratio = imgWidth / imgHeight;

        if (pageSize === 'fit') {
            if (i === 0) {
                 doc.deletePage(1); 
                 doc.addPage([imgWidth, imgHeight], imgWidth > imgHeight ? 'l' : 'p');
            } else {
                 doc.addPage([imgWidth, imgHeight], imgWidth > imgHeight ? 'l' : 'p');
            }
            doc.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
        } else {
            const isLandscape = imgWidth > imgHeight;
            if (i > 0) {
               doc.addPage('a4', isLandscape ? 'l' : 'p');
            } else {
               doc.deletePage(1);
               doc.addPage('a4', isLandscape ? 'l' : 'p');
            }

            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            
            const availWidth = pageWidth - (margin * 2);
            const availHeight = pageHeight - (margin * 2);
            
            let finalWidth = availWidth;
            let finalHeight = availWidth / ratio;

            if (finalHeight > availHeight) {
                finalHeight = availHeight;
                finalWidth = finalHeight * ratio;
            }

            const x = (pageWidth - finalWidth) / 2;
            const y = (pageHeight - finalHeight) / 2;

            doc.addImage(imgData, 'JPEG', x, y, finalWidth, finalHeight);
        }
      }

      doc.save('images.pdf');
      notify('PDF generated successfully!', 'success');
    } catch (e) {
      console.error(e);
      notify('Failed to generate PDF.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const getImageProperties = (src: string): Promise<{width: number, height: number}> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.width, height: img.height });
      img.src = src;
    });
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">{title || 'Image to PDF'}</h2>
        <p className="text-slate-500 dark:text-slate-400">Combine multiple images into a professional PDF document. Drag to reorder.</p>
      </div>

      <div className="mb-8">
        <Dropzone onFileSelect={handleFiles} accept={acceptString} label="Add Image" />
      </div>

      {items.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 transition-colors">
          <div className="flex flex-col md:flex-row justify-between items-end mb-6 border-b border-slate-100 dark:border-slate-700 pb-4">
             <div>
                <h3 className="font-semibold text-slate-700 dark:text-slate-200">Selected Images ({items.length})</h3>
                <p className="text-xs text-slate-400 mt-1">Drag thumbnails to reorder pages.</p>
             </div>
             
             <div className="flex gap-4 mt-4 md:mt-0">
                 <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Page Size</label>
                    <div className="flex bg-slate-100 dark:bg-slate-900 rounded p-1">
                        <button 
                            onClick={() => setPageSize('a4')} 
                            className={`px-3 py-1 text-xs rounded font-bold transition-all ${pageSize === 'a4' ? 'bg-white dark:bg-slate-700 shadow text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-500'}`}
                        >
                            A4
                        </button>
                        <button 
                            onClick={() => setPageSize('fit')} 
                            className={`px-3 py-1 text-xs rounded font-bold transition-all ${pageSize === 'fit' ? 'bg-white dark:bg-slate-700 shadow text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-500'}`}
                        >
                            Fit
                        </button>
                    </div>
                 </div>
                 {pageSize === 'a4' && (
                     <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Margin</label>
                         <select 
                            value={margin} 
                            onChange={(e) => setMargin(Number(e.target.value))}
                            className="text-xs bg-slate-100 dark:bg-slate-900 dark:text-slate-200 border-none rounded py-1.5 pl-2 pr-6 font-bold text-slate-600"
                         >
                             <option value={0}>None</option>
                             <option value={10}>Small</option>
                             <option value={20}>Normal</option>
                         </select>
                     </div>
                 )}
             </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <AnimatePresence initial={false}>
            {items.map((item, i) => (
              <motion.div 
                layout
                key={item.id} 
                draggable
                onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent, i)}
                onDragOver={(e) => handleDragOver(e as unknown as React.DragEvent, i)}
                onDragEnd={handleDragEnd}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className={`
                    relative group aspect-square bg-slate-100 dark:bg-slate-900 rounded-lg overflow-hidden border transition-colors cursor-move
                    ${draggedIndex === i ? 'opacity-50 border-blue-500 border-2 border-dashed' : 'border-slate-200 dark:border-slate-600 hover:border-blue-300'}
                `}
              >
                <img 
                  src={URL.createObjectURL(item.file)} 
                  alt="thumb" 
                  className="w-full h-full object-cover pointer-events-none"
                />
                <div className="absolute top-2 left-2 bg-black/60 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full">
                    {i+1}
                </div>
                <button 
                  onClick={() => removeFile(item.id)}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <div className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-xs p-1 truncate">
                  {item.file.name}
                </div>
              </motion.div>
            ))}
            </AnimatePresence>
          </div>

          <div className="flex justify-end space-x-4">
             <button 
                onClick={() => setItems([])}
                className="px-6 py-3 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 font-medium transition-colors"
              >
                Clear All
              </button>
             <button 
              onClick={generatePDF}
              disabled={isGenerating}
              className={`
                flex items-center px-8 py-3 bg-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-200 dark:shadow-none hover:bg-red-700 hover:-translate-y-0.5 transition-all
                ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}
              `}
             >
               {isGenerating ? 'Generating...' : (
                 <>
                   <PdfIcon className="w-5 h-5 mr-2" />
                   Convert to PDF
                 </>
               )}
             </button>
          </div>
        </div>
      )}
    </div>
  );
};