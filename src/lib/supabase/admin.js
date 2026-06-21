import { createClient } from '@supabase/supabase-js';

// Admin client uses the service_role key — NEVER expose this on the frontend.
// This is only used in server actions for admin operations like
// creating users with email_confirm: true and deleting orphan users.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export default supabaseAdmin;
