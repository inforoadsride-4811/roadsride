'use server';

import prisma from '@/lib/db';
import { sendSubscriptionEmail } from './email';

export async function subscribeNewsletter(email) {
  try {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { success: false, error: 'Please enter a valid email address.' };
    }

    // Check if already subscribed
    const existingSubscriber = await prisma.subscriber.findUnique({
      where: { email },
    });

    if (existingSubscriber) {
      if (existingSubscriber.status === 'subscribed') {
        return { success: true, message: 'You are already subscribed!' };
      } else {
        // Re-subscribe them
        await prisma.subscriber.update({
          where: { email },
          data: { status: 'subscribed' },
        });
        return { success: true, message: 'Welcome back! You have been re-subscribed.' };
      }
    }

    // Create new subscriber
    await prisma.subscriber.create({
      data: { email },
    });

    // Send the notification emails (to user and admin)
    await sendSubscriptionEmail(email);

    return { success: true, message: 'Thank you for subscribing!' };
  } catch (error) {
    console.error('Subscription error:', error);
    return { success: false, error: 'Failed to subscribe. Please try again later.' };
  }
}
