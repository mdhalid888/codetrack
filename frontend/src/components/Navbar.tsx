import React from 'react';
import type { AdminUser } from '../types';
import { 
  Code2, LayoutDashboard, Trophy, ArrowRightLeft, Calendar, 
  ShieldCheck, LogIn, LogOut, Sun, Moon 
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: AdminUser | null;
  onOpenLogin: () => void;
  onLogout: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onOpenLogin,
  onLogout,
  theme,
  onToggleTheme
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'compare', label: 'Compare', icon: ArrowRightLeft },
    { id: 'attendance', label: 'Attendance', icon: Calendar },
  ];

  if (currentUser) {
    navItems.push({ id: 'scanner', label: 'Database Scanner', icon: ShieldCheck });
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b backdrop-blur-xl bg-white/90 border-[#e9dff7] dark:bg-[#15122b]/90 dark:border-[#252044] shadow-sm shadow-purple-100/50 dark:shadow-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Brand */}
          <div 
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-pink-500 to-amber-400 p-0.5 shadow-lg shadow-purple-500/20 group-hover:scale-105 transition">
              <div className="w-full h-full bg-white dark:bg-[#0c0a1d] rounded-[10px] flex items-center justify-center">
                <Code2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-[#1e1535] dark:text-white group-hover:text-purple-600 transition">
                CodeTrack
              </span>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-purple-600 dark:text-pink-400 block -mt-1">
                Classroom Multi-Platform
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                    isActive
                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300 border border-purple-200 dark:border-purple-500/40 shadow-sm'
                      : 'text-[#5e5675] dark:text-purple-200/70 hover:text-[#1e1535] dark:hover:text-white hover:bg-purple-50 dark:hover:bg-purple-950/40'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-purple-600 dark:text-purple-400' : 'text-[#8a7f9e] dark:text-purple-300/60'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Side: Theme Switcher & Admin Auth Status */}
          <div className="flex items-center gap-3">
            
            {/* Theme Switcher Toggle Button */}
            <button
              onClick={onToggleTheme}
              className="p-2.5 rounded-xl border border-purple-200 dark:border-[#2f2954] bg-purple-50 dark:bg-[#1f1b3c] text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-[#28234c] transition shadow-sm"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-purple-600" />
              )}
            </button>

            {currentUser ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex flex-col items-end text-xs">
                  <span className="font-bold text-[#1e1535] dark:text-white">{currentUser.name}</span>
                  <span className="text-[10px] text-purple-600 dark:text-pink-400 font-mono uppercase font-bold">
                    {currentUser.role === 'super_admin' ? 'Super Admin' : `${currentUser.department} HOD`}
                  </span>
                </div>
                <button
                  onClick={onLogout}
                  className="p-2 text-[#8a7f9e] dark:text-purple-300/70 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenLogin}
                className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 text-white font-bold rounded-xl text-xs transition shadow-md shadow-purple-500/20"
              >
                <LogIn className="w-4 h-4" />
                <span>Admin Login</span>
              </button>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};
