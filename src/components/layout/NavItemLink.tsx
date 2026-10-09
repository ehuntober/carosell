import React from 'react';
import { NavLink } from 'react-router-dom';
import type { NavItem } from '../../data/navigation';

interface NavItemLinkProps {
  item: NavItem;
  onNavigate?: () => void;
}

export function NavItemLink({ item, onNavigate }: NavItemLinkProps) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onNavigate}
      className={({ isActive }) =>
      `group flex h-9 items-center gap-3 rounded-lg px-3 text-sm transition-colors duration-150 ${
      isActive ? 'bg-surface-2 font-medium text-ink' : 'text-ink-muted hover:bg-surface-2/60 hover:text-ink'}`

      }>
      
      {({ isActive }) =>
      <>
          <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-accent' : 'text-ink-subtle group-hover:text-ink-muted'}`} aria-hidden />
          <span className="truncate">{item.label}</span>
        </>
      }
    </NavLink>);

}