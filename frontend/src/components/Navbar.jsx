import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, LayoutDashboard, Settings as SettingsIcon, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) return null;

  return (
    <nav className="md:hidden sticky top-0 z-50 w-full bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-6 py-4 flex items-center justify-between">
      {/* Branding */}
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
          <span className="font-extrabold text-white text-lg">U</span>
        </div>
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent m-0 p-0 leading-tight">
            SocialOS
          </h1>
          <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
            Analytics Hub
          </p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-6">
        <Link
          to="/"
          className={`flex items-center gap-2 text-sm font-medium transition-colors ${
            location.pathname === '/' || location.pathname === '/dashboard'
              ? 'text-purple-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <LayoutDashboard size={18} />
          Dashboard
        </Link>
        <Link
          to="/settings"
          className={`flex items-center gap-2 text-sm font-medium transition-colors ${
            location.pathname === '/settings'
              ? 'text-purple-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <SettingsIcon size={18} />
          Connections
        </Link>
      </div>

      {/* User Actions */}
      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2 border-r border-slate-800 pr-4">
          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300">
            <User size={16} />
          </div>
          <div className="text-left">
            <p className="text-xs font-semibold text-slate-200">{user.name}</p>
            <p className="text-[10px] text-slate-500">{user.email}</p>
          </div>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-2 bg-slate-900 border border-slate-800 hover:bg-red-950/20 hover:border-red-900/50 hover:text-red-400 text-slate-300 px-3 py-1.5 rounded-lg text-sm transition-all duration-300"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
