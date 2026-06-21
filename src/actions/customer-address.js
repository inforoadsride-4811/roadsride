'use server';

import prisma from '@/lib/db';
import { createClient } from '@/lib/supabase/server';

async function getAuthCustomer() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  return prisma.customer.findUnique({ where: { authId: user.id } });
}

export async function saveAddress(data) {
  try {
    const customer = await getAuthCustomer();
    if (!customer) return { success: false, error: 'Not authenticated' };

    const { id, label, firstName, lastName, phone, address, apartment, city, state, pincode } = data;

    if (id) {
      // Update existing
      const updated = await prisma.customerAddress.update({
        where: { id, customerId: customer.id },
        data: { label, firstName, lastName, phone, address, apartment, city, state, pincode },
      });
      return { success: true, address: updated };
    } else {
      // Create new
      const isFirst = (await prisma.customerAddress.count({ where: { customerId: customer.id } })) === 0;
      const created = await prisma.customerAddress.create({
        data: {
          customerId: customer.id,
          label, firstName, lastName, phone, address, apartment, city, state, pincode,
          isDefault: isFirst,
        },
      });
      return { success: true, address: created };
    }
  } catch (error) {
    console.error('Save address error:', error);
    return { success: false, error: 'Failed to save address' };
  }
}

export async function deleteAddress(id) {
  try {
    const customer = await getAuthCustomer();
    if (!customer) return { success: false, error: 'Not authenticated' };

    await prisma.customerAddress.delete({
      where: { id, customerId: customer.id },
    });
    return { success: true };
  } catch (error) {
    console.error('Delete address error:', error);
    return { success: false, error: 'Failed to delete address' };
  }
}

export async function setDefaultAddress(id) {
  try {
    const customer = await getAuthCustomer();
    if (!customer) return { success: false, error: 'Not authenticated' };

    // Unset all defaults, then set the new one
    await prisma.$transaction([
      prisma.customerAddress.updateMany({
        where: { customerId: customer.id },
        data: { isDefault: false },
      }),
      prisma.customerAddress.update({
        where: { id, customerId: customer.id },
        data: { isDefault: true },
      }),
    ]);

    return { success: true };
  } catch (error) {
    console.error('Set default address error:', error);
    return { success: false, error: 'Failed to update default address' };
  }
}
