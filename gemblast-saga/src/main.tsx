import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './energy.css';
import './airy.css';
import './soft-glow.css';
import './mystery.css';
import './iconic.css';
import './world-theme.css';
import './journey-map.css';
import { RecoveryBoundary } from './components/RecoveryBoundary';
import { nativeStartup } from './utils/native';

createRoot(document.getElementById('root')!).render(<RecoveryBoundary><App /></RecoveryBoundary>);
// Hide the native launch overlay even if storage initialization or rendering fails.
void nativeStartup();
