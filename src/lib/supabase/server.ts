import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { verifyValue } from '@/lib/cookie-signing';

export function createClient() {
  const cookieStore = cookies();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  // Only create a real client if properly configured
  if (!supabaseUrl.startsWith('http') || !supabaseKey.startsWith('eyJ')) {
    // Return a mock client that won't connect to any real service
    return createServerClient('https://placeholder.supabase.co', 'placeholder-key', {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {
          // No-op in Server Components
        },
      },
    });
  }

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: any }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Ignore call from Server Component context
        }
      },
    },
  });
}

// ── Server-side session helpers ──────────────────────────────

export interface ServerSession {
  isAuthenticated: boolean;
  isAdmin: boolean;
  userId: string | null;
  email: string | null;
  role: string | null;
}

/**
 * Read and validate the `technova_auth_user` cookie server-side.
 *
 * Security: The cookie MUST be HMAC-signed. Unsigned or forged
 * cookies are rejected. This prevents privilege escalation by
 * modifying the cookie's `role` field.
 *
 * Works in Server Components, Route Handlers, and Server Actions.
 */
export async function getServerSession(): Promise<ServerSession> {
  const empty: ServerSession = {
    isAuthenticated: false,
    isAdmin: false,
    userId: null,
    email: null,
    role: null,
  };

  try {
    const cookieStore = cookies();
    const authCookie = cookieStore.get('technova_auth_user')?.value;
    if (!authCookie) return empty;

    // Verify the HMAC signature — reject forged cookies
    const verified = await verifyValue(authCookie);
    if (!verified) return empty;

    const profile = JSON.parse(decodeURIComponent(verified));

    if (!profile?.id || !profile?.email) return empty;

    return {
      isAuthenticated: true,
      isAdmin: profile.role === 'admin' || profile.role === 'manager',
      userId: profile.id,
      email: profile.email,
      role: profile.role,
    };
  } catch {
    return empty;
  }
}

/**
 * Get the current Supabase user via the server client.
 * Returns null when Supabase is not configured or the session
 * has expired.
 */
export async function getSupabaseUser() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const isConfigured =
    supabaseUrl.startsWith('http') && supabaseKey.length > 10 && supabaseKey.startsWith('eyJ');

  if (!isConfigured) return null;

  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch {
    return null;
  }
}
