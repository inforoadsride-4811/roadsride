import { z } from 'zod';

// ── Signup ──
export const signupSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name is too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name is too long'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number is too long')
    .regex(/^[+]?[\d\s-]+$/, 'Please enter a valid phone number'),
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .max(128, 'Password is too long'),
});

// ── OTP ──
export const otpSchema = z.object({
  email: z.string().email('Invalid email'),
  otp: z.string().length(6, 'OTP must be 6 digits').regex(/^\d{6}$/, 'OTP must be numeric'),
});

// ── Login ──
export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

// ── Checkout ──
export const checkoutSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string()
    .regex(/^\+91\d{10}$/, 'Phone number must be exactly 10 digits starting with +91'),
  address: z.string().min(5, 'Please enter a complete address'),
  apartment: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string()
    .min(6, 'Pincode must be 6 digits')
    .max(6, 'Pincode must be 6 digits')
    .regex(/^\d{6}$/, 'Please enter a valid 6-digit pincode'),
});

// ── Password Reset ──
export const passwordResetRequestSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export const passwordResetSchema = z.object({
  email: z.string().email('Invalid email'),
  otp: z.string().length(6, 'OTP must be 6 digits').regex(/^\d{6}$/, 'OTP must be numeric'),
  newPassword: z.string()
    .min(6, 'Password must be at least 6 characters')
    .max(128, 'Password is too long'),
});

// ── Profile Update ──
export const profileUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  phone: z.string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number is too long')
    .regex(/^[+]?[\d\s-]+$/, 'Please enter a valid phone number')
    .optional()
    .or(z.literal('')),
});

/**
 * Helper: Validate data against a Zod schema.
 * Returns { success: true, data } or { success: false, errors: { fieldName: 'message' } }
 */
export function validateForm(schema, data) {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0];
    if (field && !errors[field]) {
      errors[field] = issue.message;
    }
  }
  return { success: false, errors };
}
