import { redirect } from 'next/navigation';
import { getSessionCustomer } from '@/actions/customer-auth';
import prisma from '@/lib/db';
import OrdersClient from '@/components/account/orders-client';

export const metadata = {
  title: 'My Orders | RoadsRide',
};

export default async function OrdersPage() {
  const { success, customer } = await getSessionCustomer();

  if (!success || !customer) {
    redirect('/account/login');
  }

  // Fetch all orders for this customer (by customerId, email, or phone)
  const orders = await prisma.order.findMany({
    where: {
      OR: [
        { customerId: customer.id },
        { email: customer.email },
        ...(customer.phone ? [{ phone: customer.phone }] : []),
      ],
    },
    orderBy: { createdAt: 'desc' },
    include: {
      items: true,
    },
  });

  return (
    <OrdersClient
      customer={customer}
      orders={JSON.parse(JSON.stringify(orders))}
    />
  );
}
