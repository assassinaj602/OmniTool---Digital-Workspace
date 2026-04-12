import React from 'react';

interface ToolActionsProps {
  onCancel: () => void;
  onPrimary: () => void;
  cancelLabel?: string;
  primaryLabel: string;
  processingLabel?: string;
  isProcessing: boolean;
  disablePrimary?: boolean;
}

export const ToolActions: React.FC<ToolActionsProps> = ({
  onCancel,
  onPrimary,
  cancelLabel = 'Cancel',
  primaryLabel,
  processingLabel = 'Processing...',
  isProcessing,
  disablePrimary = false,
}) => {
  return (
    <div className="mt-6 flex justify-end gap-3">
      <button
        type="button"
        onClick={onCancel}
        className="px-4 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-600"
      >
        {cancelLabel}
      </button>
      <button
        type="button"
        onClick={onPrimary}
        disabled={isProcessing || disablePrimary}
        className="px-5 py-2 text-sm font-semibold rounded-xl bg-blue-600 text-white disabled:opacity-50"
      >
        {isProcessing ? processingLabel : primaryLabel}
      </button>
    </div>
  );
};
