import React from 'react';
import { ToolProcessState } from '../../utils/pdf';

interface ToolStatusNoticeProps {
  state: ToolProcessState;
  message: string;
}

export const ToolStatusNotice: React.FC<ToolStatusNoticeProps> = ({ state, message }) => {
  if (!message || state === 'idle' || state === 'ready') {
    return null;
  }

  const classes =
    state === 'error'
      ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300'
      : 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-900/20 dark:text-emerald-300';

  return (
    <div className={`rounded-xl border px-3 py-2 text-sm mt-4 ${classes}`}>
      {message}
    </div>
  );
};
