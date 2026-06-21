// ==========================================
// UTILITY FUNCTIONS
// ==========================================
// Product data is now fetched from the database via Prisma.
// This file only contains shared utility/helper functions.

export const PREPAID_DISCOUNT_PERCENT = 5;
export const SHIPPING_COST = 0; // Free shipping

export function calculatePrepaidDiscount(subtotal) {
  return Math.round((subtotal * PREPAID_DISCOUNT_PERCENT / 100) * 100) / 100;
}

export function formatPrice(amount) {
  return `₹${amount.toFixed(2)}`;
}

export function generateOrderNumber() {
  const prefix = 'RR';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * Generate a URL-friendly slug from a product name.
 * Auto-handles special characters, spaces, and normalizes unicode.
 */
export function generateSlug(name) {
  return name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100);
}
