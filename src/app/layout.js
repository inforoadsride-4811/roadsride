import { ToastProvider } from '@/components/ui/toast';
import WhatsAppButton from '@/components/layout/whatsapp-button';
import './globals.css';

export const metadata = {
  title: 'RoadsRide | Premium Car & Bike Accessories',
  description: 'RoadsRide provides premium car and bike accessories, focusing on quality, durability, affordability, and enhancing every ride with smart solutions.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>{children}</ToastProvider>
        <WhatsAppButton />
      </body>
    </html>
  );
}
