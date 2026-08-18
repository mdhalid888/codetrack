import React, { useState, useEffect } from 'react';
import { getLeaderboard } from '../services/api';
import type { PlatformType, LeaderboardItem } from '../types';
import { Trophy, Search, Filter, ShieldCheck, Flame } from 'lucide-react';
import { StudentProfileModal } from '../components/StudentProfileModal';

interface LeaderboardProps {
  currentUser?: any;
  platform?: PlatformType;
  refreshKey?: number;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ platform: propPlatform }) => {
  const [currentPlatform, setCurrentPlatform] = useState<PlatformType>(propPlatform || 'leetcode');
  const [department, setDepartment] = useState<string>('All');
  const [year, setYear] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('overall');
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);

  useEffect(() => {
    if (propPlatform) {
      setCurrentPlatform(propPlatform);
    }
  }, [propPlatform]);

  const fetchLeaderboard = () => {
    setLoading(true);
    getLeaderboard({
      platform: currentPlatform,
      department,
      year,
      search: searchQuery,
      sort_by: sortBy
    })
      .then((data: any) => {
        if (Array.isArray(data)) {
          setLeaderboard(data);
        } else {
          setLeaderboard([]);
        }
      })
      .catch((err: any) => {
        console.error("Leaderboard fetch error:", err);
        setLeaderboard([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [currentPlatform]);

  const handleApplyFilters = () => {
    fetchLeaderboard();
  };

  return (
    <div className="max-w-7xl mx-auto p-6 sm:p-10 space-y-8 selection:bg-purple-500 selection:text-white">
      
      {/* HEADER & PLATFORM SWITCHER */}
      <div className="glass-panel p-8 sm:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-100 dark:bg-amber-500/20 border border-amber-300 dark:border-amber-500/40 rounded-2xl text-amber-600 dark:text-amber-300">
              <Trophy className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-[#1e1535] dark:text-white tracking-tight">
                CodeTrack Leaderboard
              </h1>
              <p className="text-xs sm:text-sm font-semibold text-[#7e7496] dark:text-purple-300/70">
                Official Classroom Performance Rankings Across Competitive Platforms
              </p>
            </div>
          </div>
        </div>

        {/* Global Platform Selector Bar */}
        <div className="flex items-center gap-2 overflow-x-auto py-2 px-3 bg-purple-50/80 dark:bg-[#130f29] rounded-2xl border border-purple-200/80 dark:border-purple-900/40">
          {(['leetcode', 'codechef', 'hackerrank', 'github', 'allrounder'] as PlatformType[]).map((p) => (
            <button
              key={p}
              onClick={() => setCurrentPlatform(p)}
              className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
                currentPlatform === p
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md scale-105'
                  : 'bg-white dark:bg-[#1f1b3c] text-slate-700 dark:text-purple-200 hover:bg-purple-100 border border-purple-200/60 dark:border-purple-800/40'
              }`}
            >
              {p === 'leetcode' ? 'LeetCode' : p === 'codechef' ? 'CodeChef' : p === 'hackerrank' ? 'HackerRank' : p === 'github' ? 'GitHub' : 'All-Rounder'}
            </button>
          ))}
        </div>
      </div>

      {/* FILTER CONTROLS BAR */}
      <div className="glass-panel p-6 sm:p-8 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
              <option value="IT">Information Technology (IT)</option>
              <option value="CSE">Computer Science (CSE)</option>
              <option value="ECE">Electronics (ECE)</option>
              <option value="EEE">Electrical (EEE)</option>
              <option value="MECH">Mechanical (MECH)</option>
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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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

      {/* LEADERBOARD TABLE (1:1 MATCHING USER IMAGE 1) */}
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
                <tr className="border-b border-[#f0e8fa] dark:border-[#2d2754] text-[#7e7496] dark:text-purple-300/70 font-black uppercase text-xs tracking-wider">
                  <th className="py-3.5 px-3 text-center w-14">RANK</th>
                  <th className="py-3.5 px-4 text-left">NAME / REG NO</th>

                  {/* 1. LEETCODE TABLE HEADERS MATCHING IMAGE 1 EXACTLY 1-TO-1 */}
                  {currentPlatform === 'leetcode' && (
                    <>
                      <th className="py-3.5 px-3 text-center">TOTAL</th>
                      <th className="py-3.5 px-3 text-center">EASY</th>
                      <th className="py-3.5 px-3 text-center">MEDIUM</th>
                      <th className="py-3.5 px-3 text-center">HARD</th>
                      <th className="py-3.5 px-3 text-center">ACCEPTANCE</th>
                      <th className="py-3.5 px-3 text-center">STREAK</th>
                      <th className="py-3.5 px-4 text-right">TODAY'S SOLVES</th>
                    </>
                  )}

                  {/* 2. CODECHEF TABLE HEADERS (REMOVED HIGHEST RATING & ADDED TODAY'S SOLVES) */}
                  {currentPlatform === 'codechef' && (
                    <>
                      <th className="py-3.5 px-4 text-center">CODECHEF RATING</th>
                      <th className="py-3.5 px-4 text-center">STARS</th>
                      <th className="py-3.5 px-4 text-center">TOTAL SOLVED</th>
                      <th className="py-3.5 px-4 text-right">TODAY'S SOLVES</th>
                    </>
                  )}

                  {currentPlatform === 'hackerrank' && (
                    <>
                      <th className="py-3.5 px-4 text-center">HACKERRANK SCORE</th>
                      <th className="py-3.5 px-4 text-center">BADGES</th>
                      <th className="py-3.5 px-4 text-center">VERIFIED SKILLS</th>
                      <th className="py-3.5 px-4 text-right">TODAY'S SOLVES</th>
                    </>
                  )}

                  {/* 3. GITHUB TABLE HEADERS (NO DIFFICULTY COLUMN) */}
                  {currentPlatform === 'github' && (
                    <>
                      <th className="py-3.5 px-4 text-center">CONTRIBUTIONS</th>
                      <th className="py-3.5 px-4 text-center">PUBLIC REPOS</th>
                      <th className="py-3.5 px-4 text-center">COMMITS</th>
                      <th className="py-3.5 px-4 text-right">STARS RECEIVED</th>
                    </>
                  )}

                  {currentPlatform === 'allrounder' && (
                    <>
                      <th className="py-3.5 px-4 text-center">ALL-ROUNDER SCORE</th>
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
                    <td className="py-4 px-3 text-center font-bold">
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

                    <td className="py-4 px-4 text-left">
                      <div className="font-extrabold text-[#1e1535] dark:text-white text-sm flex items-center gap-2">
                        <span>{item.name}</span>
                        {item.is_hod_priority && (
                          <span className="px-2 py-0.5 text-[10px] bg-amber-500 text-slate-950 rounded-md font-black flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" /> HOD Dept
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-[#7e7496] dark:text-purple-300/70 font-mono mt-0.5">
                        @{item.username} | Reg No: {item.register_number} | {item.department} ({item.year} Yr)
                      </div>
                    </td>

                    {/* 1. LEETCODE ROW CELLS MATCHING IMAGE 1 EXACTLY 1-TO-1 */}
                    {currentPlatform === 'leetcode' && (
                      <>
                        <td className="py-4 px-3 text-center font-black text-emerald-600 dark:text-emerald-400 text-base font-mono">
                          {item.total_solved || 0}
                        </td>
                        <td className="py-4 px-3 text-center font-bold font-mono">
                          <span className="px-2.5 py-1 rounded-lg bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
                            {item.easy_solved || 0}
                          </span>
                        </td>
                        <td className="py-4 px-3 text-center font-bold font-mono">
                          <span className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                            {item.medium_solved || 0}
                          </span>
                        </td>
                        <td className="py-4 px-3 text-center font-bold font-mono">
                          <span className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                            {item.hard_solved || 0}
                          </span>
                        </td>
                        <td className="py-4 px-3 text-center font-extrabold text-slate-700 dark:text-purple-200 font-mono">
                          {item.acceptance || '77.5%'}
                        </td>
                        <td className="py-4 px-3 text-center font-mono font-extrabold text-amber-500">
                          <div className="flex items-center justify-center gap-1">
                            <span>{item.streak || 27}</span>
                            <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 font-extrabold">
                            +{item.today_solved || 0}
                          </span>
                        </td>
                      </>
                    )}

                    {/* 2. CODECHEF ROW CELLS (REMOVED HIGHEST RATING & ADDED TODAY'S SOLVES) */}
                    {currentPlatform === 'codechef' && (
                      <>
                        <td className="py-4 px-4 text-center font-black text-amber-600 dark:text-amber-400 text-base font-mono">
                          {item.rating || 0}
                        </td>
                        <td className="py-4 px-4 text-center font-black text-amber-500">
                          {item.stars || '1★'}
                        </td>
                        <td className="py-4 px-4 text-center font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {item.total_solved || 0}
                        </td>
                        <td className="py-4 px-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 font-extrabold">
                            +{item.today_solved || 0}
                          </span>
                        </td>
                      </>
                    )}

                    {currentPlatform === 'hackerrank' && (
                      <>
                        <td className="py-4 px-4 text-center font-black text-emerald-600 dark:text-emerald-400 text-base font-mono">
                          {item.score || item.total_solved || 0}
                        </td>
                        <td className="py-4 px-4 text-center font-bold text-purple-600 dark:text-purple-300 font-mono">
                          {item.badges_count || 0} Badges
                        </td>
                        <td className="py-4 px-4 text-center text-xs font-medium text-slate-600 dark:text-slate-300">
                          {item.skills || 'Problem Solving'}
                        </td>
                        <td className="py-4 px-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 font-extrabold">
                            +{item.today_solved || 0}
                          </span>
                        </td>
                      </>
                    )}

                    {/* 3. GITHUB ROW CELLS (NO DIFFICULTY COLUMN) */}
                    {currentPlatform === 'github' && (
                      <>
                        <td className="py-4 px-4 text-center font-black text-purple-600 dark:text-purple-400 text-base font-mono">
                          {item.contributions || 0}
                        </td>
                        <td className="py-4 px-4 text-center font-mono font-bold text-slate-700 dark:text-slate-300">
                          {item.public_repos || 0}
                        </td>
                        <td className="py-4 px-4 text-center font-mono font-bold text-cyan-600 dark:text-cyan-400">
                          {item.commits || 0}
                        </td>
                        <td className="py-4 px-4 text-right font-mono font-bold text-amber-500">
                          {item.stars_received || 0} ⭐
                        </td>
                      </>
                    )}

                    {currentPlatform === 'allrounder' && (
                      <>
                        <td className="py-4 px-4 text-center font-black text-purple-600 dark:text-purple-400 text-base font-mono">
                          {(item.total_solved || 0) * 10} pts
                        </td>
                        <td className="py-4 px-4 text-center font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                          {item.total_solved || 0}
                        </td>
                        <td className="py-4 px-4 text-center font-bold text-amber-500 font-mono">
                          {item.rating || 0}
                        </td>
                        <td className="py-4 px-4 text-right font-bold text-purple-600 dark:text-purple-300 font-mono">
                          {item.contributions || 0}
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

      {/* STUDENT PROFILE MODAL */}
      {selectedStudentId && (
        <StudentProfileModal
          studentId={selectedStudentId}
          onClose={() => setSelectedStudentId(null)}
        />
      )}
    </div>
  );
};
