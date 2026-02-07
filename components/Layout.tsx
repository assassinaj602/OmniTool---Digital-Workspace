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
    <div className="min-h-screen flex flex-col text-slate-900 dark:text-slate-100 transition-colors duration-300 relative">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay: '2s'}}></div>
      </div>

      <header className="sticky top-0 z-50 glass backdrop-blur-xl border-b border-white/20 dark:border-slate-800/50 shadow-lg shadow-black/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center cursor-pointer group" onClick={onNavigateHome}>
              <div className="relative w-10 h-10 bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mr-3 shadow-xl shadow-blue-500/30 group-hover:shadow-blue-500/50 group-hover:scale-110 transition-all duration-300">
                <span className="text-white font-heading font-bold text-xl tracking-tighter">O</span>
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-xl"></div>
              </div>
              <div>
                <h1 className="text-xl font-heading font-bold tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                  OmniTool
                </h1>
              {currentToolTitle && (
                <>
                  <span className="mx-3 text-slate-300 dark:text-slate-700">/</span>
                  <span className="text-slate-700 dark:text-slate-300 font-semibold tracking-tight font-heading">{currentToolTitle}</span>
                </>
              )}
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              
              <button 
                onClick={toggleTheme}
                className="p-2.5 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 bg-slate-100/50 dark:bg-slate-800/50 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl transition-all duration-300 hover:scale-110 shadow-sm hover:shadow-md"
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

      <main className="flex-grow w-full relative z-10">
        {children}
      </main>

      <footer className="glass backdrop-blur-xl border-t border-white/20 dark:border-slate-800/50 py-12 mt-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mr-3 shadow-lg shadow-blue-500/30">
                    <span className="text-white font-heading font-bold tracking-tighter">O</span>
                  </div>
                  <h3 className="text-xl font-heading font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">OmniTool</h3>
              </div>
              <p className="text-slate-600 dark:text-slate-400 max-w-xs leading-relaxed\">
                Professional, secure, client-side tools. <br/>
                No uploads, no waiting, just instant results.
              </p>
            </div>
            <div>
              <h4 className="font-heading font-semibold text-slate-900 dark:text-white mb-4">Tools</h4>
              <ul className="space-y-2 text-slate-600 dark:text-slate-400\">
                <li><button onClick={onNavigateHome} className="hover:text-blue-500 transition-colors\">Image Tools</button></li>
                <li><button onClick={onNavigateHome} className="hover:text-blue-500 transition-colors\">PDF Tools</button></li>
                <li><button onClick={onNavigateHome} className="hover:text-blue-500 transition-colors\">Converters</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-heading font-semibold text-slate-900 dark:text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-slate-600 dark:text-slate-400\">
                <li className="hover:text-blue-500 transition-colors cursor-pointer\">Privacy Policy</li>
                <li className="hover:text-blue-500 transition-colors cursor-pointer\">Terms of Service</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-slate-200/50 dark:border-slate-800/50 text-center text-slate-500 dark:text-slate-400\">
            <p>© {new Date().getFullYear()} OmniTool. 100% Client-Side Architecture.</p>
            <p className="text-xs mt-2\">Made with <span className="text-red-500\">♥</span> for privacy-conscious users</p>
          </div>
        </div>
      </footer>
    </div>
  );
};