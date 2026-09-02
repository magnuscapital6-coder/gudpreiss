'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserProfile } from '@/types';
import {
  checkClientRateLimit,
  recordClientFailedAttempt,
  resetClientRateLimit,
} from '@/lib/rate-limit';

interface AuthContextType {
  user: UserProfile | null;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string; retryAfter?: number; remaining?: number }>;
  register: (email: string, password?: string, fullName?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('gudpreiss_auth_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  }, []);

  const login = useCallback(async (email: string, password?: string) => {
    setIsLoading(true);
    try {
      const cleanEmail = email.trim().toLowerCase();

      // Client-side rate limit check (first line of defense)
      const clientLimit = checkClientRateLimit(cleanEmail, 5, 15 * 60 * 1000);
      if (!clientLimit.allowed) {
        setIsLoading(false);
        return {
          success: false,
          error: `Zu viele Anmeldeversuche. Bitte warten Sie ${clientLimit.retryAfterSeconds} Sekunden.`,
          retryAfter: clientLimit.retryAfterSeconds,
        };
      }

      // Server-side login via API (with server-side rate limiting)
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: cleanEmail, password: password || '' }),
        });

        const data = await res.json();

        if (res.status === 429) {
          recordClientFailedAttempt(cleanEmail, 5, 15 * 60 * 1000);
          setIsLoading(false);
          return {
            success: false,
            error: data.error || 'Zu viele Anmeldeversuche.',
            retryAfter: data.retryAfter || 900,
          };
        }

        if (res.ok && data.success && data.user) {
          // Success - reset rate limits
          resetClientRateLimit(cleanEmail);
          const profile: UserProfile = {
            id: data.user.id,
            email: data.user.email,
            full_name: data.user.full_name,
            avatar_url: null,
            phone: null,
            role: data.user.role,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          setUser(profile);
          localStorage.setItem('gudpreiss_auth_user', JSON.stringify(profile));
          setIsLoading(false);
          return { success: true };
        }

        // Server rejected - record failed attempt
        recordClientFailedAttempt(cleanEmail, 5, 15 * 60 * 1000);
        setIsLoading(false);
        return {
          success: false,
          error: data.error || 'Ungültige Anmeldeinformationen.',
          remaining: data.remaining,
        };
      } catch {
        // API unreachable — NO client-side fallback.
        // Users must reach the server to authenticate.
        // This prevents anyone from granting themselves admin access
        // by crafting a cookie when the API is down.
        recordClientFailedAttempt(cleanEmail, 5, 15 * 60 * 1000);
        setIsLoading(false);
        return { success: false, error: 'Server nicht erreichbar. Bitte versuchen Sie es später erneut.' };
      }
    } catch (err: unknown) {
      setIsLoading(false);
      const message = err instanceof Error ? err.message : 'Fehler bei der Anmeldung.';
      return { success: false, error: message };
    }
  }, []);

  const register = useCallback(async (email: string, password?: string, fullName?: string) => {
    setIsLoading(true);
    try {
      const cleanEmail = email.trim().toLowerCase();

      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: cleanEmail,
            password: password || '',
            fullName: fullName || cleanEmail.split('@')[0],
          }),
        });

        const data = await res.json();

        if (res.status === 429) {
          setIsLoading(false);
          return {
            success: false,
            error: data.error || 'Zu viele Registrierungsversuche.',
          };
        }

        if (res.ok && data.success && data.user) {
          const profile: UserProfile = {
            id: data.user.id,
            email: data.user.email,
            full_name: data.user.full_name,
            avatar_url: null,
            phone: null,
            role: data.user.role,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          setUser(profile);
          localStorage.setItem('gudpreiss_auth_user', JSON.stringify(profile));
          setIsLoading(false);
          return { success: true };
        }

        setIsLoading(false);
        return {
          success: false,
          error: data.error || 'Registrierung fehlgeschlagen.',
        };
      } catch {
        setIsLoading(false);
        return { success: false, error: 'Server nicht erreichbar.' };
      }
    } catch (err: unknown) {
      setIsLoading(false);
      const message = err instanceof Error ? err.message : 'Fehler bei der Registrierung.';
      return { success: false, error: message };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // Ignore
    }
    setUser(null);
    localStorage.removeItem('gudpreiss_auth_user');
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin: user?.role === 'admin' || user?.role === 'manager',
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
