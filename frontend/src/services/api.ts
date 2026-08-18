import type { PlatformType, Student, ScannerRecord, AdminUser } from '../types';

const getApiBaseUrl = (): string => {
  let envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
    envUrl = envUrl.trim().replace(/\/+$/, '');
    if (!envUrl.endsWith('/api')) {
      envUrl += '/api';
    }
    return envUrl;
  }
  // Production vs Local fallback
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return 'https://codetrack-4atl.onrender.com/api';
  }
  return 'http://localhost:5000/api';
};

const API_BASE = getApiBaseUrl();

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(4000) });
    if (res.ok) {
      const data = await res.json();
      return data.status === 'ok';
    }
    return false;
  } catch (err) {
    return false;
  }
}

export async function loginAdmin(username: string, password: string): Promise<{ token: string; user: AdminUser }> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Invalid credentials');
  }
  return res.json();
}

// NOTICE BOARD CLIENT METHODS
export async function getNotices(): Promise<any[]> {
  const res = await fetch(`${API_BASE}/notices`);
  if (!res.ok) throw new Error('Failed to fetch notices');
  return res.json();
}

export async function createNotice(noticeData: { title: string; message: string; link?: string; file_name?: string; posted_by?: string }): Promise<any> {
  const res = await fetch(`${API_BASE}/admin/notices`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(noticeData)
  });
  if (!res.ok) throw new Error('Failed to create notice');
  return res.json();
}

export async function deleteNotice(id: number): Promise<any> {
  const res = await fetch(`${API_BASE}/admin/notices/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete notice');
  return res.json();
}

// ASSIGNED DAILY TASKS CLIENT METHODS
export async function getTasks(platform?: string): Promise<any[]> {
  const query = platform ? `?platform=${platform}` : '';
  const res = await fetch(`${API_BASE}/tasks${query}`);
  if (!res.ok) throw new Error('Failed to fetch tasks');
  return res.json();
}

export async function getTaskHistory(): Promise<any[]> {
  const res = await fetch(`${API_BASE}/task-history`);
  if (!res.ok) throw new Error('Failed to fetch task history');
  return res.json();
}

export async function createTask(taskData: { platform: string; problem_number?: string; problem_name: string; difficulty?: string }): Promise<any> {
  const res = await fetch(`${API_BASE}/admin/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(taskData)
  });
  if (!res.ok) throw new Error('Failed to create task');
  return res.json();
}

export async function deleteTask(id: number): Promise<any> {
  const res = await fetch(`${API_BASE}/admin/tasks/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete task');
  return res.json();
}

export async function getDashboardSummary(
  platform: PlatformType,
  department: string = 'All',
  year: string = 'All'
): Promise<any> {
  const params = new URLSearchParams({
    platform,
    department,
    year
  });

  const res = await fetch(`${API_BASE}/dashboard-summary?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch dashboard summary');
  return res.json();
}

export async function getLeaderboard(
  platformOrOpts: PlatformType | { platform?: string; department?: string; year?: string; section?: string; search?: string; role?: string; user_dept?: string; sort_by?: string },
  department: string = 'All',
  year: string = 'All',
  section: string = 'All',
  search: string = '',
  role: string = '',
  userDept: string = '',
  sort: string = 'overall'
): Promise<any> {
  let p = 'leetcode';
  let d = 'All';
  let y = 'All';
  let sec = 'All';
  let s = '';
  let r = '';
  let ud = '';
  let sb = 'overall';

  if (typeof platformOrOpts === 'object' && platformOrOpts !== null) {
    p = platformOrOpts.platform || 'leetcode';
    d = platformOrOpts.department || 'All';
    y = platformOrOpts.year || 'All';
    sec = platformOrOpts.section || 'All';
    s = platformOrOpts.search || '';
    r = platformOrOpts.role || '';
    ud = platformOrOpts.user_dept || '';
    sb = platformOrOpts.sort_by || 'overall';
  } else {
    p = platformOrOpts || 'leetcode';
    d = department;
    y = year;
    sec = section;
    s = search;
    r = role;
    ud = userDept;
    sb = sort;
  }

  const params = new URLSearchParams({
    platform: p,
    department: d,
    year: y,
    section: sec,
    search: s,
    role: r,
    user_dept: ud,
    sort_by: sb
  });

  const res = await fetch(`${API_BASE}/leaderboard?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch leaderboard');
  return res.json();
}

export async function getStudents(): Promise<Student[]> {
  const res = await fetch(`${API_BASE}/students`);
  if (!res.ok) throw new Error('Failed to fetch students');
  return res.json();
}

export async function getStudentDetail(id: number): Promise<Student> {
  const res = await fetch(`${API_BASE}/students/${id}`);
  if (!res.ok) throw new Error('Failed to fetch student details');
  return res.json();
}

export async function getCompareData(student1Id: number, student2Id: number, platform: PlatformType): Promise<any> {
  const params = new URLSearchParams({
    student1: student1Id.toString(),
    student2: student2Id.toString(),
    platform
  });

  const res = await fetch(`${API_BASE}/compare?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch comparison');
  return res.json();
}

export async function getAttendance(
  month: string = 'August',
  calYear: string = '2026',
  department: string = 'All',
  year: string = 'All'
): Promise<any> {
  const params = new URLSearchParams({
    month,
    cal_year: calYear,
    department,
    year
  });

  const res = await fetch(`${API_BASE}/attendance?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch attendance');
  return res.json();
}

export async function getDatabaseScanner(
  department: string = 'All',
  year: string = 'All',
  status: string = 'All',
  search: string = ''
): Promise<{ total: number; records: ScannerRecord[] }> {
  const params = new URLSearchParams({
    department,
    year,
    status,
    search
  });

  const res = await fetch(`${API_BASE}/admin/database-scanner?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch database scanner data');
  return res.json();
}

export async function syncStudents(): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE}/admin/sync`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to sync students');
  return res.json();
}

export async function updateStudent(id: number, data: Partial<Student>): Promise<Student> {
  const res = await fetch(`${API_BASE}/admin/students/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update student');
  return res.json();
}

export async function importStudentsFile(file: File): Promise<{ message: string; count: number }> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/admin/students/import`, {
    method: 'POST',
    body: formData
  });
  if (!res.ok) throw new Error('Failed to import class file');
  return res.json();
}
