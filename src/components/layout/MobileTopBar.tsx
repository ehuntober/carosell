import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ExternalLinkIcon, MenuIcon, XIcon } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { classicEditorUrl, primaryNav, secondaryNav } from '../../data/navigation';
import { BrandMark } from './BrandMark';
import { IntegrationStatus } from './IntegrationStatus';
import { NavItemLink } from './NavItemLink';

export function MobileTopBar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => setOpen(false), [location.pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-line bg-surface px-4 lg:hidden">
        <BrandMark />
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          aria-expanded={open}
          className="-mr-2 flex h-10 w-10 items-center justify-center rounded-lg text-ink-muted hover:bg-surface-2 hover:text-ink">
          
          <MenuIcon className="h-5 w-5" />
        </button>
      </header>
      <AnimatePresence>
        {open &&
        <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
            className="absolute inset-0 bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={() => setOpen(false)}
            aria-hidden />
          
            <motion.nav
            aria-label="Main navigation"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.24, ease: [0.23, 1, 0.32, 1] }}
            className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col border-r border-line bg-surface">
            
              <div className="flex h-14 items-center justify-between px-4">
                <BrandMark />
                <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="-mr-2 flex h-10 w-10 items-center justify-center rounded-lg text-ink-muted hover:bg-surface-2">
                
                  <XIcon className="h-5 w-5" />
                </button>
              </div>
              <div className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-2 pt-2">
                {primaryNav.map((item) =>
              <NavItemLink key={item.to} item={item} />
              )}
                <div className="my-2 h-px bg-line" />
                {secondaryNav.map((item) =>
              <NavItemLink key={item.to} item={item} />
              )}
                <a
                href={classicEditorUrl}
                target="_blank"
                rel="noreferrer"
                className="flex h-9 items-center gap-3 rounded-lg px-3 text-sm text-ink-muted hover:bg-surface-2/60 hover:text-ink">
                
                  <ExternalLinkIcon className="h-4 w-4 text-ink-subtle" aria-hidden />
                  Classic editor
                </a>
              </div>
              <div className="p-3">
                <IntegrationStatus />
              </div>
            </motion.nav>
          </div>
        }
      </AnimatePresence>
    </>);

}