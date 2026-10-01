import { useState } from 'react';
import {
  LayoutDashboard,
  CalendarDays,
  KeyRound,
  Users,
  CreditCard,
  Sliders,
  HelpCircle,
  LogOut,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../ui/Modal';

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
  const { logout } = useAuth();
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const menuItems = [
    { key: 'dashboard' as NavItemKey, name: 'Dashboard', icon: LayoutDashboard },
    { key: 'events' as NavItemKey, name: 'Events & Rosters', icon: CalendarDays },
    { key: 'staff' as NavItemKey, name: 'Staff Management', icon: Users },
    { key: 'invites' as NavItemKey, name: 'Invite Codes', icon: KeyRound },
    { key: 'payouts' as NavItemKey, name: 'Payments & Payouts', icon: CreditCard },
  ];

  const generalItems = [
    { key: 'settings' as NavItemKey, name: 'Settings & Rules', icon: Sliders },
  ];

  return (
    <aside className="w-64 bg-white rounded-3xl flex flex-col justify-between flex-shrink-0 select-none h-full shadow-sm overflow-hidden">
      <div className="p-5 flex-1 flex flex-col min-h-0 overflow-y-auto">
        {/* Brand Header */}
        <div className="flex items-center gap-3 mb-7 px-1">
          <img
            src="/logo.jpg"
            alt="Tebeya Logo"
            className="w-9 h-9 rounded-xl object-cover shadow-xs flex-shrink-0"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <div className="min-w-0">
            <h1 className="text-base font-black text-stone-900 tracking-tight leading-tight truncate">
              Tebeya
            </h1>
            <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider truncate">
              Staff Coordination
            </p>
          </div>
        </div>

        {/* SECTION 1: MENU */}
        <div className="mb-6">
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-stone-400 px-3 mb-2">
            MENU
          </p>
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isCurrent = activeTab === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => onSelectTab(item.key)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold rounded-xl transition-all text-left relative group',
                    isCurrent
                      ? 'text-stone-900 bg-[#f7f4ef] font-bold'
                      : 'text-stone-500 hover:text-stone-900 hover:bg-[#faf8f5]'
                  )}
                >
                  {/* Left Pill Marker Indicator */}
                  {isCurrent && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-[#e66434] rounded-r-full shadow-xs" />
                  )}
                  <Icon
                    className={cn(
                      'w-4 h-4 transition-colors flex-shrink-0',
                      isCurrent ? 'text-[#e66434]' : 'text-stone-400 group-hover:text-stone-700'
                    )}
                  />
                  <span className="truncate">{item.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* SECTION 2: GENERAL */}
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-stone-400 px-3 mb-2">
            GENERAL
          </p>
          <nav className="space-y-1">
            {generalItems.map((item) => {
              const Icon = item.icon;
              const isCurrent = activeTab === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => onSelectTab(item.key)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold rounded-xl transition-all text-left relative group',
                    isCurrent
                      ? 'text-stone-900 bg-[#f7f4ef] font-bold'
                      : 'text-stone-500 hover:text-stone-900 hover:bg-[#faf8f5]'
                  )}
                >
                  {isCurrent && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-[#e66434] rounded-r-full shadow-xs" />
                  )}
                  <Icon
                    className={cn(
                      'w-4 h-4 transition-colors flex-shrink-0',
                      isCurrent ? 'text-[#e66434]' : 'text-stone-400 group-hover:text-stone-700'
                    )}
                  />
                  <span className="truncate">{item.name}</span>
                </button>
              );
            })}

            {/* Help / Docs */}
            <button
              onClick={() => setIsHelpOpen(true)}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold rounded-xl text-stone-500 hover:text-stone-900 hover:bg-[#faf8f5] transition-all text-left group"
            >
              <HelpCircle className="w-4 h-4 text-stone-400 group-hover:text-stone-700 flex-shrink-0" />
              <span>Help & Docs</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Pinned Bottom: Logout */}
      <div className="p-4 pt-2 mt-auto">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-bold rounded-xl text-stone-500 hover:text-rose-600 hover:bg-rose-50/70 transition-all text-left group"
        >
          <LogOut className="w-4 h-4 text-stone-400 group-hover:text-rose-600 flex-shrink-0 transition-colors" />
          <span>Logout</span>
        </button>
      </div>

      {/* Help Modal */}
      <Modal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        title="Tebeya Services Help & Operations Guide"
        description="Core policies and operations handbook for catering admin."
        maxWidth="md"
      >
        <div className="space-y-3 text-xs text-stone-700">
          <div className="p-3 bg-[#f7f4ef] rounded-xl">
            <h5 className="font-bold text-stone-900 mb-1">Roster Scheduling</h5>
            <p>Publish shifts with confirmed slot timings. Staff will browse available events on the mobile app.</p>
          </div>
          <div className="p-3 bg-[#f7f4ef] rounded-xl">
            <h5 className="font-bold text-stone-900 mb-1">KYC & Rule 4</h5>
            <p>Candidate ID proofs are stored privately in Cloudinary. Only authenticated admin sessions can access signed temporary preview URLs.</p>
          </div>
          <div className="p-3 bg-[#f7f4ef] rounded-xl">
            <h5 className="font-bold text-stone-900 mb-1">Onboarding Codes</h5>
            <p>Staff registration requires active invite codes. Generate codes under the Invite Codes tab.</p>
          </div>
        </div>
      </Modal>
    </aside>
  );
}
