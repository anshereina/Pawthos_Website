// src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // <--- This line is crucial for including your CSS!
import App from './App';
// import reportWebVitals from './reportWebVitals'; // Remove this if you deleted reportWebVitals.ts

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

