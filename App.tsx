import React, { useState, useEffect, useMemo } from 'react';
import { Layout } from './components/Layout';
import { NotificationProvider } from './components/NotificationContext';
import { ImageResizer } from './tools/ImageResizer';
import { ImageConverter } from './tools/ImageConverter';
import { MemeGenerator } from './tools/MemeGenerator';
import { ImageToPdf } from './tools/ImageToPdf';
import { ImageCropper } from './tools/ImageCropper';
import { ImageCompressor } from './tools/ImageCompressor';
import { RotateFlip } from './tools/RotateFlip';
import { PdfToImage } from './tools/PdfToImage';
import { CollageMaker } from './tools/CollageMaker';
import { ColorPicker } from './tools/ColorPicker';
import { BulkImageResizer } from './tools/BulkImageResizer';
import { HeicToJpg } from './tools/HeicToJpg';
import { SvgTools } from './tools/SvgTools';
import { PdfCompressor } from './tools/PdfCompressor';
import { PdfToGif } from './tools/PdfToGif';
import { ImageEnlarger } from './tools/ImageEnlarger';
import { PdfConverter } from './tools/PdfConverter';
import { ToolCategory, ToolDef } from './types';
import { 
  ResizeIcon, ConvertIcon, LaughIcon, PdfIcon, 
  CropRealIcon, CompressIcon, RotateIcon, PdfImageIcon,
  CollageIcon, PaletteIcon, BulkIcon, HeicIcon, SvgIcon,
  GifIcon, ExpandIcon
} from './components/Icons';

