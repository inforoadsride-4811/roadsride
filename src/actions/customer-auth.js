'use server';

import { cookies, headers } from 'next/headers';
import prisma from '@/lib/db';
import { createClient } from '@/lib/supabase/server';
import supabaseAdmin from '@/lib/supabase/admin';
import { sendCustomerWelcomeEmail, sendOTPEmail, sendPasswordResetOTPEmail } from '@/actions/email';
import { signupSchema, loginSchema, otpSchema, passwordResetSchema, validateForm } from '@/lib/validations';

// ── Helpers ──

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function parseUserAgent(userAgent) {
  if (!userAgent) return { browser: 'Unknown', platform: 'Unknown', device: 'Desktop' };
  
  let browser = 'Unknown';
  if (userAgent.includes('Chrome')) browser = 'Chrome';
  else if (userAgent.includes('Safari')) browser = 'Safari';
  else if (userAgent.includes('Firefox')) browser = 'Firefox';
  else if (userAgent.includes('Edge')) browser = 'Edge';

  let platform = 'Unknown';
  if (userAgent.includes('Windows')) platform = 'Windows';
  else if (userAgent.includes('Mac OS')) platform = 'MacOS';
  else if (userAgent.includes('Linux')) platform = 'Linux';
  else if (userAgent.includes('Android')) platform = 'Android';
  else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) platform = 'iOS';

  let device = 'Desktop';
  if (userAgent.includes('Mobile') || platform === 'Android' || platform === 'iOS') {
    device = 'Mobile';
  }

  return { browser, platform, device };
}

// ── Step 1: Start Signup Verification ──
// Validates data, checks for existing user, generates OTP, sends email.
// Does NOT create any auth or customer record yet.

export async function startSignupVerification(data) {
  try {
    // 1. Validate with Zod
    const validation = validateForm(signupSchema, data);
    if (!validation.success) {
      return { success: false, errors: validation.errors };
    }

    const { email, password, firstName, lastName, phone } = validation.data;

    // 2. Check if email already exists in Customer table
    const existingCustomer = await prisma.customer.findUnique({
      where: { email },
    });
    if (existingCustomer) {
      return { success: false, error: 'An account with this email already exists.' };
    }

    // 3. Delete any old OTPs for this email (single active OTP per email)
    await prisma.oTPVerification.deleteMany({
      where: { email, type: 'signup' },
    });

    // 4. Generate OTP + store with signup data
    const otp = generateOTP();
    await prisma.oTPVerification.create({
      data: {
        email,
        otp,
        type: 'signup',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
        signupData: { firstName, lastName, phone, password },
      },
    });

    // 5. Send OTP via Resend
    await sendOTPEmail(email, otp);

    return { success: true };
  } catch (error) {
    console.error('Start signup verification error:', error);
    return { success: false, error: 'Something went wrong. Please try again.' };
  }
}

// ── Step 2: Complete Signup (Atomic with Rollback) ──
// Verifies OTP, creates Supabase Auth user, creates Customer record.
// If any step fails, rolls back everything.

