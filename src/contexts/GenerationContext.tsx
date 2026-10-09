import React, { createContext, useContext } from 'react';
import { useGenerationPipeline, type GenerationApi } from '../hooks/useGenerationPipeline';

const GenerationContext = createContext<GenerationApi | null>(null);

export function GenerationProvider({ children }: {children: React.ReactNode;}) {
  const api = useGenerationPipeline();
  return <GenerationContext.Provider value={api}>{children}</GenerationContext.Provider>;
}

export function useGeneration(): GenerationApi {
  const ctx = useContext(GenerationContext);
  if (!ctx) throw new Error('useGeneration must be used inside GenerationProvider');
  return ctx;
}