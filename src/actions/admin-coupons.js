'use server';

import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';

function generateRandomCode(prefix = '', suffix = '', length = 6, useNumbers = true) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' + (useNumbers ? '0123456789' : '');
  let randomStr = '';
  for (let i = 0; i < length; i++) {
    randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}${randomStr}${suffix}`.toUpperCase();
}

export async function getAdminCoupons({ page = 1, limit = 10, search = '', status = '' } = {}) {
  try {
    const where = {};
    if (status === 'active') where.isActive = true;
    if (status === 'inactive') where.isActive = false;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [coupons, total] = await Promise.all([
      prisma.coupon.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.coupon.count({ where }),
    ]);

    return {
      success: true,
      coupons,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  } catch (error) {
    console.error('getAdminCoupons error:', error);
    return { success: false, error: 'Failed to fetch coupons' };
  }
}

export async function getAdminCoupon(id) {
  try {
    const coupon = await prisma.coupon.findUnique({
      where: { id },
    });
    if (!coupon) return { success: false, error: 'Coupon not found' };
    return { success: true, coupon };
  } catch (error) {
    console.error('getAdminCoupon error:', error);
    return { success: false, error: 'Failed to fetch coupon' };
  }
}

export async function createCoupon(data) {
  try {
    const existing = await prisma.coupon.findUnique({ where: { code: data.code } });
    if (existing) {
      return { success: false, error: 'Coupon code already exists' };
    }

    const coupon = await prisma.coupon.create({
      data: {
        name: data.name,
        code: data.code.toUpperCase(),
        description: data.description || null,
        internalNotes: data.internalNotes || null,
        discountType: data.discountType,
        discountValue: parseFloat(data.discountValue),
        minOrderAmount: parseFloat(data.minOrderAmount) || 0,
        maxDiscountAmount: data.maxDiscountAmount ? parseFloat(data.maxDiscountAmount) : null,
        minQuantity: parseInt(data.minQuantity) || 1,
        applicableTo: data.applicableTo || 'all',
        productIds: data.productIds || null,
        categoryIds: data.categoryIds || null,
        maxTotalUses: data.maxTotalUses ? parseInt(data.maxTotalUses) : null,
        maxPerUser: parseInt(data.maxPerUser) || 1,
        maxDailyUses: data.maxDailyUses ? parseInt(data.maxDailyUses) : null,
        maxMonthlyUses: data.maxMonthlyUses ? parseInt(data.maxMonthlyUses) : null,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        userRestriction: data.userRestriction || 'all',
        allowedEmails: data.allowedEmails || null,
        isStackable: data.isStackable || false,
        isAutoApply: data.isAutoApply || false,
        isHidden: data.isHidden || false,
        firstPurchaseOnly: data.firstPurchaseOnly || false,
        isActive: data.isActive !== false,
      },
    });

    revalidatePath('/admin/coupons');
    return { success: true, coupon };
  } catch (error) {
    console.error('createCoupon error:', error);
    return { success: false, error: 'Failed to create coupon' };
  }
}

export async function updateCoupon(id, data) {
  try {
    if (data.code) {
      const existing = await prisma.coupon.findFirst({
        where: { code: data.code, NOT: { id } },
      });
      if (existing) return { success: false, error: 'Coupon code already exists' };
    }

    const updateData = {};
    const fields = [
      'name', 'code', 'description', 'internalNotes', 'discountType', 'discountValue',
      'minOrderAmount', 'maxDiscountAmount', 'minQuantity', 'applicableTo', 'productIds',
      'categoryIds', 'maxTotalUses', 'maxPerUser', 'maxDailyUses', 'maxMonthlyUses',
      'userRestriction', 'allowedEmails', 'isStackable', 'isAutoApply', 'isHidden',
      'firstPurchaseOnly', 'isActive'
    ];

    for (const field of fields) {
      if (data[field] !== undefined) {
        if (['discountValue', 'minOrderAmount', 'maxDiscountAmount'].includes(field)) {
          updateData[field] = data[field] === null ? null : parseFloat(data[field]);
        } else if (['minQuantity', 'maxTotalUses', 'maxPerUser', 'maxDailyUses', 'maxMonthlyUses'].includes(field)) {
          updateData[field] = data[field] === null ? null : parseInt(data[field]);
        } else {
          updateData[field] = data[field];
        }
      }
    }
    
    if (data.startDate) updateData.startDate = new Date(data.startDate);
    if (data.endDate !== undefined) updateData.endDate = data.endDate ? new Date(data.endDate) : null;
    if (updateData.code) updateData.code = updateData.code.toUpperCase();

    const coupon = await prisma.coupon.update({
      where: { id },
      data: updateData,
    });

    revalidatePath('/admin/coupons');
    return { success: true, coupon };
  } catch (error) {
    console.error('updateCoupon error:', error);
    return { success: false, error: 'Failed to update coupon' };
  }
}

export async function deleteCoupon(id) {
  try {
    await prisma.coupon.delete({ where: { id } });
    revalidatePath('/admin/coupons');
    return { success: true };
  } catch (error) {
    console.error('deleteCoupon error:', error);
    return { success: false, error: 'Failed to delete coupon' };
  }
}

export async function bulkDeleteCoupons(ids) {
  try {
    await prisma.coupon.deleteMany({ where: { id: { in: ids } } });
    revalidatePath('/admin/coupons');
    return { success: true };
  } catch (error) {
    console.error('bulkDeleteCoupons error:', error);
    return { success: false, error: 'Failed to delete coupons' };
  }
}

export async function generateCoupons(config) {
  try {
    const {
      count = 10,
      prefix = '',
      suffix = '',
      length = 6,
      useNumbers = true,
      discountType = 'percentage',
      discountValue = 10,
      minOrderAmount = 0,
      endDate = null
    } = config;

    const couponsData = [];
    const generatedCodes = new Set();
    
    // Ensure uniqueness
    const existingCoupons = await prisma.coupon.findMany({ select: { code: true } });
    const existingCodes = new Set(existingCoupons.map(c => c.code));

    while (couponsData.length < count) {
      const code = generateRandomCode(prefix, suffix, length, useNumbers);
      if (!existingCodes.has(code) && !generatedCodes.has(code)) {
        generatedCodes.add(code);
        couponsData.push({
          name: `Bulk Generated ${code}`,
          code,
          discountType,
          discountValue: parseFloat(discountValue),
          minOrderAmount: parseFloat(minOrderAmount),
          endDate: endDate ? new Date(endDate) : null,
        });
      }
    }

    await prisma.coupon.createMany({ data: couponsData });
    revalidatePath('/admin/coupons');
    return { success: true, count: couponsData.length };
  } catch (error) {
    console.error('generateCoupons error:', error);
    return { success: false, error: 'Failed to generate coupons' };
  }
}

export async function getCouponAnalytics() {
  try {
    const [total, active, expired, redemptions] = await Promise.all([
      prisma.coupon.count(),
      prisma.coupon.count({ where: { isActive: true } }),
      prisma.coupon.count({ where: { endDate: { lt: new Date() } } }),
      prisma.couponRedemption.aggregate({
        _sum: { discountAmount: true },
        _count: true
      })
    ]);

    const topCoupons = await prisma.couponRedemption.groupBy({
      by: ['couponId'],
      _sum: { discountAmount: true },
      _count: { _all: true },
      orderBy: { _count: { couponId: 'desc' } },
      take: 5
    });

    // Populate coupon names for top coupons
    const populatedTopCoupons = await Promise.all(topCoupons.map(async (c) => {
      const coupon = await prisma.coupon.findUnique({ where: { id: c.couponId }, select: { code: true } });
      return {
        code: coupon?.code || 'Unknown',
        usageCount: c._count._all,
        discountGiven: c._sum.discountAmount || 0
      };
    }));

    return {
      success: true,
      stats: {
        totalCoupons: total,
        activeCoupons: active,
        expiredCoupons: expired,
        totalRedemptions: redemptions._count,
        totalDiscountGiven: redemptions._sum.discountAmount || 0,
      },
      topCoupons: populatedTopCoupons
    };
  } catch (error) {
    console.error('getCouponAnalytics error:', error);
    return { success: false, error: 'Failed to fetch analytics' };
  }
}

export async function getCouponRedemptions({ page = 1, limit = 20, couponId = null } = {}) {
  try {
    const where = {};
    if (couponId) where.couponId = couponId;

    const [redemptions, total] = await Promise.all([
      prisma.couponRedemption.findMany({
        where,
        include: { coupon: { select: { code: true, name: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.couponRedemption.count({ where }),
    ]);

    return {
      success: true,
      redemptions,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  } catch (error) {
    console.error('getCouponRedemptions error:', error);
    return { success: false, error: 'Failed to fetch redemptions' };
  }
}
