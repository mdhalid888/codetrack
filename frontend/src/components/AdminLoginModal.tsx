import React, { useState } from 'react';
import { loginAdmin } from '../services/api';
import type { AdminUser } from '../types';
import { ShieldCheck, Lock, User as UserIcon, X, AlertCircle } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: AdminUser, token: string) => void;
}

const OFFICIAL_CREDENTIALS: Record<string, { pass: string; user: AdminUser }> = {
  "test456@gmail.com": { pass: "admin456@", user: { id: 1, username: "test456@gmail.com", role: "super_admin", department: "All", name: "Main Administrator" } },
  "admin": { pass: "admin456@", user: { id: 1, username: "test456@gmail.com", role: "super_admin", department: "All", name: "Main Administrator" } },

  // HODs
  "nitithod@nehrucolleges.com": { pass: "itHod123$", user: { id: 2, username: "nitithod@nehrucolleges.com", role: "hod", department: "IT", name: "IT Department HOD" } },
  "nitcsehod@nehrucolleges.com": { pass: "cseHod123$", user: { id: 3, username: "nitcsehod@nehrucolleges.com", role: "hod", department: "CSE", name: "CSE Department HOD" } },
  "nitccehod@nehrucolleges.com": { pass: "cceHod123$", user: { id: 4, username: "nitccehod@nehrucolleges.com", role: "hod", department: "CCE", name: "CCE Department HOD" } },
  "nitaimlhod@nehrucolleges.com": { pass: "aimlHod123$", user: { id: 5, username: "nitaimlhod@nehrucolleges.com", role: "hod", department: "AI ML", name: "AI ML Department HOD" } },
  "nitcshod@nehrucolleges.com": { pass: "csHod123$", user: { id: 6, username: "nitcshod@nehrucolleges.com", role: "hod", department: "CYBER", name: "Cyber Security HOD" } },

  // NIT Placements & Staff
  "nitplacements@nehrucolleges.com": { pass: "nitplacements23$", user: { id: 7, username: "nitplacements@nehrucolleges.com", role: "super_admin", department: "All", name: "NIT Placement Officer" } },
  "nitarunpatrick@nehrucolleges.com": { pass: "nitArun123$", user: { id: 8, username: "nitarunpatrick@nehrucolleges.com", role: "super_admin", department: "All", name: "Arun Patrick (Placement)" } },
  "nitjasonp@nehrucolleges.com": { pass: "nitJason123$", user: { id: 9, username: "nitjasonp@nehrucolleges.com", role: "super_admin", department: "All", name: "Jason P (Placement)" } },
  "nititiv@nehrucolleges.com": { pass: "nitIT123$", user: { id: 10, username: "nititiv@nehrucolleges.com", role: "hod", department: "IT", name: "IT Placement Coordinator" } },
  "nicsetiv@nehrucolleges.com": { pass: "nitCSE123$", user: { id: 11, username: "nicsetiv@nehrucolleges.com", role: "hod", department: "CSE", name: "CSE Placement Coordinator" } },
};

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const uClean = username.trim().toLowerCase();
    const pClean = password.trim();

    try {
      const data = await loginAdmin(uClean, pClean);
      onLoginSuccess(data.user, data.token);
      onClose();
    } catch (err: any) {
      // Fallback verification for official credentials
      const localAcc = OFFICIAL_CREDENTIALS[uClean];
      if (localAcc && localAcc.pass === pClean) {
        onLoginSuccess(localAcc.user, `token-local-${uClean}`);
        onClose();
        setLoading(false);
        return;
      }
      setError(err.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Faculty & Admin Portal</h2>
            <p className="text-xs text-slate-400">Sign in to access Department HOD & Placement features</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
              Username / Email
            </label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. test456@gmail.com or nitithod@nehrucolleges.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium rounded-xl text-sm shadow-lg shadow-indigo-500/20 transition duration-200 disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In as Faculty / Admin'}
            </button>
          </div>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-800/80 text-center space-y-1">
          <p className="text-xs text-slate-400 font-semibold">
            Official Nehru Colleges Login Active:
          </p>
          <p className="text-[11px] text-slate-500">
            Admin: <code className="text-indigo-300">test456@gmail.com</code> | HODs: <code className="text-indigo-300">nitithod@nehrucolleges.com</code> | Placements: <code className="text-indigo-300">nitplacements@nehrucolleges.com</code>
          </p>
        </div>
      </div>
    </div>
  );
};
