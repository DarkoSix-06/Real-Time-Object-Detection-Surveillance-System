import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import WebcamDetection from './WebcamDetection';
import './index.css';


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<WebcamDetection />} />
      </Routes>
    </BrowserRouter>
  );
}
