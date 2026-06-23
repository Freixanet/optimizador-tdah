import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import {applyVariantFromUrl} from './appVariant';
import {initNativeShell} from './nativeShell';
import './index.css';

applyVariantFromUrl();
void initNativeShell();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
