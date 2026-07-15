'use server';

import prisma from '@/lib/db';

export async function validateCoupon(code, cartData, customerEmail = null) {
  try {
    if (!code) return { success: false, error: 'Please enter a coupon code.' };
    
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon) return { success: false, error: 'Invalid coupon code.' };
    
    // Check if active
    if (!coupon.isActive) return { success: false, error: 'This coupon is no longer active.' };

    // Check validity dates
    const now = new Date();
    if (coupon.startDate && now < new Date(coupon.startDate)) {
      return { success: false, error: 'This coupon is not active yet.' };
    }
    if (coupon.endDate && now > new Date(coupon.endDate)) {
      return { success: false, error: 'This coupon has expired.' };
    }

    // Check usage limits
    if (coupon.maxTotalUses && coupon.usedCount >= coupon.maxTotalUses) {
      return { success: false, error: 'This coupon has reached its usage limit.' };
    }

    // Check user restrictions (if email provided)
    if (customerEmail) {
      // Per user limit
      if (coupon.maxPerUser) {
        const userRedemptions = await prisma.couponRedemption.count({
          where: { couponId: coupon.id, email: customerEmail }
        });
        if (userRedemptions >= coupon.maxPerUser) {
          return { success: false, error: 'You have already used this coupon the maximum allowed times.' };
        }
      }

      // Allowed emails check
      if (coupon.allowedEmails && Array.isArray(coupon.allowedEmails) && coupon.allowedEmails.length > 0) {
        if (!coupon.allowedEmails.includes(customerEmail)) {
          return { success: false, error: 'This coupon is not available for your email.' };
        }
      }
    }

    // Check cart rules
    const subtotal = cartData.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalQuantity = cartData.reduce((sum, item) => sum + item.quantity, 0);

    if (subtotal < coupon.minOrderAmount) {
      return { success: false, error: `Minimum order amount for this coupon is ${coupon.minOrderAmount}.` };
    }

    if (totalQuantity < coupon.minQuantity) {
      return { success: false, error: `Minimum quantity of ${coupon.minQuantity} required for this coupon.` };
    }

    // Check product/category restrictions
    let applicableSubtotal = 0;
    
    if (coupon.applicableTo === 'all') {
      applicableSubtotal = subtotal;
    } else {
      // Filter cart items that match the restriction
      cartData.forEach(item => {
        let isMatch = false;
        if (coupon.applicableTo === 'products' && coupon.productIds && Array.isArray(coupon.productIds)) {
           // We might need product ID in cartData to check properly, assuming we have productSlug
           // For now, if applicableTo is products, we expect cart to have product id, 
           // but our cart only stores productSlug. We might need to check DB or skip if not implemented.
           // Since our cart has productSlug, let's assume productIds array stores slugs.
           if (coupon.productIds.includes(item.productSlug)) {
             isMatch = true;
           }
        }
        // Categories check is more complex, skipped for now or assume it checks server-side
        if (isMatch) {
          applicableSubtotal += (item.price * item.quantity);
        }
      });
      
      if (applicableSubtotal === 0) {
        return { success: false, error: 'This coupon is not applicable to any items in your cart.' };
      }
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = (applicableSubtotal * coupon.discountValue) / 100;
      if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
        discountAmount = coupon.maxDiscountAmount;
      }
    } else if (coupon.discountType === 'fixed') {
      discountAmount = coupon.discountValue;
      if (discountAmount > applicableSubtotal) {
        discountAmount = applicableSubtotal; // Can't discount more than total
      }
    } else if (coupon.discountType === 'flat_price') {
      // Sets the price to a flat value (e.g. bundle price)
      if (applicableSubtotal > coupon.discountValue) {
        discountAmount = applicableSubtotal - coupon.discountValue;
      }
    }

    return { 
      success: true, 
      coupon: {
        code: coupon.code,
        discountAmount: Math.round(discountAmount * 100) / 100, // Round to 2 decimals
        isAutoApply: coupon.isAutoApply,
        isStackable: coupon.isStackable
      }
    };
  } catch (error) {
    console.error('validateCoupon error:', error);
    return { success: false, error: 'Failed to validate coupon.' };
  }
}

