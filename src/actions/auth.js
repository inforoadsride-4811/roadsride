'use server';

import { createClient } from '@/lib/supabase/server';

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
