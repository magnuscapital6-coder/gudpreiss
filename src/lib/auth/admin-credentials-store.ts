import { createClient } from '@supabase/supabase-js';

/**
 * Server-side admin credential management via Supabase.
 * No fallback — requires Supabase to be configured.
 */

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function getAdminCredentials() {
  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    console.error('[ADMIN_CREDENTIALS] Supabase not configured');
    return null;
  }

  try {
    const { data: users } = await supabaseAdmin.auth.admin.listUsers();
    const adminUser = users?.users?.find(
      (u) => u.user_metadata?.role === 'admin' || u.app_metadata?.role === 'admin'
    );

    if (adminUser) {
      return {
        id: adminUser.id,
        email: adminUser.email || '',
      };
    }

    return null;
  } catch (err) {
    console.error('[ADMIN_CREDENTIALS] Error fetching admin user:', err);
    return null;
  }
}

export async function updateAdminCredentials(newEmail: string, newPassword?: string) {
  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    return { success: false, error: 'Supabase not configured' };
  }

  const cleanEmail = newEmail.trim().toLowerCase();

  try {
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    let adminUser = existingUsers?.users?.find(
      (u) => u.user_metadata?.role === 'admin' || u.app_metadata?.role === 'admin'
    );

    let userId: string;

    if (adminUser) {
      userId = adminUser.id;
      const updateData: Record<string, unknown> = {
        email: cleanEmail,
        email_confirm: true,
        user_metadata: { full_name: 'GudPreiss Admin', role: 'admin' },
      };
      if (newPassword) {
        updateData.password = newPassword;
      }
      await supabaseAdmin.auth.admin.updateUserById(userId, updateData);
    } else {
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: cleanEmail,
        password: newPassword || 'admin123',
        email_confirm: true,
        user_metadata: { full_name: 'GudPreiss Admin', role: 'admin' },
      });
      if (createError) {
        console.error('[ADMIN_CREDENTIALS] Create error:', createError.message);
        return { success: false, error: createError.message };
      }
      userId = newUser?.user?.id || `usr-${cleanEmail.replace(/[^a-z0-9]/g, '-')}`;
    }

    await supabaseAdmin.from('profiles').upsert({
      id: userId,
      email: cleanEmail,
      full_name: 'GudPreiss Admin',
      role: 'admin',
      updated_at: new Date().toISOString(),
    });

    await supabaseAdmin.from('store_settings').upsert({
      id: 'default',
      admin_email: cleanEmail,
      updated_at: new Date().toISOString(),
    });

    return { success: true, email: cleanEmail, userId };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[ADMIN_CREDENTIALS] Error:', message);
    return { success: false, error: message };
  }
}
