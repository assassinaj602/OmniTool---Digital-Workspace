import React, { useState, useRef, useEffect } from 'react';
import { Dropzone } from '../components/Dropzone';
import { DownloadIcon, LaughIcon } from '../components/Icons';
import { useNotification } from '../components/NotificationContext';

export const MemeGenerator: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [topText, setTopText] = useState('WHEN YOU DEPLOY');
  const [bottomText, setBottomText] = useState('ON FRIDAY');
  const [fontSize, setFontSize] = useState(40);
  const [textColor, setTextColor] = useState('#ffffff');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const { notify } = useNotification();

  const drawMeme = () => {
    if (!file || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      
      ctx!.drawImage(img, 0, 0);
      
      const scaledFontSize = (fontSize / 500) * img.width;
      ctx!.font = `900 ${scaledFontSize}px Impact, sans-serif`;
      ctx!.fillStyle = textColor;
      ctx!.strokeStyle = 'black';
      ctx!.lineWidth = scaledFontSize / 15;
      ctx!.textAlign = 'center';
      
      ctx!.textBaseline = 'top';
      const x = canvas.width / 2;
      const topY = canvas.height * 0.05;
      ctx!.strokeText(topText.toUpperCase(), x, topY);
      ctx!.fillText(topText.toUpperCase(), x, topY);
      
      ctx!.textBaseline = 'bottom';
      const bottomY = canvas.height * 0.95;
      ctx!.strokeText(bottomText.toUpperCase(), x, bottomY);
      ctx!.fillText(bottomText.toUpperCase(), x, bottomY);
      
      setPreviewUrl(canvas.toDataURL('image/jpeg'));
    };
    img.src = URL.createObjectURL(file);
  };

  useEffect(() => {
    if (file) {
      drawMeme();
    }
  }, [file, topText, bottomText, fontSize, textColor]);

  const downloadMeme = () => {
    try {
        const link = document.createElement('a');
        link.download = `meme-${Date.now()}.jpg`;
        link.href = previewUrl;
        link.click();
        notify('Meme downloaded!', 'success');
    } catch (e) {
        notify('Error downloading meme', 'error');
    }
  };

  const handleFileSelect = (f: File) => {
      setFile(f);
      notify('Template loaded!', 'success');
  }

  if (!file) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="text-center mb-10">
          <div className="inline-block p-3 bg-pink-100 dark:bg-pink-900/30 text-pink-500 dark:text-pink-300 rounded-full mb-4">
             <LaughIcon className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Meme Generator</h2>
          <p className="text-slate-500 dark:text-slate-400">Create viral memes in seconds. No watermarks.</p>
        </div>
        <Dropzone onFileSelect={handleFileSelect} accept="image/*" label="Upload Image Template" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Controls */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
            <h3 className="font-bold text-lg mb-6 text-slate-800 dark:text-white">Text Options</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Top Text</label>
                <input 
                  type="text" 
                  value={topText}
                  onChange={(e) => setTopText(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg font-bold focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  placeholder="TOP TEXT"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Bottom Text</label>
                <input 
                  type="text" 
                  value={bottomText}
                  onChange={(e) => setBottomText(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg font-bold focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  placeholder="BOTTOM TEXT"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Font Size</label>
                    <input 
                      type="number" 
                      value={fontSize}
                      onChange={(e) => setFontSize(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg"
                    />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Color</label>
                    <div className="flex items-center h-[42px] border border-slate-300 dark:border-slate-600 rounded-lg px-2 bg-white dark:bg-slate-900">
                        <input 
                          type="color" 
                          value={textColor}
                          onChange={(e) => setTextColor(e.target.value)}
                          className="w-8 h-8 cursor-pointer border-none bg-transparent"
                        />
                        <span className="ml-2 text-sm text-slate-600 dark:text-slate-300">{textColor}</span>
                    </div>
                 </div>
              </div>
            </div>
          </div>

          <button 
            onClick={downloadMeme}
            className="w-full py-4 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-xl shadow-lg hover:shadow-pink-200 dark:hover:shadow-none transition-all flex items-center justify-center"
          >
            <DownloadIcon className="w-6 h-6 mr-2" />
            Download Meme
          </button>
          
          <button onClick={() => setFile(null)} className="w-full py-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
             Start Over
          </button>
        </div>

        {/* Preview */}
        <div className="lg:col-span-2 bg-slate-900 dark:bg-black rounded-2xl flex items-center justify-center p-8 border border-slate-800 dark:border-slate-800 min-h-[500px]">
           {previewUrl ? (
             <img src={previewUrl} alt="Meme Preview" className="max-w-full max-h-[600px] shadow-2xl rounded-sm object-contain" />
           ) : (
             <div className="text-white">Rendering...</div>
           )}
           <canvas ref={canvasRef} className="hidden" />
        </div>
      </div>
    </div>
  );
};