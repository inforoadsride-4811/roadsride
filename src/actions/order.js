'use server';

import prisma from '@/lib/db';
import { generateOrderNumber } from '@/lib/product';
import { sendOrderConfirmationEmail } from './email';

export async function processOrder(orderData) {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      address,
      apartment,
      city,
      state,
      pincode,
      paymentMethod,
      items,
    } = orderData;

    // Calculate totals
    let subtotal = 0;
    const orderItems = items.map(item => {
      subtotal += item.price * item.quantity;
      return {
        productSlug: item.productSlug,
        productName: item.productName,
        packName: item.packName || null,
        quantity: item.quantity,
        price: item.price,
        originalPrice: item.originalPrice || item.price,
        image: item.image || null,
      };
    });

    let discount = 0;
    if (paymentMethod === 'razorpay') {
      discount = Math.round((subtotal * 5 / 100) * 100) / 100;
    }

    const total = subtotal - discount;

    const orderNumber = generateOrderNumber();
    const customerName = `${firstName} ${lastName}`.trim();

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerName,
        email,
        phone,
        address,
        apartment,
        city,
        state,
        pincode,
        subtotal,
        discount,
        total,
        paymentMethod,
        paymentStatus: paymentMethod === 'razorpay' ? 'paid' : 'pending',
        orderStatus: 'confirmed',
        razorpayOrderId: orderData.razorpayOrderId,
        razorpayPaymentId: orderData.razorpayPaymentId,
        razorpaySignature: orderData.razorpaySignature,
        items: {
          create: orderItems,
        },
      },
    });

    // Send email synchronously to ensure it completes before the serverless function exits
    await sendOrderConfirmationEmail(order.id).catch(err => console.error('Email sending failed:', err));

    return { success: true, orderId: order.id };
  } catch (error) {
    console.error('Order processing error:', error);
    return { success: false, error: 'Failed to process order' };
  }
}
