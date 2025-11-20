import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store';
import { registerSW } from 'virtual:pwa-register';
import toast from 'react-hot-toast';

// Register the service worker
registerSW({
  onNeedRefresh() {
    toast.success('New content available! Please refresh.');
  },
  onOfflineReady() {
    toast.success('App is ready to work offline!');
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
);