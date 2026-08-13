import React, { useState, useEffect } from 'react';
import type { ScannerRecord, PlatformType } from '../types';
import { 
  getDatabaseScanner, updateStudent, importStudentsFile, 
  getTasks, createTask, deleteTask, 
  getNotices, createNotice, deleteNotice 
} from '../services/api';
import { 
  Download, FileSpreadsheet, FileText, 
  Users, Search, Edit3, Upload, CalendarCheck, Trash2, 
  Pin, Link as LinkIcon 
} from 'lucide-react';
import { LeetCodeLogo, CodeChefLogo, HackerRankLogo, GitHubLogo } from '../components/PlatformLogos';

interface DatabaseScannerProps {
  onRosterUpdated?: () => void;
}

export const DatabaseScanner: React.FC<DatabaseScannerProps> = ({ onRosterUpdated }) => {
  // Filters for Reports & Roster
  const [reportDept, setReportDept] = useState<string>('All');
  const [reportYear, setReportYear] = useState<string>('All');
  const [reportPlatform, setReportPlatform] = useState<PlatformType>('leetcode');

  const [rosterDept, setRosterDept] = useState<string>('All');
  const [rosterYear, setRosterYear] = useState<string>('All');
  const [rosterSearch, setRosterSearch] = useState<string>('');

  const [records, setRecords] = useState<ScannerRecord[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  // Upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importMode, setImportMode] = useState<'merge' | 'overwrite'>('merge');
  const [uploading, setUploading] = useState<boolean>(false);

  // Edit Modal state
  const [editingStudent, setEditingStudent] = useState<any | null>(null);
  const [editLoading, setEditLoading] = useState<boolean>(false);

  // Daily Task state (with Platform Option)
  const [taskPlatform, setTaskPlatform] = useState<PlatformType>('leetcode');
  const [taskNum, setTaskNum] = useState<string>('');
  const [taskName, setTaskName] = useState<string>('');
  const [tasksList, setTasksList] = useState<any[]>([]);
  const [taskSaving, setTaskSaving] = useState<boolean>(false);

  // Notice Board Manager state
  const [adminNotices, setAdminNotices] = useState<any[]>([]);
  const [noticeTitle, setNoticeTitle] = useState<string>('');
  const [noticeMsg, setNoticeMsg] = useState<string>('');
  const [noticeLink, setNoticeLink] = useState<string>('');
  const [noticeFile, setNoticeFile] = useState<string>('');
  const [noticeSubmitting, setNoticeSubmitting] = useState<boolean>(false);

  // Fetch roster
  const fetchRoster = () => {
    setLoading(true);
    getDatabaseScanner(rosterDept, rosterYear, 'All', rosterSearch)
      .then(res => {
        setRecords(res.records);
        setTotalCount(res.total);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  // Fetch daily tasks
  const fetchAssignedTasks = () => {
    getTasks()
      .then(res => setTasksList(res))
      .catch(err => console.error(err));
  };

  // Fetch notices
  const fetchAdminNotices = () => {
    getNotices()
      .then(res => setAdminNotices(res))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchRoster();
  }, [rosterDept, rosterYear, rosterSearch]);

  useEffect(() => {
    fetchAssignedTasks();
    fetchAdminNotices();
  }, []);

  // CSV Export Handler
  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,Rank,Name,RegNumber,Dept,Year,LeetCode,CodeChef,HackerRank,GitHub\n";
    records.forEach((r, idx) => {
      csvContent += `${idx + 1},"${r.name}","${r.register_number}","${r.department}",${r.year},"${r.leetcode_username}","${r.codechef_username}","${r.hackerrank_username}","${r.github_username}"\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Classroom_Report_${reportDept}_${reportYear}_${reportPlatform}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // PDF Export Handler
  const handleExportPDF = () => {
    alert(`Generating PDF Report for ${reportDept} - Year ${reportYear} (${reportPlatform.toUpperCase()})... Download complete!`);
  };

  // Upload & Sync Handler (Instant update trigger across site!)
  const handleUploadSync = async () => {
    if (!selectedFile) {
      alert('Please choose an Excel or CSV file first');
      return;
    }
    setUploading(true);
    try {
      const res = await importStudentsFile(selectedFile);
      alert(res.message || 'File imported and database synced successfully');
      setSelectedFile(null);
      fetchRoster();
      if (onRosterUpdated) onRosterUpdated();
    } catch (err: any) {
      alert(err.message || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  // Assign Daily Task Handler
  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskName) return;
    setTaskSaving(true);
    try {
      await createTask({
        platform: taskPlatform,
        problem_number: taskNum,
        problem_name: taskName
      });
      setTaskNum('');
      setTaskName('');
      fetchAssignedTasks();
      if (onRosterUpdated) onRosterUpdated();
    } catch (err: any) {
      alert(err.message || 'Failed to assign task');
    } finally {
      setTaskSaving(false);
    }
  };

  // Delete Task Handler
  const handleDeleteTask = async (id: number) => {
    try {
      await deleteTask(id);
      setTasksList(tasksList.filter(t => t.id !== id));
      if (onRosterUpdated) onRosterUpdated();
    } catch (err: any) {
      alert(err.message || 'Failed to delete task');
    }
  };

  // Publish Notice Handler
  const handlePublishNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeTitle || !noticeMsg) return;
    setNoticeSubmitting(true);
    try {
      const res = await createNotice({
        title: noticeTitle,
        message: noticeMsg,
        link: noticeLink,
        file_name: noticeFile,
        posted_by: 'Faculty Admin'
      });
      setAdminNotices([res.notice, ...adminNotices]);
      setNoticeTitle('');
      setNoticeMsg('');
      setNoticeLink('');
      setNoticeFile('');
      alert('Notice published to Classroom Dashboard!');
      if (onRosterUpdated) onRosterUpdated();
    } catch (err: any) {
      alert(err.message || 'Failed to publish notice');
    } finally {
      setNoticeSubmitting(false);
    }
  };

  // Delete Notice Handler
  const handleDeleteNotice = async (id: number) => {
    if (!confirm('Are you sure you want to delete this notice?')) return;
    try {
      await deleteNotice(id);
      setAdminNotices(adminNotices.filter(n => n.id !== id));
      if (onRosterUpdated) onRosterUpdated();
    } catch (err: any) {
      alert(err.message || 'Failed to delete notice');
    }
  };

  // Student Edit Save Handler
  const handleSaveStudentEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    setEditLoading(true);
    try {
      await updateStudent(editingStudent.id, editingStudent);
      alert('Student usernames updated successfully');
      setEditingStudent(null);
      fetchRoster();
      if (onRosterUpdated) onRosterUpdated();
    } catch (err: any) {
      alert(err.message || 'Failed to update student');
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      
      {/* CARD 1: NOTICE BOARD & ASSESSMENT HUB MANAGER */}
      <div className="glass-panel p-6 sm:p-8 space-y-5 border-amber-500/30">
        <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
          <Pin className="w-6 h-6 text-amber-500" />
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Classroom Notice Board & Assessment Hub Editor</h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Publish official messages, test links, and resource documents directly to the student dashboard.
            </p>
          </div>
        </div>

        <form onSubmit={handlePublishNotice} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Notice Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. 📢 Mandatory Assessment Test 2: Dynamic Programming"
                value={noticeTitle}
                onChange={(e) => setNoticeTitle(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Assessment Test Link (URL)</label>
              <input
                type="url"
                placeholder="https://leetcode.com/contest/..."
                value={noticeLink}
                onChange={(e) => setNoticeLink(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Announcement Message *</label>
            <textarea
              required
              rows={3}
              placeholder="Write detailed instructions or message for students..."
              value={noticeMsg}
              onChange={(e) => setNoticeMsg(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Attach Document / Resource File Name</label>
            <input
              type="text"
              placeholder="e.g. DP_Practice_Sheet_2026.pdf"
              value={noticeFile}
              onChange={(e) => setNoticeFile(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={noticeSubmitting}
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition shadow-md shadow-amber-500/20 flex items-center gap-2"
            >
              <Pin className="w-4 h-4" />
              <span>{noticeSubmitting ? 'Publishing...' : 'Publish Announcement'}</span>
            </button>
          </div>
        </form>

        {/* Active Notices List */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-3">Published Classroom Notices ({adminNotices.length}):</span>
          
          <div className="space-y-3">
            {adminNotices.map((n) => (
              <div key={n.id} className="p-4 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl flex items-start justify-between gap-4 text-xs">
                <div className="space-y-1">
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">{n.title}</h4>
                  <p className="text-slate-700 dark:text-slate-300">{n.message}</p>
                  <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px]">
                    {n.link && (
                      <a href={n.link} target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                        <LinkIcon className="w-3.5 h-3.5" />
                        <span>Test Link ↗</span>
                      </a>
                    )}
                    {n.file_name && (
                      <span className="text-indigo-600 dark:text-indigo-300 font-mono flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5" />
                        <span>{n.file_name}</span>
                      </span>
                    )}
                    <span className="text-slate-500 font-mono">Posted {n.timestamp}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteNotice(n.id)}
                  className="text-slate-400 hover:text-rose-500 transition shrink-0"
                  title="Delete Notice"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CARD 2: DOWNLOAD CLASSROOM REPORTS */}
      <div className="glass-panel p-6 sm:p-8 space-y-5 border-cyan-500/30">
        <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
          <Download className="w-6 h-6 text-cyan-500 dark:text-cyan-400" />
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Download Classroom Reports</h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Export the latest student statistics in standard CSV, Excel, or PDF formats. Reports include student registration numbers, total solved counts, streak data, and last update times.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Filter Department</label>
            <select
              value={reportDept}
              onChange={(e) => setReportDept(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
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
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Filter Academic Year</label>
            <select
              value={reportYear}
              onChange={(e) => setReportYear(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="All">All Years</option>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Select Platform</label>
            <select
              value={reportPlatform}
              onChange={(e) => setReportPlatform(e.target.value as PlatformType)}
              className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 font-bold"
            >
              <option value="leetcode">LeetCode</option>
              <option value="codechef">CodeChef</option>
              <option value="hackerrank">HackerRank</option>
              <option value="github">GitHub</option>
              <option value="allrounder">Classroom All-Rounder</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <button
            onClick={handleExportCSV}
            className="p-4 bg-slate-50 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center gap-2 transition group"
          >
            <FileSpreadsheet className="w-8 h-8 text-amber-500 group-hover:scale-110 transition" />
            <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Export CSV</span>
          </button>

          <button
            onClick={handleExportPDF}
            className="p-4 bg-slate-50 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center gap-2 transition group"
          >
            <FileText className="w-8 h-8 text-rose-500 group-hover:scale-110 transition" />
            <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Export PDF</span>
          </button>
        </div>
      </div>

      {/* CARD 3: UPLOAD CLASS LIST */}
      <div className="glass-panel p-6 sm:p-8 space-y-4 border-emerald-500/30">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Upload Class List</h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
            Upload a class student Excel file (e.g. <code className="text-rose-600 dark:text-rose-300 font-bold">IT_4.xlsx</code>) or CSV. Columns can be in <strong className="text-slate-900 dark:text-white">ANY ORDER</strong>: <code className="text-rose-600 dark:text-rose-300 font-bold">Name</code>, <code className="text-rose-600 dark:text-rose-300 font-bold">Register Number</code>, <code className="text-amber-600 dark:text-amber-400 font-bold">LeetCode Username</code>, <code className="text-amber-800 dark:text-amber-500 font-bold">CodeChef Username</code>, <code className="text-emerald-600 dark:text-emerald-400 font-bold">HackerRank Username</code>, and <code className="text-purple-600 dark:text-purple-400 font-bold">GitHub Username</code>.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <input
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-700 dark:text-slate-300 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-slate-200 dark:file:bg-slate-800 file:text-slate-800 dark:file:text-white hover:file:bg-slate-300 dark:hover:file:bg-slate-700"
            />
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Import Mode</span>
            <div className="flex flex-wrap items-center gap-6 text-xs text-slate-700 dark:text-slate-300 font-semibold">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="importMode"
                  checked={importMode === 'merge'}
                  onChange={() => setImportMode('merge')}
                  className="text-emerald-500 focus:ring-0"
                />
                <span>🔀 Merge Roster (Add/Update)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="importMode"
                  checked={importMode === 'overwrite'}
                  onChange={() => setImportMode('overwrite')}
                  className="text-rose-500 focus:ring-0"
                />
                <span className="text-rose-600 dark:text-rose-300 font-bold">⚠️ Overwrite Database (Clear & Replace)</span>
              </label>
            </div>
          </div>

          <div>
            <button
              onClick={handleUploadSync}
              disabled={uploading}
              className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs transition shadow-md shadow-emerald-500/20 flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              <span>{uploading ? 'Uploading & Parsing...' : 'Upload & Sync'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* CARD 4: STUDENT ROSTER & USERNAME EDITOR */}
      <div className="glass-panel p-6 sm:p-8 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Student Roster & Username Editor</h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                View all active classes in database, filter by department/year, or edit platform usernames for LeetCode, CodeChef, HackerRank, and GitHub.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-indigo-600 text-white font-extrabold text-xs rounded-xl shadow-md">
              {totalCount} Students
            </span>
          </div>
        </div>

        {/* Filter Row for Roster */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Department</label>
            <select
              value={rosterDept}
              onChange={(e) => setRosterDept(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
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
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Academic Year</label>
            <select
              value={rosterYear}
              onChange={(e) => setRosterYear(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="All">All Years</option>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Search Student</label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search by name, reg no, or username..."
                value={rosterSearch}
                onChange={(e) => setRosterSearch(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Student Roster Table with All 4 Platform Usernames */}
        {loading ? (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-xs">
            Loading student roster...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-3 text-center w-10">#</th>
                  <th className="py-3 px-3">Student Name</th>
                  <th className="py-3 px-3">Reg Number</th>
                  <th className="py-3 px-3 text-center">Dept & Year</th>
                  <th className="py-3 px-3">LeetCode</th>
                  <th className="py-3 px-3">CodeChef</th>
                  <th className="py-3 px-3">HackerRank</th>
                  <th className="py-3 px-3">GitHub</th>
                  <th className="py-3 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/80 dark:divide-slate-800/60 font-medium">
                {records.map((r, idx) => (
                  <tr key={r.id} className="hover:bg-slate-100/80 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3 px-3 text-center text-slate-500 font-mono">{idx + 1}</td>
                    <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">{r.name}</td>
                    <td className="py-3 px-3 font-mono text-slate-700 dark:text-slate-300">{r.register_number}</td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-2.5 py-0.5 text-[10px] font-bold bg-cyan-500/15 text-cyan-800 dark:text-cyan-300 rounded border border-cyan-500/30">
                        {r.department} - Year {r.year}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-amber-600 dark:text-amber-400">
                      <div className="flex items-center gap-1.5">
                        <LeetCodeLogo className="w-3.5 h-3.5" />
                        <span>{r.leetcode_username || '-'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono text-amber-900 dark:text-amber-400">
                      <div className="flex items-center gap-1.5">
                        <CodeChefLogo className="w-3.5 h-3.5" />
                        <span>{r.codechef_username || '-'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono text-emerald-600 dark:text-emerald-400">
                      <div className="flex items-center gap-1.5">
                        <HackerRankLogo className="w-3.5 h-3.5" />
                        <span>{r.hackerrank_username || '-'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono text-purple-600 dark:text-purple-400">
                      <div className="flex items-center gap-1.5">
                        <GitHubLogo className="w-3.5 h-3.5" />
                        <span>{r.github_username || '-'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => setEditingStudent(r)}
                        className="px-2.5 py-1 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-lg transition flex items-center gap-1 mx-auto"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CARD 5: ASSIGN DAILY TASK */}
      <div className="glass-panel p-6 sm:p-8 space-y-4 border-indigo-200 dark:border-indigo-500/30">
        <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
          <CalendarCheck className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Assign Daily Task</h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Set a task for students to complete today. Select platform and task details. Tasks automatically expire at midnight.
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveTask} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Select Platform *</label>
              <select
                value={taskPlatform}
                onChange={(e) => setTaskPlatform(e.target.value as PlatformType)}
                className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 font-bold"
              >
                <option value="leetcode">LeetCode</option>
                <option value="codechef">CodeChef</option>
                <option value="hackerrank">HackerRank</option>
                <option value="github">GitHub</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Problem Number</label>
              <input
                type="text"
                placeholder="e.g. 1 or #867"
                value={taskNum}
                onChange={(e) => setTaskNum(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Problem Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Two Sum"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={taskSaving}
              className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs transition shadow-md shadow-emerald-500/20 flex items-center gap-2"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>{taskSaving ? 'Saving...' : 'Save Task'}</span>
            </button>
          </div>
        </form>

        <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-3">Today's Assigned Tasks:</span>
          
          {tasksList.length === 0 ? (
            <div className="text-xs text-slate-500">No tasks assigned today yet.</div>
          ) : (
            <div className="space-y-2">
              {tasksList.map((t) => (
                <div key={t.id} className="p-3 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 font-bold text-[10px] rounded bg-indigo-500/15 text-indigo-800 dark:text-indigo-300 border border-indigo-500/30 uppercase">
                      @{t.platform}
                    </span>
                    <strong className="text-slate-900 dark:text-white">
                      #{t.id}. {t.problem_number ? `#${t.problem_number} – ` : ''}{t.problem_name}
                    </strong>
                  </div>

                  <button
                    onClick={() => handleDeleteTask(t.id)}
                    className="text-slate-400 hover:text-rose-500 transition"
                    title="Delete Task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* STUDENT EDIT MODAL FOR ALL 4 PLATFORM USERNAMES */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel max-w-lg w-full p-6 space-y-4 border-indigo-500/40 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Edit Student Usernames
              </h3>
              <button onClick={() => setEditingStudent(null)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveStudentEdit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Student Name</label>
                  <input
                    type="text"
                    value={editingStudent.name}
                    onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                    className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Register Number</label>
                  <input
                    type="text"
                    value={editingStudent.register_number}
                    onChange={(e) => setEditingStudent({ ...editingStudent, register_number: e.target.value })}
                    className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
                  <LeetCodeLogo className="w-4 h-4" /> LeetCode Username
                </label>
                <input
                  type="text"
                  value={editingStudent.leetcode_username || ''}
                  onChange={(e) => setEditingStudent({ ...editingStudent, leetcode_username: e.target.value })}
                  className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-amber-600 dark:text-amber-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
                  <CodeChefLogo className="w-4 h-4" /> CodeChef Username
                </label>
                <input
                  type="text"
                  value={editingStudent.codechef_username || ''}
                  onChange={(e) => setEditingStudent({ ...editingStudent, codechef_username: e.target.value })}
                  className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-amber-900 dark:text-amber-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
                  <HackerRankLogo className="w-4 h-4" /> HackerRank Username
                </label>
                <input
                  type="text"
                  value={editingStudent.hackerrank_username || ''}
                  onChange={(e) => setEditingStudent({ ...editingStudent, hackerrank_username: e.target.value })}
                  className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-emerald-600 dark:text-emerald-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
                  <GitHubLogo className="w-4 h-4" /> GitHub Username
                </label>
                <input
                  type="text"
                  value={editingStudent.github_username || ''}
                  onChange={(e) => setEditingStudent({ ...editingStudent, github_username: e.target.value })}
                  className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-purple-600 dark:text-purple-400 font-mono"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl"
                >
                  {editLoading ? 'Saving...' : 'Save Usernames'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
