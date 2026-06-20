'use server';

import Razorpay from 'razorpay';
import crypto from 'crypto';
import prisma from '@/lib/db';
import { sendOrderConfirmationEmail } from './email';

export async function getRazorpayOrderId(amount) {
  try {
    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: Math.round(amount * 100), // amount in paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    };

    const rzpOrder = await razorpay.orders.create(options);

    return { success: true, id: rzpOrder.id };
  } catch (error) {
    console.error('Razorpay Order creation error:', error);
    return { success: false, error: 'Failed to create payment order' };
  }
}

export async function verifyRazorpayPayment({
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
}) {
  try {
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      return { success: true };
    }

    return { success: false, error: 'Payment verification failed' };
  } catch (error) {
    console.error('Razorpay verification error:', error);
    return { success: false, error: 'Failed to verify payment' };
  }
}
