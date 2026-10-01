import React, { useState } from 'react';
import { Sidebar, type NavItemKey } from './Sidebar';
import { Menu, X } from 'lucide-react';

interface AdminLayoutProps {
  activeTab: NavItemKey;
  onSelectTab: (tab: NavItemKey) => void;
  children: React.ReactNode;
}

export function AdminLayout({ activeTab, onSelectTab, children }: AdminLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="h-screen w-full bg-[#ede8e1] p-3 sm:p-4 lg:p-5 flex flex-col lg:flex-row gap-3 sm:gap-4 lg:gap-5 overflow-hidden font-sans">
      {/* Mobile Top Bar */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-white rounded-2xl shadow-sm flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <img
            src="/logo.jpg"
            alt="Logo"
            className="w-8 h-8 rounded-xl object-cover shadow-xs"
          />
          <span className="font-black text-stone-900 text-sm">Tebeya Services</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-xl text-stone-600 hover:bg-[#dad0c3]/40 transition-colors"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar on desktop / Drawer on mobile */}
      <div
        className={`lg:block ${
          mobileMenuOpen
            ? 'block fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-sm p-4 lg:p-0'
            : 'hidden'
        } flex-shrink-0 lg:h-full`}
        onClick={(e) => {
          if (e.target === e.currentTarget) setMobileMenuOpen(false);
        }}
      >
        <div className="h-full w-64 max-w-[85vw] flex flex-col">
          <Sidebar
            activeTab={activeTab}
            onSelectTab={(tab) => {
              onSelectTab(tab);
              setMobileMenuOpen(false);
            }}
          />
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-[#faf8f5] rounded-3xl shadow-sm">
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
