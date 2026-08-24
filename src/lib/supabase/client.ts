import { createBrowserClient } from '@supabase/ssr';

/**
 * Browser Supabase client.
 * Returns a client only if properly configured, otherwise returns null.
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  // Only create a real client if properly configured
  if (!supabaseUrl.startsWith('http') || !supabaseKey || supabaseKey.length < 10) {
    // Return a no-op client that won't connect to any real service
    return createBrowserClient('https://placeholder.supabase.co', 'placeholder-key');
  }

  return createBrowserClient(supabaseUrl, supabaseKey);
}
