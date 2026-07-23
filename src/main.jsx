// src/main.jsx (또는 index.js)
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { ThemeProvider } from './context/ThemeContext'; // 추가

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);