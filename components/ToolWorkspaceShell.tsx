import React from 'react';
import { ToolCategory } from '../types';

interface ToolWorkspaceShellProps {
  title: string;
  description: string;
  category: ToolCategory;
  isFavorite: boolean;
  onBack: () => void;
  onToggleFavorite: () => void;
  onOpenCommandPalette: () => void;
  children: React.ReactNode;
}

export const ToolWorkspaceShell: React.FC<ToolWorkspaceShellProps> = ({
  title,
  description,
  category,
  isFavorite,
  onBack,
  onToggleFavorite,
  onOpenCommandPalette,
  children,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 animate-fade-in">
      <div className="rounded-3xl border border-zinc-200 dark:border-zinc-700 bg-linear-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-950 shadow-xl overflow-hidden">
        <div className="border-b border-zinc-200 dark:border-zinc-700 px-5 md:px-8 py-5 md:py-6">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-full">
              {category}
            </span>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-900">
              Local processing
            </span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="max-w-3xl">
              <h2 className="text-2xl md:text-3xl font-heading font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                {title}
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400 mt-2 leading-relaxed">
                {description}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={onBack}
                className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 hover:border-violet-300 dark:hover:border-violet-700 transition-colors text-sm font-semibold"
              >
                Back to workspace
              </button>
              <button
                type="button"
                onClick={onOpenCommandPalette}
                className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 hover:border-violet-300 dark:hover:border-violet-700 transition-colors text-sm font-semibold"
              >
                Commands
              </button>
              <button
                type="button"
                onClick={onToggleFavorite}
                className={`px-4 py-2 rounded-xl border transition-colors text-sm font-semibold ${
                  isFavorite
                    ? 'border-amber-300 bg-amber-100 dark:bg-amber-500/10 dark:border-amber-700 text-amber-900 dark:text-amber-200'
                    : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 hover:border-amber-300 dark:hover:border-amber-700'
                }`}
              >
                {isFavorite ? 'Pinned tool' : 'Pin tool'}
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 md:p-8">
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/80 dark:bg-zinc-900/60 p-4 md:p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
