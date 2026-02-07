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
import { BackgroundRemover } from './tools/BackgroundRemover';
import { ToolCategory, ToolDef } from './types';
import { 
  ResizeIcon, ConvertIcon, LaughIcon, PdfIcon, 
  CropRealIcon, CompressIcon, RotateIcon, PdfImageIcon,
  CollageIcon, PaletteIcon, BulkIcon, HeicIcon, SvgIcon,
  GifIcon, ExpandIcon, ShieldCheckIcon, ZapIcon, ServerOffIcon, BackgroundRemoverIcon
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
        case 'background-remover': return <BackgroundRemover />;
        
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
      icon: <ResizeIcon className="w-8 h-8 text-violet-500" />,
      component: null
    },
    {
      id: 'bulk-resize',
      title: 'Bulk Image Resizer',
      description: 'Resize multiple images at once.',
      category: ToolCategory.IMAGE,
      icon: <BulkIcon className="w-8 h-8 text-violet-600" />,
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
      icon: <CropRealIcon className="w-8 h-8 text-fuchsia-500" />,
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
    {
      id: 'background-remover',
      title: 'Background Remover',
      description: 'Extract subjects with transparency.',
      category: ToolCategory.IMAGE,
      icon: <BackgroundRemoverIcon className="w-8 h-8 text-emerald-500" />,
      component: null
    },

    // --- Convert ---
    {
      id: 'convert',
      title: 'Image Converter',
      description: 'Universal format swapper.',
      category: ToolCategory.CONVERSION,
      icon: <ConvertIcon className="w-8 h-8 text-emerald-500" />,
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
      icon: <HeicIcon className="w-8 h-8 text-zinc-800 dark:text-white" />,
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
      icon: <SvgIcon className="w-8 h-8 text-emerald-600" />,
      component: null
    },
    {
      id: 'webp-jpg',
      title: 'WebP to JPG',
      description: 'Fix web image compatibility.',
      category: ToolCategory.CONVERSION,
      icon: <ConvertIcon className="w-8 h-8 text-zinc-500" />,
      component: null
    },
    {
      id: 'png-jpg',
      title: 'PNG to JPG',
      description: 'Flatten transparency.',
      category: ToolCategory.CONVERSION,
      icon: <ConvertIcon className="w-8 h-8 text-zinc-600" />,
      component: null
    },
    {
      id: 'jpg-png',
      title: 'JPG to PNG',
      description: 'Add alpha channel support.',
      category: ToolCategory.CONVERSION,
      icon: <ConvertIcon className="w-8 h-8 text-zinc-700" />,
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
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-6xl font-heading font-extrabold text-zinc-900 dark:text-white tracking-tight mb-5 leading-tight">
          All the tools you need,<br /> 
          <span className="bg-gradient-to-r from-violet-600 to-fuchsia-500 bg-clip-text text-transparent">right in your browser.</span>
        </h2>
        
        {/* Search Bar */}
        <div className="max-w-xl mx-auto mt-10 relative group">
           <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
             <svg className="h-5 w-5 text-zinc-300 dark:text-zinc-500 group-focus-within:text-violet-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
             </svg>
           </div>
           <input
             id="tool-search"
             type="text"
             className="block w-full pl-11 pr-4 py-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:ring-2 focus:ring-violet-500/40 focus:border-violet-400 dark:focus:border-violet-500 outline-none transition-all"
             placeholder="Search tools (Press Ctrl + K)"
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
           {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-300 hover:text-zinc-500 dark:text-zinc-500 dark:hover:text-zinc-300"
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
        <div className="mb-14">
           <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-4 px-1">Recently Used</h3>
           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {recentToolIds.map(id => {
                 const tool = tools.find(t => t.id === id);
                 if (!tool) return null;
                 return (
                    <div 
                        key={tool.id}
                        onClick={() => handleToolSelect(tool.id)}
                        className="bg-zinc-50 dark:bg-zinc-800 p-3.5 rounded-xl border border-zinc-100 dark:border-zinc-700 hover:border-violet-300 dark:hover:border-violet-600 cursor-pointer flex items-center gap-3 transition-all hover:bg-violet-50 dark:hover:bg-violet-950/30"
                    >
                        <div className="p-1.5 rounded-lg">
                           {React.cloneElement(tool.icon as React.ReactElement, { className: "w-5 h-5" })}
                        </div>
                        <span className="font-semibold text-zinc-700 dark:text-zinc-300 text-sm">{tool.title}</span>
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
            <div key={cat} className="mb-14">
                <div className="flex items-center gap-3 mb-6">
                    <h3 className="text-xl font-heading font-bold text-zinc-800 dark:text-white">
                        {cat}
                    </h3>
                    <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-full">
                        {catTools.length}
                    </span>
                    <div className="h-px flex-1 bg-zinc-100 dark:bg-zinc-700 ml-2"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {catTools.map((tool) => (
                    <div 
                        key={tool.id}
                        onClick={() => handleToolSelect(tool.id)}
                        className="group bg-white dark:bg-zinc-800 rounded-2xl p-5 border border-zinc-200 dark:border-zinc-700 hover:border-violet-300 dark:hover:border-violet-600 hover:shadow-lg hover:shadow-violet-500/5 transition-all duration-200 cursor-pointer hover:-translate-y-0.5 h-full flex flex-col relative overflow-hidden"
                    >
                        {/* Hover Accent Line */}
                        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                        
                        <div className="mb-4 p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl w-fit group-hover:bg-violet-50 dark:group-hover:bg-violet-950/40 transition-colors duration-200">
                            {tool.icon}
                        </div>
                        <h3 className="text-base font-heading font-bold text-zinc-800 dark:text-zinc-100 mb-1.5 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">{tool.title}</h3>
                        <p className="text-sm text-zinc-400 dark:text-zinc-500 leading-relaxed">{tool.description}</p>
                    </div>
                    ))}
                </div>
            </div>
        );
      })}

      {/* Privacy Banner */}
      {!searchTerm && (
        <div className="mt-20 relative rounded-3xl overflow-hidden bg-zinc-900 text-white border border-zinc-700">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-[0.15] bg-[radial-gradient(#8b5cf6_1px,transparent_1px)] [background-size:20px_20px]"></div>
            <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/15 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
            <div className="absolute bottom-0 left-0 w-60 h-60 bg-fuchsia-600/15 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"></div>

            <div className="relative z-10 px-6 py-12 md:p-16">
                <div className="max-w-4xl mx-auto text-center mb-16">
                    <div className="inline-flex items-center justify-center p-3 bg-violet-500/10 rounded-2xl mb-6 ring-1 ring-violet-500/50 backdrop-blur-sm">
                        <ShieldCheckIcon className="w-8 h-8 text-violet-400" />
                    </div>
                    <h2 className="text-3xl md:text-5xl font-heading font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-br from-white via-zinc-200 to-zinc-400 tracking-tight">
                        Privacy isn't a setting.<br/>It's our architecture.
                    </h2>
                    <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
                        Unlike other tools, we don't need your data to do our job. 
                        OmniTool runs entirely in your browser using WebAssembly.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                    <div className="bg-white/5 backdrop-blur-sm p-8 rounded-2xl border border-white/5 hover:bg-white/10 hover:border-violet-500/30 transition-all group">
                        <div className="w-14 h-14 bg-indigo-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <ServerOffIcon className="w-7 h-7 text-indigo-400" />
                        </div>
                        <h3 className="text-xl font-bold mb-3 font-heading">No Server Uploads</h3>
                        <p className="text-zinc-400 leading-relaxed">Your files never leave your device. All processing happens locally in your browser's secure sandbox.</p>
                    </div>
                    
                    <div className="bg-white/5 backdrop-blur-sm p-8 rounded-2xl border border-white/5 hover:bg-white/10 hover:border-fuchsia-500/30 transition-all group">
                        <div className="w-14 h-14 bg-fuchsia-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <ZapIcon className="w-7 h-7 text-fuchsia-400" />
                        </div>
                        <h3 className="text-xl font-bold mb-3 font-heading">Instant Performance</h3>
                        <p className="text-zinc-400 leading-relaxed">Zero network latency. Large files process instantly because there's no upload or download time.</p>
                    </div>

                    <div className="bg-white/5 backdrop-blur-sm p-8 rounded-2xl border border-white/5 hover:bg-white/10 hover:border-emerald-500/30 transition-all group">
                        <div className="w-14 h-14 bg-emerald-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <ShieldCheckIcon className="w-7 h-7 text-emerald-400" />
                        </div>
                        <h3 className="text-xl font-bold mb-3 font-heading">Offline Capable</h3>
                        <p className="text-zinc-400 leading-relaxed">Works perfectly without internet. Once loaded, OmniTool is a native-like app on your device.</p>
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