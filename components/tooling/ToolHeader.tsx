import React from 'react';

interface ToolHeaderProps {
  title: string;
  subtitle: string;
}

export const ToolHeader: React.FC<ToolHeaderProps> = ({ title, subtitle }) => {
  return (
    <div className="text-center mb-8">
      <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{title}</h2>
      <p className="text-slate-500 dark:text-slate-400 mt-2">{subtitle}</p>
    </div>
  );
};
