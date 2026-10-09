import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AppShell } from './components/layout/AppShell';
import { GenerationProvider } from './contexts/GenerationContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { StudioProvider } from './contexts/StudioContext';
import { BrandKitPage } from './pages/BrandKit';
import { Dashboard } from './pages/Dashboard';
import { Help } from './pages/Help';
import { Projects } from './pages/Projects';
import { Settings } from './pages/Settings';
import { Studio } from './pages/Studio';
import { Templates } from './pages/Templates';

export function App() {
  return (
    <BrowserRouter>
      <SettingsProvider>
        <StudioProvider>
          <GenerationProvider>
            <Routes>
              <Route element={<AppShell />}>
                <Route index element={<Dashboard />} />
                <Route path="studio" element={<Studio />} />
                <Route path="projects" element={<Projects />} />
                <Route path="templates" element={<Templates />} />
                <Route path="brand-kit" element={<BrandKitPage />} />
                <Route path="settings" element={<Settings />} />
                <Route path="help" element={<Help />} />
                <Route path="*" element={<Dashboard />} />
              </Route>
            </Routes>
            <Toaster theme="dark" position="bottom-right" offset={80} richColors closeButton />
          </GenerationProvider>
        </StudioProvider>
      </SettingsProvider>
    </BrowserRouter>);

}