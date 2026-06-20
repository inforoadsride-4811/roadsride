'use server';

import { Resend } from 'resend';
import prisma from '@/lib/db';
import {
  generateOrderConfirmationHTML,
  generateAdminOrderNotificationHTML,
  generateSubscriberThankYouHTML,
  generateAdminSubscriberNotificationHTML
} from '@/lib/email-template';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOrderConfirmationEmail(orderId) {
  try {
    const order = await prisma.order.findUnique({
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
