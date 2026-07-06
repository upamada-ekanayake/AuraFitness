import React from 'react';
import SidebarNav from '../navigation/SidebarNav';
import MobileBottomNav from '../navigation/MobileBottomNav';
import UserMenu from '../auth/UserMenu';

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#08070b] text-zinc-100 flex flex-col md:flex-row pb-[calc(5.75rem+env(safe-area-inset-bottom))] md:pb-0 relative">
      <div className="pointer-events-none fixed inset-0 opacity-60">
        <div className="aura-drift absolute -top-24 right-[-6rem] h-72 w-72 rounded-full bg-violet-700/18 blur-3xl" />
        <div className="absolute bottom-16 left-[-8rem] h-72 w-72 rounded-full bg-fuchsia-700/10 blur-3xl" />
      </div>

      <SidebarNav />

      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <main className="flex-1 px-4 py-5 pt-[calc(1.25rem+env(safe-area-inset-top))] sm:px-6 md:p-10 max-w-7xl w-full mx-auto overflow-y-auto relative z-10">
          <div className="md:hidden mb-5">
            <UserMenu compact />
          </div>
          {children}
        </main>
      </div>

      <MobileBottomNav />
    </div>
  );
}
