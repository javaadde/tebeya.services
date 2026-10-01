import {
  LayoutDashboard,
  CalendarDays,
  KeyRound,
  Users,
  CreditCard,
  Sliders,
} from 'lucide-react';
import { cn } from '../../utils/cn';

export type NavItemKey =
  | 'dashboard'
  | 'events'
  | 'invites'
  | 'staff'
  | 'payouts'
  | 'settings';

interface SidebarProps {
  activeTab: NavItemKey;
  onSelectTab: (tab: NavItemKey) => void;
}

export function Sidebar({ activeTab, onSelectTab }: SidebarProps) {
  const navigation = [
    { key: 'dashboard' as NavItemKey, name: 'Dashboard', icon: LayoutDashboard },
    { key: 'events' as NavItemKey, name: 'Events & Rosters', icon: CalendarDays },
    { key: 'invites' as NavItemKey, name: 'Invite Codes', icon: KeyRound },
    { key: 'staff' as NavItemKey, name: 'Staff Management', icon: Users },
    { key: 'payouts' as NavItemKey, name: 'Payments & Payouts', icon: CreditCard },
    { key: 'settings' as NavItemKey, name: 'Settings & Wage Rules', icon: Sliders },
  ];

  return (
    <aside className="w-64 border-r border-gray-200 bg-white flex flex-col justify-between flex-shrink-0">
      <div className="p-6">
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-black text-sm shadow-sm shadow-emerald-200">
            TS
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900 leading-tight">Tebeya Services</h1>
            <p className="text-xs text-gray-500 font-medium">Admin Operations Hub</p>
          </div>
        </div>

        <nav className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isCurrent = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => onSelectTab(item.key)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all text-left',
                  isCurrent
                    ? 'bg-emerald-50 text-emerald-800 shadow-sm font-semibold'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                )}
              >
                <Icon
                  className={cn(
                    'w-4 h-4 transition-colors',
                    isCurrent ? 'text-emerald-700' : 'text-gray-400'
                  )}
                />
                {item.name}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-gray-100 bg-gray-50/50">
        <div className="text-[11px] text-gray-400 font-medium">
          Tebeya Catering Operations
        </div>
        <div className="text-[10px] text-gray-400 mt-0.5">
          v1.0.0 · Production Ready
        </div>
      </div>
    </aside>
  );
}
