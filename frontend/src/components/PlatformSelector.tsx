import React from 'react';
import type { PlatformType } from '../types';
import { Award } from 'lucide-react';
import { LeetCodeLogo, CodeChefLogo, HackerRankLogo, GitHubLogo } from './PlatformLogos';

interface PlatformSelectorProps {
  currentPlatform: PlatformType;
  onSelectPlatform: (platform: PlatformType) => void;
  showAllRounder?: boolean;
  className?: string;
}

export const PlatformSelector: React.FC<PlatformSelectorProps> = ({
  currentPlatform,
  onSelectPlatform,
  showAllRounder = true,
  className = ''
}) => {
  const platforms: { id: PlatformType; name: string; icon: React.ElementType; color: string; bgActive: string }[] = [
    { 
      id: 'leetcode', 
      name: 'LeetCode', 
      icon: LeetCodeLogo, 
      color: 'text-amber-500', 
      bgActive: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40 font-bold shadow-sm' 
    },
    { 
      id: 'codechef', 
      name: 'CodeChef', 
      icon: CodeChefLogo, 
      color: 'text-amber-700 dark:text-amber-500', 
      bgActive: 'bg-amber-100 text-amber-950 border-amber-300 dark:bg-amber-700/20 dark:text-amber-400 dark:border-amber-600/40 font-bold shadow-sm' 
    },
    { 
      id: 'hackerrank', 
      name: 'HackerRank', 
      icon: HackerRankLogo, 
      color: 'text-emerald-600 dark:text-emerald-400', 
      bgActive: 'bg-emerald-100 text-emerald-950 border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/40 font-bold shadow-sm' 
    },
    { 
      id: 'github', 
      name: 'GitHub', 
      icon: GitHubLogo, 
      color: 'text-purple-600 dark:text-purple-400', 
      bgActive: 'bg-purple-100 text-purple-950 border-purple-300 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-500/40 font-bold shadow-sm' 
    },
  ];

  if (showAllRounder) {
    platforms.push({
      id: 'allrounder',
      name: '🏆 All-Rounder',
      icon: Award,
      color: 'text-pink-600 dark:text-pink-400',
      bgActive: 'bg-gradient-to-r from-pink-100 to-purple-100 text-purple-950 border-pink-300 dark:from-pink-500/20 dark:to-purple-500/20 dark:text-pink-300 dark:border-pink-500/40 font-bold shadow-sm'
    });
  }

  return (
    <div className={`flex flex-wrap items-center gap-2 p-1.5 bg-white/90 dark:bg-[#15122b]/90 rounded-2xl border border-[#e9dff7] dark:border-[#252044] shadow-sm ${className}`}>
      <span className="text-xs font-bold uppercase tracking-wider text-[#7e7496] dark:text-purple-300/70 px-3 hidden sm:inline">
        Platform:
      </span>
      <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
        {platforms.map((p) => {
          const Icon = p.icon;
          const isActive = currentPlatform === p.id;
          return (
            <button
              key={p.id}
              onClick={() => onSelectPlatform(p.id)}
              className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold rounded-xl border transition-all duration-200 ${
                isActive
                  ? p.bgActive
                  : 'border-transparent text-[#5e5675] dark:text-purple-200/70 hover:text-[#1e1535] dark:hover:text-white hover:bg-purple-50 dark:hover:bg-[#1f1b3c]'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{p.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