export async function validateCoupons(codes, cartData, customerEmail = null) {
  try {
    if (!codes || !Array.isArray(codes) || codes.length === 0) {
      return { success: true, coupons: [], totalDiscount: 0 };
    }

    let currentSubtotal = cartData.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const validCoupons = [];
    let totalDiscount = 0;
    
    // Fetch all coupons at once
    const dbCoupons = await prisma.coupon.findMany({
      where: { code: { in: codes.map(c => c.toUpperCase()) } }
    });

    // Check stackability upfront
    // If any coupon is not stackable, and there's more than 1 coupon requested, it's invalid
    if (codes.length > 1) {
      const hasNonStackable = dbCoupons.some(c => !c.isStackable);
      if (hasNonStackable) {
        return { success: false, error: 'One or more applied coupons cannot be stacked with other coupons.' };
      }
    }

    for (const code of codes) {
      const coupon = dbCoupons.find(c => c.code === code.toUpperCase());
      if (!coupon) continue;

      if (!coupon.isActive) continue;

      const now = new Date();
      if (coupon.startDate && now < new Date(coupon.startDate)) continue;
      if (coupon.endDate && now > new Date(coupon.endDate)) continue;

      if (coupon.maxTotalUses && coupon.usedCount >= coupon.maxTotalUses) continue;

      if (customerEmail) {
        if (coupon.maxPerUser) {
          const userRedemptions = await prisma.couponRedemption.count({
            where: { couponId: coupon.id, email: customerEmail }
          });
          if (userRedemptions >= coupon.maxPerUser) continue;
        }

        if (coupon.allowedEmails && Array.isArray(coupon.allowedEmails) && coupon.allowedEmails.length > 0) {
          if (!coupon.allowedEmails.includes(customerEmail)) continue;
        }
      }

      // Check min order amount against ORIGINAL subtotal or CURRENT? 
      // Usually minOrderAmount is checked against original subtotal
      const originalSubtotal = cartData.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      if (originalSubtotal < coupon.minOrderAmount) continue;

      const totalQuantity = cartData.reduce((sum, item) => sum + item.quantity, 0);
      if (totalQuantity < coupon.minQuantity) continue;

      // Calculate discount on CURRENT subtotal to prevent over-discounting
      let applicableSubtotal = currentSubtotal;
      
      if (coupon.applicableTo !== 'all') {
        // If specific products, only calculate discount on those products' portion of the current subtotal
        // This is complex, so for simplicity we recalculate applicable subtotal based on remaining proportions,
        // or just apply it. For now, let's recalculate based on original item prices if they match.
        // But to avoid over-discounting, cap it at currentSubtotal.
        let matchingTotal = 0;
        cartData.forEach(item => {
          if (coupon.applicableTo === 'products' && coupon.productIds && Array.isArray(coupon.productIds)) {
             if (coupon.productIds.includes(item.productSlug)) {
               matchingTotal += (item.price * item.quantity);
             }
          }
        });
        applicableSubtotal = Math.min(currentSubtotal, matchingTotal);
        if (applicableSubtotal <= 0) continue;
      }

      let discountAmount = 0;
      if (coupon.discountType === 'percentage') {
        discountAmount = (applicableSubtotal * coupon.discountValue) / 100;
        if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
          discountAmount = coupon.maxDiscountAmount;
        }
      } else if (coupon.discountType === 'fixed') {
        discountAmount = coupon.discountValue;
        if (discountAmount > applicableSubtotal) {
          discountAmount = applicableSubtotal;
        }
      } else if (coupon.discountType === 'flat_price') {
        if (applicableSubtotal > coupon.discountValue) {
          discountAmount = applicableSubtotal - coupon.discountValue;
        }
      }

      discountAmount = Math.round(discountAmount * 100) / 100;
      
      if (discountAmount > 0) {
        currentSubtotal = Math.max(0, currentSubtotal - discountAmount);
        totalDiscount += discountAmount;
        validCoupons.push({
          code: coupon.code,
          discountAmount,
          isAutoApply: coupon.isAutoApply,
          isStackable: coupon.isStackable
        });
      }
    }

    return { success: true, coupons: validCoupons, totalDiscount };
  } catch (error) {
    console.error('validateCoupons error:', error);
    return { success: false, error: 'Failed to validate coupons.' };
  }
}
