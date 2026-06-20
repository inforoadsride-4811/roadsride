import { redirect } from 'next/navigation';
import prisma from '@/lib/db';
import SubscribersClient from '@/components/admin/subscribers-client';

export const metadata = {
  title: 'Subscribers | Admin | RoadsRide',
};

export default async function SubscribersPage() {
  // Fetch all subscribers ordered by latest first
  const subscribers = await prisma.subscriber.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return <SubscribersClient subscribers={subscribers} />;
}