export async function completeSignup(data) {
  try {
    // 1. Validate OTP input
    const validation = validateForm(otpSchema, data);
    if (!validation.success) {
      return { success: false, errors: validation.errors };
    }

    const { email, otp } = validation.data;

    // 2. Find the active OTP record
    const otpRecord = await prisma.oTPVerification.findFirst({
      where: {
        email,
        type: 'signup',
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) {
      return { success: false, error: 'OTP has expired. Please request a new one.' };
    }

    // 3. Check attempts (max 3)
    if (otpRecord.attempts >= 3) {
      await prisma.oTPVerification.delete({ where: { id: otpRecord.id } });
      return { success: false, error: 'Too many failed attempts. Please request a new OTP.' };
    }

    // 4. Verify OTP
    if (otpRecord.otp !== otp) {
      await prisma.oTPVerification.update({
        where: { id: otpRecord.id },
        data: { attempts: { increment: 1 } },
      });
      return { success: false, error: `Invalid OTP. ${2 - otpRecord.attempts} attempts remaining.` };
    }

    // 5. Extract signup data
    const signupData = otpRecord.signupData;
    const { firstName, lastName, phone, password } = signupData;
    const fullName = `${firstName} ${lastName}`.trim();

    // 6. Get device info
    const headersList = await headers();
    const userAgent = headersList.get('user-agent') || '';
    const ip = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'Unknown';
    const { browser, platform, device } = parseUserAgent(userAgent);

    // ── CRITICAL TRANSACTIONAL BLOCK ──
    let authUserId = null;

    try {
      // Step A: Create Supabase Auth user via Admin API (email_confirm: true bypasses Supabase emails)
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: fullName, phone },
      });

      if (authError) {
        throw new Error(`Auth creation failed: ${authError.message}`);
      }

      authUserId = authData.user.id;

      // Step B: Create Customer record in database
      await prisma.customer.create({
        data: {
          authId: authUserId,
          email,
          name: fullName,
          phone: phone || null,
          avatar: data.avatar || null,
          status: 'active',
          emailVerified: true,
          lastLoginDate: new Date(),
          lastActiveDate: new Date(),
          lastLoginIp: ip,
          lastLoginDevice: device,
          lastLoginBrowser: browser,
          lastLoginPlatform: platform,
        },
      });

      // Step C: Sign the user in immediately
      const supabase = await createClient();
      await supabase.auth.signInWithPassword({ email, password });

    } catch (criticalError) {
      // ── ROLLBACK ──
      // If auth user was created but DB failed, delete the orphan auth user
      if (authUserId) {
        await supabaseAdmin.auth.admin.deleteUser(authUserId).catch(err => 
          console.error('Failed to rollback auth user:', err)
        );
      }
      console.error('Critical signup error (rolled back):', criticalError);
      return { success: false, error: 'Account creation failed. Please try again.' };
    }

    // 7. Delete the OTP record (cleanup)
    await prisma.oTPVerification.delete({ where: { id: otpRecord.id } }).catch(() => {});

    // ── NON-CRITICAL PARALLEL TASKS (fire-and-forget) ──
    Promise.allSettled([
      sendCustomerWelcomeEmail(email, fullName),
      // Future: Activity log, analytics, marketing subscriber, etc.
    ]).catch(() => {});

    return { success: true };
  } catch (error) {
    console.error('Complete signup error:', error);
    return { success: false, error: 'Something went wrong. Please try again.' };
  }
}

// ── Resend OTP ──

export async function resendOTP(email) {
  try {
    // Delete old OTPs
    const existingOtp = await prisma.oTPVerification.findFirst({
      where: { email, type: 'signup', expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
    });

    if (!existingOtp) {
      return { success: false, error: 'No pending verification found. Please start over.' };
    }

    // Check cooldown (30 seconds)
    const timeSinceCreated = Date.now() - new Date(existingOtp.createdAt).getTime();
    if (timeSinceCreated < 30000) {
      return { success: false, error: 'Please wait 30 seconds before requesting a new code.' };
    }

    // Delete old, create new
    await prisma.oTPVerification.deleteMany({ where: { email, type: 'signup' } });

    const otp = generateOTP();
    await prisma.oTPVerification.create({
      data: {
        email,
        otp,
        type: 'signup',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        signupData: existingOtp.signupData,
      },
    });

    await sendOTPEmail(email, otp);
    return { success: true };
  } catch (error) {
    console.error('Resend OTP error:', error);
    return { success: false, error: 'Failed to resend OTP.' };
  }
}

// ── Login ──

export async function customerLogin(data) {
  try {
    const validation = validateForm(loginSchema, data);
    if (!validation.success) {
      return { success: false, errors: validation.errors };
    }

    const { email, password } = validation.data;
    const supabase = await createClient();

    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (authData.user) {
      const customer = await prisma.customer.findUnique({
        where: { authId: authData.user.id },
      });

      if (customer && (customer.status === 'banned' || customer.status === 'suspended' || customer.status === 'deleted')) {
        await supabase.auth.signOut();
        return { success: false, error: 'Your account has been suspended. Please contact support.' };
      }

      // Update login metadata
      const headersList = await headers();
      const userAgent = headersList.get('user-agent') || '';
      const ip = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'Unknown';
      const { browser, platform, device } = parseUserAgent(userAgent);

      if (customer) {
        await prisma.customer.update({
          where: { id: customer.id },
          data: {
            lastLoginDate: new Date(),
            lastActiveDate: new Date(),
            lastLoginIp: ip,
            lastLoginDevice: device,
            lastLoginBrowser: browser,
            lastLoginPlatform: platform,
          },
        });
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'Something went wrong during login.' };
  }
}

// ── Logout ──

export async function customerLogout() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

// ── Get Session Customer ──

export async function getSessionCustomer() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, customer: null };

    const customer = await prisma.customer.findUnique({
      where: { authId: user.id },
      include: { addresses: true },
    });

    if (!customer) return { success: false, customer: null };

    if (customer.status === 'banned' || customer.status === 'suspended' || customer.status === 'deleted') {
      return { success: false, customer: null };
    }

    return { 
      success: true, 
      customer: {
        id: customer.id,
        authId: customer.authId,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        avatar: customer.avatar,
        status: customer.status,
        emailVerified: customer.emailVerified,
        createdAt: customer.createdAt,
        addresses: customer.addresses,
      } 
    };
  } catch (error) {
    return { success: false, customer: null };
  }
}

