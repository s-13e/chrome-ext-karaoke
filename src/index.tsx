//import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './services/i18n';

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
