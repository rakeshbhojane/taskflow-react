import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutGrid, FolderKanban, LogOut, User, Zap, ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Layout() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out');
    navigate('/login');
  };

  return (
    <div className="min-h-screen gradient-bg flex">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 flex flex-col border-r border-ink-800/60 bg-ink-950/40 backdrop-blur-xl">
        {/* Logo */}
        <div className="p-6 border-b border-ink-800/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-volt-500 flex items-center justify-center">
              <Zap size={18} className="text-ink-950" fill="currentColor" />
            </div>
            <div>
              <p className="font-bold text-ink-50 text-lg leading-none tracking-tight">TaskFlow</p>
              <p className="text-xs text-ink-500 mt-0.5">Project Manager</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          <p className="text-xs font-semibold text-ink-600 uppercase tracking-widest px-4 mb-3">Navigation</p>
          <NavLink
            to="/projects"
            className={({ isActive }) => isActive ? 'nav-link-active' : 'nav-link'}
          >
            <FolderKanban size={18} />
            <span>Projects</span>
          </NavLink>
        </nav>

        {/* User info */}
        <div className="p-4 border-t border-ink-800/60">
          <div className="glass-card p-3 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-ink-700 flex items-center justify-center shrink-0">
                <User size={16} className="text-ink-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-ink-100 truncate">{user?.name}</p>
                <p className="text-xs text-ink-500 truncate">{user?.email}</p>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-ink-800">
              <span className={`status-badge text-xs ${isAdmin ? 'bg-volt-500/10 text-volt-400' : 'bg-ink-800 text-ink-400'}`}>
                {isAdmin ? '⚡ Admin' : '👤 Member'}
              </span>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full btn-ghost flex items-center gap-2 text-coral-400 hover:bg-coral-500/10 hover:text-coral-400">
            <LogOut size={16} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
