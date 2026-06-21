'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Loader2, Camera, ArrowLeft, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { startSignupVerification, completeSignup, resendOTP } from '@/actions/customer-auth';
import { uploadFile, BUCKETS } from '@/lib/storage';
import { signupSchema, validateForm } from '@/lib/validations';

export default function SignupPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const avatarInputRef = useRef(null);

  // Step: 'form' | 'otp' | 'success'
  const [step, setStep] = useState('form');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
  });

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [otpValue, setOtpValue] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setAvatarPreview(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear field error on change
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  // ── Step 1: Submit Form → Send OTP ──
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    // Client-side Zod validation
    const validation = validateForm(signupSchema, formData);
    if (!validation.success) {
      setErrors(validation.errors);
      return;
    }

    setLoading(true);
    setErrors({});

    const result = await startSignupVerification(formData);

    if (result.success) {
      setStep('otp');
      setResendCooldown(30);
      addToast({ title: 'OTP Sent!', message: 'Check your email for the verification code.', type: 'success' });
    } else if (result.errors) {
      setErrors(result.errors);
    } else {
      addToast({ title: 'Signup failed', message: result.error, type: 'error' });
    }
    setLoading(false);
  };

  // ── Step 2: Verify OTP → Complete Signup ──
  const handleOTPSubmit = async (e) => {
    e.preventDefault();

    if (otpValue.length !== 6) {
      setErrors({ otp: 'Please enter the 6-digit code.' });
      return;
    }

    setLoading(true);
    setErrors({});

    // Upload avatar if provided
    let avatarUrl = '';
    if (avatarFile) {
      const uploadResult = await uploadFile(avatarFile, BUCKETS.CUSTOMERS, 'avatars/');
      if (uploadResult.success) {
        avatarUrl = uploadResult.url;
      }
    }

    const result = await completeSignup({
      email: formData.email,
      otp: otpValue,
      avatar: avatarUrl,
    });

    if (result.success) {
      setStep('success');
      addToast({ title: 'Account created!', message: 'Welcome to RoadsRide.', type: 'success' });
      setTimeout(() => {
        router.push('/account');
        router.refresh();
      }, 2000);
    } else if (result.errors) {
      setErrors(result.errors);
    } else {
      addToast({ title: 'Verification failed', message: result.error, type: 'error' });
    }
    setLoading(false);
  };

  // ── Resend OTP ──
  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;
    setLoading(true);
    const result = await resendOTP(formData.email);
    if (result.success) {
      setResendCooldown(30);
      addToast({ title: 'New code sent!', message: 'Check your email.', type: 'success' });
    } else {
      addToast({ title: 'Failed', message: result.error, type: 'error' });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[70vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-brand-black">
          {step === 'form' && 'Create an account'}
          {step === 'otp' && 'Verify your email'}
          {step === 'success' && 'Welcome aboard!'}
        </h2>
        {step === 'form' && (
          <p className="mt-2 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/account/login" className="font-medium text-brand-yellow-hover hover:text-brand-yellow transition-colors">
              Sign in
            </Link>
          </p>
        )}
        {step === 'otp' && (
          <p className="mt-2 text-center text-sm text-gray-600">
            We sent a 6-digit code to <strong>{formData.email}</strong>
          </p>
        )}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm border border-brand-border sm:rounded-xl sm:px-10">

          {/* ── STEP 1: FORM ── */}
          {step === 'form' && (
            <form className="space-y-5" onSubmit={handleFormSubmit}>
              {/* Avatar Upload */}
              <div className="flex justify-center mb-2">
                <div className="relative group cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
                  <div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 group-hover:border-brand-yellow flex items-center justify-center overflow-hidden transition-colors">
                    {avatarPreview ? (
                      <Image src={avatarPreview} alt="Avatar" width={96} height={96} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl text-gray-400 font-bold">{formData.firstName?.charAt(0)?.toUpperCase() || '?'}</span>
                    )}
                  </div>
                  <div className="absolute bottom-0 right-0 w-8 h-8 bg-brand-yellow rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Camera size={14} className="text-brand-black" />
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    ref={avatarInputRef}
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </div>
              </div>
              <p className="text-center text-xs text-gray-400 -mt-2">Tap to add photo (optional)</p>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First name</label>
                  <Input
                    name="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="John"
                    className={errors.firstName ? 'border-red-400' : ''}
                  />
                  {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last name</label>
                  <Input
                    name="lastName"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Doe"
                    className={errors.lastName ? 'border-red-400' : ''}
                  />
                  {errors.lastName && <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                <Input
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className={errors.email ? 'border-red-400' : ''}
                />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone number</label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-200 bg-gray-50 text-gray-500 text-sm font-medium">+91</span>
                  <Input
                    name="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="9876543210"
                    className={`rounded-l-none ${errors.phone ? 'border-red-400' : ''}`}
                  />
                </div>
                {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <Input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Minimum 6 characters"
                    className={`pr-10 ${errors.password ? 'border-red-400' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
              </div>

              <div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 mt-2 text-base bg-brand-yellow text-brand-black hover:bg-brand-yellow-hover rounded-xl font-bold"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Continue'}
                </Button>
              </div>

              <p className="text-xs text-center text-gray-500 mt-4">
                By creating an account, you agree to our Terms of Service and Privacy Policy.
              </p>
            </form>
          )}

          {/* ── STEP 2: OTP VERIFICATION ── */}
          {step === 'otp' && (
            <form className="space-y-6" onSubmit={handleOTPSubmit}>
              <button type="button" onClick={() => setStep('form')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-brand-black transition-colors">
                <ArrowLeft size={14} /> Back
              </button>

              <div className="text-center">
                <div className="w-16 h-16 bg-brand-yellow/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">✉️</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-center">Enter verification code</label>
                <Input
                  type="text"
                  maxLength={6}
                  value={otpValue}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setOtpValue(val);
                    if (errors.otp) setErrors(prev => ({ ...prev, otp: undefined }));
                  }}
                  placeholder="000000"
                  className={`text-center text-2xl tracking-[0.5em] font-bold h-14 ${errors.otp ? 'border-red-400' : ''}`}
                  autoFocus
                />
                {errors.otp && <p className="text-xs text-red-500 mt-1 text-center">{errors.otp}</p>}
              </div>

              <Button
                type="submit"
                disabled={loading || otpValue.length !== 6}
                className="w-full h-11 text-base bg-brand-yellow text-brand-black hover:bg-brand-yellow-hover rounded-xl font-bold"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify & Create Account'}
              </Button>

              <div className="text-center">
                <p className="text-sm text-gray-500">
                  Didn&apos;t receive the code?{' '}
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={resendCooldown > 0 || loading}
                    className={`font-medium ${resendCooldown > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-brand-yellow-hover hover:text-brand-yellow cursor-pointer'}`}
                  >
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* ── STEP 3: SUCCESS ── */}
          {step === 'success' && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={40} className="text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-brand-black mb-2">Account Created!</h3>
              <p className="text-gray-600 mb-4">Welcome to RoadsRide. Redirecting you now...</p>
              <Loader2 className="w-5 h-5 animate-spin mx-auto text-brand-yellow" />
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
