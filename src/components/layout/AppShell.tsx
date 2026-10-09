import React from 'react';
import { Outlet } from 'react-router-dom';
import { MobileBottomNav } from './MobileBottomNav';
import { MobileTopBar } from './MobileTopBar';
import { Sidebar } from './Sidebar';

export function AppShell() {
  return (
    <div className="flex h-[100dvh] w-full overflow-hidden bg-canvas text-ink">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileTopBar />
        <main id="main" className="scrollbar-thin min-h-0 flex-1 overflow-y-auto overflow-x-hidden pb-16 lg:pb-0">
          <Outlet />
        </main>
      </div>
      <MobileBottomNav />
    </div>);

}