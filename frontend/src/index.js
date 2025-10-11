import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import ScanPage from './pages/ScanPage';
import HistoryPage from './pages/HistoryPage';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/scan" element={<ScanPage />} />
      <Route path="/history" element={<HistoryPage />} />
    </Routes>
  </BrowserRouter>
);
