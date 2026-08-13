import React, { useState, useEffect } from 'react';
import { getAttendance } from '../services/api';
import { Calendar, CheckCircle2 } from 'lucide-react';

interface AttendanceProps {
  refreshKey?: number;
}

export const Attendance: React.FC<AttendanceProps> = ({ refreshKey = 0 }) => {
  const [department, setDepartment] = useState<string>('All');
  const [year, setYear] = useState<string>('All');
  const [month, setMonth] = useState<string>('August');
  const [calYear, setCalYear] = useState<string>('2026');

  // Applied Filter State
  const [appliedDept, setAppliedDept] = useState<string>('All');
  const [appliedYear, setAppliedYear] = useState<string>('All');
  const [appliedMonth, setAppliedMonth] = useState<string>('August');
  const [appliedCalYear, setAppliedCalYear] = useState<string>('2026');

  const [attendanceData, setAttendanceData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchAttendanceData = (m: string, yStr: string, d: string, y: string) => {
    setLoading(true);
    getAttendance(m, yStr, d, y)
      .then((data) => setAttendanceData(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAttendanceData(appliedMonth, appliedCalYear, appliedDept, appliedYear);
  }, [appliedMonth, appliedCalYear, appliedDept, appliedYear, refreshKey]);

  const handleApplyFilters = () => {
    setAppliedDept(department);
    setAppliedYear(year);
    setAppliedMonth(month);
    setAppliedCalYear(calYear);
  };

  const monthsList = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysArray = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="space-y-7 pb-12 animate-fade-in">
      
      {/* Top Banner */}
      <div className="glass-panel p-7 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 bg-gradient-to-r from-purple-100/60 via-white to-pink-100/60 dark:from-[#171430] dark:to-[#221b47]">
        <div>
          <div className="flex items-center gap-2 text-[#7e7496] dark:text-purple-300 text-xs font-bold uppercase tracking-wider mb-1">
            <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>OMR EVALUATION MATRIX</span>
          </div>
          <h1 className="text-3xl font-black text-[#1e1535] dark:text-white">
            Classroom OMR Attendance Sheet
          </h1>
          <p className="text-xs sm:text-sm text-[#5e5675] dark:text-purple-200/70 mt-1 font-medium">
            Daily submission presence matrix formatted as an authentic OMR Bubble Evaluation Sheet across 31 days.
          </p>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="glass-panel p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-extrabold text-[#5e5675] dark:text-purple-200/70 uppercase mb-1">
              Department
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full bg-[#f8f5fd] dark:bg-[#120f26] border border-[#e9dff7] dark:border-[#272248] rounded-xl px-4 py-2.5 text-xs text-[#1e1535] dark:text-white font-bold"
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
              className="w-full bg-[#f8f5fd] dark:bg-[#120f26] border border-[#e9dff7] dark:border-[#272248] rounded-xl px-4 py-2.5 text-xs text-[#1e1535] dark:text-white font-bold"
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
              Select Month
            </label>
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-full bg-[#f8f5fd] dark:bg-[#120f26] border border-[#e9dff7] dark:border-[#272248] rounded-xl px-4 py-2.5 text-xs text-[#1e1535] dark:text-white font-bold"
            >
              {monthsList.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-[#5e5675] dark:text-purple-200/70 uppercase mb-1">
              Calendar Year
            </label>
            <select
              value={calYear}
              onChange={(e) => setCalYear(e.target.value)}
              className="w-full bg-[#f8f5fd] dark:bg-[#120f26] border border-[#e9dff7] dark:border-[#272248] rounded-xl px-4 py-2.5 text-xs text-[#1e1535] dark:text-white font-bold"
            >
              <option value="2026">2026</option>
              <option value="2025">2025</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={handleApplyFilters}
            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-purple-500/20"
          >
            <span>Apply Filters</span>
          </button>
        </div>
      </div>

      {/* OMR SHEET BUBBLE MATRIX PANEL */}
      <div className="glass-panel p-6 sm:p-8 space-y-4">
        
        {/* OMR Legend Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-[#fcfaff] dark:bg-[#161230] border border-[#e9dff7] dark:border-[#2b2450] rounded-2xl text-xs font-bold">
          <div className="flex items-center gap-2 text-[#1e1535] dark:text-white">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <span>OMR Evaluation Legend ({appliedMonth} {appliedCalYear}):</span>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-500 text-white font-black text-[9px] flex items-center justify-center shadow-sm shadow-emerald-500/30">●</span>
              <span className="text-[#42395c] dark:text-purple-200">Present (Solved Daily Task)</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-rose-500 text-white font-black text-[9px] flex items-center justify-center shadow-sm shadow-rose-500/30">●</span>
              <span className="text-[#7e7496] dark:text-purple-300/70">Absent (Red Dot)</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-[#7e7496] dark:text-purple-300/70 text-sm font-medium">
            Loading OMR attendance sheet...
          </div>
        ) : (
          <div className="overflow-x-auto border border-[#e9dff7] dark:border-[#27214a] rounded-2xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#f4effc] dark:bg-[#171433] border-b border-[#e9dff7] dark:border-[#2d2754] text-[#7e7496] dark:text-purple-300 font-black uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-3 w-10 text-center sticky left-0 bg-[#f4effc] dark:bg-[#171433] z-10 border-r border-[#e9dff7] dark:border-[#2d2754]">#</th>
                  <th className="py-3 px-4 min-w-[160px] sticky left-10 bg-[#f4effc] dark:bg-[#171433] z-10 border-r border-[#e9dff7] dark:border-[#2d2754]">STUDENT NAME</th>
                  <th className="py-3 px-3 min-w-[120px] border-r border-[#e9dff7] dark:border-[#2d2754]">REG NUMBER</th>
                  <th className="py-3 px-2 text-center border-r border-[#e9dff7] dark:border-[#2d2754]">DEPT</th>
                  <th className="py-3 px-3 text-right border-r border-[#e9dff7] dark:border-[#2d2754]">RATE</th>
                  
                  {/* OMR 31 DAYS COLUMN HEADERS */}
                  {daysArray.map((dayNum) => (
                    <th key={dayNum} className="py-3 px-1 text-center min-w-[28px] border-r border-[#e9dff7]/60 dark:border-[#2a244b]/60 font-mono text-[9px]">
                      {dayNum < 10 ? `0${dayNum}` : dayNum}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0e8fa] dark:divide-[#252044]">
                {attendanceData?.records?.map((r: any, idx: number) => (
                  <tr key={r.id} className="hover:bg-purple-50/60 dark:hover:bg-purple-950/30 transition">
                    <td className="py-3 px-3 text-center text-[#8a7f9e] font-mono font-bold sticky left-0 bg-[#fcfaff] dark:bg-[#120f29] border-r border-[#e9dff7] dark:border-[#2d2754]">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-4 font-bold text-[#1e1535] dark:text-white sticky left-10 bg-[#fcfaff] dark:bg-[#120f29] border-r border-[#e9dff7] dark:border-[#2d2754] whitespace-nowrap">
                      {r.name}
                    </td>
                    <td className="py-3 px-3 font-mono text-[#5e5675] dark:text-purple-200/80 border-r border-[#e9dff7] dark:border-[#2d2754] whitespace-nowrap">
                      {r.register_number}
                    </td>
                    <td className="py-3 px-2 text-center border-r border-[#e9dff7] dark:border-[#2d2754]">
                      <span className="px-1.5 py-0.5 font-bold bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 rounded text-[10px]">
                        {r.department}-{r.year}Y
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-black text-emerald-600 dark:text-emerald-400 border-r border-[#e9dff7] dark:border-[#2d2754]">
                      {r.consistency_rate}%
                    </td>

                    {/* OMR CIRCULAR BUBBLES GRID */}
                    {daysArray.map((dayNum) => {
                      const dayObj = r.days?.find((d: any) => d.day === dayNum);
                      const isPresent = dayObj?.status === 'present';
                      return (
                        <td key={dayNum} className="py-2.5 px-1 text-center border-r border-[#e9dff7]/60 dark:border-[#2a244b]/60">
                          {isPresent ? (
                            <span
                              className="w-5 h-5 mx-auto rounded-full bg-emerald-500 text-white font-black text-[9px] flex items-center justify-center shadow-sm shadow-emerald-500/30 ring-1 ring-emerald-400"
                              title={`Day ${dayNum}: Present (${dayObj?.solves || 1} solves)`}
                            >
                              ●
                            </span>
                          ) : (
                            <span
                              className="w-5 h-5 mx-auto rounded-full bg-rose-500 text-white font-black text-[9px] flex items-center justify-center shadow-sm shadow-rose-500/30 ring-1 ring-rose-400"
                              title={`Day ${dayNum}: Absent (0 solves)`}
                            >
                              ●
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
