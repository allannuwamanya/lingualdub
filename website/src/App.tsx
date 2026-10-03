import React from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Overview from './pages/Overview';
import Docs from './pages/Docs';
import Abstractions from './pages/Abstractions';
import Research from './pages/Research';
import Architecture from './pages/Architecture';
import Studio from './pages/Studio';
import FrameworkSpecs from './pages/FrameworkSpecs';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          {/* Main Website & Marketing Pages */}
          <Route index element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/overview" element={<Overview />} />
          <Route path="/docs" element={<Docs />} />
          <Route path="/abstractions" element={<Abstractions />} />
          <Route path="/research" element={<Research />} />
          <Route path="/architecture" element={<Architecture />} />
          <Route path="/specs" element={<FrameworkSpecs defaultTab="architecture" />} />

          {/* Dedicated African Voice Studio Workstation */}
          <Route path="/studio" element={<Studio initialTab="speech" />} />
          <Route path="/speech" element={<Studio initialTab="speech" />} />
          <Route path="/dubbing" element={<Studio initialTab="dubbing" />} />
          <Route path="/voices" element={<Studio initialTab="gallery" />} />
          <Route path="/cloner" element={<Studio initialTab="cloner" />} />
          <Route path="/agent" element={<Studio initialTab="agent" />} />
          <Route path="/models" element={<Studio initialTab="models" />} />
          <Route path="/mastering" element={<Studio initialTab="mastering" />} />
          <Route path="/settings" element={<Studio initialTab="settings" />} />

          {/* Fallback to Home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
