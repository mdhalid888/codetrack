import React, { useState, useEffect } from 'react';
import type { PlatformType, AdminUser } from '../types';
import { getDashboardSummary, createNotice, deleteNotice, getTaskHistory } from '../services/api';
import { StudentProfileModal } from '../components/StudentProfileModal';
import { LeetCodeLogo, CodeChefLogo, HackerRankLogo, GitHubLogo } from '../components/PlatformLogos';
import { 
  Filter, Trophy, Activity, ArrowUpRight, Flame, Clock, 
  ExternalLink, Sparkles, Bell, Code, Award, Pin, Plus, Trash2, FileText, Link as LinkIcon, History, X 
} from 'lucide-react';

interface DashboardProps {
  onNavigateToLeaderboard?: () => void;
  currentUser?: AdminUser | null;
  platform?: PlatformType;
  onSelectPlatform?: (platform: PlatformType) => void;
  refreshKey?: number;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  onNavigateToLeaderboard, 
  currentUser,
  platform: externalPlatform,
  refreshKey = 0
}) => {
  const currentPlatform = externalPlatform || 'leetcode';

  const [department, setDepartment] = useState<string>('All');
  const [year, setYear] = useState<string>('All');
  const [appliedDept, setAppliedDept] = useState<string>('All');
  const [appliedYear, setAppliedYear] = useState<string>('All');

  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);

  // Notice Board State
  const [notices, setNotices] = useState<any[]>([]);
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState<boolean>(false);
  const [noticeTitle, setNoticeTitle] = useState<string>('');
  const [noticeMsg, setNoticeMsg] = useState<string>('');
  const [noticeLink, setNoticeLink] = useState<string>('');
  const [noticeFile, setNoticeFile] = useState<string>('');
  const [noticeSubmitting, setNoticeSubmitting] = useState<boolean>(false);

  // Task History State
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState<boolean>(false);
  const [taskHistory, setTaskHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState<boolean>(false);

  const fetchSummary = (p: PlatformType, dept: string, yr: string) => {
    setLoading(true);
    getDashboardSummary(p, dept, yr)
      .then(data => {
        setSummary(data);
        if (data.notices) setNotices(data.notices);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSummary(currentPlatform, appliedDept, appliedYear);
  }, [currentPlatform, appliedDept, appliedYear, refreshKey]);

  const handleApplyFilters = () => {
    setAppliedDept(department);
    setAppliedYear(year);
  };

  const handleOpenHistory = async () => {
    setIsHistoryModalOpen(true);
    setHistoryLoading(true);
    try {
      const historyData = await getTaskHistory();
      setTaskHistory(historyData);
    } catch (err) {
      console.error(err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleCreateNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeTitle || !noticeMsg) return;
    setNoticeSubmitting(true);
    try {
      const res = await createNotice({
        title: noticeTitle,
        message: noticeMsg,
        link: noticeLink,
        file_name: noticeFile,
        posted_by: currentUser?.name || 'Admin'
      });
      setNotices([res.notice, ...notices]);
      setIsNoticeModalOpen(false);
      setNoticeTitle('');
      setNoticeMsg('');
      setNoticeLink('');
      setNoticeFile('');
    } catch (err: any) {
      alert(err.message || 'Failed to post notice');
    } finally {
      setNoticeSubmitting(false);
    }
  };

  const handleDeleteNotice = async (id: number) => {
    if (!confirm('Are you sure you want to delete this notice?')) return;
    try {
      await deleteNotice(id);
      setNotices(notices.filter(n => n.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete notice');
    }
  };

  const currentDateStr = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: '2-digit',
    year: 'numeric'
  });

  const renderPlatformBadge = (plat: string) => {
    const p = (plat || '').toLowerCase();
    if (p === 'leetcode') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-black bg-amber-100 dark:bg-amber-500/20 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30">
          <LeetCodeLogo className="w-3.5 h-3.5" />
          <span>LeetCode</span>
        </span>
      );
    }
    if (p === 'codechef') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-black bg-amber-900/10 dark:bg-amber-700/20 text-amber-950 dark:text-amber-400 border border-amber-400/40">
          <CodeChefLogo className="w-3.5 h-3.5" />
          <span>CodeChef</span>
        </span>
      );
    }
    if (p === 'hackerrank') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-black bg-emerald-100 dark:bg-emerald-500/20 text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30">
          <HackerRankLogo className="w-3.5 h-3.5" />
          <span>HackerRank</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-black bg-purple-100 dark:bg-purple-500/20 text-purple-900 dark:text-purple-300 border border-purple-300 dark:border-purple-500/30">
        <GitHubLogo className="w-3.5 h-3.5" />
        <span>GitHub</span>
      </span>
    );
  };

  return (
    <div className="space-y-7 pb-12 animate-fade-in">

      {/* Top Banner with Platform Selector */}
      <div className="glass-panel p-7 sm:p-9 relative overflow-hidden bg-gradient-to-r from-purple-100/70 via-white to-pink-100/70 dark:from-[#171430] dark:via-[#171430] dark:to-[#221b47]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-purple-700 dark:text-purple-400 text-xs font-extrabold uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4" />
              <span>Multi-Platform Classroom Analytics</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1e1535] dark:text-white tracking-tight">
              Classroom Coding Performance
            </h1>
            <p className="text-[#5e5675] dark:text-purple-200/70 text-sm sm:text-base mt-2 max-w-2xl font-medium">
              Track student daily solved statistics, top classroom solvers, recent activities, and milestone accomplishments across platforms.
            </p>
          </div>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="glass-panel p-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full md:w-auto flex-1">
            <div>
              <label className="block text-xs font-extrabold text-[#5e5675] dark:text-purple-200/70 uppercase mb-1.5 tracking-wider">
                Filter Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-[#f8f5fd] dark:bg-[#120f26] border border-[#e9dff7] dark:border-[#272248] rounded-2xl px-5 py-3 text-sm text-[#1e1535] dark:text-white font-bold focus:outline-none focus:border-purple-500 transition"
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
              <label className="block text-xs font-extrabold text-[#5e5675] dark:text-purple-200/70 uppercase mb-1.5 tracking-wider">
                Filter Academic Year
              </label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full bg-[#f8f5fd] dark:bg-[#120f26] border border-[#e9dff7] dark:border-[#272248] rounded-2xl px-5 py-3 text-sm text-[#1e1535] dark:text-white font-bold focus:outline-none focus:border-purple-500 transition"
              >
                <option value="All">All Years (1st-4th)</option>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>
            </div>
          </div>

          <div className="w-full md:w-auto pt-2 md:pt-5">
            <button
              onClick={handleApplyFilters}
              className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 text-white font-black rounded-2xl text-sm transition shadow-lg shadow-purple-500/25"
            >
              <span>Apply Filters</span>
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* TOP CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card text-center flex flex-col justify-between p-6 sm:p-7">
          <span className="text-xs font-extrabold tracking-widest text-[#7e7496] dark:text-purple-300/70 uppercase block mb-1">
            CLASSROOM
          </span>
          <div className="text-4xl sm:text-5xl font-black text-purple-600 dark:text-pink-400 my-2">
            {summary?.classroom || 'ALL'}
          </div>
          <div className="text-xs text-[#7e7496] dark:text-purple-300/70 flex items-center justify-center gap-1 pt-3 border-t border-[#f0e8fa] dark:border-[#2d2754] font-medium">
            <span>🎓 Mapped class database</span>
          </div>
        </div>

        <div className="glass-card text-center flex flex-col justify-between p-6 sm:p-7">
          <span className="text-xs font-extrabold tracking-widest text-[#7e7496] dark:text-purple-300/70 uppercase block mb-1">
            {currentPlatform === 'github' ? "TODAY'S COMMITS" : "TODAY'S SOLVES"}
          </span>
          <div className="text-4xl sm:text-5xl font-black text-amber-500 dark:text-amber-400 my-2">
            {loading ? '...' : (summary?.todays_solves || 0)}
          </div>
          <div className="text-xs text-[#7e7496] dark:text-purple-300/70 flex items-center justify-center gap-1 pt-3 border-t border-[#f0e8fa] dark:border-[#2d2754] font-medium">
            <span>📈 {currentPlatform === 'github' ? 'Commits pushed today' : 'Problems solved today'}</span>
          </div>
        </div>

        <div className="glass-card text-center flex flex-col justify-between p-6 sm:p-7">
          <span className="text-xs font-extrabold tracking-widest text-[#7e7496] dark:text-purple-300/70 uppercase block mb-1">
            {currentPlatform === 'github' ? 'TOTAL CONTRIBUTIONS' : `${currentPlatform.toUpperCase()} TOTAL SOLVES`}
          </span>
          <div className="text-4xl sm:text-5xl font-black text-cyan-600 dark:text-cyan-400 my-2">
            {loading ? '...' : (summary?.total_solves || 0)}
          </div>
          <div className="text-xs text-[#7e7496] dark:text-purple-300/70 flex items-center justify-center gap-1 pt-3 border-t border-[#f0e8fa] dark:border-[#2d2754] font-medium">
            <span>📚 {currentPlatform === 'github' ? 'Commits, PRs & issues' : 'Total solved aggregate'}</span>
          </div>
        </div>

        <div className="glass-card text-center flex flex-col justify-between p-6 sm:p-7">
          <span className="text-xs font-extrabold tracking-widest text-[#7e7496] dark:text-purple-300/70 uppercase block mb-1">
            {currentPlatform === 'leetcode' ? 'CLASS STREAK' : currentPlatform === 'codechef' ? 'MAX RATING & STARS' : currentPlatform === 'hackerrank' ? 'BADGES EARNED' : 'PUBLIC REPOS'}
          </span>
          <div className="text-3xl sm:text-4xl font-black text-purple-700 dark:text-purple-300 my-2 flex items-center justify-center gap-1">
            {currentPlatform === 'leetcode' && (
              <><span>29</span> <Flame className="w-7 h-7 text-amber-500 fill-amber-500 inline" /> <span className="text-sm text-[#7e7496] font-normal">days</span></>
            )}
            {currentPlatform === 'codechef' && (
              <><span>1980</span> <span className="text-sm text-amber-600 font-bold">(4★)</span></>
            )}
            {currentPlatform === 'hackerrank' && (
              <><span>110</span> <Award className="w-6 h-6 text-emerald-500 inline" /></>
            )}
            {currentPlatform === 'github' && (
              <><span>148</span> <Code className="w-6 h-6 text-purple-600 inline" /></>
            )}
          </div>
          <div className="text-xs text-[#7e7496] dark:text-purple-300/70 flex items-center justify-center gap-1 pt-3 border-t border-[#f0e8fa] dark:border-[#2d2754] font-medium">
            <span>
              {currentPlatform === 'leetcode' ? '🔥 Active coding streak' : currentPlatform === 'codechef' ? '🏆 Highest division rating' : currentPlatform === 'hackerrank' ? '🏅 Verified domain badges' : '📁 Projects developed'}
            </span>
          </div>
        </div>
      </div>

      {/* NOTICE BOARD & ASSESSMENT HUB */}
      <div className="glass-panel p-7 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-[#f0e8fa] dark:border-[#2d2754]">
          <div className="flex items-center gap-3">
            <Pin className="w-7 h-7 text-pink-500" />
            <div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-[#1e1535] dark:text-white">Classroom Notice Board & Assessment Hub</h3>
              <p className="text-xs sm:text-sm text-[#5e5675] dark:text-purple-200/70 font-medium mt-0.5">Official announcements, assessment test links, and resource files published by Faculty/Admin.</p>
            </div>
          </div>

          {currentUser && (
            <button
              onClick={() => setIsNoticeModalOpen(true)}
              className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 text-white font-bold rounded-2xl text-xs sm:text-sm flex items-center gap-1.5 transition shrink-0 shadow-md shadow-purple-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Post Announcement</span>
            </button>
          )}
        </div>

        {notices.length === 0 ? (
          <div className="p-8 text-center text-[#7e7496] dark:text-purple-300/70 text-sm">
            No notices or announcements posted yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {notices.map((n) => (
              <div key={n.id} className="p-5 bg-[#fcfaff] dark:bg-[#1c1836] border border-[#e9dff7] dark:border-[#2d2754] rounded-2xl flex flex-col justify-between gap-4 text-xs sm:text-sm">
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-extrabold text-[#1e1535] dark:text-white text-base leading-snug">{n.title}</h4>
                    {currentUser && (
                      <button
                        onClick={() => handleDeleteNotice(n.id)}
                        className="text-[#8a7f9e] hover:text-rose-600 transition"
                        title="Delete Notice"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <p className="text-[#42395c] dark:text-purple-200/80 leading-relaxed font-medium">{n.message}</p>
                </div>

                <div className="space-y-2 pt-3 border-t border-[#f0e8fa] dark:border-[#2b254a]">
                  <div className="flex flex-wrap items-center gap-2">
                    {n.link && (
                      <a
                        href={n.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-2 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200 border border-emerald-300 dark:border-emerald-500/40 rounded-xl font-bold text-xs flex items-center gap-1.5 transition"
                      >
                        <LinkIcon className="w-3.5 h-3.5" />
                        <span>Open Assessment Link</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}

                    {n.file_name && (
                      <a
                        href="#"
                        onClick={(e) => { e.preventDefault(); alert(`Downloading file: ${n.file_name}`); }}
                        className="px-3.5 py-2 bg-purple-100 dark:bg-purple-500/20 text-purple-800 dark:text-purple-300 hover:bg-purple-200 border border-purple-300 dark:border-purple-500/40 rounded-xl font-bold text-xs flex items-center gap-1.5 transition"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>{n.file_name}</span>
                      </a>
                    )}
                  </div>

                  <div className="text-xs font-mono text-[#8a7f9e] dark:text-purple-300/60 flex items-center gap-1 pt-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Posted {n.timestamp} by {n.posted_by}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* TWO COLUMN CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">

        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-7">

          {/* TOP CLASSROOM SOLVERS */}
          <div className="glass-panel p-7 sm:p-8">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-[#f0e8fa] dark:border-[#2d2754]">
              <div className="flex items-center gap-3">
                <Trophy className="w-6 h-6 text-amber-500" />
                <h3 className="text-xl sm:text-2xl font-extrabold text-[#1e1535] dark:text-white">
                  Top Classroom Solvers <span className="text-xs font-semibold text-[#7e7496] dark:text-purple-300/70">({currentPlatform.toUpperCase()})</span>
                </h3>
              </div>
              {onNavigateToLeaderboard && (
                <button
                  onClick={onNavigateToLeaderboard}
                  className="text-xs sm:text-sm font-bold text-purple-600 dark:text-purple-300 hover:underline flex items-center gap-1 transition"
                >
                  <span>View All</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              )}
            </div>

            {loading ? (
              <div className="p-10 text-center text-[#7e7496] dark:text-purple-300/70 text-sm">
                Loading top classroom solvers...
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-[#f0e8fa] dark:border-[#2d2754] text-[#7e7496] dark:text-purple-300/70 font-extrabold uppercase text-xs tracking-wider">
                      <th className="py-3.5 px-4 text-center w-14">RANK</th>
                      <th className="py-3.5 px-4">STUDENT</th>
                      <th className="py-3.5 px-4 text-right">{currentPlatform === 'github' ? 'CONTRIBS' : 'SOLVED'}</th>
                      <th className="py-3.5 px-4 text-center">BREAKDOWN</th>
                      <th className="py-3.5 px-4 text-right">ACTIVITY</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f0e8fa] dark:divide-[#252044]">
                    {summary?.top_5_solvers?.map((s: any) => (
                      <tr
                        key={s.id}
                        onClick={() => setSelectedStudentId(s.id)}
                        className="hover:bg-purple-50/60 dark:hover:bg-purple-950/30 transition cursor-pointer"
                      >
                        <td className="py-4 px-4 text-center font-bold">
                          {s.rank === 1 ? (
                            <span className="w-7 h-7 mx-auto flex items-center justify-center rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-500/40 text-xs font-bold">🥇</span>
                          ) : s.rank === 2 ? (
                            <span className="w-7 h-7 mx-auto flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-300/20 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-400/40 text-xs font-bold">🥈</span>
                          ) : s.rank === 3 ? (
                            <span className="w-7 h-7 mx-auto flex items-center justify-center rounded-full bg-amber-100 dark:bg-amber-700/20 text-amber-800 dark:text-amber-400 border border-amber-300 dark:border-amber-600/40 text-xs font-bold">🥉</span>
                          ) : (
                            <span className="text-[#8a7f9e] font-mono font-bold">#{s.rank}</span>
                          )}
                        </td>

                        <td className="py-4 px-4">
                          <div className="font-extrabold text-[#1e1535] dark:text-white text-base flex items-center gap-2">
                            <span>{s.name}</span>
                            <span className="px-2 py-0.5 text-xs bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 rounded-lg font-bold border border-purple-200 dark:border-purple-800">
                              {s.department} - {s.year} Yr
                            </span>
                          </div>
                          <div className="text-xs text-[#7e7496] dark:text-purple-300/70 font-mono mt-0.5">{s.username}</div>
                        </td>

                        <td className="py-4 px-4 text-right font-black text-cyan-600 dark:text-cyan-400 text-lg">
                          {s.solved}
                        </td>

                        <td className="py-4 px-4 text-center">
                          {currentPlatform === 'leetcode' ? (
                            <div className="flex items-center justify-center gap-1.5 text-xs font-bold">
                              <span className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-lg border border-emerald-300 dark:border-emerald-500/30">E: {s.easy}</span>
                              <span className="bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-lg border border-amber-300 dark:border-amber-500/30">M: {s.medium}</span>
                              <span className="bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 px-2 py-0.5 rounded-lg border border-rose-300 dark:border-rose-500/30">H: {s.hard}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-[#7e7496] dark:text-purple-300/70 font-mono">@{currentPlatform}</span>
                          )}
                        </td>

                        <td className="py-4 px-4 text-right">
                          <div className="flex flex-col items-end gap-1">
                            {s.today_solved > 0 && (
                              <span className="px-2 py-0.5 text-xs font-black bg-amber-500 text-slate-950 rounded-lg">
                                +{s.today_solved} today
                              </span>
                            )}
                            <span className="text-xs text-amber-600 dark:text-amber-400 font-bold flex items-center gap-0.5">
                              {s.streak} <Flame className="w-4 h-4 fill-amber-500 text-amber-500 inline" /> streak
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* RECENT ACTIVITY FEED */}
          <div className="glass-panel p-7 sm:p-8">
            <div className="flex items-center gap-3 mb-5 pb-3 border-b border-[#f0e8fa] dark:border-[#2d2754]">
              <Activity className="w-6 h-6 text-emerald-500" />
              <h3 className="text-xl sm:text-2xl font-extrabold text-[#1e1535] dark:text-white">Recent Activity Feed</h3>
            </div>

            <div className="max-h-96 overflow-y-auto pr-2 space-y-3.5">
              {summary?.recent_activities?.map((act: any, idx: number) => (
                <div
                  key={idx}
                  className="p-3.5 bg-[#fcfaff] dark:bg-[#1c1836] border border-[#e9dff7] dark:border-[#2d2754] rounded-2xl flex items-center justify-between gap-3 text-xs sm:text-sm"
                >
                  <div className="space-y-0.5">
                    <div>
                      <strong className="text-[#1e1535] dark:text-white font-extrabold">{act.student_name}</strong>{' '}
                      <span className="text-[#5e5675] dark:text-purple-200/70">{act.action}</span>{' '}
                      <strong className="text-[#342a4d] dark:text-purple-100 font-bold">{act.problem_title}</strong>
                    </div>
                    <div className="text-xs text-[#8a7f9e] dark:text-purple-300/60 flex items-center gap-1 font-mono">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{act.time}</span>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 text-xs font-black rounded-lg uppercase ${
                    act.type === 'HARD'
                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300 border border-rose-300 dark:border-rose-500/30'
                      : act.type === 'MEDIUM'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30'
                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30'
                  }`}>
                    {act.type}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-7">

          {/* TODAY'S TASKS CARD */}
          <div className="glass-panel p-7 sm:p-8">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#f0e8fa] dark:border-[#2d2754]">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-purple-100 dark:bg-purple-500/20 border border-purple-300 dark:border-purple-500/30 text-purple-900 dark:text-purple-300 text-xs font-black rounded-xl uppercase">
                  💻 TODAY'S TASKS (6 SUMS)
                </span>
              </div>
              <button
                onClick={handleOpenHistory}
                className="text-xs sm:text-sm font-extrabold text-purple-700 dark:text-purple-300 hover:text-pink-600 dark:hover:text-pink-400 flex items-center gap-1.5 transition bg-purple-50 dark:bg-[#1f1b3c] px-3 py-1.5 rounded-xl border border-purple-200 dark:border-purple-500/30"
              >
                <History className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>7-Day History</span>
              </button>
            </div>

            <div className="text-center text-xs font-extrabold text-[#5e5675] dark:text-purple-200/70 mb-4 font-mono uppercase tracking-wider">
              Assigned for {currentDateStr}
            </div>

            <div className="space-y-3">
              {summary?.todays_tasks?.map((t: any, idx: number) => (
                <div key={idx} className="p-3.5 bg-[#fcfaff] dark:bg-[#1c1836] border border-[#e9dff7] dark:border-[#2d2754] rounded-2xl text-xs sm:text-sm flex flex-col gap-1.5 hover:border-purple-300 transition">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-black text-[#1e1535] dark:text-white">
                      {idx + 1}. {t.title}
                    </span>
                    {renderPlatformBadge(t.platform)}
                  </div>
                  <div className="flex items-center justify-between text-xs text-[#7e7496] dark:text-purple-300/70 font-mono pt-1">
                    <span>Difficulty: <strong className="text-amber-600 dark:text-amber-400">{t.difficulty || 'Easy'}</strong></span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓ Assigned</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* DAILY CHALLENGE BANNER */}
          <div className="glass-card text-center p-7 border-amber-300 dark:border-amber-500/40 bg-gradient-to-b from-amber-500/10 via-white to-purple-50/40 dark:from-amber-500/10 dark:to-[#171430]">
            <span className="inline-block px-3.5 py-1 bg-amber-500 text-slate-950 text-xs font-black uppercase rounded-full tracking-wider mb-3">
              ⚡ {currentPlatform.toUpperCase()} DAILY CHALLENGE
            </span>
            <h4 className="text-2xl font-black text-[#1e1535] dark:text-white mb-2 leading-tight">
              {summary?.daily_challenge?.title || 'Stone Game II'}
            </h4>
            <span className="inline-block px-3 py-0.5 text-xs font-bold bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 rounded-lg border border-amber-300 dark:border-amber-500/40 mb-5">
              {summary?.daily_challenge?.difficulty || 'Medium'}
            </span>

            <button className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 text-white font-black rounded-2xl text-sm transition flex items-center justify-center gap-2 shadow-md shadow-purple-500/20">
              <span>Solve Challenge</span>
              <ExternalLink className="w-4 h-4" />
            </button>

            <div className="text-xs text-[#7e7496] dark:text-purple-300/70 mt-4 font-mono">
              Class Completion: <strong className="text-emerald-600 dark:text-emerald-400">{summary?.daily_challenge?.completion || '18 / 42'}</strong>
            </div>
          </div>

          {/* MILESTONES & LOGS */}
          <div className="glass-panel p-7 sm:p-8">
            <div className="flex items-center gap-3 mb-4">
              <Bell className="w-6 h-6 text-amber-500" />
              <h3 className="text-xl font-extrabold text-[#1e1535] dark:text-white">Milestones & Logs</h3>
            </div>

            <div className="space-y-3.5">
              {summary?.milestones?.map((m: any, idx: number) => (
                <div key={idx} className="p-3.5 bg-[#fcfaff] dark:bg-[#1c1836] border border-[#e9dff7] dark:border-[#2d2754] rounded-2xl text-xs sm:text-sm space-y-1">
                  <div className="font-bold text-[#1e1535] dark:text-purple-100">{m.text}</div>
                  <div className="text-xs font-mono text-[#8a7f9e] dark:text-purple-300/60">{m.time}</div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      <StudentProfileModal
        studentId={selectedStudentId}
        initialPlatform={currentPlatform}
        onClose={() => setSelectedStudentId(null)}
      />

      {/* 🗓️ 7-DAY TASK HISTORY MODAL */}
      {isHistoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel max-w-2xl w-full p-7 space-y-5 border-purple-300 dark:border-purple-500/40 max-h-[85vh] overflow-y-auto animate-fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-[#f0e8fa] dark:border-[#2d2754]">
              <div className="flex items-center gap-3">
                <History className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                <div>
                  <h3 className="text-xl font-black text-[#1e1535] dark:text-white">Classroom Task History (Last 7 Days)</h3>
                  <p className="text-xs text-[#5e5675] dark:text-purple-200/70">View daily assigned problem sets across all coding platforms.</p>
                </div>
              </div>
              <button
                onClick={() => setIsHistoryModalOpen(false)}
                className="p-2 text-[#8a7f9e] hover:text-[#1e1535] dark:hover:text-white rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/40 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {historyLoading ? (
              <div className="p-12 text-center text-slate-500 dark:text-slate-400">
                <div className="animate-spin w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full mx-auto mb-3" />
                Loading 7-day task history...
              </div>
            ) : (
              <div className="space-y-6">
                {taskHistory.map((dayGroup: any, gIdx: number) => (
                  <div key={gIdx} className="space-y-3">
                    <div className="flex items-center gap-2 text-xs font-black text-purple-700 dark:text-purple-300 uppercase tracking-wider bg-purple-100/70 dark:bg-purple-900/30 px-3 py-1.5 rounded-xl w-fit">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{dayGroup.date}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {dayGroup.tasks.map((tk: any, tIdx: number) => (
                        <div key={tIdx} className="p-3 bg-[#fcfaff] dark:bg-[#1c1836] border border-[#e9dff7] dark:border-[#2d2754] rounded-2xl text-xs space-y-1.5 flex flex-col justify-between">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-extrabold text-[#1e1535] dark:text-white">
                              #{tk.problem_number || tIdx + 1} - {tk.problem_name}
                            </span>
                          </div>

                          <div className="flex items-center justify-between pt-1 border-t border-[#f0e8fa] dark:border-[#2a2448]">
                            {renderPlatformBadge(tk.platform)}
                            <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                              {tk.difficulty || 'Easy'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end pt-3">
              <button
                onClick={() => setIsHistoryModalOpen(false)}
                className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 text-white font-bold rounded-xl text-xs"
              >
                Close History
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POST ANNOUNCEMENT MODAL FOR ADMIN */}
      {isNoticeModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel max-w-lg w-full p-7 space-y-5 border-purple-300 dark:border-purple-500/40 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#f0e8fa] dark:border-[#2d2754]">
              <h3 className="text-xl font-bold text-[#1e1535] dark:text-white flex items-center gap-2">
                <Pin className="w-5 h-5 text-pink-500" /> Post New Announcement
              </h3>
              <button
                onClick={() => setIsNoticeModalOpen(false)}
                className="text-[#8a7f9e] hover:text-[#1e1535] dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNotice} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-[#42395c] dark:text-purple-200 font-semibold mb-1">Notice Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 📢 Mandatory Assessment Test 2: Dynamic Programming"
                  value={noticeTitle}
                  onChange={(e) => setNoticeTitle(e.target.value)}
                  className="w-full bg-[#f8f5fd] dark:bg-[#120f26] border border-[#e9dff7] dark:border-[#272248] rounded-xl px-4 py-2.5 text-[#1e1535] dark:text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-[#42395c] dark:text-purple-200 font-semibold mb-1">Announcement Message *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Type official message or instructions for students..."
                  value={noticeMsg}
                  onChange={(e) => setNoticeMsg(e.target.value)}
                  className="w-full bg-[#f8f5fd] dark:bg-[#120f26] border border-[#e9dff7] dark:border-[#272248] rounded-xl px-4 py-2.5 text-[#1e1535] dark:text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-[#42395c] dark:text-purple-200 font-semibold mb-1">Assessment Link (Optional)</label>
                <input
                  type="url"
                  placeholder="https://leetcode.com/contest/..."
                  value={noticeLink}
                  onChange={(e) => setNoticeLink(e.target.value)}
                  className="w-full bg-[#f8f5fd] dark:bg-[#120f26] border border-[#e9dff7] dark:border-[#272248] rounded-xl px-4 py-2.5 text-[#1e1535] dark:text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-[#42395c] dark:text-purple-200 font-semibold mb-1">Attachment / File Name (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. DP_Practice_Sheet.pdf"
                  value={noticeFile}
                  onChange={(e) => setNoticeFile(e.target.value)}
                  className="w-full bg-[#f8f5fd] dark:bg-[#120f26] border border-[#e9dff7] dark:border-[#272248] rounded-xl px-4 py-2.5 text-[#1e1535] dark:text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNoticeModalOpen(false)}
                  className="px-5 py-2.5 bg-purple-100 dark:bg-[#252044] hover:bg-purple-200 text-purple-900 dark:text-purple-200 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={noticeSubmitting}
                  className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 text-white font-bold rounded-xl"
                >
                  {noticeSubmitting ? 'Publishing...' : 'Publish Announcement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
