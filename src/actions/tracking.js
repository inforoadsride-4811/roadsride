'use server';

import prisma from '@/lib/db';

export async function getOrderDetails(orderId) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) return { success: false, error: 'Order not found' };

    return { success: true, order };
  } catch (error) {
    return { success: false, error: 'Failed to fetch order details' };
  }
}

export async function trackOrderByNumber(orderNumber) {
  try {
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: { items: true },
    });

    if (!order) return { success: false, error: 'Order not found' };

    return { success: true, order };
  } catch (error) {
    return { success: false, error: 'Failed to track order' };
  }
}
