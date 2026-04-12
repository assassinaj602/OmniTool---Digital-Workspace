import React, { useEffect, useMemo, useState } from 'react';
import { Layout } from './components/Layout';
import { NotificationProvider } from './components/NotificationContext';
import { CommandItem, CommandPalette } from './components/CommandPalette';
import { ToolWorkspaceShell } from './components/ToolWorkspaceShell';
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

const RECENT_TOOLS_STORAGE_KEY = 'omnitool_recent';
const FAVORITES_STORAGE_KEY = 'omnitool_favorites';
const ALL_CATEGORY = 'All Tools';

const readHashToolId = () => {
  if (typeof window === 'undefined') return null;

  const hash = window.location.hash.replace(/^#/, '');
  const match = hash.match(/tool=([^&]+)/);

  if (!match) return null;

  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
};

const clearHash = () => {
  if (typeof window === 'undefined') return;

  window.history.replaceState({}, '', `${window.location.pathname}${window.location.search}`);
};

const setToolHash = (toolId: string) => {
  if (typeof window === 'undefined') return;

  window.location.hash = `tool=${encodeURIComponent(toolId)}`;
};

const setThemeClass = (dark: boolean) => {
  if (dark) {
    document.documentElement.classList.add('dark');
    localStorage.theme = 'dark';
  } else {
    document.documentElement.classList.remove('dark');
    localStorage.theme = 'light';
  }
};

function App() {
  const [currentToolId, setCurrentToolId] = useState<string | null>(() => readHashToolId());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(ALL_CATEGORY);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  const [favoriteToolIds, setFavoriteToolIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(FAVORITES_STORAGE_KEY) || '[]');
    } catch {
      return [];
    }
  });

  const [recentToolIds, setRecentToolIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(RECENT_TOOLS_STORAGE_KEY) || '[]');
    } catch {
      return [];
    }
  });

  const tools: ToolDef[] = [
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
      description: 'Build photo layouts quickly.',
      category: ToolCategory.IMAGE,
      icon: <CollageIcon className="w-8 h-8 text-pink-600" />,
      component: null
    },
    {
      id: 'flip',
      title: 'Flip Image',
      description: 'Mirror vertically or horizontally.',
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
      description: 'Upscale small images.',
      category: ToolCategory.IMAGE,
      icon: <ExpandIcon className="w-8 h-8 text-indigo-500" />,
      component: null
    },
    {
      id: 'picker',
      title: 'Color Picker',
      description: 'Extract HEX and RGB values.',
      category: ToolCategory.IMAGE,
      icon: <PaletteIcon className="w-8 h-8 text-yellow-500" />,
      component: null
    },
    {
      id: 'meme',
      title: 'Meme Generator',
      description: 'Create social-ready image captions.',
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

    {
      id: 'convert',
      title: 'Image Converter',
      description: 'Convert between image formats.',
      category: ToolCategory.CONVERSION,
      icon: <ConvertIcon className="w-8 h-8 text-emerald-500" />,
      component: null
    },
    {
      id: 'pdf-jpg',
      title: 'PDF to JPG',
      description: 'Extract PDF pages as JPG images.',
      category: ToolCategory.CONVERSION,
      icon: <PdfImageIcon className="w-8 h-8 text-red-500" />,
      component: null
    },
    {
      id: 'heic-jpg',
      title: 'HEIC to JPG',
      description: 'Convert iPhone HEIC files quickly.',
      category: ToolCategory.CONVERSION,
      icon: <HeicIcon className="w-8 h-8 text-zinc-800 dark:text-white" />,
      component: null
    },
    {
      id: 'svg-convert',
      title: 'SVG Converter',
      description: 'Convert between SVG and raster formats.',
      category: ToolCategory.CONVERSION,
      icon: <SvgIcon className="w-8 h-8 text-orange-600" />,
      component: null
    },
    {
      id: 'pdf-png',
      title: 'PDF to PNG',
      description: 'Extract PDF pages as PNG images.',
      category: ToolCategory.CONVERSION,
      icon: <PdfImageIcon className="w-8 h-8 text-blue-400" />,
      component: null
    },
    {
      id: 'png-svg',
      title: 'PNG to SVG',
      description: 'Convert raster logos to vector output.',
      category: ToolCategory.CONVERSION,
      icon: <SvgIcon className="w-8 h-8 text-emerald-600" />,
      component: null
    },
    {
      id: 'webp-jpg',
      title: 'WebP to JPG',
      description: 'Convert WebP files for compatibility.',
      category: ToolCategory.CONVERSION,
      icon: <ConvertIcon className="w-8 h-8 text-zinc-500" />,
      component: null
    },
    {
      id: 'png-jpg',
      title: 'PNG to JPG',
      description: 'Flatten transparency into JPG.',
      category: ToolCategory.CONVERSION,
      icon: <ConvertIcon className="w-8 h-8 text-zinc-600" />,
      component: null
    },
    {
      id: 'jpg-png',
      title: 'JPG to PNG',
      description: 'Convert JPG images to PNG.',
      category: ToolCategory.CONVERSION,
      icon: <ConvertIcon className="w-8 h-8 text-zinc-700" />,
      component: null
    },

    {
      id: 'pdf-compress',
      title: 'Compress PDF',
      description: 'Reduce PDF size for sharing.',
      category: ToolCategory.PDF,
      icon: <CompressIcon className="w-8 h-8 text-red-700" />,
      component: null
    },
    {
      id: 'pdf-convert',
      title: 'PDF Converter',
      description: 'Convert PDF to text or Word output.',
      category: ToolCategory.PDF,
      icon: <PdfIcon className="w-8 h-8 text-red-600" />,
      component: null
    },
    {
      id: 'img-pdf',
      title: 'Image to PDF',
      description: 'Merge images into PDF documents.',
      category: ToolCategory.PDF,
      icon: <PdfIcon className="w-8 h-8 text-red-500" />,
      component: null
    },
    {
      id: 'jpg-pdf',
      title: 'JPG to PDF',
      description: 'Convert JPG image sets to PDF.',
      category: ToolCategory.PDF,
      icon: <PdfIcon className="w-8 h-8 text-red-400" />,
      component: null
    },
    {
      id: 'png-pdf',
      title: 'PNG to PDF',
      description: 'Convert PNG image sets to PDF.',
      category: ToolCategory.PDF,
      icon: <PdfIcon className="w-8 h-8 text-red-300" />,
      component: null
    },
    {
      id: 'pdf-gif',
      title: 'PDF to GIF',
      description: 'Turn PDF pages into animated GIFs.',
      category: ToolCategory.PDF,
      icon: <GifIcon className="w-8 h-8 text-purple-600" />,
      component: null
    },
  ];

  const toolById = useMemo(() => {
    return tools.reduce<Record<string, ToolDef>>((acc, tool) => {
      acc[tool.id] = tool;
      return acc;
    }, {});
  }, [tools]);

  const openTool = (id: string) => {
    setCurrentToolId(id);
    setSelectedCategory(ALL_CATEGORY);
    setToolHash(id);
    setIsCommandPaletteOpen(false);
  };

  const navigateHome = () => {
    setCurrentToolId(null);
    setSelectedCategory(ALL_CATEGORY);
    clearHash();
    setIsCommandPaletteOpen(false);
  };

  const navigateCategory = (category: string) => {
    setCurrentToolId(null);
    setSelectedCategory(category);
    clearHash();
    setIsCommandPaletteOpen(false);
  };

  const toggleFavorite = (id: string) => {
    setFavoriteToolIds((prev) => {
      const next = prev.includes(id)
        ? prev.filter((toolId) => toolId !== id)
        : [id, ...prev.filter((toolId) => toolId !== id)].slice(0, 8);

      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      setThemeClass(next);
      return next;
    });
  };

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

      case 'webp-jpg': return <ImageConverter defaultOutputFormat="image/jpeg" acceptedInputFormats={['image/webp']} title="WebP to JPG" />;
      case 'png-jpg': return <ImageConverter defaultOutputFormat="image/jpeg" acceptedInputFormats={['image/png']} title="PNG to JPG" />;
      case 'jpg-png': return <ImageConverter defaultOutputFormat="image/png" acceptedInputFormats={['image/jpeg']} title="JPG to PNG" />;

      case 'pdf-compress': return <PdfCompressor />;
      case 'pdf-convert': return <PdfConverter />;

      case 'img-pdf': return <ImageToPdf title="Image to PDF" />;
      case 'jpg-pdf': return <ImageToPdf acceptedFormats={['image/jpeg']} title="JPG to PDF" />;
      case 'png-pdf': return <ImageToPdf acceptedFormats={['image/png']} title="PNG to PDF" />;

      case 'pdf-gif': return <PdfToGif />;

      default: return <ImageResizer />;
    }
  };

  useEffect(() => {
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDark(true);
      setThemeClass(true);
      return;
    }

    setThemeClass(false);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }

      if (e.key === 'Escape' && !isCommandPaletteOpen) {
        navigateHome();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen]);

  useEffect(() => {
    const syncFromHash = () => {
      const nextToolId = readHashToolId();

      if (nextToolId && toolById[nextToolId]) {
        setCurrentToolId(nextToolId);
        setSelectedCategory(ALL_CATEGORY);
      } else {
        setCurrentToolId(null);
      }
    };

    window.addEventListener('hashchange', syncFromHash);
    return () => window.removeEventListener('hashchange', syncFromHash);
  }, [toolById]);

  useEffect(() => {
    if (!currentToolId) return;

    setRecentToolIds((prev) => {
      const next = [currentToolId, ...prev.filter((id) => id !== currentToolId)].slice(0, 8);
      localStorage.setItem(RECENT_TOOLS_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, [currentToolId]);

  const categoryFilters = [ALL_CATEGORY, ...Object.values(ToolCategory)];
  const displayCategories = Object.values(ToolCategory);

  const filteredTools = useMemo(() => {
    const normalizedSearch = searchTerm.toLowerCase();

    return tools.filter((tool) => {
      const matchesSearch =
        tool.title.toLowerCase().includes(normalizedSearch) ||
        tool.description.toLowerCase().includes(normalizedSearch);
      const matchesCategory = selectedCategory === ALL_CATEGORY || tool.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory, tools]);

  const favoriteTools = useMemo(
    () => favoriteToolIds.map((id) => tools.find((tool) => tool.id === id)).filter(Boolean) as ToolDef[],
    [favoriteToolIds, tools]
  );

  const toolCountByCategory = useMemo(() => {
    return tools.reduce<Record<string, number>>((counts, tool) => {
      counts[tool.category] = (counts[tool.category] || 0) + 1;
      return counts;
    }, {});
  }, [tools]);

  const commandPaletteCommands = useMemo<CommandItem[]>(() => {
    const baseCommands: CommandItem[] = [
      {
        id: 'cmd-home',
        label: 'Go to workspace home',
        description: 'Return to the main OmniTool dashboard',
        section: 'Navigation',
        keywords: ['home', 'dashboard'],
        shortcut: 'Esc',
        action: navigateHome,
      },
      {
        id: 'cmd-theme',
        label: isDark ? 'Switch to light mode' : 'Switch to dark mode',
        description: 'Toggle visual theme',
        section: 'Actions',
        keywords: ['theme', 'dark', 'light', 'appearance'],
        action: toggleTheme,
      },
      {
        id: 'cmd-clear-search',
        label: 'Clear tool search',
        description: 'Reset current search filters',
        section: 'Actions',
        keywords: ['clear', 'search', 'reset'],
        action: () => setSearchTerm(''),
      },
    ];

    const categoryCommands = displayCategories.map((category) => ({
      id: `cat-${category}`,
      label: `Show ${category}`,
      description: `Filter home view to ${category.toLowerCase()}`,
      section: 'Categories',
      keywords: ['category', category.toLowerCase()],
      action: () => navigateCategory(category),
    }));

    const toolCommands = tools.map((tool) => ({
      id: `tool-${tool.id}`,
      label: `Open ${tool.title}`,
      description: tool.description,
      section: 'Tools',
      keywords: [tool.category, tool.title, tool.description],
      action: () => openTool(tool.id),
    }));

    return [...baseCommands, ...categoryCommands, ...toolCommands];
  }, [displayCategories, isDark, tools]);

  const renderHome = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-violet-200 dark:border-violet-900 bg-violet-50/80 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 text-xs font-semibold uppercase tracking-[0.24em] mb-6">
          <ShieldCheckIcon className="w-4 h-4" />
          Browser-native productivity platform
        </div>

        <h2 className="text-4xl md:text-6xl font-heading font-extrabold text-zinc-900 dark:text-white tracking-tight mb-5 leading-tight">
          Private file workflows for teams and individuals,
          <span className="block bg-gradient-to-r from-violet-600 to-fuchsia-500 bg-clip-text text-transparent">with no server dependency.</span>
        </h2>
        <p className="max-w-3xl mx-auto text-base md:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
          OmniTool combines conversion, image editing, and PDF workflows in a single browser workspace. Every action runs locally, supports dark and light mode, and is optimized for drag, browse, and paste-driven usage.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => setIsCommandPaletteOpen(true)}
            className="px-5 py-3 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 font-semibold shadow-lg hover:shadow-xl transition-shadow"
          >
            Open command palette
          </button>
          <button
            type="button"
            onClick={() => openTool('resize')}
            className="px-5 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 font-semibold hover:border-violet-300 dark:hover:border-violet-700 transition-colors"
          >
            Start with Image Resizer
          </button>
        </div>

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
            placeholder="Search tools or press Ctrl + K for commands"
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

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {categoryFilters.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all duration-200 ${
                selectedCategory === category
                  ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-zinc-900 dark:border-white shadow-lg shadow-zinc-900/10'
                  : 'bg-white/80 dark:bg-zinc-900/80 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-violet-300 dark:hover:border-violet-600 hover:text-violet-600 dark:hover:text-violet-300'
              }`}
            >
              {category}
              <span className="ml-2 text-xs opacity-70">
                {category === ALL_CATEGORY ? tools.length : toolCountByCategory[category] || 0}
              </span>
            </button>
          ))}
        </div>
      </div>

      <section className="mb-14 grid md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-6">
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">Trusted workflow capacity</p>
          <p className="text-2xl font-heading font-bold text-zinc-900 dark:text-zinc-100">20+ production tools</p>
          <p className="text-sm mt-2 text-zinc-600 dark:text-zinc-400">Image editing, conversion, and PDF operations in one interface.</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-6">
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">Privacy architecture</p>
          <p className="text-2xl font-heading font-bold text-zinc-900 dark:text-zinc-100">No server uploads</p>
          <p className="text-sm mt-2 text-zinc-600 dark:text-zinc-400">Files are processed on-device and do not leave the browser.</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-6">
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">Input flexibility</p>
          <p className="text-2xl font-heading font-bold text-zinc-900 dark:text-zinc-100">Drag, browse, paste</p>
          <p className="text-sm mt-2 text-zinc-600 dark:text-zinc-400">Supports multiple input patterns for faster task completion.</p>
        </div>
      </section>

      <section className="mb-14">
        <h3 className="text-xl font-heading font-bold text-zinc-900 dark:text-zinc-100 mb-5">Recommended workflows</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <button onClick={() => openTool('resize')} className="text-left rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/70 p-5 hover:border-violet-300 dark:hover:border-violet-700 transition-colors">
            <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">Creator workflow</p>
            <h4 className="text-lg font-heading font-bold mt-1 text-zinc-900 dark:text-zinc-100">Resize then compress</h4>
            <p className="text-sm mt-2 text-zinc-600 dark:text-zinc-400">Prepare social assets quickly with lighter file sizes.</p>
          </button>
          <button onClick={() => openTool('pdf-convert')} className="text-left rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/70 p-5 hover:border-violet-300 dark:hover:border-violet-700 transition-colors">
            <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">Document workflow</p>
            <h4 className="text-lg font-heading font-bold mt-1 text-zinc-900 dark:text-zinc-100">Extract and repurpose PDF</h4>
            <p className="text-sm mt-2 text-zinc-600 dark:text-zinc-400">Convert PDF content to editable formats in one step.</p>
          </button>
          <button onClick={() => openTool('svg-convert')} className="text-left rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/70 p-5 hover:border-violet-300 dark:hover:border-violet-700 transition-colors">
            <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">Design workflow</p>
            <h4 className="text-lg font-heading font-bold mt-1 text-zinc-900 dark:text-zinc-100">Vector and raster bridge</h4>
            <p className="text-sm mt-2 text-zinc-600 dark:text-zinc-400">Move assets between PNG, JPG, and SVG with precision.</p>
          </button>
        </div>
      </section>

      {favoriteTools.length > 0 && !searchTerm && (
        <section className="mb-14">
          <div className="flex items-center gap-3 mb-6">
            <h3 className="text-xl font-heading font-bold text-zinc-800 dark:text-white">Pinned tools</h3>
            <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-full">
              {favoriteTools.length}
            </span>
            <div className="h-px flex-1 bg-zinc-100 dark:bg-zinc-700 ml-2"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
            {favoriteTools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => openTool(tool.id)}
                className="group bg-zinc-900 text-white rounded-2xl p-4 border border-zinc-800 hover:border-violet-500/60 hover:shadow-lg hover:shadow-violet-500/10 transition-all duration-200 text-left flex items-center gap-3"
              >
                <div className="p-2.5 rounded-xl bg-white/5 group-hover:bg-violet-500/10 transition-colors">
                  {React.cloneElement(tool.icon as React.ReactElement, { className: 'w-5 h-5' })}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold truncate">{tool.title}</div>
                  <div className="text-xs text-zinc-400 truncate">{tool.description}</div>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {!searchTerm && recentToolIds.length > 0 && (
        <section className="mb-14">
          <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-4 px-1">Recently used</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {recentToolIds.map((id) => {
              const tool = tools.find((entry) => entry.id === id);
              if (!tool) return null;

              return (
                <button
                  type="button"
                  key={tool.id}
                  onClick={() => openTool(tool.id)}
                  className="bg-zinc-50 dark:bg-zinc-800 p-3.5 rounded-xl border border-zinc-100 dark:border-zinc-700 hover:border-violet-300 dark:hover:border-violet-600 cursor-pointer flex items-center gap-3 transition-all hover:bg-violet-50 dark:hover:bg-violet-950/30"
                >
                  <div className="p-1.5 rounded-lg">
                    {React.cloneElement(tool.icon as React.ReactElement, { className: 'w-5 h-5' })}
                  </div>
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300 text-sm">{tool.title}</span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {displayCategories.map((category) => {
        const categoryTools = filteredTools.filter((tool) => tool.category === category);
        if (categoryTools.length === 0) return null;

        return (
          <section key={category} className="mb-14">
            <div className="flex items-center gap-3 mb-6">
              <h3 className="text-xl font-heading font-bold text-zinc-800 dark:text-white">{category}</h3>
              <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-full">
                {categoryTools.length}
              </span>
              <div className="h-px flex-1 bg-zinc-100 dark:bg-zinc-700 ml-2"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {categoryTools.map((tool) => {
                const isFavorite = favoriteToolIds.includes(tool.id);

                return (
                  <button
                    type="button"
                    key={tool.id}
                    onClick={() => openTool(tool.id)}
                    className="group bg-white dark:bg-zinc-800 rounded-2xl p-5 border border-zinc-200 dark:border-zinc-700 hover:border-violet-300 dark:hover:border-violet-600 hover:shadow-lg hover:shadow-violet-500/5 transition-all duration-200 cursor-pointer hover:-translate-y-0.5 h-full flex flex-col relative overflow-hidden text-left"
                  >
                    <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                    <button
                      type="button"
                      aria-label={isFavorite ? `Remove ${tool.title} from favorites` : `Add ${tool.title} to favorites`}
                      onClick={(event) => {
                        event.stopPropagation();
                        toggleFavorite(tool.id);
                      }}
                      className={`absolute top-3 right-3 w-9 h-9 rounded-full border transition-all duration-200 flex items-center justify-center ${
                        isFavorite
                          ? 'bg-amber-400 text-zinc-900 border-amber-300 shadow-lg shadow-amber-500/20'
                          : 'bg-white/90 dark:bg-zinc-900/90 text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:text-amber-500 hover:border-amber-300'
                      }`}
                    >
                      <svg className="w-4 h-4" fill={isFavorite ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.43 4.404a1 1 0 00.95.69h4.624c.969 0 1.371 1.24.588 1.81l-3.742 2.718a1 1 0 00-.364 1.118l1.43 4.404c.3.921-.755 1.688-1.54 1.118l-3.742-2.718a1 1 0 00-1.175 0l-3.742 2.718c-.784.57-1.838-.197-1.539-1.118l1.43-4.404a1 1 0 00-.364-1.118L2.457 9.831c-.783-.57-.38-1.81.588-1.81h4.624a1 1 0 00.95-.69l1.43-4.404z" />
                      </svg>
                    </button>

                    <div className="mb-4 p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl w-fit group-hover:bg-violet-50 dark:group-hover:bg-violet-950/40 transition-colors duration-200 pr-12">
                      {tool.icon}
                    </div>
                    <h3 className="text-base font-heading font-bold text-zinc-800 dark:text-zinc-100 mb-1.5 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                      {tool.title}
                    </h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{tool.description}</p>
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}

      {!searchTerm && (
        <section className="mt-20 relative rounded-3xl overflow-hidden bg-zinc-900 text-white border border-zinc-700">
          <div className="absolute inset-0 opacity-[0.15] bg-[radial-gradient(#8b5cf6_1px,transparent_1px)] [background-size:20px_20px]"></div>
          <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/15 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-fuchsia-600/15 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"></div>

          <div className="relative z-10 px-6 py-12 md:p-16">
            <div className="max-w-4xl mx-auto text-center mb-12">
              <div className="inline-flex items-center justify-center p-3 bg-violet-500/10 rounded-2xl mb-6 ring-1 ring-violet-500/50 backdrop-blur-sm">
                <ShieldCheckIcon className="w-8 h-8 text-violet-400" />
              </div>
              <h2 className="text-3xl md:text-5xl font-heading font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-br from-white via-zinc-200 to-zinc-400 tracking-tight">
                Privacy is core product infrastructure, not a secondary feature.
              </h2>
              <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
                Work with sensitive files confidently. OmniTool performs all operations in your browser and can continue offline after load.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <div className="bg-white/5 backdrop-blur-sm p-8 rounded-2xl border border-white/5 hover:bg-white/10 hover:border-violet-500/30 transition-all group">
                <div className="w-14 h-14 bg-indigo-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <ServerOffIcon className="w-7 h-7 text-indigo-400" />
                </div>
                <h3 className="text-xl font-bold mb-3 font-heading">No server uploads</h3>
                <p className="text-zinc-400 leading-relaxed">Files stay local and are processed in a browser sandbox.</p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm p-8 rounded-2xl border border-white/5 hover:bg-white/10 hover:border-fuchsia-500/30 transition-all group">
                <div className="w-14 h-14 bg-fuchsia-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <ZapIcon className="w-7 h-7 text-fuchsia-400" />
                </div>
                <h3 className="text-xl font-bold mb-3 font-heading">Fast by default</h3>
                <p className="text-zinc-400 leading-relaxed">No upload queue and no download lag between steps.</p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm p-8 rounded-2xl border border-white/5 hover:bg-white/10 hover:border-emerald-500/30 transition-all group">
                <div className="w-14 h-14 bg-emerald-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <ShieldCheckIcon className="w-7 h-7 text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold mb-3 font-heading">Offline-ready workspace</h3>
                <p className="text-zinc-400 leading-relaxed">Keep working on planes, weak networks, or secure environments.</p>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );

  const currentTool = currentToolId ? toolById[currentToolId] : null;

  return (
    <NotificationProvider>
      <Layout
        onNavigateHome={navigateHome}
        onNavigateCategory={navigateCategory}
        isDark={isDark}
        onToggleTheme={toggleTheme}
        currentToolTitle={currentTool?.title}
      >
        <CommandPalette
          isOpen={isCommandPaletteOpen}
          onClose={() => setIsCommandPaletteOpen(false)}
          commands={commandPaletteCommands}
        />

        {currentTool ? (
          <ToolWorkspaceShell
            title={currentTool.title}
            description={currentTool.description}
            category={currentTool.category}
            isFavorite={favoriteToolIds.includes(currentTool.id)}
            onBack={navigateHome}
            onToggleFavorite={() => toggleFavorite(currentTool.id)}
            onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          >
            {getToolComponent(currentTool.id)}
          </ToolWorkspaceShell>
        ) : (
          renderHome()
        )}
      </Layout>
    </NotificationProvider>
  );
}

export default App;
