import { useState } from 'react';
import { Search, Mail, Bell, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';

interface HeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function Header({ title, subtitle, action }: HeaderProps) {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [hasUnread, setHasUnread] = useState(true);

  return (
    <div className="px-6 sm:px-8 pt-5 pb-2 space-y-5">
      {/* TIER 1: TOP BAR (Matching media_1790842672179.png) */}
      <div className="bg-white rounded-2xl px-4 sm:px-5 py-2.5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search Pill */}
        <div className="relative flex-1 max-w-sm">
          <div className="flex items-center gap-2.5 bg-[#f7f4ef] rounded-xl px-3.5 py-2 transition-all focus-within:ring-2 focus-within:ring-[#598A31]/25">
            <Search className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search shifts, staff, venues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-xs text-stone-900 placeholder-stone-400 focus:outline-none font-medium"
            />
            <kbd className="hidden sm:inline-flex items-center text-[10px] font-bold text-stone-400 bg-white rounded-md px-1.5 py-0.5 shadow-xs pointer-events-none">
              ⌘F
            </kbd>
          </div>
        </div>

        {/* Right Controls: Mail, Bell, Profile */}
        <div className="flex items-center justify-end gap-2.5">
          {/* Mail Icon Button */}
          <button
            type="button"
            title="Messages & Advisories"
            className="w-9 h-9 rounded-full bg-[#f7f4ef] text-stone-600 hover:text-[#598A31] hover:bg-[#e6f0dc] transition-all flex items-center justify-center"
          >
            <Mail className="w-4 h-4" />
          </button>

          {/* Bell Icon Button */}
          <button
            type="button"
            onClick={() => setHasUnread(false)}
            title="Notifications"
            className="w-9 h-9 rounded-full bg-[#f7f4ef] text-stone-600 hover:text-[#598A31] hover:bg-[#e6f0dc] transition-all flex items-center justify-center relative"
          >
            <Bell className="w-4 h-4" />
            {hasUnread && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#598A31] ring-2 ring-white" />
            )}
          </button>

          {/* User Profile Chip */}
          <div className="flex items-center gap-2.5 pl-3">
            <div className="w-9 h-9 rounded-full bg-[#e6f0dc] text-[#598A31] flex items-center justify-center font-bold text-xs flex-shrink-0">
              {user?.name ? user.name[0].toUpperCase() : <UserIcon className="w-4 h-4" />}
            </div>
            <div className="text-left hidden md:block min-w-0">
              <p className="text-xs font-bold text-stone-900 leading-tight truncate">
                {user?.name || 'Administrator'}
              </p>
              <p className="text-[11px] text-stone-400 font-medium truncate max-w-[150px]">
                {user?.email || 'admin@tebeya.services'}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="text-stone-400 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg ml-1"
              title="Log Out"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* TIER 2: PAGE ACTION HEADER (Matching media_1790842672179.png) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        <div>
          <h2 className="text-2xl font-black text-stone-900 tracking-tight">{title}</h2>
          {subtitle && <p className="text-xs text-stone-500 mt-1 font-medium">{subtitle}</p>}
        </div>

        {action && <div className="flex items-center gap-2.5 flex-shrink-0">{action}</div>}
      </div>
    </div>
  );
}
