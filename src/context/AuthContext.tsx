import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, UserRole } from '../types/academic';
import { MOCK_USERS } from '../data/mockAcademicData';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  login: (email: string, role?: UserRole) => boolean;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  demoAccounts: { role: UserRole; label: string; email: string; name: string }[];
  sessionStartedAt: number | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'siam_unklab_auth_user';
const SESSION_TIMESTAMP_KEY = 'siam_unklab_session_time';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
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

  const login = useCallback((email: string, role?: UserRole): boolean => {
    const trimmedEmail = email.trim().toLowerCase();
    const found = MOCK_USERS.find(
      (u) => u.email.toLowerCase() === trimmedEmail || (role && u.role === role)
    );

    if (found) {
      setUser(found);
      const now = Date.now();
      setSessionStartedAt(now);
      localStorage.setItem(SESSION_TIMESTAMP_KEY, now.toString());
      return true;
    }

    if (role) {
      const byRole = MOCK_USERS.find((u) => u.role === role);
      if (byRole) {
        setUser(byRole);
        const now = Date.now();
        setSessionStartedAt(now);
        localStorage.setItem(SESSION_TIMESTAMP_KEY, now.toString());
        return true;
      }
    }

    return false;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setSessionStartedAt(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(SESSION_TIMESTAMP_KEY);
  }, []);

  const switchRole = useCallback((newRole: UserRole) => {
    const targetUser = MOCK_USERS.find((u) => u.role === newRole);
    if (targetUser) {
      setUser(targetUser);
    }
  }, []);

  const demoAccounts = [
    {
      role: 'student' as UserRole,
      label: 'Mahasiswa (David Wowor)',
      email: 'mahasiswa@unklab.ac.id',
      name: 'David Wowor (105022110001)',
    },
    {
      role: 'lecturer' as UserRole,
      label: 'Dosen (Dr. Ronny Gosal, M.Kom.)',
      email: 'dosen@unklab.ac.id',
      name: 'Dr. Ronny Gosal, M.Kom. (0912038401)',
    },
    {
      role: 'admin' as UserRole,
      label: 'Admin Akademik (Semuel Mewengkang)',
      email: 'admin@unklab.ac.id',
      name: 'Semuel Mewengkang, S.Kom.',
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
        switchRole,
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
