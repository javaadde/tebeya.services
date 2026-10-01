import React from 'react';
import { Sidebar, type NavItemKey } from './Sidebar';

interface AdminLayoutProps {
  activeTab: NavItemKey;
  onSelectTab: (tab: NavItemKey) => void;
  children: React.ReactNode;
}

export function AdminLayout({ activeTab, onSelectTab, children }: AdminLayoutProps) {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      <Sidebar activeTab={activeTab} onSelectTab={onSelectTab} />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
