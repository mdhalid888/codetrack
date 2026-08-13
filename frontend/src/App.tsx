import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { GlobalPlatformBar } from './components/GlobalPlatformBar';
import { AdminLoginModal } from './components/AdminLoginModal';
import { Dashboard } from './pages/Dashboard';
import { Leaderboard } from './pages/Leaderboard';
import { Compare } from './pages/Compare';
import { Attendance } from './pages/Attendance';
import { DatabaseScanner } from './pages/DatabaseScanner';
import { syncStudents } from './services/api';
import type { PlatformType, AdminUser } from './types';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [globalPlatform, setGlobalPlatform] = useState<PlatformType>('leetcode');
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const [isLoginOpen, setIsLoginOpen] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);

  // Theme State ('dark' | 'light')
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('codetrack_theme') as 'dark' | 'light') || 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('codetrack_theme', theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleTriggerInstantSync = async () => {
    setIsSyncing(true);
    try {
      await syncStudents();
      setRefreshKey(prev => prev + 1);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('codetrack_admin_user');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('codetrack_admin_user');
      }
    }
  }, []);

  const handleLoginSuccess = (user: AdminUser, token: string) => {
    setCurrentUser(user);
    localStorage.setItem('codetrack_admin_user', JSON.stringify(user));
    localStorage.setItem('codetrack_admin_token', token);
    setActiveTab('leaderboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('codetrack_admin_user');
    localStorage.removeItem('codetrack_admin_token');
    setActiveTab('dashboard');
  };

  return (
    <div className="min-h-screen bg-[#f4effc] dark:bg-[#0c0a1d] text-[#1e1535] dark:text-white flex flex-col selection:bg-purple-500 selection:text-white transition-colors duration-300">
      
      {/* 1. Main Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onOpenLogin={() => setIsLoginOpen(true)}
        onLogout={handleLogout}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* 2. Sticky Global Platform Selector Header Sub-Bar */}
      <GlobalPlatformBar
        currentPlatform={globalPlatform}
        onSelectPlatform={(p) => setGlobalPlatform(p)}
        onSyncNow={handleTriggerInstantSync}
        isSyncing={isSyncing}
      />

      {/* 3. Page Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {activeTab === 'dashboard' && (
          <Dashboard
            onNavigateToLeaderboard={() => setActiveTab('leaderboard')}
            currentUser={currentUser}
            platform={globalPlatform}
            refreshKey={refreshKey}
          />
        )}

        {activeTab === 'leaderboard' && (
          <Leaderboard
            currentUser={currentUser}
            platform={globalPlatform}
            refreshKey={refreshKey}
          />
        )}

        {activeTab === 'compare' && (
          <Compare
            platform={globalPlatform}
            refreshKey={refreshKey}
          />
        )}

        {activeTab === 'attendance' && (
          <Attendance
            refreshKey={refreshKey}
          />
        )}

        {activeTab === 'scanner' && currentUser && (
          <DatabaseScanner
            onRosterUpdated={handleTriggerInstantSync}
          />
        )}
      </main>

      <footer className="bg-white/80 dark:bg-[#15122b] border-t border-[#e9dff7] dark:border-[#252044] py-6 text-center text-xs text-[#6e6485] dark:text-purple-300/70 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} CodeTrack Classroom — Multi-Platform Coding Performance Tracker</p>
          <div className="flex items-center gap-4 text-[#8a7f9e] dark:text-purple-300/60 font-semibold">
            <span>LeetCode</span> • <span>CodeChef</span> • <span>HackerRank</span> • <span>GitHub</span>
          </div>
        </div>
      </footer>

      <AdminLoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
};

export default App;
