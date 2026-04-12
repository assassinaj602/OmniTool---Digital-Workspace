import React, { useEffect, useMemo, useState } from 'react';

export interface CommandItem {
  id: string;
  label: string;
  description: string;
  section: string;
  keywords?: string[];
  shortcut?: string;
  action: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  commands: CommandItem[];
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, commands }) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
    }
  }, [isOpen]);

  const filteredCommands = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      return commands.slice(0, 12);
    }

    return commands
      .filter((command) => {
        const haystack = [command.label, command.description, ...(command.keywords || [])]
          .join(' ')
          .toLowerCase();
        return haystack.includes(normalized);
      })
      .slice(0, 12);
  }, [commands, query]);

  const grouped = useMemo(() => {
    return filteredCommands.reduce<Record<string, CommandItem[]>>((acc, command) => {
      if (!acc[command.section]) acc[command.section] = [];
      acc[command.section].push(command);
      return acc;
    }, {});
  }, [filteredCommands]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-120">
      <button
        type="button"
        aria-label="Close command palette"
        className="absolute inset-0 bg-zinc-950/45 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-121 max-w-2xl mx-auto mt-16 px-4">
        <div className="rounded-3xl border border-zinc-200/80 dark:border-zinc-700 bg-white/95 dark:bg-zinc-900/95 shadow-2xl overflow-hidden">
          <div className="border-b border-zinc-200 dark:border-zinc-700 px-4 py-3">
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Escape') {
                  onClose();
                }
                if (event.key === 'Enter' && filteredCommands[0]) {
                  event.preventDefault();
                  filteredCommands[0].action();
                  onClose();
                }
              }}
              placeholder="Type a command, tool name, or category"
              className="w-full bg-transparent text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 text-base outline-none"
            />
          </div>

          <div className="max-h-[60vh] overflow-y-auto p-3">
            {filteredCommands.length === 0 && (
              <div className="rounded-2xl border border-zinc-200 dark:border-zinc-700 p-5 text-sm text-zinc-500 dark:text-zinc-400">
                No matching commands. Try a tool name, category, or action.
              </div>
            )}

            {Object.entries(grouped).map(([section, sectionCommands]) => (
              <div key={section} className="mb-4 last:mb-0">
                <h3 className="px-2 py-2 text-xs uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 font-semibold">
                  {section}
                </h3>
                <div className="space-y-1">
                  {sectionCommands.map((command) => (
                    <button
                      key={command.id}
                      type="button"
                      onClick={() => {
                        command.action();
                        onClose();
                      }}
                      className="w-full text-left rounded-xl border border-transparent hover:border-violet-200 dark:hover:border-violet-800 hover:bg-violet-50/70 dark:hover:bg-violet-950/40 px-3 py-2.5 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{command.label}</div>
                          <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{command.description}</div>
                        </div>
                        {command.shortcut && (
                          <span className="text-[11px] text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-md">
                            {command.shortcut}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-zinc-200 dark:border-zinc-700 px-4 py-2.5 text-xs text-zinc-500 dark:text-zinc-400 flex items-center justify-between">
            <span>Enter to run the top result</span>
            <span>Esc to close</span>
          </div>
        </div>
      </div>
    </div>
  );
};
