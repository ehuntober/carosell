import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { BrandKit, IntegrationSettings } from '../types/settings';
import { isImageProviderConfigured } from '../utils/imageProviders';
import { loadJSON, saveJSON } from '../utils/storage';

const INTEGRATIONS_KEY = 'carosell.integrations';
const BRAND_KEY = 'carosell.brandKit';

export const defaultIntegrations: IntegrationSettings = {
  geminiEndpoint: '',
  imageProvider: 'none',
  comfyUrl: 'http://127.0.0.1:8188',
  comfyCheckpoint: 'sd_xl_base_1.0.safetensors',
  comfySteps: 25,
  httpEndpoint: ''
};

export const defaultBrandKit: BrandKit = {
  brandName: '',
  handle: '',
  themeId: 'cinematic-dark',
  headlineFont: 'Montserrat',
  bodyFont: 'Inter',
  textColor: '#ffffff',
  accentColor: '#fb7185',
  backgroundColor: '#0b0b0f',
  applyToNewProjects: false
};

interface SettingsValue {
  integrations: IntegrationSettings;
  updateIntegrations: (patch: Partial<IntegrationSettings>) => void;
  brandKit: BrandKit;
  updateBrandKit: (patch: Partial<BrandKit>) => void;
  geminiReady: boolean;
  imageReady: boolean;
}

const SettingsContext = createContext<SettingsValue | null>(null);

export function SettingsProvider({ children }: {children: React.ReactNode;}) {
  const [integrations, setIntegrations] = useState<IntegrationSettings>(() =>
  loadJSON(INTEGRATIONS_KEY, defaultIntegrations)
  );
  const [brandKit, setBrandKit] = useState<BrandKit>(() => loadJSON(BRAND_KEY, defaultBrandKit));

  const updateIntegrations = useCallback((patch: Partial<IntegrationSettings>) => {
    setIntegrations((prev) => {
      const next = { ...prev, ...patch };
      saveJSON(INTEGRATIONS_KEY, next);
      return next;
    });
  }, []);

  const updateBrandKit = useCallback((patch: Partial<BrandKit>) => {
    setBrandKit((prev) => {
      const next = { ...prev, ...patch };
      saveJSON(BRAND_KEY, next);
      return next;
    });
  }, []);

  const value = useMemo<SettingsValue>(
    () => ({
      integrations,
      updateIntegrations,
      brandKit,
      updateBrandKit,
      geminiReady: Boolean(integrations.geminiEndpoint.trim()),
      imageReady: isImageProviderConfigured(integrations)
    }),
    [integrations, updateIntegrations, brandKit, updateBrandKit]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used inside SettingsProvider');
  return ctx;
}