// ── Update Customer Profile ──

export async function updateCustomerProfile(data) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const customer = await prisma.customer.findUnique({ where: { authId: user.id } });
    if (!customer) return { success: false, error: 'Customer not found' };

    await prisma.customer.update({
      where: { id: customer.id },
      data: {
        name: data.name || customer.name,
        phone: data.phone || customer.phone,
        avatar: data.avatar || customer.avatar,
        lastActiveDate: new Date(),
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Update profile error:', error);
    return { success: false, error: 'Failed to update profile' };
  }
}

// ── Password Reset: Request OTP ──

export async function requestPasswordReset(email) {
  try {
    if (!email) return { success: false, error: 'Email is required.' };

    // Check customer exists
    const customer = await prisma.customer.findUnique({ where: { email } });
    if (!customer) {
      // Don't reveal if email exists or not for security
      return { success: true };
    }

    // Delete old OTPs for this email, keep single active
    await prisma.oTPVerification.deleteMany({ where: { email, type: 'password_reset' } });

    const otp = generateOTP();
    await prisma.oTPVerification.create({
      data: {
        email,
        otp,
        type: 'password_reset',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    await sendPasswordResetOTPEmail(email, otp);
    return { success: true };
  } catch (error) {
    console.error('Password reset request error:', error);
    return { success: false, error: 'Something went wrong.' };
  }
}

// ── Password Reset: Complete ──

export async function completePasswordReset(data) {
  try {
    const validation = validateForm(passwordResetSchema, data);
    if (!validation.success) {
      return { success: false, errors: validation.errors };
    }

    const { email, otp, newPassword } = validation.data;

    // Find OTP
    const otpRecord = await prisma.oTPVerification.findFirst({
      where: {
        email,
        type: 'password_reset',
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) {
      return { success: false, error: 'OTP has expired. Please request a new one.' };
    }

    if (otpRecord.attempts >= 3) {
      await prisma.oTPVerification.delete({ where: { id: otpRecord.id } });
      return { success: false, error: 'Too many failed attempts. Please request a new OTP.' };
    }

    if (otpRecord.otp !== otp) {
      await prisma.oTPVerification.update({
        where: { id: otpRecord.id },
        data: { attempts: { increment: 1 } },
      });
      return { success: false, error: `Invalid OTP. ${2 - otpRecord.attempts} attempts remaining.` };
    }

    // Find customer + update password via Admin API
    const customer = await prisma.customer.findUnique({ where: { email } });
    if (!customer) {
      return { success: false, error: 'Account not found.' };
    }

    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(customer.authId, {
      password: newPassword,
    });

    if (updateError) {
      return { success: false, error: 'Failed to update password.' };
    }

    // Cleanup OTP
    await prisma.oTPVerification.delete({ where: { id: otpRecord.id } }).catch(() => {});

    return { success: true };
  } catch (error) {
    console.error('Password reset error:', error);
    return { success: false, error: 'Something went wrong.' };
  }
}
