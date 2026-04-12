import React from 'react';

interface ToolFileMetaProps {
  fileName: string;
  details?: string;
}

export const ToolFileMeta: React.FC<ToolFileMetaProps> = ({ fileName, details }) => {
  return (
    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
      {fileName}
      {details ? ` • ${details}` : ''}
    </p>
  );
};
