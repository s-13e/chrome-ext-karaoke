// src/content/index.tsx
// import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import 'normalize.css';
import { GlobalStyle } from '@styles/GlobalStyle';

let root = document.getElementById('chrome-extension-root');
if (!root) {
  root = document.createElement('div');
  root.id = 'chrome-extension-root';
  document.body.appendChild(root);
}
createRoot(root).render(
  <>
    <GlobalStyle />
    <App />
  </>,
);
