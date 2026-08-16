import React, { useState, useEffect } from 'react';
import type { PlatformType, LeaderboardItem, AdminUser } from '../types';
import { getLeaderboard } from '../services/api';
import { StudentProfileModal } from '../components/StudentProfileModal';
import { Trophy, Filter, Search, ShieldCheck } from 'lucide-react';

interface LeaderboardProps {
  currentUser?: AdminUser | null;
  platform?: PlatformType;
  onSelectPlatform?: (platform: PlatformType) => void;
  refreshKey?: number;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ 
  currentUser,
  platform: externalPlatform,
  refreshKey = 0
}) => {
  const currentPlatform = externalPlatform || 'leetcode';

  const [department, setDepartment] = useState<string>('All');
  const [year, setYear] = useState<string>('All');
  const [search, setSearch] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('overall');

  const [appliedDept, setAppliedDept] = useState<string>('All');
  const [appliedYear, setAppliedYear] = useState<string>('All');

  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);

  const fetchLeaderboardData = (p: PlatformType, dept: string, yr: string, q: string, sort: string) => {
    setLoading(true);
    const role = currentUser?.role || '';
    const userDept = currentUser?.department || '';

    getLeaderboard(p, dept, yr, 'All', q, role, userDept, sort)
      .then(res => setLeaderboard(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLeaderboardData(currentPlatform, appliedDept, appliedYear, search, sortBy);
  }, [currentPlatform, appliedDept, appliedYear, search, sortBy, currentUser, refreshKey]);

  const handleApplyFilters = () => {
    setAppliedDept(department);
    setAppliedYear(year);
  };

  return (
    <div className="space-y-7 pb-12 animate-fade-in">
      
      {/* Header Banner with Platform Selector */}
      <div className="glass-panel p-7 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 bg-gradient-to-r from-purple-100/60 via-white to-pink-100/60 dark:from-[#171430] dark:to-[#221b47]">
        <div>
          <div className="flex items-center gap-2 text-[#7e7496] dark:text-purple-300 text-xs font-bold uppercase tracking-wider mb-1">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>CLASSROOM RANKINGS</span>
          </div>
          <h1 className="text-3xl font-black text-[#1e1535] dark:text-white">
            Class Leaderboard
          </h1>
          <p className="text-xs sm:text-sm text-[#5e5675] dark:text-purple-200/70 mt-1 font-medium">
            Real-time student rankings across all platforms with instant solve updates.
          </p>
        </div>
      </div>

      {/* FILTER & SORT BAR */}
      <div className="glass-panel p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-extrabold text-[#5e5675] dark:text-purple-200/70 uppercase mb-1">
              Department
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full bg-[#f8f5fd] dark:bg-[#120f26] border border-[#e9dff7] dark:border-[#272248] rounded-xl px-4 py-2.5 text-xs text-[#1e1535] dark:text-white font-bold focus:outline-none focus:border-purple-500 transition"
            >
              <option value="All">All Departments</option>
              <option value="CCE">CCE</option>
              <option value="IT">IT</option>
              <option value="CSE">CSE</option>
              <option value="ECE">ECE</option>
              <option value="EEE">EEE</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-[#5e5675] dark:text-purple-200/70 uppercase mb-1">
              Academic Year
            </label>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full bg-[#f8f5fd] dark:bg-[#120f26] border border-[#e9dff7] dark:border-[#272248] rounded-xl px-4 py-2.5 text-xs text-[#1e1535] dark:text-white font-bold focus:outline-none focus:border-purple-500 transition"
            >
              <option value="All">All Years (1st-4th)</option>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-[#5e5675] dark:text-purple-200/70 uppercase mb-1">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-[#f8f5fd] dark:bg-[#120f26] border border-[#e9dff7] dark:border-[#272248] rounded-xl px-4 py-2.5 text-xs text-[#1e1535] dark:text-white font-bold focus:outline-none focus:border-purple-500 transition"
            >
              <option value="overall">Total Solves / Overall Score</option>
              <option value="today">Today's Solves</option>
              <option value="easy">Easy Solves</option>
              <option value="medium">Medium Solves</option>
              <option value="hard">Hard Solves</option>
              <option value="streak">Active Streak</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-[#5e5675] dark:text-purple-200/70 uppercase mb-1">
              Search Student
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-[#8a7f9e] dark:text-purple-300 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search name or reg no..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#f8f5fd] dark:bg-[#120f26] border border-[#e9dff7] dark:border-[#272248] rounded-xl pl-9 pr-4 py-2.5 text-xs text-[#1e1535] dark:text-white font-medium focus:outline-none focus:border-purple-500 transition"
              />
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={handleApplyFilters}
            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-purple-500/20"
          >
            <span>Apply Filters</span>
            <Filter className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* LEADERBOARD TABLE */}
      <div className="glass-panel p-6 sm:p-8">
        {loading ? (
          <div className="p-12 text-center text-[#7e7496] dark:text-purple-300/70 text-sm font-medium">
            Loading leaderboard data...
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="p-12 text-center text-[#7e7496] dark:text-purple-300/70 text-sm">
            No students found matching current filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-[#f0e8fa] dark:border-[#2d2754] text-[#7e7496] dark:text-purple-300/70 font-extrabold uppercase text-xs tracking-wider">
                  <th className="py-3.5 px-4 text-center w-14">RANK</th>
                  <th className="py-3.5 px-4">STUDENT NAME</th>
                  <th className="py-3.5 px-4">REG NUMBER</th>
                  <th className="py-3.5 px-4 text-center">CLASSROOM</th>

                  {currentPlatform === 'leetcode' && (
                    <>
                      <th className="py-3.5 px-4 text-right">SOLVED (E/M/H)</th>
                      <th className="py-3.5 px-4 text-center">RATING</th>
                      <th className="py-3.5 px-4 text-center">ACTIVE DAYS</th>
                      <th className="py-3.5 px-4 text-right">GLOBAL RANK</th>
                    </>
                  )}

                  {currentPlatform === 'codechef' && (
                    <>
                      <th className="py-3.5 px-4 text-right">CODECHEF RATING</th>
                      <th className="py-3.5 px-4 text-center">STARS</th>
                      <th className="py-3.5 px-4 text-center">HIGHEST RATING</th>
                      <th className="py-3.5 px-4 text-right">SOLVED</th>
                    </>
                  )}

                  {currentPlatform === 'hackerrank' && (
                    <>
                      <th className="py-3.5 px-4 text-right">HACKERRANK SCORE</th>
                      <th className="py-3.5 px-4 text-center">BADGES</th>
                      <th className="py-3.5 px-4 text-center">VERIFIED SKILLS</th>
                      <th className="py-3.5 px-4 text-right">CHALLENGES</th>
                    </>
                  )}

                  {currentPlatform === 'github' && (
                    <>
                      <th className="py-3.5 px-4 text-right">CONTRIBUTIONS</th>
                      <th className="py-3.5 px-4 text-center">PUBLIC REPOS</th>
                      <th className="py-3.5 px-4 text-center">COMMITS</th>
                      <th className="py-3.5 px-4 text-right">STARS RECEIVED</th>
                    </>
                  )}

                  {currentPlatform === 'allrounder' && (
                    <>
                      <th className="py-3.5 px-4 text-right">ALL-ROUNDER SCORE</th>
                      <th className="py-3.5 px-4 text-center">LEETCODE</th>
                      <th className="py-3.5 px-4 text-center">CODECHEF</th>
                      <th className="py-3.5 px-4 text-right">GITHUB</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0e8fa] dark:divide-[#252044]">
                {leaderboard.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => setSelectedStudentId(item.id)}
                    className="hover:bg-purple-50/60 dark:hover:bg-purple-950/30 transition cursor-pointer"
                  >
                    <td className="py-4 px-4 text-center font-bold">
                      {item.rank === 1 ? (
                        <span className="w-7 h-7 mx-auto flex items-center justify-center rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-500/40 text-xs font-bold">🥇</span>
                      ) : item.rank === 2 ? (
                        <span className="w-7 h-7 mx-auto flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-300/20 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-400/40 text-xs font-bold">🥈</span>
                      ) : item.rank === 3 ? (
                        <span className="w-7 h-7 mx-auto flex items-center justify-center rounded-full bg-amber-100 dark:bg-amber-700/20 text-amber-800 dark:text-amber-400 border border-amber-300 dark:border-amber-600/40 text-xs font-bold">🥉</span>
                      ) : (
                        <span className="text-[#8a7f9e] font-mono font-bold">#{item.rank}</span>
                      )}
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-extrabold text-[#1e1535] dark:text-white text-base flex items-center gap-2">
                        <span>{item.name}</span>
                        {item.is_hod_priority && (
                          <span className="px-2 py-0.5 text-[10px] bg-amber-500 text-slate-950 rounded-md font-black flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" /> HOD Dept
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-[#7e7496] dark:text-purple-300/70 font-mono mt-0.5">{item.username}</div>
                    </td>

                    <td className="py-4 px-4 font-mono font-bold text-[#42395c] dark:text-purple-200/90">
                      {item.register_number}
                    </td>

                    <td className="py-4 px-4 text-center">
                      <span className="px-2.5 py-1 text-xs font-bold bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 rounded-lg border border-purple-200 dark:border-purple-800">
                        {item.department} - {item.year} Yr
                      </span>
                    </td>

                    {currentPlatform === 'leetcode' && (
                      <>
                        <td className="py-4 px-4 text-right font-black text-amber-600 dark:text-amber-400 text-base">
                          {item.total_solved || 0}
                          <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                            E:{item.easy_solved || 0} M:{item.medium_solved || 0} H:{item.hard_solved || 0}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center font-bold text-purple-600 dark:text-purple-300">
                          {item.rating || '-'}
                        </td>
                        <td className="py-4 px-4 text-center font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
                          {item.active_days || 0} days
                        </td>
                        <td className="py-4 px-4 text-right font-mono text-xs text-slate-600 dark:text-slate-400">
                          {item.global_rank || 'N/A'}
                        </td>
                      </>
                    )}

                    {currentPlatform === 'codechef' && (
                      <>
                        <td className="py-4 px-4 text-right font-black text-amber-600 dark:text-amber-400 text-base">
                          {item.rating || 0}
                        </td>
                        <td className="py-4 px-4 text-center font-black text-amber-500">
                          {item.stars || '1★'}
                        </td>
                        <td className="py-4 px-4 text-center font-bold text-slate-700 dark:text-slate-300 font-mono">
                          {item.highest_rating || item.rating || 0}
                        </td>
                        <td className="py-4 px-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {item.total_solved || 0}
                        </td>
                      </>
                    )}

                    {currentPlatform === 'hackerrank' && (
                      <>
                        <td className="py-4 px-4 text-right font-black text-emerald-600 dark:text-emerald-400 text-base">
                          {item.score || item.total_solved || 0}
                        </td>
                        <td className="py-4 px-4 text-center font-bold text-purple-600 dark:text-purple-300 font-mono">
                          {item.badges_count || 0} Badges
                        </td>
                        <td className="py-4 px-4 text-center text-xs font-medium text-slate-600 dark:text-slate-300">
                          {item.skills || 'Problem Solving'}
                        </td>
                        <td className="py-4 px-4 text-right font-mono font-bold text-cyan-600 dark:text-cyan-400">
                          {item.total_solved || 0}
                        </td>
                      </>
                    )}

                    {currentPlatform === 'github' && (
                      <>
                        <td className="py-4 px-4 text-right font-black text-purple-600 dark:text-purple-400 text-base">
                          {item.contributions || 0}
                        </td>
                        <td className="py-4 px-4 text-center font-mono font-bold text-slate-700 dark:text-slate-300">
                          {item.public_repos || 0} repos
                        </td>
                        <td className="py-4 px-4 text-center font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                          {item.commits || 0} commits
                        </td>
                        <td className="py-4 px-4 text-right font-mono text-amber-500 font-bold">
                          ★ {item.stars_received || 0}
                        </td>
                      </>
                    )}

                    {currentPlatform === 'allrounder' && (
                      <>
                        <td className="py-4 px-4 text-right font-black text-pink-600 dark:text-pink-400 text-lg">
                          {(item.overall_score || 0).toFixed(1)} / 100
                        </td>
                        <td className="py-4 px-4 text-center font-bold text-amber-600 dark:text-amber-400 font-mono">
                          {item.total_solved || 0} solves
                        </td>
                        <td className="py-4 px-4 text-center font-bold text-amber-500 font-mono">
                          {item.codechef_rating || item.rating || 0} rating
                        </td>
                        <td className="py-4 px-4 text-right font-bold text-purple-600 dark:text-purple-400 font-mono">
                          {item.contributions || 0} contribs
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <StudentProfileModal
        studentId={selectedStudentId}
        onClose={() => setSelectedStudentId(null)}
      />

    </div>
  );
};
