import React from 'react';
import SidebarNav from '../navigation/SidebarNav';
import MobileBottomNav from '../navigation/MobileBottomNav';

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row pb-20 md:pb-0">
      {/* Desktop Sidebar Navigation */}
      <SidebarNav />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top visual gradient flare */}
        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />

        {/* Inner container */}
        <main className="flex-1 p-6 md:p-10 max-w-7xl w-full mx-auto overflow-y-auto relative z-10">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
}
