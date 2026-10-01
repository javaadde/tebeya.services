import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AdminLayout } from './components/layout/AdminLayout';
import type { NavItemKey } from './components/layout/Sidebar';
import { LoginView } from './features/auth/LoginView';
import { DashboardView } from './features/dashboard/DashboardView';
import { EventsView } from './features/events/EventsView';
import { InvitesView } from './features/invites/InvitesView';
import { StaffView } from './features/staff/StaffView';
import { PayoutsView } from './features/payouts/PayoutsView';
import { SettingsView } from './features/settings/SettingsView';

function AdminPortal() {
  const { isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<NavItemKey>('dashboard');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white font-black text-sm shadow-md animate-pulse">
            TS
          </div>
          <p className="text-xs text-gray-500 font-medium">Loading Tebeya Admin Portal...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginView />;
  }

  return (
    <AdminLayout activeTab={activeTab} onSelectTab={setActiveTab}>
      {activeTab === 'dashboard' && <DashboardView onNavigate={setActiveTab} />}
      {activeTab === 'events' && <EventsView />}
      {activeTab === 'invites' && <InvitesView />}
      {activeTab === 'staff' && <StaffView />}
      {activeTab === 'payouts' && <PayoutsView />}
      {activeTab === 'settings' && <SettingsView />}
    </AdminLayout>
  );
}

export function App() {
  return (
    <AuthProvider>
      <AdminPortal />
    </AuthProvider>
  );
}

export default App;
