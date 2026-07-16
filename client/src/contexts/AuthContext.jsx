import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authService } from '../services/auth.service';
import { setAccessToken } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // true while we attempt silent session restore

  // On first load, try to silently refresh using the httpOnly cookie so a page
  // reload doesn't force a fresh login if the refresh token is still valid.
  useEffect(() => {
    const bootstrap = async () => {
      try {
        const { data } = await authService.refresh();
        setAccessToken(data.data.accessToken);
        const me = await authService.getMe();
        setUser(me.data.data.user);
      } catch {
        setAccessToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    bootstrap();
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await authService.login({ email, password });
    setAccessToken(data.data.accessToken);
    setUser(data.data.user);
    return data.data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  }, []);

  const value = { user, setUser, isLoading, isAuthenticated: !!user, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
