'use server';

import prisma from '@/lib/db';
import { getSessionCustomer } from './customer-auth';

/**
 * Sync full cart to DB — replaces all items for the customer
 */
export async function syncCartToDB(cartItems) {
  try {
    const { success, customer } = await getSessionCustomer();
    if (!success || !customer) return { success: false };

    // Use a transaction: delete all old items, then insert new ones
    await prisma.$transaction([
      prisma.cartItem.deleteMany({ where: { customerId: customer.id } }),
      ...(cartItems.length > 0
        ? [
            prisma.cartItem.createMany({
              data: cartItems.map((item) => ({
                customerId: customer.id,
                productId: item.id,
                productName: item.name,
                productSlug: item.slug,
                packName: item.packName || null,
                price: item.price,
                originalPrice: item.originalPrice,
                image: item.image || null,
                quantity: item.quantity,
              })),
            }),
          ]
        : []),
    ]);

    return { success: true };
  } catch (error) {
    console.error('Cart sync error:', error);
    return { success: false };
  }
}

/**
 * Load cart from DB for logged-in user
 */
export async function loadCartFromDB() {
  try {
    const { success, customer } = await getSessionCustomer();
    if (!success || !customer) return { success: false, items: [] };

    const cartItems = await prisma.cartItem.findMany({
      where: { customerId: customer.id },
      orderBy: { createdAt: 'asc' },
    });

    const items = cartItems.map((item) => ({
      id: item.productId,
      name: item.productName,
      slug: item.productSlug,
      packName: item.packName,
      price: item.price,
      originalPrice: item.originalPrice,
      image: item.image,
      quantity: item.quantity,
    }));

    return { success: true, items };
  } catch (error) {
    console.error('Cart load error:', error);
    return { success: false, items: [] };
  }
}

/**
 * Clear cart in DB (after checkout)
 */
export async function clearCartInDB() {
  try {
    const { success, customer } = await getSessionCustomer();
    if (!success || !customer) return { success: false };

    await prisma.cartItem.deleteMany({ where: { customerId: customer.id } });
    return { success: true };
  } catch (error) {
    console.error('Cart clear error:', error);
    return { success: false };
  }
}
