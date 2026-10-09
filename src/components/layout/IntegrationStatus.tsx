import React from 'react';
import { Link } from 'react-router-dom';
import { useSettings } from '../../contexts/SettingsContext';
import { providerLabel } from '../../utils/imageProviders';

export function IntegrationStatus() {
  const { geminiReady, imageReady, integrations } = useSettings();
  const rows = [
  { label: 'Gemini script', ready: geminiReady, value: geminiReady ? 'Configured' : 'Not set up' },
  { label: 'Image engine', ready: imageReady, value: imageReady ? providerLabel(integrations) : 'Not set up' }];

  return (
    <Link
      to="/settings"
      className="block rounded-lg border border-line px-3 py-2.5 transition-colors duration-150 hover:border-line-strong hover:bg-surface-2">
      
      <span className="sr-only">Integration status — open settings</span>
      <ul className="space-y-1.5">
        {rows.map((r) =>
        <li key={r.label} className="flex items-center justify-between gap-2 text-xs">
            <span className="text-ink-muted">{r.label}</span>
            <span className="flex items-center gap-1.5 text-ink">
              <span className={`h-1.5 w-1.5 rounded-full ${r.ready ? 'bg-success' : 'bg-ink-subtle'}`} aria-hidden />
              {r.value}
            </span>
          </li>
        )}
      </ul>
    </Link>);

}