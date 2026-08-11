'use client';

import { usePathname } from 'next/navigation';

export default function WhatsAppButton({ settings }) {
  const pathname = usePathname();
  const phoneNumber = settings?.whatsappNumber || '919097968671'; // Fallback if not in settings
  const message = 'Hello, I need some help with RoadsRide products.';
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  // Default to showing on all pages if no settings exist (null or undefined)
  const enabledUrls = settings?.whatsappEnabledUrls || '/*';
    
  const urlsArray = (typeof enabledUrls === 'string' ? enabledUrls : '/*').split(',').map(u => u.trim()).filter(Boolean);

  let shouldShow = false;
  if (urlsArray.length === 0) {
     // if intentionally empty, don't show
     shouldShow = false;
  } else {
    for (const pattern of urlsArray) {
      if (pattern === '/*' || pattern === '*') {
        shouldShow = true;
        break;
      }
      if (pattern.endsWith('/*')) {
        const base = pattern.slice(0, -2);
        if (pathname.startsWith(base)) {
          shouldShow = true;
          break;
        }
      } else {
        if (pathname === pattern || pathname + '/' === pattern) {
          shouldShow = true;
          break;
        }
      }
    }
  }

  if (!shouldShow) return null;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed top-1/2 right-0 -translate-y-1/2 z-[110] flex items-center justify-center bg-[#25D366] text-black border-2 border-black border-r-0 rounded-l-full shadow-[-4px_4px_0px_rgba(0,0,0,1)] transition-all hover:-translate-x-1 hover:shadow-[-6px_6px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-[2px] active:shadow-none p-3 pl-4 pr-3"
      aria-label="Chat on WhatsApp"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-8 w-8"
      >
        <path d="M12.031 0C5.385 0 0 5.385 0 12.031c0 2.646.837 5.12 2.378 7.202l-1.573 5.753 5.88-1.543A11.968 11.968 0 0012.031 24c6.646 0 12.031-5.385 12.031-12.031S18.677 0 12.031 0zm0 22.015c-2.228 0-4.364-.582-6.223-1.684l-.446-.265-3.486.915.933-3.398-.291-.462a9.98 9.98 0 01-1.748-5.69C.741 5.923 5.313 1.352 11.233 1.352 17.152 1.352 21.724 5.924 21.724 11.844c0 5.92-4.572 10.491-10.491 10.491zm5.728-7.822c-.314-.157-1.859-.918-2.146-1.023-.287-.105-.497-.157-.706.157-.21.314-.811 1.023-1.002 1.233-.19.21-.38.236-.694.079-1.54-.775-2.73-1.488-3.794-3.303-.191-.326-.02-.503.136-.66.14-.141.314-.367.471-.55.157-.183.21-.314.314-.524.105-.21.052-.393-.026-.55-.079-.157-.706-1.703-.968-2.333-.254-.614-.512-.53-.706-.54-.183-.008-.393-.01-.602-.01-.21 0-.55.079-.838.393-.288.314-1.1 1.074-1.1 2.62 0 1.546 1.126 3.04 1.283 3.25.157.21 2.215 3.38 5.363 4.664.75.305 1.335.487 1.792.624.753.226 1.44.194 1.98.118.604-.085 1.859-.76 2.121-1.493.262-.733.262-1.362.184-1.493-.079-.131-.288-.21-.602-.367z" />
      </svg>
    </a>
  );
}
