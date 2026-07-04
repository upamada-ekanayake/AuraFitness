import React from 'react';
import SidebarNav from '../navigation/SidebarNav';
import MobileBottomNav from '../navigation/MobileBottomNav';
import UserMenu from '../auth/UserMenu';

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-950 text-slate-100 flex flex-col md:flex-row pb-[calc(5.75rem+env(safe-area-inset-bottom))] md:pb-0">
      {/* Desktop Sidebar Navigation */}
      <SidebarNav />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top visual gradient flare */}
        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />

        {/* Inner container */}
        <main className="flex-1 px-4 py-5 pt-[calc(1.25rem+env(safe-area-inset-top))] sm:px-6 md:p-10 max-w-7xl w-full mx-auto overflow-y-auto relative z-10">
          <div className="md:hidden mb-5">
            <UserMenu compact />
          </div>
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
}
