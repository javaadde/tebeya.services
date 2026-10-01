import { LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';

interface HeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function Header({ title, subtitle, action }: HeaderProps) {
  const { user, logout } = useAuth();

  return (
    <header className="border-b border-gray-200 bg-white px-8 py-4 flex items-center justify-between sticky top-0 z-10">
      <div>
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        {action}

        <div className="flex items-center gap-2 pl-4 border-l border-gray-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs border border-emerald-200">
              {user?.name ? user.name[0].toUpperCase() : <UserIcon className="w-4 h-4" />}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-bold text-gray-900 leading-tight">
                {user?.name || 'Administrator'}
              </p>
              <p className="text-[11px] text-gray-500">{user?.email || 'admin@tebeya.services'}</p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="text-gray-500 hover:text-rose-600 ml-2"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
