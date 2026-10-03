import React from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Studio from './pages/Studio';
import FrameworkSpecs from './pages/FrameworkSpecs';
import Home from './pages/Home';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          {/* Main DAW Studio Workstation Modes */}
          <Route index element={<Studio initialTab="speech" />} />
          <Route path="/studio" element={<Studio initialTab="speech" />} />
          <Route path="/speech" element={<Studio initialTab="speech" />} />
          <Route path="/dubbing" element={<Studio initialTab="dubbing" />} />
          <Route path="/voices" element={<Studio initialTab="gallery" />} />
          <Route path="/cloner" element={<Studio initialTab="cloner" />} />
          <Route path="/agent" element={<Studio initialTab="agent" />} />
          <Route path="/models" element={<Studio initialTab="models" />} />
          <Route path="/mastering" element={<Studio initialTab="mastering" />} />
          <Route path="/settings" element={<Studio initialTab="settings" />} />

          {/* Integrated Framework Specifications & Knowledge Base */}
          <Route path="/specs" element={<FrameworkSpecs defaultTab="architecture" />} />
          <Route path="/architecture" element={<FrameworkSpecs defaultTab="architecture" />} />
          <Route path="/abstractions" element={<FrameworkSpecs defaultTab="abstractions" />} />
          <Route path="/research" element={<FrameworkSpecs defaultTab="research" />} />
          <Route path="/docs" element={<FrameworkSpecs defaultTab="docs" />} />
          <Route path="/overview" element={<FrameworkSpecs defaultTab="overview" />} />

          {/* Legacy landing page route */}
          <Route path="/home" element={<Home />} />

          {/* Fallback to Speech Lab */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
