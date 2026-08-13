import type { PlatformType, Student, LeaderboardItem, ScannerRecord, AdminUser } from '../types';

const API_BASE = 'http://localhost:5000/api';

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(3000) });
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
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to publish notice');
  }
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
  const url = platform ? `${API_BASE}/tasks?platform=${platform}` : `${API_BASE}/tasks`;
  const res = await fetch(url);
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
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to assign task');
  }
  return res.json();
}

export async function deleteTask(id: number): Promise<any> {
  const res = await fetch(`${API_BASE}/admin/tasks/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to remove task');
  return res.json();
}

export async function getDashboardSummary(platform: PlatformType = 'leetcode', dept: string = 'All', year: string = 'All'): Promise<any> {
  const params = new URLSearchParams({ platform, department: dept, year });
  const res = await fetch(`${API_BASE}/dashboard-summary?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch dashboard summary');
  return res.json();
}

export async function getStudents(filters?: { department?: string; year?: string; section?: string; search?: string }): Promise<Student[]> {
  const params = new URLSearchParams();
  if (filters?.department) params.append('department', filters.department);
  if (filters?.year) params.append('year', filters.year);
  if (filters?.section) params.append('section', filters.section);
  if (filters?.search) params.append('search', filters.search);

  const res = await fetch(`${API_BASE}/students?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch students');
  return res.json();
}

export async function getStudentDetail(id: number): Promise<any> {
  const res = await fetch(`${API_BASE}/students/${id}`);
  if (!res.ok) throw new Error('Failed to fetch student details');
  return res.json();
}

export async function getLeaderboard(
  platform: PlatformType = 'leetcode',
  dept: string = 'All',
  year: string = 'All',
  section: string = 'All',
  search: string = '',
  role: string = '',
  userDept: string = '',
  sortBy: string = 'overall'
): Promise<{ platform: string; total_students: number; data: LeaderboardItem[] }> {
  const params = new URLSearchParams({
    platform,
    department: dept,
    year,
    section,
    search,
    role,
    user_dept: userDept,
    sort_by: sortBy
  });

  const res = await fetch(`${API_BASE}/leaderboard?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch leaderboard');
  return res.json();
}

export async function getCompareData(student1Id: number, student2Id: number, platform: PlatformType = 'leetcode'): Promise<any> {
  const res = await fetch(`${API_BASE}/compare?student1=${student1Id}&student2=${student2Id}&platform=${platform}`);
  if (!res.ok) throw new Error('Failed to fetch compare data');
  return res.json();
}

export async function getAttendance(
  month: string = 'August',
  calYear: string = '2026',
  dept: string = 'All',
  year: string = 'All'
): Promise<{ month: string; cal_year: number; department: string; year: string; num_days: number; records: any[] }> {
  const params = new URLSearchParams({ month, cal_year: calYear, department: dept, year });
  const res = await fetch(`${API_BASE}/attendance?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch attendance');
  return res.json();
}

export async function getDatabaseScanner(dept: string = 'All', year: string = 'All', status: string = 'All', search: string = ''): Promise<{ total: number; records: ScannerRecord[] }> {
  const params = new URLSearchParams({ department: dept, year, status, search });
  const res = await fetch(`${API_BASE}/admin/database-scanner?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch database scanner data');
  return res.json();
}

export async function syncStudents(studentId?: number): Promise<any> {
  const res = await fetch(`${API_BASE}/admin/sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ student_id: studentId })
  });
  if (!res.ok) throw new Error('Failed to sync students');
  return res.json();
}

export async function addStudent(studentData: any): Promise<any> {
  const res = await fetch(`${API_BASE}/admin/students`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(studentData)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to add student');
  }
  return res.json();
}

export async function updateStudent(id: number, studentData: any): Promise<any> {
  const res = await fetch(`${API_BASE}/admin/students/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(studentData)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to update student');
  }
  return res.json();
}

export async function deleteStudent(id: number): Promise<any> {
  const res = await fetch(`${API_BASE}/admin/students/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete student');
  return res.json();
}

export async function importStudentsFile(file: File): Promise<any> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/admin/students/import`, {
    method: 'POST',
    body: formData
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to import students');
  }
  return res.json();
}
