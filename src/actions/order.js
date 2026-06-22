'use server';

import prisma from '@/lib/db';
import { generateOrderNumber, SHIPPING_COST } from '@/lib/product';
import { sendOrderConfirmationEmail } from './email';
import { completeCheckoutDraft } from './drafts';
import { after } from 'next/server';

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
      customerId,
      draftId,
    } = orderData;

    // Calculate totals (pure computation — no DB calls)
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

    const total = subtotal + SHIPPING_COST - discount;
    const orderNumber = generateOrderNumber();
    const customerName = `${firstName} ${lastName}`.trim();

    // Single DB write — order + items created in one transaction (Prisma nested create)
    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerId: customerId || null,
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
        orderStatus: 'processing',
        razorpayOrderId: orderData.razorpayOrderId,
        razorpayPaymentId: orderData.razorpayPaymentId,
        razorpaySignature: orderData.razorpaySignature,
        items: {
          create: orderItems,
        },
      },
      include: { items: true }, // Include items so we can pass the full order to email
    });

    // Fire and forget background tasks safely using Next.js after()
    after(() => {
      sendOrderConfirmationEmail(null, order).catch(err => console.error('Email sending failed:', err));
      if (draftId) {
        completeCheckoutDraft(draftId).catch(err => console.error('Draft completion failed:', err));
      }
    });

    return { success: true, orderId: order.id };
  } catch (error) {
    console.error('Order processing error:', error);
    return { success: false, error: 'Failed to process order' };
  }
}
