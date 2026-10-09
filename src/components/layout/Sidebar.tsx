import React from 'react';
import { ExternalLinkIcon } from 'lucide-react';
import { classicEditorUrl, primaryNav, secondaryNav } from '../../data/navigation';
import { BrandMark } from './BrandMark';
import { IntegrationStatus } from './IntegrationStatus';
import { NavItemLink } from './NavItemLink';

export function Sidebar() {
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-line bg-surface lg:flex" aria-label="Main navigation">
      <div className="flex h-14 items-center px-4">
        <BrandMark />
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 px-2 pt-2">
        {primaryNav.map((item) =>
        <NavItemLink key={item.to} item={item} />
        )}
      </nav>
      <div className="space-y-3 px-2 pb-3">
        <div className="px-1">
          <IntegrationStatus />
        </div>
        <nav className="flex flex-col gap-0.5" aria-label="Support">
          {secondaryNav.map((item) =>
          <NavItemLink key={item.to} item={item} />
          )}
          <a
            href={classicEditorUrl}
            target="_blank"
            rel="noreferrer"
            className="flex h-9 items-center gap-3 rounded-lg px-3 text-sm text-ink-muted transition-colors duration-150 hover:bg-surface-2/60 hover:text-ink">
            
            <ExternalLinkIcon className="h-4 w-4 text-ink-subtle" aria-hidden />
            Classic editor
          </a>
        </nav>
      </div>
    </aside>);

}