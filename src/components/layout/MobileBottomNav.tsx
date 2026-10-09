import React from 'react';
import { NavLink } from 'react-router-dom';
import { primaryNav } from '../../data/navigation';

export function MobileBottomNav() {
  return (
    <nav
      aria-label="Quick navigation"
      className="fixed inset-x-0 bottom-0 z-40 grid h-16 grid-cols-4 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] lg:hidden">
      
      {primaryNav.slice(0, 4).map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-1 text-[11px] font-medium ${isActive ? 'text-ink' : 'text-ink-subtle'}`
            }>
            
            {({ isActive }) =>
            <>
                <Icon className={`h-5 w-5 ${isActive ? 'text-accent' : ''}`} aria-hidden />
                {item.shortLabel}
              </>
            }
          </NavLink>);

      })}
    </nav>);

}