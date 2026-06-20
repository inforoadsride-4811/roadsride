import { ToastProvider } from '@/components/ui/toast';
import WhatsAppButton from '@/components/layout/whatsapp-button';
import Script from 'next/script';
import './globals.css';

export const metadata = {
  title: 'RoadsRide | Premium Car & Bike Accessories',
  description: 'RoadsRide provides premium car and bike accessories, focusing on quality, durability, affordability, and enhancing every ride with smart solutions.',
  icons: {
    icon: '/favicon.jpeg',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
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

        <ToastProvider>{children}</ToastProvider>
        <WhatsAppButton />
      </body>
    </html>
  );
}
