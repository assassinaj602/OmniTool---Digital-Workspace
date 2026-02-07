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
    <div className="min-h-screen flex flex-col text-zinc-900 dark:text-zinc-100 transition-colors duration-300 relative bg-zinc-50 dark:bg-zinc-950">
      {/* Animated background elements (Dark Mode Only) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none hidden dark:block">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-500/5 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-fuchsia-500/5 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay: '1s'}}></div>
      </div>

      <header className="sticky top-0 z-50 bg-zinc-50/90 dark:bg-zinc-950/90 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center cursor-pointer group" onClick={onNavigateHome}>
              <div className="relative w-10 h-10 rounded-xl flex items-center justify-center mr-3 shadow-sm border border-zinc-200 dark:border-zinc-800 group-hover:scale-105 transition-all duration-300 overflow-hidden">
                <img 
                  src="/assets/icon.jpg" 
                  alt="OmniTool Logo" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h1 className="text-xl font-heading font-bold tracking-tight text-zinc-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors duration-300">
                  OmniTool
                </h1>
              </div>
              {currentToolTitle && (
                <>
                  <span className="mx-3 text-zinc-300 dark:text-zinc-700">/</span>
                  <span className="text-zinc-600 dark:text-zinc-300 font-semibold tracking-tight font-heading">{currentToolTitle}</span>
                </>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Tools count badge */}
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">20+ Tools</span>
              </div>
              
              <button 
                onClick={toggleTheme}
                className="p-2 text-zinc-500 dark:text-zinc-400 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-lg transition-all duration-300 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800"
                aria-label="Toggle Dark Mode"
              >
                {isDark ? (
                  <svg className="w-5 h-5 transition-transform group-hover:rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 transition-transform group-hover:-rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

      <footer className="bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-700 py-12 mt-12 relative z-10 overflow-hidden">
        {/* Decorative gradient line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-400 to-transparent opacity-0 dark:opacity-40" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
            {/* Brand Section */}
            <div className="col-span-1 md:col-span-5">
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center mr-3 shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                  <img 
                    src="/assets/icon.jpg" 
                    alt="OmniTool Logo" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-heading font-bold text-zinc-900 dark:text-white">OmniTool</h3>
              </div>
              <p className="text-zinc-500 dark:text-zinc-400 max-w-sm leading-relaxed mb-6">
                Professional, secure, client-side tools for all your needs. <br/>
                No uploads, no waiting, just instant results. <br/>
                <span className="text-sm text-zinc-400 dark:text-zinc-500">100% privacy-focused architecture.</span>
              </p>
              
              {/* Social Links */}
              <div className="flex space-x-3">
                <a href="#" className="w-9 h-9 bg-zinc-100 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-400 dark:text-zinc-500 hover:text-violet-600 dark:hover:text-violet-400 hover:border-violet-200 dark:hover:border-violet-800 hover:-translate-y-0.5 transition-all duration-300">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
                <a href="#" className="w-9 h-9 bg-zinc-100 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-400 dark:text-zinc-500 hover:text-violet-600 dark:hover:text-violet-400 hover:border-violet-200 dark:hover:border-violet-800 hover:-translate-y-0.5 transition-all duration-300">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                </a>
                <a href="#" className="w-9 h-9 bg-zinc-100 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-400 dark:text-zinc-500 hover:text-violet-600 dark:hover:text-violet-400 hover:border-violet-200 dark:hover:border-violet-800 hover:-translate-y-0.5 transition-all duration-300">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
                <a href="#" className="w-9 h-9 bg-zinc-100 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-400 dark:text-zinc-500 hover:text-violet-600 dark:hover:text-violet-400 hover:border-violet-200 dark:hover:border-violet-800 hover:-translate-y-0.5 transition-all duration-300">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
                </a>
              </div>
            </div>
            
            {/* Tools Section */}
            <div className="col-span-1 md:col-span-2">
              <h4 className="font-heading font-semibold text-zinc-900 dark:text-white mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-violet-500" fill="currentColor" viewBox="0 0 24 24"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>
                Tools
              </h4>
              <ul className="space-y-2 text-zinc-500 dark:text-zinc-400">
                <li><button onClick={onNavigateHome} className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors">Image Tools</button></li>
                <li><button onClick={onNavigateHome} className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors">PDF Tools</button></li>
                <li><button onClick={onNavigateHome} className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors">Converters</button></li>
                <li><button onClick={onNavigateHome} className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors">File Tools</button></li>
              </ul>
            </div>
            
            {/* Features Section */}
            <div className="col-span-1 md:col-span-2">
              <h4 className="font-heading font-semibold text-zinc-900 dark:text-white mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-violet-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                Features
              </h4>
              <ul className="space-y-2 text-zinc-500 dark:text-zinc-400">
                <li className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors cursor-pointer">100% Client-Side</li>
                <li className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors cursor-pointer">No Data Upload</li>
                <li className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors cursor-pointer">Instant Processing</li>
                <li className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors cursor-pointer">Privacy First</li>
              </ul>
            </div>
            
            {/* Legal Section */}
            <div className="col-span-1 md:col-span-3">
              <h4 className="font-heading font-semibold text-zinc-900 dark:text-white mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-violet-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>
                Legal
              </h4>
              <ul className="space-y-2 text-zinc-500 dark:text-zinc-400">
                <li className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors cursor-pointer">Privacy Policy</li>
                <li className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors cursor-pointer">Terms of Service</li>
                <li className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors cursor-pointer">Cookie Policy</li>
                <li className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors cursor-pointer">GDPR Compliance</li>
              </ul>
            </div>
          </div>
          
          {/* Bottom Section */}
          <div className="pt-8 border-t border-zinc-200 dark:border-zinc-700">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <p className="text-zinc-400 dark:text-zinc-500 text-sm">
                © {new Date().getFullYear()} OmniTool. All rights reserved. Built with privacy in mind.
              </p>
              <div className="flex items-center space-x-6 text-sm text-zinc-400 dark:text-zinc-500">
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1 text-emerald-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                  100% Secure
                </span>
                <span className="text-xs">Made with <span className="text-red-500">♥</span> for privacy-conscious users</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};