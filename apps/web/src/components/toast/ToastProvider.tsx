import { useState, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import { ToastContext } from './ToastContext';

export function ToastProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  const success = useCallback((message: string) => {
    setState({ open: true, message, severity: 'success' });
  }, []);

  const error = useCallback((message: string) => {
    setState({ open: true, message, severity: 'error' });
  }, []);

  const handleClose = useCallback(() => {
    setState((s) => ({ ...s, open: false }));
  }, []);

  const value = useMemo(() => ({ success, error }), [success, error]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Snackbar
        open={state.open}
        autoHideDuration={3000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={state.severity} onClose={handleClose}>
          {state.message}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  );
}
