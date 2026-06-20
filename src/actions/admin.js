'use server';

import prisma from '@/lib/db';

export async function getDashboardStats() {
  try {
    const totalOrders = await prisma.order.count();
    
    const revenueAgg = await prisma.order.aggregate({
      _sum: { total: true },
      where: {
        paymentStatus: 'paid', // or confirmed for COD if needed
      }
    });
    
    const pendingOrders = await prisma.order.count({
      where: { orderStatus: 'pending' }
    });

    const codOrders = await prisma.order.count({
      where: { paymentMethod: 'cod' }
    });

    const prepaidOrders = await prisma.order.count({
      where: { paymentMethod: 'razorpay' }
    });

    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { items: true }
    });

    return {
      success: true,
      stats: {
        totalOrders,
        revenue: revenueAgg._sum.total || 0,
        pendingOrders,
        codOrders,
        prepaidOrders,
      },
      recentOrders,
    };
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error);
    return { success: false, error: 'Failed to fetch dashboard data' };
  }
}

export async function getAllOrders(page = 1, limit = 10, search = '') {
  try {
    const skip = (page - 1) * limit;
    
    const where = search ? {
      OR: [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ]
    } : {};

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { items: true },
      }),
      prisma.order.count({ where })
    ]);

    return {
      success: true,
      orders,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit
      }
    };
  } catch (error) {
    return { success: false, error: 'Failed to fetch orders' };
  }
}

export async function updateOrderStatus(orderId, status) {
  try {
    await prisma.order.update({
      where: { id: orderId },
      data: { orderStatus: status }
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to update order status' };
  }
}

export async function updatePaymentStatus(orderId, status) {
  try {
    await prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus: status }
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to update payment status' };
  }
}
