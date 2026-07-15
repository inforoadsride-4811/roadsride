'use server';

import prisma from '@/lib/db';
import { generateOrderNumber, SHIPPING_COST } from '@/lib/product';
import { sendOrderConfirmationEmail } from './email';
import { completeCheckoutDraft } from './drafts';
import { after } from 'next/server';

import { validateCoupons } from './coupon';

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
      couponCodes, // array of codes
    } = orderData;

    // Calculate totals (pure computation — no DB calls initially)
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
    let validatedCouponsData = [];

    // 1. Validate and calculate Coupon Discount
    if (couponCodes && couponCodes.length > 0) {
      const validation = await validateCoupons(couponCodes, items, email);
      if (validation.success) {
        discount += validation.totalDiscount;
        validatedCouponsData = validation.coupons;
      } else {
        // We could throw or return an error here, but for now we'll just not apply it if invalid
        return { success: false, error: 'Coupons are invalid: ' + validation.error };
      }
    }

    // 2. Add Prepaid Discount (stacks with coupon by default)
    if (paymentMethod === 'razorpay') {
      // 5% off subtotal AFTER coupon is applied, or 5% of base subtotal? 
      // Usually it's 5% of (subtotal - couponDiscount)
      const afterCouponSubtotal = Math.max(0, subtotal - discount);
      discount += Math.round((afterCouponSubtotal * 5 / 100) * 100) / 100;
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
        couponCode: couponCodes && couponCodes.length > 0 ? couponCodes.join(',') : null,
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

    // Handle Coupon Redemption Tracking
    if (validatedCouponsData && validatedCouponsData.length > 0) {
      for (const validCoupon of validatedCouponsData) {
        const dbCoupon = await prisma.coupon.findUnique({ where: { code: validCoupon.code } });
        if (dbCoupon) {
          await prisma.coupon.update({
            where: { id: dbCoupon.id },
            data: { usedCount: { increment: 1 } }
          });
          
          await prisma.couponRedemption.create({
            data: {
              couponId: dbCoupon.id,
              orderId: order.id,
              customerId: customerId || null,
              email,
              discountAmount: validCoupon.discountAmount,
              orderTotal: total,
              productName: orderItems.map(i => i.productName).join(', '),
            }
          });
        }
      }
    }

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
