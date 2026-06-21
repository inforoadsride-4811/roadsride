'use server';

import prisma from '@/lib/db';

export async function getCustomers({ page = 1, limit = 20, search = '', status = 'all' } = {}) {
  try {
    const skip = (page - 1) * limit;
    
    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status !== 'all') {
      where.status = status;
    } else {
      where.status = { not: 'deleted' }; // Hide deleted by default unless searching specifically
    }

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        include: {
          _count: { select: { orders: true } },
          orders: {
            where: { paymentStatus: 'paid' },
            select: { total: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.customer.count({ where })
    ]);

    const formatted = customers.map(c => {
      const totalSpend = c.orders.reduce((sum, order) => sum + order.total, 0);
      return {
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        avatar: c.avatar,
        role: c.role,
        status: c.status,
        totalOrders: c._count.orders,
        totalSpend,
        registrationDate: c.createdAt.toISOString(),
        lastLoginDate: c.lastLoginDate ? c.lastLoginDate.toISOString() : null,
      };
    });

    return {
      success: true,
      customers: formatted,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    console.error('Get customers error:', error);
    return { success: false, customers: [], pagination: {} };
  }
}

export async function getCustomerById(id) {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        orders: {
          orderBy: { createdAt: 'desc' }
        },
        reviews: {
          include: { product: { select: { name: true } } },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!customer) return { success: false, error: 'Customer not found' };

    // Analytics Calculation
    const totalOrders = customer.orders.length;
    const totalRevenue = customer.orders
      .filter(o => o.paymentStatus === 'paid' || o.paymentMethod === 'cod')
      .reduce((sum, o) => sum + o.total, 0);
    
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const lastOrderDate = totalOrders > 0 ? customer.orders[0].createdAt : null;

    // Find most purchased category (we have to do this via OrderItems in real app, simplified here)
    // Actually, order items aren't included in the findUnique query above to save memory, 
    // we can do a secondary query for analytics if needed, but let's stick to basics for now.

    return {
      success: true,
      customer: {
        ...customer,
        analytics: {
          totalOrders,
          totalRevenue,
          averageOrderValue,
          lastOrderDate,
        }
      }
    };
  } catch (error) {
    console.error('Get customer error:', error);
    return { success: false, error: 'Failed to fetch customer.' };
  }
}

export async function updateCustomerStatus(id, status) {
  try {
    const validStatuses = ['active', 'suspended', 'banned', 'deleted'];
    if (!validStatuses.includes(status)) {
      return { success: false, error: 'Invalid status.' };
    }

    await prisma.customer.update({
      where: { id },
      data: { status }
    });

    return { success: true };
  } catch (error) {
    console.error('Update customer status error:', error);
    return { success: false, error: 'Failed to update customer status.' };
  }
}

export async function getCustomerOrders(customerId, { page = 1, limit = 10 } = {}) {
  try {
    const skip = (page - 1) * limit;
    
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { customerId },
        include: { items: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.order.count({ where: { customerId } })
    ]);

    return {
      success: true,
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    return { success: false, orders: [], pagination: {} };
  }
}
