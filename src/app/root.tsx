import React, { StrictMode } from 'react';
import { RESOLVEProvider } from '../store/RESOLVEContext';
import { ToastProvider } from '../components/ui/Toast';
import App from './App';

export default function Root(): React.ReactElement {
  return (
    <StrictMode>
      <RESOLVEProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </RESOLVEProvider>
    </StrictMode>
  );
}
