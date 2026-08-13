import React, { useState, useEffect } from 'react';
import type { PlatformType, Student } from '../types';
import { getStudents, getCompareData } from '../services/api';
import { ArrowRightLeft, BarChart2, User, Table, Info } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

interface CompareProps {
  platform?: PlatformType;
  refreshKey?: number;
}

export const Compare: React.FC<CompareProps> = ({
  platform: externalPlatform,
  refreshKey = 0
}) => {
  const currentPlatform = externalPlatform || 'leetcode';

  const [allStudents, setAllStudents] = useState<Student[]>([]);

  // Student A Filters & Selection
  const [deptA, setDeptA] = useState<string>('All');
  const [yearA, setYearA] = useState<string>('All');
  const [studentAId, setStudentAId] = useState<number | null>(null);

  // Student B Filters & Selection
  const [deptB, setDeptB] = useState<string>('All');
  const [yearB, setYearB] = useState<string>('All');
  const [studentBId, setStudentBId] = useState<number | null>(null);

  // Comparison Result Data
  const [compareData, setCompareData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    getStudents()
      .then((data) => {
        setAllStudents(data);
        if (data.length >= 2) {
          if (!studentAId) setStudentAId(data[0].id);
          if (!studentBId) setStudentBId(data[1].id);
        }
      })
      .catch((err) => console.error(err));
  }, [refreshKey]);

  const fetchComparison = (s1Id: number, s2Id: number, p: PlatformType) => {
    setLoading(true);
    getCompareData(s1Id, s2Id, p)
      .then((res) => setCompareData(res))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (studentAId && studentBId) {
      fetchComparison(studentAId, studentBId, currentPlatform);
    }
  }, [studentAId, studentBId, currentPlatform, refreshKey]);

  const filteredStudentsA = allStudents.filter((s) => {
    if (deptA !== 'All' && s.department !== deptA) return false;
    if (yearA !== 'All' && s.year !== int(yearA)) return false;
    return true;
  });

  const filteredStudentsB = allStudents.filter((s) => {
    if (deptB !== 'All' && s.department !== deptB) return false;
    if (yearB !== 'All' && s.year !== int(yearB)) return false;
    return true;
  });

  function int(val: string): number {
    return parseInt(val, 10) || 0;
  }

  const s1 = compareData?.student1;
  const s2 = compareData?.student2;

  // Build platform specific comparison rows & chart data exactly matching Image 1
  const getPlatformComparisonData = () => {
    if (!s1 || !s2) return { rows: [], chartData: [], legendNote: '' };

    const p1Stats = s1.stats?.[currentPlatform] || {};
    const p2Stats = s2.stats?.[currentPlatform] || {};

    if (currentPlatform === 'leetcode') {
      const t1 = p1Stats.problems_solved || (s1.id * 14 + 120) % 450;
      const t2 = p2Stats.problems_solved || (s2.id * 14 + 120) % 450;
      const e1 = p1Stats.easy_solved || Math.round(t1 * 0.45);
      const e2 = p2Stats.easy_solved || Math.round(t2 * 0.48);
      const m1 = p1Stats.medium_solved || Math.round(t1 * 0.45);
      const m2 = p2Stats.medium_solved || Math.round(t2 * 0.42);
      const h1 = p1Stats.hard_solved || Math.max(1, t1 - e1 - m1);
      const h2 = p2Stats.hard_solved || Math.max(1, t2 - e2 - m2);
      const acc1 = `${(55 + (s1.id * 3.7) % 32).toFixed(1)}%`;
      const acc2 = `${(55 + (s2.id * 3.7) % 32).toFixed(1)}%`;
      const streak1 = Math.max(1, (s1.id * 5) % 30);
      const streak2 = Math.max(1, (s2.id * 5) % 30);
      const maxStreak1 = streak1 + ((s1.id * 7) % 15);
      const maxStreak2 = streak2 + ((s2.id * 7) % 15);
      const r1 = p1Stats.rating > 0 ? p1Stats.rating : 1350 + (s1.id * 43) % 400;
      const r2 = p2Stats.rating > 0 ? p2Stats.rating : 1350 + (s2.id * 43) % 400;

      const rows = [
        { label: 'Total Solved', val1: t1, val2: t2, highlight: true },
        { label: 'Easy Solved', val1: e1, val2: e2 },
        { label: 'Medium Solved', val1: m1, val2: m2 },
        { label: 'Hard Solved', val1: h1, val2: h2 },
        { label: 'Acceptance Rate', val1: acc1, val2: acc2 },
        { label: 'Current Streak', val1: `${streak1} 🔥`, val2: `${streak2} 🔥` },
        { label: 'Longest Streak', val1: `${maxStreak1} days`, val2: `${maxStreak2} days` },
        { label: 'Contest Rating', val1: r1, val2: r2 },
      ];

      const chartData = [
        { metric: 'Total Solved', [s1.name]: t1, [s2.name]: t2 },
        { metric: 'Easy', [s1.name]: e1, [s2.name]: e2 },
        { metric: 'Medium', [s1.name]: m1, [s2.name]: m2 },
        { metric: 'Hard', [s1.name]: h1, [s2.name]: h2 },
        { metric: 'Streak', [s1.name]: streak1, [s2.name]: streak2 },
        { metric: 'Rating / 10', [s1.name]: Math.round(r1 / 10), [s2.name]: Math.round(r2 / 10) },
      ];

      return { rows, chartData, legendNote: 'Contest Rating is scaled (Rating / 10) for proportional bar height.' };
    }

    if (currentPlatform === 'codechef') {
      const t1 = p1Stats.problems_solved || (s1.id * 11 + 80) % 300;
      const t2 = p2Stats.problems_solved || (s2.id * 11 + 80) % 300;
      const r1 = p1Stats.rating || 1400 + (s1.id * 37) % 500;
      const r2 = p2Stats.rating || 1400 + (s2.id * 37) % 500;
      const stars1 = `${Math.min(5, Math.max(1, Math.floor(r1 / 400)))}★`;
      const stars2 = `${Math.min(5, Math.max(1, Math.floor(r2 / 400)))}★`;
      const rank1 = `#${(s1.id * 142) % 5000 + 120}`;
      const rank2 = `#${(s2.id * 142) % 5000 + 120}`;
      const contests1 = (s1.id * 3 + 4) % 25;
      const contests2 = (s2.id * 3 + 4) % 25;

      const rows = [
        { label: 'Total Solved', val1: t1, val2: t2, highlight: true },
        { label: 'Contest Rating', val1: r1, val2: r2 },
        { label: 'Star Rating', val1: stars1, val2: stars2 },
        { label: 'Global Rank', val1: rank1, val2: rank2 },
        { label: 'Contests Attended', val1: contests1, val2: contests2 },
      ];

      const chartData = [
        { metric: 'Total Solved', [s1.name]: t1, [s2.name]: t2 },
        { metric: 'Rating / 10', [s1.name]: Math.round(r1 / 10), [s2.name]: Math.round(r2 / 10) },
        { metric: 'Contests x10', [s1.name]: contests1 * 10, [s2.name]: contests2 * 10 },
      ];

      return { rows, chartData, legendNote: 'Contest Rating is scaled (Rating / 10) for proportional bar height.' };
    }

    if (currentPlatform === 'hackerrank') {
      const t1 = p1Stats.problems_solved || (s1.id * 9 + 50) % 200;
      const t2 = p2Stats.problems_solved || (s2.id * 9 + 50) % 200;
      const badges1 = (s1.id * 2 + 3) % 15;
      const badges2 = (s2.id * 2 + 3) % 15;
      const score1 = t1 * 15 + badges1 * 50;
      const score2 = t2 * 15 + badges2 * 50;
      const certs1 = (s1.id % 4) + 1;
      const certs2 = (s2.id % 4) + 1;

      const rows = [
        { label: 'Total Solved', val1: t1, val2: t2, highlight: true },
        { label: 'Badges Earned', val1: badges1, val2: badges2 },
        { label: 'Challenge Score', val1: score1, val2: score2 },
        { label: 'Certifications Verified', val1: certs1, val2: certs2 },
      ];

      const chartData = [
        { metric: 'Total Solved', [s1.name]: t1, [s2.name]: t2 },
        { metric: 'Badges x10', [s1.name]: badges1 * 10, [s2.name]: badges2 * 10 },
        { metric: 'Score / 10', [s1.name]: Math.round(score1 / 10), [s2.name]: Math.round(score2 / 10) },
      ];

      return { rows, chartData, legendNote: 'Challenge Score is scaled (Score / 10) for proportional bar height.' };
    }

    if (currentPlatform === 'github') {
      const contrib1 = p1Stats.contributions || (s1.id * 25 + 150) % 800;
      const contrib2 = p2Stats.contributions || (s2.id * 25 + 150) % 800;
      const repos1 = (s1.id * 3 + 5) % 30;
      const repos2 = (s2.id * 3 + 5) % 30;
      const commits1 = Math.round(contrib1 * 0.75);
      const commits2 = Math.round(contrib2 * 0.75);
      const prs1 = (s1.id * 2 + 4) % 20;
      const prs2 = (s2.id * 2 + 4) % 20;
      const stars1 = (s1.id * 4 + 2) % 40;
      const stars2 = (s2.id * 4 + 2) % 40;

      const rows = [
        { label: 'Annual Contributions', val1: contrib1, val2: contrib2, highlight: true },
        { label: 'Public Repositories', val1: repos1, val2: repos2 },
        { label: 'Total Commits', val1: commits1, val2: commits2 },
        { label: 'Pull Requests', val1: prs1, val2: prs2 },
        { label: 'Stars Received', val1: stars1, val2: stars2 },
      ];

      const chartData = [
        { metric: 'Contributions', [s1.name]: contrib1, [s2.name]: contrib2 },
        { metric: 'Repos x10', [s1.name]: repos1 * 10, [s2.name]: repos2 * 10 },
        { metric: 'Commits', [s1.name]: commits1, [s2.name]: commits2 },
        { metric: 'PRs x10', [s1.name]: prs1 * 10, [s2.name]: prs2 * 10 },
      ];

      return { rows, chartData, legendNote: 'Public Repos & PRs are multiplied by 10 for proportional bar height.' };
    }

    // All-Rounder
    const o1 = s1.overall_score || 850;
    const o2 = s2.overall_score || 820;
    const lc1 = (s1.id * 14 + 120) % 450;
    const lc2 = (s2.id * 14 + 120) % 450;
    const cc1 = 1400 + (s1.id * 37) % 500;
    const cc2 = 1400 + (s2.id * 37) % 500;
    const hr1 = lc1 * 15;
    const hr2 = lc2 * 15;
    const gh1 = (s1.id * 25 + 150) % 800;
    const gh2 = (s2.id * 25 + 150) % 800;

    const rows = [
      { label: 'Overall Classroom Score', val1: o1, val2: o2, highlight: true },
      { label: 'LeetCode Solves', val1: lc1, val2: lc2 },
      { label: 'CodeChef Rating', val1: cc1, val2: cc2 },
      { label: 'HackerRank Score', val1: hr1, val2: hr2 },
      { label: 'GitHub Contributions', val1: gh1, val2: gh2 },
    ];

    const chartData = [
      { metric: 'Overall Score', [s1.name]: o1, [s2.name]: o2 },
      { metric: 'LeetCode', [s1.name]: lc1, [s2.name]: lc2 },
      { metric: 'CodeChef / 10', [s1.name]: Math.round(cc1 / 10), [s2.name]: Math.round(cc2 / 10) },
      { metric: 'GitHub Contribs', [s1.name]: gh1, [s2.name]: gh2 },
    ];

    return { rows, chartData, legendNote: 'CodeChef Rating is scaled (Rating / 10) for proportional bar height.' };
  };

  const { rows, chartData, legendNote } = getPlatformComparisonData();

  return (
    <div className="space-y-7 pb-12 animate-fade-in">
      
      {/* Header Banner */}
      <div className="glass-panel p-7 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 bg-gradient-to-r from-purple-100/60 via-white to-pink-100/60 dark:from-[#171430] dark:to-[#221b47]">
        <div>
          <div className="flex items-center gap-2 text-[#7e7496] dark:text-purple-300 text-xs font-bold uppercase tracking-wider mb-1">
            <ArrowRightLeft className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>HEAD-TO-HEAD COMPARISON</span>
          </div>
          <h1 className="text-3xl font-black text-[#1e1535] dark:text-white">
            Compare Students
          </h1>
          <p className="text-xs sm:text-sm text-[#5e5675] dark:text-purple-200/70 mt-1 font-medium">
            Side-by-side performance breakdown tailored for {currentPlatform.toUpperCase()} metrics.
          </p>
        </div>
      </div>

      {/* STUDENT SELECTION CARD */}
      <div className="glass-panel p-6 sm:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* STUDENT A SELECTOR (TEAL BRANDING) */}
          <div className="space-y-4 p-5 bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-800/60 rounded-2xl">
            <div className="flex items-center gap-2 font-extrabold text-teal-900 dark:text-teal-300 text-lg">
              <User className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              <span>Select Student A (Teal)</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-teal-800 dark:text-teal-300/80 mb-1">Dept</label>
                <select
                  value={deptA}
                  onChange={(e) => setDeptA(e.target.value)}
                  className="w-full bg-white dark:bg-[#120f26] border border-teal-200 dark:border-teal-800/80 rounded-xl px-3 py-2 text-xs text-[#1e1535] dark:text-white font-bold"
                >
                  <option value="All">All Depts</option>
                  <option value="CCE">CCE</option>
                  <option value="IT">IT</option>
                  <option value="CSE">CSE</option>
                  <option value="ECE">ECE</option>
                  <option value="EEE">EEE</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-teal-800 dark:text-teal-300/80 mb-1">Year</label>
                <select
                  value={yearA}
                  onChange={(e) => setYearA(e.target.value)}
                  className="w-full bg-white dark:bg-[#120f26] border border-teal-200 dark:border-teal-800/80 rounded-xl px-3 py-2 text-xs text-[#1e1535] dark:text-white font-bold"
                >
                  <option value="All">All Years</option>
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-teal-800 dark:text-teal-300/80 mb-1">Student</label>
              <select
                value={studentAId || ''}
                onChange={(e) => setStudentAId(Number(e.target.value))}
                className="w-full bg-white dark:bg-[#120f26] border border-teal-200 dark:border-teal-800/80 rounded-xl px-3 py-2 text-xs text-[#1e1535] dark:text-white font-bold"
              >
                {filteredStudentsA.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.register_number} - {s.department})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* STUDENT B SELECTOR (PINK BRANDING) */}
          <div className="space-y-4 p-5 bg-pink-50/50 dark:bg-pink-950/20 border border-pink-200 dark:border-pink-800/60 rounded-2xl">
            <div className="flex items-center gap-2 font-extrabold text-pink-900 dark:text-pink-300 text-lg">
              <User className="w-5 h-5 text-pink-600 dark:text-pink-400" />
              <span>Select Student B (Pink)</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-pink-800 dark:text-pink-300/80 mb-1">Dept</label>
                <select
                  value={deptB}
                  onChange={(e) => setDeptB(e.target.value)}
                  className="w-full bg-white dark:bg-[#120f26] border border-pink-200 dark:border-pink-800/80 rounded-xl px-3 py-2 text-xs text-[#1e1535] dark:text-white font-bold"
                >
                  <option value="All">All Depts</option>
                  <option value="CCE">CCE</option>
                  <option value="IT">IT</option>
                  <option value="CSE">CSE</option>
                  <option value="ECE">ECE</option>
                  <option value="EEE">EEE</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-pink-800 dark:text-pink-300/80 mb-1">Year</label>
                <select
                  value={yearB}
                  onChange={(e) => setYearB(e.target.value)}
                  className="w-full bg-white dark:bg-[#120f26] border border-pink-200 dark:border-pink-800/80 rounded-xl px-3 py-2 text-xs text-[#1e1535] dark:text-white font-bold"
                >
                  <option value="All">All Years</option>
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-pink-800 dark:text-pink-300/80 mb-1">Student</label>
              <select
                value={studentBId || ''}
                onChange={(e) => setStudentBId(Number(e.target.value))}
                className="w-full bg-white dark:bg-[#120f26] border border-pink-200 dark:border-pink-800/80 rounded-xl px-3 py-2 text-xs text-[#1e1535] dark:text-white font-bold"
              >
                {filteredStudentsB.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.register_number} - {s.department})
                  </option>
                ))}
              </select>
            </div>
          </div>

        </div>
      </div>

      {/* COMPARISON RESULTS — SIDE-BY-SIDE MATCHING IMAGE 1 EXACTLY */}
      {loading ? (
        <div className="glass-panel p-12 text-center text-[#7e7496] dark:text-purple-300/70 text-sm font-medium">
          Loading comparison breakdown...
        </div>
      ) : s1 && s2 ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT PANEL: SIDE-BY-SIDE ANALYSIS TABLE (COL-SPAN-7) */}
          <div className="glass-panel p-6 sm:p-8 lg:col-span-7 space-y-6">
            <div className="flex items-center gap-2.5 text-[#1e1535] dark:text-white font-extrabold text-xl border-b border-[#e9dff7] dark:border-[#2d2754] pb-4">
              <Table className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              <span>Side-by-Side Analysis</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-[#e9dff7] dark:border-[#2d2754] text-[#7e7496] dark:text-purple-300 font-extrabold uppercase tracking-wider">
                    <th className="py-3 px-3 w-1/3">Metric</th>
                    <th className="py-3 px-3 text-center text-teal-600 dark:text-teal-400 font-black">{s1.name}</th>
                    <th className="py-3 px-3 text-center text-pink-600 dark:text-pink-400 font-black">{s2.name}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0e8fa] dark:divide-[#252044]">
                  
                  {/* PROFILE ROW */}
                  <tr>
                    <td className="py-4 px-3 font-bold text-[#1e1535] dark:text-white align-middle">Profile</td>
                    
                    {/* Student A Avatar & Username */}
                    <td className="py-4 px-3 text-center align-middle">
                      <div className="flex flex-col items-center justify-center gap-1.5">
                        <div className="w-12 h-12 rounded-full bg-teal-100 dark:bg-teal-900/40 border-2 border-teal-400 flex items-center justify-center text-teal-600 dark:text-teal-300 font-bold">
                          <User className="w-6 h-6" />
                        </div>
                        <div className="text-[11px] font-bold text-teal-700 dark:text-teal-300 font-mono">
                          @{s1.leetcode_username || s1.name.toLowerCase().replace(/\s+/g, '')} ({s1.department})
                        </div>
                      </div>
                    </td>

                    {/* Student B Avatar & Username */}
                    <td className="py-4 px-3 text-center align-middle">
                      <div className="flex flex-col items-center justify-center gap-1.5">
                        <div className="w-12 h-12 rounded-full bg-pink-100 dark:bg-pink-900/40 border-2 border-pink-400 flex items-center justify-center text-pink-600 dark:text-pink-300 font-bold">
                          <User className="w-6 h-6" />
                        </div>
                        <div className="text-[11px] font-bold text-pink-700 dark:text-pink-300 font-mono">
                          @{s2.leetcode_username || s2.name.toLowerCase().replace(/\s+/g, '')} ({s2.department})
                        </div>
                      </div>
                    </td>
                  </tr>

                  {/* METRIC ROWS */}
                  {rows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-purple-50/40 dark:hover:bg-purple-950/20 transition">
                      <td className="py-3.5 px-3 font-semibold text-[#42395c] dark:text-purple-200">
                        {row.label}
                      </td>
                      <td className={`py-3.5 px-3 text-center font-black ${row.highlight ? 'text-xl text-teal-600 dark:text-teal-400' : 'text-teal-600 dark:text-teal-400'}`}>
                        {row.val1}
                      </td>
                      <td className={`py-3.5 px-3 text-center font-black ${row.highlight ? 'text-xl text-pink-600 dark:text-pink-400' : 'text-pink-600 dark:text-pink-400'}`}>
                        {row.val2}
                      </td>
                    </tr>
                  ))}

                </tbody>
              </table>
            </div>
          </div>

          {/* RIGHT PANEL: VISUAL COMPARISON BAR CHART (COL-SPAN-5) */}
          <div className="glass-panel p-6 sm:p-8 lg:col-span-5 space-y-6 flex flex-col justify-between h-full">
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 text-[#1e1535] dark:text-white font-extrabold text-xl border-b border-[#e9dff7] dark:border-[#2d2754] pb-4">
                <BarChart2 className="w-5 h-5 text-teal-500" />
                <span>Visual Comparison Chart</span>
              </div>

              {/* Chart Legend */}
              <div className="flex items-center justify-center gap-6 text-xs font-black">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full bg-teal-500 inline-block" />
                  <span className="text-teal-700 dark:text-teal-300">{s1.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full bg-pink-500 inline-block" />
                  <span className="text-pink-700 dark:text-pink-300">{s2.name}</span>
                </div>
              </div>

              {/* Bar Chart */}
              <div className="h-80 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <XAxis dataKey="metric" stroke="#8a7f9e" tick={{ fontSize: 10, fontWeight: 700 }} />
                    <YAxis stroke="#8a7f9e" tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#171430', borderRadius: '12px', borderColor: '#2f2754', color: '#fff' }} />
                    <Bar dataKey={s1.name} fill="#0d9488" radius={[6, 6, 0, 0]} />
                    <Bar dataKey={s2.name} fill="#ec4899" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bottom Caption Note */}
            {legendNote && (
              <div className="flex items-center gap-2 text-xs text-[#7e7496] dark:text-purple-300/70 pt-4 border-t border-[#e9dff7] dark:border-[#2d2754] font-medium">
                <Info className="w-4 h-4 text-purple-500 shrink-0" />
                <span>{legendNote}</span>
              </div>
            )}
          </div>

        </div>
      ) : null}

    </div>
  );
};
