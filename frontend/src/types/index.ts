export type PlatformType = 'leetcode' | 'codechef' | 'hackerrank' | 'github' | 'allrounder';

export interface PlatformStats {
  id: number;
  student_id: number;
  platform: string;
  problems_solved: number;
  easy_solved: number;
  medium_solved: number;
  hard_solved: number;
  rating: number;
  highest_rating: number;
  stars: string;
  contests_count: number;
  global_rank: string;
  active_days: number;
  badges_count: number;
  skills: string;
  certifications_count: number;
  score: number;
  public_repos: number;
  contributions: number;
  commits: number;
  pull_requests: number;
  issues: number;
  stars_received: number;
  followers: number;
  normalized_score: number;
  status: 'connected' | 'invalid_username' | 'data_unavailable';
  error_message?: string;
  last_updated: string | null;
}

export interface Student {
  id: number;
  name: string;
  register_number: string;
  department: string;
  year: number;
  section: string;
  leetcode_username: string;
  codechef_username: string;
  hackerrank_username: string;
  github_username: string;
  platform_stats?: PlatformStats[];
}

export interface LeaderboardItem {
  rank: number;
  id: number;
  name: string;
  register_number: string;
  department: string;
  year: number;
  section: string;
  username?: string;
  is_hod_dept?: boolean;
  is_hod_priority?: boolean;

  total_solved?: number;
  problems_solved?: number;
  rating?: number;
  highest_rating?: number;
  stars?: string;
  easy_solved?: number;
  medium_solved?: number;
  hard_solved?: number;

  challenges_completed?: number;
  badges?: number;
  skills?: string;
  certifications?: number;
  score?: number;

  contributions?: number;
  commits?: number;
  repositories?: number;
  pull_requests?: number;
  issues?: number;
  followers?: number;

  leetcode_score?: number;
  codechef_score?: number;
  hackerrank_score?: number;
  github_score?: number;
  overall_score?: number;

  today_solved?: number;
  today_solves?: number;
  week_solves?: number;
  month_solves?: number;
  streak?: number;
  acceptance?: string;

  rank_score?: number;
  last_updated?: string | null;
  status?: string;
}

export interface ScannerRecord {
  id: number;
  name: string;
  register_number: string;
  department: string;
  year: number;
  section: string;
  leetcode_username: string;
  leetcode_status?: string;
  codechef_username: string;
  codechef_status?: string;
  hackerrank_username: string;
  hackerrank_status?: string;
  github_username: string;
  github_status?: string;
  solves?: number;
  last_updated?: string | null;
}

export interface AdminUser {
  id: number;
  username: string;
  name: string;
  role: 'super_admin' | 'hod';
  department: string;
}
