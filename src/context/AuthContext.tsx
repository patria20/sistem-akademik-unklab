import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, UserRole } from '../types/academic';
import { MOCK_USERS } from '../data/mockAcademicData';

export interface LoginResult {
  success: boolean;
  user?: User;
  error?: string;
}

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  login: (email: string, password: string) => LoginResult;
  logout: () => void;
  demoAccounts: { role: UserRole; label: string; email: string; name: string }[];
  sessionStartedAt: number | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'siam_unklab_auth_user';
const SESSION_TIMESTAMP_KEY = 'siam_unklab_session_time';

const STUDENT_EMAIL_REGEX = /^[a-z0-9._-]+@student\.unklab\.ac\.id$/i;
const LECTURER_EMAIL_REGEX = /^[a-z0-9._-]+@unklab\.ac\.id$/i;

export const detectRoleFromUnklabEmail = (email: string): UserRole | null => {
  const trimmed = email.trim().toLowerCase();
  if (STUDENT_EMAIL_REGEX.test(trimmed)) return 'student';
  if (LECTURER_EMAIL_REGEX.test(trimmed)) {
    const localPart = trimmed.split('@')[0];
    if (localPart === 'admin') return null;
    return 'lecturer';
  }
  return null;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!saved) return null;
      const parsed = JSON.parse(saved) as User;
      if (parsed?.role !== 'student' && parsed?.role !== 'lecturer') {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        localStorage.removeItem(SESSION_TIMESTAMP_KEY);
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  });

  const [sessionStartedAt, setSessionStartedAt] = useState<number | null>(() => {
    try {
      const savedTime = localStorage.getItem(SESSION_TIMESTAMP_KEY);
      return savedTime ? parseInt(savedTime, 10) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      const now = Date.now();
      if (!sessionStartedAt) {
        setSessionStartedAt(now);
        localStorage.setItem(SESSION_TIMESTAMP_KEY, now.toString());
      }
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(SESSION_TIMESTAMP_KEY);
      setSessionStartedAt(null);
    }
  }, [user, sessionStartedAt]);

  const login = useCallback((email: string, password: string): LoginResult => {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !password.trim()) {
      return {
        success: false,
        error: 'Mohon isi alamat email UNKLAB dan kata sandi Anda.',
      };
    }

    if (trimmedEmail === 'admin@unklab.ac.id' || trimmedEmail.startsWith('admin@')) {
      return {
        success: false,
        error:
          'Fitur dan akun Admin telah dihapus. Silakan login menggunakan email Mahasiswa (@student.unklab.ac.id) atau Dosen (@unklab.ac.id).',
      };
    }

    const detectedRole = detectRoleFromUnklabEmail(trimmedEmail);
    if (!detectedRole) {
      return {
        success: false,
        error:
          'Format email tidak valid. Gunakan email UNKLAB: @student.unklab.ac.id (Mahasiswa) atau @unklab.ac.id (Dosen).',
      };
    }

    const localPart = trimmedEmail.split('@')[0];
    const exactMatch = MOCK_USERS.find((u) => u.email.toLowerCase() === trimmedEmail);
    let loggedInUser: User;

    if (exactMatch) {
      loggedInUser = exactMatch;
    } else {
      const baseUser = MOCK_USERS.find((u) => u.role === detectedRole)!;
      loggedInUser = {
        ...baseUser,
        email: trimmedEmail,
        username: localPart,
        identityNumber:
          detectedRole === 'student' && /^\d+$/.test(localPart)
            ? localPart
            : baseUser.identityNumber,
      };
    }

    setUser(loggedInUser);
    const now = Date.now();
    setSessionStartedAt(now);
    localStorage.setItem(SESSION_TIMESTAMP_KEY, now.toString());

    return { success: true, user: loggedInUser };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setSessionStartedAt(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(SESSION_TIMESTAMP_KEY);
  }, []);

  const demoAccounts = [
    {
      role: 'student' as UserRole,
      label: 'Mahasiswa (David Wowor)',
      email: '12410168@student.unklab.ac.id',
      name: 'David Wowor (12410168)',
    },
    {
      role: 'lecturer' as UserRole,
      label: 'Dosen (Dr. Ronny Gosal, M.Kom.)',
      email: 'dosen@unklab.ac.id',
      name: 'Dr. Ronny Gosal, M.Kom. (0912038401)',
    },
  ];

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'student',
        isAuthenticated: !!user,
        login,
        logout,
        demoAccounts,
        sessionStartedAt,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
