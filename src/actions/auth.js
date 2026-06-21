'use server';

import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/db';

export async function adminLogin(email, password) {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    // Verify this user is actually an admin
    const adminUser = await prisma.adminUser.findUnique({
      where: { authId: data.user.id },
    });

    if (!adminUser || !adminUser.active) {
      // Not an admin — sign them out immediately
      await supabase.auth.signOut();
      return { success: false, error: 'Access denied. Admin privileges required.' };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: 'Login failed' };
  }
}

export async function adminLogout() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Logout failed' };
  }
}

export async function getSessionAdmin() {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return { success: false };

    // Verify they are an actual admin in the database
    const adminUser = await prisma.adminUser.findUnique({
      where: { authId: user.id },
    });

    if (!adminUser || !adminUser.active) {
      return { success: false };
    }

    return { success: true, authId: user.id, email: user.email, role: adminUser.role };
  } catch (err) {
    return { success: false };
  }
}
