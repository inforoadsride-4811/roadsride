import { redirect } from 'next/navigation';

export default function ProductIndexPage() {
  // Redirect /product to the main shop page
  redirect('/shop');
}
