import { useState } from 'react';

export type ToolProcessState = 'idle' | 'ready' | 'processing' | 'done' | 'error';

export const useToolProcessState = () => {
  const [state, setState] = useState<ToolProcessState>('idle');
  const [message, setMessage] = useState<string>('');

  return {
    state,
    message,
    isProcessing: state === 'processing',
    setIdle: (nextMessage = '') => {
      setState('idle');
      setMessage(nextMessage);
    },
    setReady: (nextMessage = '') => {
      setState('ready');
      setMessage(nextMessage);
    },
    setProcessing: (nextMessage = '') => {
      setState('processing');
      setMessage(nextMessage);
    },
    setDone: (nextMessage = 'Done.') => {
      setState('done');
      setMessage(nextMessage);
    },
    setError: (nextMessage: string) => {
      setState('error');
      setMessage(nextMessage);
    },
  };
};
