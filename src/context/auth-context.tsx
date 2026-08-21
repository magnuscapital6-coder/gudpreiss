'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserProfile } from '@/types';
import { createClient } from '@/lib/supabase/client';
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

// Cookie helpers for middleware-readable auth state
const AUTH_COOKIE = 'gudpreiss_auth_user';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

/**
 * Sign cookie value with HMAC-SHA256 client-side.
 * Uses the same Web Crypto API as the server.
 * The signature prevents cookie forgery.
 */
async function signValue(value: string): Promise<string> {
  const secret = 'gudpreiss-dev-secret-change-in-production';
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(value));
  const hex = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return `${value}.${hex}`;
}

async function setAuthCookie(profile: UserProfile) {
  try {
    const jsonValue = JSON.stringify(profile);
    const encoded = encodeURIComponent(jsonValue);
    const signed = await signValue(encoded);
    document.cookie = `${AUTH_COOKIE}=${signed}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
  } catch {
    // Non-blocking
  }
}

function removeAuthCookie() {
  document.cookie = `${AUTH_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
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
          await setAuthCookie(profile);
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
      const newUser: UserProfile = {
        id: `usr-${Date.now()}`,
        email: cleanEmail,
        full_name: fullName || cleanEmail.split('@')[0],
        avatar_url: null,
        phone: null,
        role: 'customer',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setUser(newUser);
      localStorage.setItem('gudpreiss_auth_user', JSON.stringify(newUser));
      await setAuthCookie(newUser);
      setIsLoading(false);
      return { success: true };
    } catch (err: unknown) {
      setIsLoading(false);
      const message = err instanceof Error ? err.message : 'Fehler bei der Registrierung.';
      return { success: false, error: message };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      const supabase = createClient();
      if (supabase && process.env.NEXT_PUBLIC_SUPABASE_URL) {
        await supabase.auth.signOut();
      }
    } catch {
      // Ignore
    }
    setUser(null);
    localStorage.removeItem('gudpreiss_auth_user');
    removeAuthCookie();
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
