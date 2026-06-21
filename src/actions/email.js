'use server';

import { Resend } from 'resend';
import prisma from '@/lib/db';
import {
  generateOrderConfirmationHTML,
  generateAdminOrderNotificationHTML,
  generateSubscriberThankYouHTML,
  generateAdminSubscriberNotificationHTML,
  generateCustomerWelcomeHTML,
  generateOTPVerificationHTML,
  generatePasswordResetOTPHTML
} from '@/lib/email-template';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOrderConfirmationEmail(orderId, preloadedOrder = null) {
  try {
    // Use pre-loaded order if available, otherwise fetch from DB
    const order = preloadedOrder || await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    if (!process.env.RESEND_API_KEY) {
      console.log('Skipping email send - RESEND_API_KEY not configured');
      return { success: true, warning: 'Email skipped (dev mode)' };
    }

    const adminEmail = process.env.ADMIN_EMAIL || 'info.roadsride@gmail.com';

    const { data, error } = await resend.batch.send([
      {
        from: 'RoadsRide <orders@roadsride.co.in>', // Use verified domain here
        to: [order.email],
        subject: `Order Confirmation - ${order.orderNumber}`,
        html: generateOrderConfirmationHTML(order),
      },
      {
        from: 'RoadsRide <orders@roadsride.co.in>', // Use verified domain here
        to: [adminEmail],
        subject: `New Order Booked! #${order.orderNumber}`,
        html: generateAdminOrderNotificationHTML(order),
      }
    ]);

    if (error) {
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: 'Failed to send confirmation email' };
  }
}

export async function sendSubscriptionEmail(email) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.log('Skipping subscription email send - RESEND_API_KEY not configured');
      return { success: true, warning: 'Email skipped (dev mode)' };
    }

    const adminEmail = process.env.ADMIN_EMAIL || 'info.roadsride@gmail.com';

    const { data, error } = await resend.batch.send([
      {
        from: 'RoadsRide <orders@roadsride.co.in>',
        to: [email],
        subject: 'Thank you for subscribing to RoadsRide!',
        html: generateSubscriberThankYouHTML(email),
      },
      {
        from: 'RoadsRide <orders@roadsride.co.in>',
        to: [adminEmail],
        subject: 'New Newsletter Subscriber!',
        html: generateAdminSubscriberNotificationHTML(email),
      }
    ]);

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('Subscription email error:', error);
    return { success: false, error: 'Failed to send subscription email' };
  }
}

export async function sendCustomerWelcomeEmail(email, name) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.log('Skipping welcome email send - RESEND_API_KEY not configured');
      return { success: true, warning: 'Email skipped (dev mode)' };
    }

    const { data, error } = await resend.emails.send({
      from: 'RoadsRide <orders@roadsride.co.in>',
      to: [email],
      subject: 'Welcome to RoadsRide!',
      html: generateCustomerWelcomeHTML(name),
    });

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('Welcome email error:', error);
    return { success: false, error: 'Failed to send welcome email' };
  }
}

export async function sendOTPEmail(email, otp) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.log('OTP for', email, ':', otp);
      return { success: true, warning: 'Email skipped (dev mode)' };
    }

    const { data, error } = await resend.emails.send({
      from: 'RoadsRide <orders@roadsride.co.in>',
      to: [email],
      subject: 'Your RoadsRide Verification Code',
      html: generateOTPVerificationHTML(otp),
    });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('OTP email error:', error);
    return { success: false, error: 'Failed to send verification email' };
  }
}

export async function sendPasswordResetOTPEmail(email, otp) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.log('Password reset OTP for', email, ':', otp);
      return { success: true, warning: 'Email skipped (dev mode)' };
    }

    const { data, error } = await resend.emails.send({
      from: 'RoadsRide <orders@roadsride.co.in>',
      to: [email],
      subject: 'Reset Your RoadsRide Password',
      html: generatePasswordResetOTPHTML(otp),
    });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Password reset email error:', error);
    return { success: false, error: 'Failed to send password reset email' };
  }
}

