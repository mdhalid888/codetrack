import React from 'react';
import type { PlatformType } from '../types';
import { LeetCodeLogo, CodeChefLogo, HackerRankLogo, GitHubLogo } from './PlatformLogos';
import { Trophy, RefreshCw } from 'lucide-react';

interface GlobalPlatformBarProps {
  currentPlatform: PlatformType;
  onSelectPlatform: (platform: PlatformType) => void;
  onSyncNow?: () => void;
  isSyncing?: boolean;
}

export const GlobalPlatformBar: React.FC<GlobalPlatformBarProps> = ({
  currentPlatform,
  onSelectPlatform,
  onSyncNow,
  isSyncing = false
}) => {
  const platforms: { id: PlatformType; label: string; logo: React.ReactNode; colorClass: string; activeBg: string }[] = [
    {
      id: 'leetcode',
      label: 'LeetCode',
      logo: <LeetCodeLogo className="w-5 h-5" />,
      colorClass: 'hover:text-amber-500',
      activeBg: 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/25 ring-2 ring-amber-400'
    },
    {
      id: 'codechef',
      label: 'CodeChef',
      logo: <CodeChefLogo className="w-5 h-5" />,
      colorClass: 'hover:text-amber-700',
      activeBg: 'bg-amber-800 text-white shadow-lg shadow-amber-900/25 ring-2 ring-amber-700'
    },
    {
      id: 'hackerrank',
      label: 'HackerRank',
      logo: <HackerRankLogo className="w-5 h-5" />,
      colorClass: 'hover:text-emerald-500',
      activeBg: 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/25 ring-2 ring-emerald-400'
    },
    {
      id: 'github',
      label: 'GitHub',
      logo: <GitHubLogo className="w-5 h-5" />,
      colorClass: 'hover:text-purple-500',
      activeBg: 'bg-purple-600 text-white shadow-lg shadow-purple-500/25 ring-2 ring-purple-400'
    },
    {
      id: 'allrounder',
      label: 'All-Rounder',
      logo: <Trophy className="w-5 h-5 text-amber-300" />,
      colorClass: 'hover:text-pink-500',
      activeBg: 'bg-gradient-to-r from-purple-600 via-pink-500 to-amber-500 text-white shadow-lg shadow-pink-500/25 ring-2 ring-pink-400'
    }
  ];

  return (
    <div className="sticky top-16 z-30 bg-white/90 dark:bg-[#15112e]/90 backdrop-blur-md border-b border-[#e9dff7] dark:border-[#27214a] shadow-sm py-2.5 px-4 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        
        {/* Left Label */}
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#6e6485] dark:text-purple-300/80">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Global Platform Selector:</span>
        </div>

        {/* Platform Option Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 w-full sm:w-auto">
          {platforms.map((p) => {
            const isActive = currentPlatform === p.id;
            return (
              <button
                key={p.id}
                onClick={() => onSelectPlatform(p.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-extrabold text-xs sm:text-sm transition-all duration-200 ${
                  isActive
                    ? p.activeBg
                    : 'bg-[#f4effc] dark:bg-[#1f1a3a] text-[#42395c] dark:text-purple-200 border border-[#e3d8f5] dark:border-[#2e2756] hover:bg-white dark:hover:bg-[#28224b]'
                }`}
              >
                {p.logo}
                <span>{p.label}</span>
              </button>
            );
          })}
        </div>

        {/* Live Instant Update & Sync Indicator Button */}
        {onSyncNow && (
          <button
            onClick={onSyncNow}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-500/30 rounded-xl text-xs font-bold hover:bg-purple-200 transition shrink-0"
            title="Instantly Refresh & Sync Student Stats Across All Platforms"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-purple-600' : ''}`} />
            <span>{isSyncing ? 'Syncing Live...' : 'Instant Sync'}</span>
          </button>
        )}

      </div>
    </div>
  );
};
