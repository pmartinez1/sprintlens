import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Trello, Zap, Menu, X, LogOut } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/AuthContext';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const navItems = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'Boards', path: '/boards', icon: Trello },
];

export default function AppLayout({ children, agentOpen = false, agentPanel = null }) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();

  const initials = user?.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() || '?';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Nav */}
      <header className="h-14 border-b border-slate-800 flex items-center px-4 md:px-6 gap-4 sticky top-0 z-40 bg-slate-950/95 backdrop-blur">
        <div className="flex items-center gap-2 flex-1">
          <div className="h-7 w-7 rounded-lg bg-indigo-600 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-white text-base tracking-tight">SprintLens</span>
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map(({ label, path, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                location.pathname === path
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Profile dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-semibold hover:bg-indigo-500 transition-colors flex-shrink-0">
              {initials}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-slate-900 border-slate-700 text-slate-200 min-w-[160px]">
            {user?.full_name && (
              <div className="px-3 py-2 text-xs text-slate-400 border-b border-slate-700">{user.full_name}</div>
            )}
            <DropdownMenuItem
              onClick={() => logout()}
              className="text-red-400 hover:text-red-300 focus:text-red-300 focus:bg-slate-800 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden text-slate-400 hover:text-white"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="md:hidden border-b border-slate-800 bg-slate-950 px-4 py-2 flex flex-col gap-1">
          {navItems.map(({ label, path, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                location.pathname === path
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </div>
      )}

      {/* Main content + Agent panel row */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <main className="flex-1 p-4 md:p-6 overflow-y-auto min-w-0">
          {children}
        </main>
        {agentOpen && (
          <div className="w-96 flex-shrink-0" />
        )}
      </div>
    </div>
  );
}