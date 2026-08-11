'use server';

import prisma from '@/lib/db';

export async function getDashboardStats() {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [
      totalOrders,
      todayOrders,
      totalRevenueAgg,
      todayRevenueAgg,
      totalProducts,
      totalCustomers,
      lowStockProducts,
      outOfStockProducts,
      recentOrders
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { createdAt: { gte: startOfToday } } }),
      prisma.order.aggregate({ _sum: { total: true }, where: { paymentStatus: 'paid' } }),
      prisma.order.aggregate({ _sum: { total: true }, where: { paymentStatus: 'paid', createdAt: { gte: startOfToday } } }),
      prisma.product.count(),
      prisma.customer.count(),
      prisma.product.findMany({ where: { stock: { gt: 0, lte: 5 } }, select: { id: true, name: true, stock: true }, take: 5 }),
      prisma.product.findMany({ where: { stock: 0 }, select: { id: true, name: true, stock: true }, take: 5 }),
      prisma.order.findMany({ take: 5, orderBy: { createdAt: 'desc' }, include: { items: true } })
    ]);

    return {
      success: true,
      stats: {
        totalOrders,
        todayOrders,
        totalRevenue: totalRevenueAgg._sum.total || 0,
        todayRevenue: todayRevenueAgg._sum.total || 0,
        totalProducts,
        totalCustomers,
      },
      lowStockProducts,
      outOfStockProducts,
      recentOrders,
    };
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error);
    return { success: false, error: 'Failed to fetch dashboard data' };
  }
}

// Activity Logging Helper
export async function logAdminActivity({ authId, action, entityType, entityId, description, metadata = null }) {
  try {
    if (!authId) return;
    const adminUser = await prisma.adminUser.findUnique({ where: { authId } });
    if (!adminUser) return;

    await prisma.adminActivityLog.create({
      data: {
        adminUserId: adminUser.id,
        action,
        entityType,
        entityId,
        description,
        metadata,
      }
    });
  } catch (err) {
    console.error('Failed to log admin activity:', err);
  }
}

export async function getAllOrders(page = 1, limit = 10, search = '', dateFilter = '', startDate = '', endDate = '') {
  try {
    const skip = (page - 1) * limit;
    
    let where = search ? {
      OR: [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { customerName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ]
    } : {};

    const now = new Date();
    if (dateFilter) {
      if (dateFilter === 'today') {
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        where.createdAt = { gte: startOfToday };
      } else if (dateFilter === 'yesterday') {
        const startOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        where.createdAt = { gte: startOfYesterday, lt: startOfToday };
      } else if (dateFilter === 'this_week') {
        const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
        where.createdAt = { gte: startOfWeek };
      } else if (dateFilter === 'this_month') {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        where.createdAt = { gte: startOfMonth };
      } else if (dateFilter === 'custom' && startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt = { gte: start, lte: end };
      }
    }

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

export async function updateOrderDetails(orderId, data) {
  try {
    const { 
      customerName, email, phone, address, apartment, city, state, pincode, 
      orderStatus, paymentStatus, paymentMode, amountCollected 
    } = data;
    
    await prisma.order.update({
      where: { id: orderId },
      data: {
        customerName,
        email,
        phone,
        address,
        apartment,
        city,
        state,
        pincode,
        orderStatus,
        paymentStatus,
        paymentMode: paymentMode || null,
        amountCollected: amountCollected ? parseFloat(amountCollected) : null,
        updatedAt: new Date()
      }
    });
    return { success: true };
  } catch (error) {
    console.error('Failed to update order details:', error);
    return { success: false, error: 'Failed to update order details' };
  }
}

// ==========================================
// BULK DELETE ACTIONS (Max 10)
// ==========================================

export async function bulkDeleteOrders(ids) {
  try {
    if (!Array.isArray(ids) || ids.length === 0) return { success: false, error: 'No IDs provided' };
    if (ids.length > 10) return { success: false, error: 'Maximum 10 records can be deleted at once' };
    
    await prisma.order.deleteMany({
      where: { id: { in: ids } }
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to delete orders' };
  }
}

export async function bulkDeleteProducts(ids) {
  try {
    if (!Array.isArray(ids) || ids.length === 0) return { success: false, error: 'No IDs provided' };
    if (ids.length > 10) return { success: false, error: 'Maximum 10 records can be deleted at once' };
    
    await prisma.product.deleteMany({
      where: { id: { in: ids } }
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to delete products' };
  }
}

export async function bulkDeleteCategories(ids) {
  try {
    if (!Array.isArray(ids) || ids.length === 0) return { success: false, error: 'No IDs provided' };
    if (ids.length > 10) return { success: false, error: 'Maximum 10 records can be deleted at once' };
    
    await prisma.category.deleteMany({
      where: { id: { in: ids } }
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to delete categories' };
  }
}

export async function bulkDeleteReviews(ids) {
  try {
    if (!Array.isArray(ids) || ids.length === 0) return { success: false, error: 'No IDs provided' };
    if (ids.length > 10) return { success: false, error: 'Maximum 10 records can be deleted at once' };
    
    await prisma.productReview.deleteMany({
      where: { id: { in: ids } }
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to delete reviews' };
  }
}

export async function bulkUpdateReviewStatus(ids, action) {
  try {
    if (!Array.isArray(ids) || ids.length === 0) return { success: false, error: 'No IDs provided' };
    if (ids.length > 10) return { success: false, error: 'Maximum 10 records at once' };

    const data = {};
    if (action === 'approve') data.approved = true;
    if (action === 'reject') data.approved = false;

    await prisma.productReview.updateMany({
      where: { id: { in: ids } },
      data,
    });

    return { success: true };
  } catch (error) {
    console.error('Bulk update review status error:', error);
    return { success: false, error: 'Failed to update reviews' };
  }
}

export async function bulkDeleteCustomers(ids) {
  try {
    if (!Array.isArray(ids) || ids.length === 0) return { success: false, error: 'No IDs provided' };
    if (ids.length > 10) return { success: false, error: 'Maximum 10 records can be deleted at once' };
    
    await prisma.customer.deleteMany({
      where: { id: { in: ids } }
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to delete customers' };
  }
}

export async function bulkUpdateOrderStatus(ids, status) {
  try {
    if (!Array.isArray(ids) || ids.length === 0) return { success: false, error: 'No IDs provided' };
    if (!status) return { success: false, error: 'No status provided' };
    
    // Using updateMany is efficient but doesn't trigger individual hooks. For basic fields it's perfect.
    await prisma.order.updateMany({
      where: { id: { in: ids } },
      data: { orderStatus: status, updatedAt: new Date() }
    });
    
    return { success: true };
  } catch (error) {
    console.error('Bulk update order status error:', error);
    return { success: false, error: 'Failed to update order statuses' };
  }
}
