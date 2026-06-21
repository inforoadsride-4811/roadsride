import { redirect } from 'next/navigation';
import { getSessionCustomer } from '@/actions/customer-auth';
import prisma from '@/lib/db';
import AccountDashboard from '@/components/account/account-dashboard';

export const metadata = {
  title: 'My Account | RoadsRide',
};

export default async function AccountPage({ searchParams }) {
  const { success, customer } = await getSessionCustomer();

  if (!success || !customer) {
    redirect('/account/login');
  }

  const params = await searchParams;
  const initialTab = params?.tab || 'profile';

  // Fetch everything in parallel — match orders by customerId or email only (phone is not unique)
  const orderWhere = { OR: [{ customerId: customer.id }, { email: customer.email }] };

  const [orderCount, orders, addresses] = await Promise.all([
    prisma.order.count({ where: orderWhere }),
    prisma.order.findMany({
      where: orderWhere,
      orderBy: { createdAt: 'desc' },
      include: { items: true },
    }),
    prisma.customerAddress.findMany({
      where: { customerId: customer.id },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    }),
  ]);

  return (
    <AccountDashboard
      customer={customer}
      orderCount={orderCount}
      orders={JSON.parse(JSON.stringify(orders))}
      addresses={JSON.parse(JSON.stringify(addresses))}
      initialTab={initialTab}
    />
  );
}
