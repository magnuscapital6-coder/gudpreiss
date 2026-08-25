import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

let inMemoryAdminCredentials = {
  email: process.env.DEMO_ADMIN_EMAIL || 'admin@gudpreiss.de',
  password: process.env.DEMO_ADMIN_PASSWORD || 'admin123',
};

export async function getAdminCredentials() {
  if (supabaseAdmin) {
    try {
      const { data: users } = await supabaseAdmin.auth.admin.listUsers();
      const adminUser = users?.users?.find(
        (u) => u.email === inMemoryAdminCredentials.email || u.user_metadata?.role === 'admin'
      );
      if (adminUser) {
        return {
          id: adminUser.id,
          email: adminUser.email || inMemoryAdminCredentials.email,
          password: inMemoryAdminCredentials.password,
        };
      }
    } catch (err) {
      console.error('Error fetching admin user from Supabase:', err);
    }
  }

  return {
    id: 'usr-admin-default',
    email: inMemoryAdminCredentials.email,
    password: inMemoryAdminCredentials.password,
  };
}

export async function updateAdminCredentials(newEmail: string, newPassword?: string) {
  const cleanEmail = newEmail.trim().toLowerCase();
  
  if (newPassword) {
    inMemoryAdminCredentials.password = newPassword;
  }
  inMemoryAdminCredentials.email = cleanEmail;

  try {
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    let adminUser = existingUsers?.users?.find(
      (u) => u.email === cleanEmail || u.user_metadata?.role === 'admin'
    );

    let userId: string;

    if (adminUser) {
      userId = adminUser.id;
      const updateData: any = {
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
        console.error('Supabase admin create error:', createError.message);
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
  } catch (err: any) {
    console.error('Error updating admin credentials:', err.message || err);
    return { success: true, email: cleanEmail, warning: err.message };
  }
}

export function isCustomAdminPasswordValid(password: string): boolean {
  if (inMemoryAdminCredentials.password && password === inMemoryAdminCredentials.password) {
    return true;
  }
  return false;
}
