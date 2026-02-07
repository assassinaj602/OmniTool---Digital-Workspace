import React, { useEffect, useState } from 'react';

interface LayoutProps {
  children: React.ReactNode;
  onNavigateHome: () => void;
  currentToolTitle?: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, onNavigateHome, currentToolTitle }) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check system preference or localStorage
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
      setIsDark(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center cursor-pointer group" onClick={onNavigateHome}>
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3 shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                <span className="text-white font-heading font-bold text-xl tracking-tighter">O</span>
              </div>
              <h1 className="text-xl font-heading font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                OmniTool
              </h1>
              {currentToolTitle && (
                <>
                  <span className="mx-3 text-slate-300 dark:text-slate-700">/</span>
                  <span className="text-slate-600 dark:text-slate-300 font-medium tracking-tight font-heading">{currentToolTitle}</span>
                </>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              
              <button 
                onClick={toggleTheme}
                className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                aria-label="Toggle Dark Mode"
              >
                {isDark ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow w-full">
        {children}
      </main>

      <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-4">
                  <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center mr-2">
                    <span className="text-white font-heading font-bold text-sm tracking-tighter">O</span>
                  </div>
                  <h3 className="text-lg font-heading font-bold text-slate-900 dark:text-white">OmniTool</h3>
              </div>
              <p className="text-slate-500 dark:text-slate-400 max-w-xs text-sm leading-relaxed">
                Professional, secure, client-side tools. <br/>
                No uploads, no waiting, just instant results.
              </p>
            </div>
            <div>
              <h4 className="font-heading font-semibold text-slate-900 dark:text-white mb-4">Tools</h4>
              <ul className="space-y-2 text-slate-500 dark:text-slate-400 text-sm">
                <li><button onClick={onNavigateHome} className="hover:text-blue-500 transition-colors">Image Tools</button></li>
                <li><button onClick={onNavigateHome} className="hover:text-blue-500 transition-colors">PDF Tools</button></li>
                <li><button onClick={onNavigateHome} className="hover:text-blue-500 transition-colors">Converters</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-heading font-semibold text-slate-900 dark:text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-slate-500 dark:text-slate-400 text-sm">
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 text-center text-slate-400 text-sm">
            © {new Date().getFullYear()} OmniTool. 100% Client-Side Architecture.
          </div>
        </div>
      </footer>
    </div>
  );
};