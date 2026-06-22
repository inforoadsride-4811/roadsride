import { ToastProvider } from '@/components/ui/toast';
import WhatsAppButton from '@/components/layout/whatsapp-button';
import ClientLayout from '@/components/layout/client-layout';
import NextTopLoader from 'nextjs-toploader';
import Script from 'next/script';
import { getStoreSettings } from '@/actions/admin-products';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://roadsride.com'),
  title: {
    template: '%s | RoadsRide',
    default: 'RoadsRide | Premium Car and Bike Accessories',
  },
  description: 'RoadsRide provides premium car and bike accessories, focusing on quality, durability, affordability, and enhancing every ride with smart solutions.',
  openGraph: {
    title: 'RoadsRide | Premium Car and Bike Accessories',
    description: 'RoadsRide provides premium car and bike accessories, focusing on quality, durability, affordability, and enhancing every ride with smart solutions.',
    url: 'https://roadsride.com',
    siteName: 'RoadsRide',
    images: [
      {
        url: '/favicon.jpeg',
        width: 800,
        height: 600,
        alt: 'RoadsRide Logo',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RoadsRide | Premium Car and Bike Accessories',
    description: 'RoadsRide provides premium car and bike accessories, focusing on quality, durability, affordability, and enhancing every ride with smart solutions.',
    images: ['/favicon.jpeg'],
  },
  icons: {
    icon: [
      { url: '/favicon.jpeg', type: 'image/jpeg' }
    ],
  },
};

export default async function RootLayout({ children }) {
  const { settings } = await getStoreSettings();

  return (
    <html lang="en" className={inter.variable}>
      <head>
        {/* Google Tag Manager */}
        <Script
          id="google-tag-manager"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','GTM-M7LPZ5SS');
            `,
          }}
        />
        {/* End Google Tag Manager */}
      </head>
      <body>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-M7LPZ5SS"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}

        <NextTopLoader
          color="#F5C400"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px #F5C400,0 0 5px #F5C400"
        />

        <ToastProvider>
          <ClientLayout settings={settings}>
            {children}
          </ClientLayout>
        </ToastProvider>
        <WhatsAppButton />
      </body>
    </html>
  );
}
