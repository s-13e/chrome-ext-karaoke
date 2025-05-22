import { createRoot } from 'react-dom/client';
import { App } from './App';

const root = document.createElement('div');
root.id = 'chrome-extension-root';
document.body.appendChild(root);

createRoot(root).render(<App />);
