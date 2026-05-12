import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type UserRole = 'admin' | 'moderator' | 'user';

export type User = { 
  id: number; 
  username: string; 
  role: UserRole; 
  points: number; 
  avatarUrl?: string | null; 
  isVerified: boolean; 
  isVip: boolean;
  vipSince?: string;
} | null;

interface RegisterResponse {
  requiresVerification?: boolean;
  message?: string;
}

interface AuthState {
  user: User;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
  login: (e: string, p: string, t: string) => Promise<void>;
  register: (u: string, e: string, p: string, t: string) => Promise<RegisterResponse>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (!res.ok) throw new Error('Unauthenticated');
      const data = await res.json() as { user: User };
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string, turnstileToken: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, turnstileToken })
    });
    
    const data = (await res.json()) as { error?: string };
    
    if (!res.ok) throw new Error(data.error || 'Login failed');
    await refreshUser();
  };

  const register = async (username: string, email: string, password: string, turnstileToken: string): Promise<RegisterResponse> => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, turnstileToken })
    });
    
    const data = (await res.json()) as { error?: string; requiresVerification?: boolean; message?: string };
    
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    if (!data.requiresVerification) {
      await refreshUser();
    }
    return { requiresVerification: data.requiresVerification, message: data.message };
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    window.location.href = '/login';
  };

  useEffect(() => { refreshUser(); }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, refreshUser, logout, login, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be executed within an AuthProvider instance');
  return context;
};
