import { createRoot } from 'react-dom/client';
import Root from './app/root';
import './styles/globals.css';
import './styles/layout.css';
import './styles/animations.css';
import './styles/ui.css';

const container = document.getElementById('root');
if (!container) throw new Error('Root element not found');

const root = createRoot(container);
root.render(<Root />);
