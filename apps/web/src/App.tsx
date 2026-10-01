import {
  CalendarDays,
  KeyRound,
  Users,
  CreditCard,
  Sliders,
  LayoutDashboard,
  ShieldAlert,
} from 'lucide-react';

export function App() {
  const stats = [
    { label: 'Upcoming Events', value: '4' },
    { label: 'Staff Headcount Filled', value: '86%' },
    { label: 'Active Invite Codes', value: '12' },
    { label: 'Pending Verifications', value: '3' },
  ];

  const navigation = [
    { name: 'Dashboard', icon: LayoutDashboard, current: true },
    { name: 'Events & Rosters', icon: CalendarDays, current: false },
    { name: 'Invite Codes', icon: KeyRound, current: false },
    { name: 'Staff Management', icon: Users, current: false },
    { name: 'Payments & Earnings', icon: CreditCard, current: false },
    { name: 'Settings & Wage Rules', icon: Sliders, current: false },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 border-r border-gray-200 bg-white flex flex-col justify-between">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-sm">
              TS
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900 leading-none">Tebeya Services</h1>
              <p className="text-xs text-gray-500 mt-1">Admin Panel</p>
            </div>
          </div>

          <nav className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.name}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    item.current
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-100 text-xs text-gray-400">
          Catering Staff Booking v1.0
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="border-b border-gray-200 bg-white px-8 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Admin Operations Dashboard</h2>
            <p className="text-sm text-gray-500">Monitor event fill status, approve staff, and issue invite codes.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              API Connected
            </span>
          </div>
        </header>

        <div className="p-8 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <p className="text-xs font-medium uppercase tracking-wider text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Quick Info Box */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-emerald-600 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Restricted Invite-Only Onboarding Active</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Staff signups require single-use, admin-issued invite codes. Enforce clash checks, daily caps (max 2 events/day),
                  and travel allowances configured under settings.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
