import React, { StrictMode } from 'react';
import { RESOLVEProvider } from '../store/RESOLVEContext';
import App from './App';

export default function Root(): React.ReactElement {
  return (
    <StrictMode>
      <RESOLVEProvider>
        <App />
      </RESOLVEProvider>
    </StrictMode>
  );
}