function App() {
  const [currentToolId, setCurrentToolId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [recentToolIds, setRecentToolIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('omnitool_recent') || '[]');
    } catch {
      return [];
    }
  });

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ESC to go home
      if (e.key === 'Escape') {
        setCurrentToolId(null);
      }
      // Ctrl+K to search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('tool-search');
        if (searchInput) {
            searchInput.focus();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleToolSelect = (id: string) => {
    setCurrentToolId(id);
    const newRecent = [id, ...recentToolIds.filter(x => x !== id)].slice(0, 4);
    setRecentToolIds(newRecent);
    localStorage.setItem('omnitool_recent', JSON.stringify(newRecent));
  };

  // Helper to allow multiple IDs to point to same component for SEO/UX purposes
  const getToolComponent = (id: string) => {
    switch (id) {
        case 'resize': return <ImageResizer />;
        case 'bulk-resize': return <BulkImageResizer />;
        case 'compress': return <ImageCompressor />;
        case 'crop': return <ImageCropper />;
        case 'collage': return <CollageMaker />;
        case 'flip': return <RotateFlip />;
        case 'rotate': return <RotateFlip />;
        case 'enlarge': return <ImageEnlarger />;
        case 'picker': return <ColorPicker />;
        case 'meme': return <MemeGenerator />;
        
        case 'convert': return <ImageConverter />;
        case 'pdf-jpg': return <PdfToImage defaultOutputFormat="jpeg" />; 
        case 'heic-jpg': return <HeicToJpg />;
        case 'svg-convert': return <SvgTools defaultMode="svg-to-png" />;
        case 'pdf-png': return <PdfToImage defaultOutputFormat="png" />;
        case 'png-svg': return <SvgTools defaultMode="png-to-svg" />;
        
        case 'webp-jpg': return <ImageConverter 
            defaultOutputFormat="image/jpeg" 
            acceptedInputFormats={['image/webp']}
            title="WebP to JPG" 
        />;
        case 'png-jpg': return <ImageConverter 
            defaultOutputFormat="image/jpeg" 
            acceptedInputFormats={['image/png']} 
            title="PNG to JPG"
        />;
        case 'jpg-png': return <ImageConverter 
            defaultOutputFormat="image/png" 
            acceptedInputFormats={['image/jpeg']}
            title="JPG to PNG" 
        />;

        case 'pdf-compress': return <PdfCompressor />;
        case 'pdf-convert': return <PdfConverter />; // Text extractor + Word
        
        case 'img-pdf': return <ImageToPdf title="Image to PDF" />;
        case 'jpg-pdf': return <ImageToPdf 
            acceptedFormats={['image/jpeg']} 
            title="JPG to PDF"
        />;
        case 'png-pdf': return <ImageToPdf 
            acceptedFormats={['image/png']} 
            title="PNG to PDF"
        />;
        
        case 'pdf-gif': return <PdfToGif />;
        
        default: return <ImageResizer />;
    }
  };

  const tools: ToolDef[] = [
    // --- Image Tools ---
    {
      id: 'resize',
      title: 'Image Resizer',
      description: 'Resize images pixel-perfectly.',
      category: ToolCategory.IMAGE,
      icon: <ResizeIcon className="w-8 h-8 text-blue-500" />,
      component: null
    },
    {
      id: 'bulk-resize',
      title: 'Bulk Image Resizer',
      description: 'Resize multiple images at once.',
      category: ToolCategory.IMAGE,
      icon: <BulkIcon className="w-8 h-8 text-blue-600" />,
      component: null
    },
    {
      id: 'compress',
      title: 'Image Compressor',
      description: 'Reduce file size, keep quality.',
      category: ToolCategory.IMAGE,
      icon: <CompressIcon className="w-8 h-8 text-orange-500" />,
      component: null
    },
    {
      id: 'crop',
      title: 'Crop Image',
      description: 'Trim and frame your shots.',
      category: ToolCategory.IMAGE,
      icon: <CropRealIcon className="w-8 h-8 text-purple-500" />,
      component: null
    },
    {
      id: 'collage',
      title: 'Collage Maker',
      description: 'Beautiful photo layouts.',
      category: ToolCategory.IMAGE,
      icon: <CollageIcon className="w-8 h-8 text-pink-600" />,
      component: null
    },
    {
      id: 'flip',
      title: 'Flip Image',
      description: 'Mirror vertically/horizontally.',
      category: ToolCategory.IMAGE,
      icon: <RotateIcon className="w-8 h-8 text-teal-400" />,
      component: null
    },
    {
      id: 'rotate',
      title: 'Rotate Image',
      description: 'Fix orientation instantly.',
      category: ToolCategory.IMAGE,
      icon: <RotateIcon className="w-8 h-8 text-teal-600" />,
      component: null
    },
    {
      id: 'enlarge',
      title: 'Image Enlarger',
      description: 'Upscale small images (AI-like).',
      category: ToolCategory.IMAGE,
      icon: <ExpandIcon className="w-8 h-8 text-indigo-500" />,
      component: null
    },
    {
      id: 'picker',
      title: 'Color Picker',
      description: 'Grab HEX codes from pixels.',
      category: ToolCategory.IMAGE,
      icon: <PaletteIcon className="w-8 h-8 text-yellow-500" />,
      component: null
    },
    {
      id: 'meme',
      title: 'Meme Generator',
      description: 'Make viral content fast.',
      category: ToolCategory.IMAGE, 
      icon: <LaughIcon className="w-8 h-8 text-pink-500" />,
      component: null
    },

    // --- Convert ---
    {
      id: 'convert',
      title: 'Image Converter',
      description: 'Universal format swapper.',
      category: ToolCategory.CONVERSION,
      icon: <ConvertIcon className="w-8 h-8 text-green-500" />,
      component: null
    },
    {
      id: 'pdf-jpg',
      title: 'PDF to JPG',
      description: 'Extract pages as images.',
      category: ToolCategory.CONVERSION,
      icon: <PdfImageIcon className="w-8 h-8 text-red-500" />,
      component: null
    },
    {
      id: 'heic-jpg',
      title: 'HEIC to JPG',
      description: 'Unlock iPhone photos.',
      category: ToolCategory.CONVERSION,
      icon: <HeicIcon className="w-8 h-8 text-slate-800 dark:text-white" />,
      component: null
    },
    {
      id: 'svg-convert',
      title: 'SVG Converter',
      description: 'Vector to Raster & back.',
      category: ToolCategory.CONVERSION,
      icon: <SvgIcon className="w-8 h-8 text-orange-600" />,
      component: null
    },
    {
      id: 'pdf-png',
      title: 'PDF to PNG',
      description: 'High-res page extraction.',
      category: ToolCategory.CONVERSION,
      icon: <PdfImageIcon className="w-8 h-8 text-blue-400" />,
      component: null
    },
    {
      id: 'png-svg',
      title: 'PNG to SVG',
      description: 'Turn logos into vectors.',
      category: ToolCategory.CONVERSION,
      icon: <SvgIcon className="w-8 h-8 text-green-600" />,
      component: null
    },
    {
      id: 'webp-jpg',
      title: 'WebP to JPG',
      description: 'Fix web image compatibility.',
      category: ToolCategory.CONVERSION,
      icon: <ConvertIcon className="w-8 h-8 text-gray-500" />,
      component: null
    },
    {
      id: 'png-jpg',
      title: 'PNG to JPG',
      description: 'Flatten transparency.',
      category: ToolCategory.CONVERSION,
      icon: <ConvertIcon className="w-8 h-8 text-gray-600" />,
      component: null
    },
    {
      id: 'jpg-png',
      title: 'JPG to PNG',
      description: 'Add alpha channel support.',
      category: ToolCategory.CONVERSION,
      icon: <ConvertIcon className="w-8 h-8 text-gray-700" />,
      component: null
    },

    // --- PDF Tools ---
    {
      id: 'pdf-compress',
      title: 'Compress PDF',
      description: 'Shrink docs for email.',
      category: ToolCategory.PDF,
      icon: <CompressIcon className="w-8 h-8 text-red-700" />,
      component: null
    },
    {
      id: 'pdf-convert',
      title: 'PDF Converter',
      description: 'PDF to Word / Text.',
      category: ToolCategory.PDF,
      icon: <PdfIcon className="w-8 h-8 text-red-600" />,
      component: null
    },
    {
      id: 'img-pdf',
      title: 'Image to PDF',
      description: 'Combine photos into docs.',
      category: ToolCategory.PDF,
      icon: <PdfIcon className="w-8 h-8 text-red-500" />,
      component: null
    },
    {
      id: 'jpg-pdf',
      title: 'JPG to PDF',
      description: 'Batch convert photos.',
      category: ToolCategory.PDF,
      icon: <PdfIcon className="w-8 h-8 text-red-400" />,
      component: null
    },
    {
      id: 'png-pdf',
      title: 'PNG to PDF',
      description: 'Document scans to PDF.',
      category: ToolCategory.PDF,
      icon: <PdfIcon className="w-8 h-8 text-red-300" />,
      component: null
    },
    {
      id: 'pdf-gif',
      title: 'PDF to GIF',
      description: 'Turn slides into animation.',
      category: ToolCategory.PDF,
      icon: <GifIcon className="w-8 h-8 text-purple-600" />,
      component: null
    },
  ];

  const currentToolTitle = tools.find(t => t.id === currentToolId)?.title;
  const categories = Object.values(ToolCategory);
  
  const filteredTools = useMemo(() => {
    return tools.filter(t => 
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      t.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const renderHome = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-heading font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
          All the tools you need,<br /> 
          <span className="text-blue-600 dark:text-blue-400">right in your browser.</span>
        </h2>
        
        {/* Search Bar */}
        <div className="max-w-xl mx-auto mt-8 relative group">
           <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
             <svg className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
             </svg>
           </div>
           <input
             id="tool-search"
             type="text"
             className="block w-full pl-11 pr-4 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
             placeholder="Search tools (Press Ctrl + K)"
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
           {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                 <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                 </svg>
              </button>
           )}
        </div>
      </div>

      {/* Recent Tools */}
      {!searchTerm && recentToolIds.length > 0 && (
        <div className="mb-12">
           <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4 px-2">Recent</h3>
           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {recentToolIds.map(id => {
                 const tool = tools.find(t => t.id === id);
                 if (!tool) return null;
                 return (
                    <div 
                        key={tool.id}
                        onClick={() => handleToolSelect(tool.id)}
                        className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 cursor-pointer flex items-center gap-3 transition-all shadow-sm hover:shadow-md"
                    >
                        <div className="p-2 bg-slate-50 dark:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300">
                           {React.cloneElement(tool.icon as React.ReactElement, { className: "w-5 h-5" })}
                        </div>
                        <span className="font-semibold text-slate-700 dark:text-slate-200 text-sm">{tool.title}</span>
                    </div>
                 );
              })}
           </div>
        </div>
      )}

      {/* Categories */}
      {categories.map(cat => {
        const catTools = filteredTools.filter(t => t.category === cat);
        if (catTools.length === 0) return null;
        
        return (
            <div key={cat} className="mb-12">
                <h3 className="text-2xl font-heading font-bold text-slate-800 dark:text-white mb-6 border-b border-slate-200 dark:border-slate-800 pb-2 flex items-center">
                    {cat}
                    <span className="ml-3 text-sm font-sans font-normal text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">
                        {catTools.length}
                    </span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {catTools.map((tool) => (
                    <div 
                        key={tool.id}
                        onClick={() => handleToolSelect(tool.id)}
                        className="group bg-white dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700/50 hover:shadow-xl hover:shadow-blue-500/10 hover:border-blue-200 dark:hover:border-blue-500/50 transition-all cursor-pointer transform hover:-translate-y-1 h-full flex flex-col relative overflow-hidden"
                    >
                        {/* Hover Accent Line */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        
                        <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl w-fit group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 transition-colors">
                            {tool.icon}
                        </div>
                        <h3 className="text-lg font-heading font-bold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{tool.title}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{tool.description}</p>
                    </div>
                    ))}
                </div>
            </div>
        );
      })}

      {!searchTerm && (
        <div className="mt-12 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 md:p-12 text-center text-white relative overflow-hidden shadow-2xl shadow-blue-900/20">
            <div className="relative z-10">
            <h3 className="text-3xl font-heading font-bold mb-4">Privacy First. Always.</h3>
            <p className="max-w-2xl mx-auto text-blue-100 text-lg leading-relaxed">
                OmniTool processes your files directly in your browser using WebAssembly. 
                Your images and documents <span className="font-bold text-white">never</span> leave your device.
            </p>
            </div>
            <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl"></div>
        </div>
      )}
    </div>
  );

  return (
    <NotificationProvider>
      <Layout 
        onNavigateHome={() => setCurrentToolId(null)}
        currentToolTitle={currentToolTitle}
      >
        {currentToolId ? (
          <div className="animate-fade-in">
            {getToolComponent(currentToolId)}
          </div>
        ) : (
          renderHome()
        )}
      </Layout>
    </NotificationProvider>
  );
}

export default App;