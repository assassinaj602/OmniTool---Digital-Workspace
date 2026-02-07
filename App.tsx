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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-16 relative">
        {/* Decorative elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-32 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 blur-3xl"></div>
        
        <h2 className="text-5xl md:text-6xl lg:text-7xl font-heading font-extrabold text-slate-900 dark:text-white tracking-tight mb-6 relative animate-slide-up">
          All the tools you need,<br /> 
          <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">right in your browser.</span>
        </h2>
        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-8 leading-relaxed">Professional-grade tools that work instantly, privately, and beautifully in your browser</p>
        
        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mt-10 relative group">
           <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
           <div className="relative">
             <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
               <svg className="h-6 w-6 text-slate-400 group-focus-within:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
               </svg>
             </div>
             <input
               id="tool-search"
               type="text"
               className="block w-full pl-14 pr-4 py-5 glass backdrop-blur-xl rounded-2xl shadow-2xl text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-lg"
               placeholder="Search tools (Press Ctrl + K)"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
             {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                   <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                   </svg>
                </button>
             )}
           </div>
        </div>
      </div>

      {/* Recent Tools */}
      {!searchTerm && recentToolIds.length > 0 && (
        <div className="mb-16">
           <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-6 px-2 flex items-center gap-2">
             <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
               <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
               <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
             </svg>
             Recently Used
           </h3>
           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {recentToolIds.map(id => {
                 const tool = tools.find(t => t.id === id);
                 if (!tool) return null;
                 return (
                    <div 
                        key={tool.id}
                        onClick={() => handleToolSelect(tool.id)}
                        className="group glass backdrop-blur-xl p-5 rounded-2xl border border-white/20 dark:border-slate-700/50 hover:border-blue-400/50 dark:hover:border-blue-500/50 cursor-pointer flex items-center gap-4 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-2xl hover:shadow-blue-500/20"
                    >
                        <div className="p-2.5 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 rounded-xl text-slate-600 dark:text-slate-300 group-hover:from-blue-100 group-hover:to-indigo-100 dark:group-hover:from-blue-900/50 dark:group-hover:to-indigo-900/50 transition-all">
                           {React.cloneElement(tool.icon as React.ReactElement, { className: "w-6 h-6" })}
                        </div>
                        <span className="font-semibold text-slate-700 dark:text-slate-200 tracking-tight font-heading">{tool.title}</span>
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
            <div key={cat} className="mb-16">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-3xl font-heading font-bold text-slate-800 dark:text-white flex items-center gap-3">
                        <span className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">{cat}</span>
                        <span className="text-base font-sans font-normal text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/50 px-3 py-1.5 rounded-full">
                            {catTools.length}
                        </span>
                    </h3>
                    <div className="h-px flex-1 bg-gradient-to-r from-slate-200 via-slate-300 to-transparent dark:from-slate-800 dark:via-slate-700 ml-6"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {catTools.map((tool) => (
                    <div 
                        key={tool.id}
                        onClick={() => handleToolSelect(tool.id)}
                        className="group glass backdrop-blur-xl rounded-3xl p-7 shadow-lg border border-white/20 dark:border-slate-700/50 hover:shadow-2xl hover:shadow-blue-500/20 hover:border-blue-300/50 dark:hover:border-blue-500/50 transition-all duration-500 cursor-pointer transform hover:-translate-y-2 h-full flex flex-col relative overflow-hidden"
                    >
                        {/* Animated gradient border on hover */}
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl -z-10"></div>
                        
                        {/* Hover Accent Line */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-t-3xl"></div>
                        
                        <div className="mb-5 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800/50 dark:to-slate-700/50 rounded-2xl w-fit group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                            {tool.icon}
                        </div>
                        <h3 className="text-xl font-heading font-bold text-slate-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{tool.title}</h3>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{tool.description}</p>
                        
                        {/* Hover arrow indicator */}
                        <div className="mt-auto pt-4 flex items-center text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-0 group-hover:translate-x-2">
                            <span className="text-sm font-semibold">Try it</span>
                            <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </div>
                    ))}
                </div>
            </div>
        );
      })}

      {!searchTerm && (
        <div className="mt-20 relative group">
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl blur-2xl opacity-25 group-hover:opacity-40 transition duration-1000"></div>
            
            <div className="relative glass backdrop-blur-xl rounded-3xl p-12 md:p-16 text-center border border-white/20 dark:border-slate-800/50 shadow-2xl overflow-hidden">
                {/* Animated background orbs */}
                <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl animate-pulse-slow"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl animate-pulse-slow" style={{animationDelay: '1s'}}></div>
                
                <div className="relative z-10">
                    {/* Icon */}
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-6 shadow-2xl shadow-blue-500/50">
                        <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    
                    <h3 className="text-4xl md:text-5xl font-heading font-bold mb-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">Privacy First. Always.</h3>
                    
                    <p className="max-w-3xl mx-auto text-slate-600 dark:text-slate-300 text-lg md:text-xl leading-relaxed mb-8">
                        OmniTool processes your files directly in your browser using WebAssembly. 
                        Your images and documents <span className="font-bold text-blue-600 dark:text-blue-400">never leave your device</span>.
                    </p>
                    
                    <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                            </svg>
                            <span className="font-medium">No Server Upload</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                            </svg>
                            <span className="font-medium">100% Client-Side</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                            </svg>
                            <span className="font-medium">Instant Processing</span>
                        </div>
                    </div>
                </div>
            </div>
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