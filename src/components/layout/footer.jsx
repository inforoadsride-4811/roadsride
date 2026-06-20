'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Phone, Mail, MapPin, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { subscribeNewsletter } from '@/actions/subscriber';

const departments = [
  { name: 'Who Are We', href: '#' },
  { name: 'Home', href: '/' },
  { name: 'Blog', href: '#' },
  { name: 'Shop', href: '/' },
  { name: 'Contact Us', href: '#' },
  { name: 'My Account', href: '#' },
  { name: 'Track Order', href: '/track-order' },
  { name: 'Wishlist', href: '#' },
];

const quickLinks = [
  { name: 'Terms & Conditions', href: '#' },
  { name: 'Refunds & Cancellations Policy', href: '#' },
  { name: 'Privacy Policy', href: '#' },
];

export default function Footer() {
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const { addToast } = useToast();

  const handleSubscribe = async () => {
    if (!email) return;
    setIsSubscribing(true);

    const result = await subscribeNewsletter(email);

    if (result.success) {
      addToast({ title: 'Success!', message: result.message, type: 'success' });
      setEmail('');
    } else {
      addToast({ title: 'Error', message: result.error, type: 'error' });
    }

    setIsSubscribing(false);
  };

  return (
    <footer className="border-t border-brand-border bg-white">
      <div className="px-6 py-14 md:py-20" style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[1.2fr_0.8fr_0.8fr_1.3fr] xl:gap-16">
          {/* About Us */}
          <div>
            <h3 className="mb-5 text-xl font-bold text-brand-black">About Us</h3>
            <p className="mb-6 text-base leading-8 text-gray-600">
              RoadsRide provides premium car and bike accessories, focusing on quality, durability, affordability, and enhancing every ride with smart solutions.
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-3 text-sm text-gray-600">
                <Phone size={16} className="mt-0.5 flex-shrink-0" />
                <span>9097968671, 8192878149</span>
              </div>
              <div className="flex items-start gap-3 text-sm text-gray-600">
                <Mail size={16} className="mt-0.5 flex-shrink-0" />
                <a href="mailto:info.roadsride@gmail.com" className="hover:text-brand-black transition-colors">
                  info.roadsride@gmail.com
                </a>
              </div>
              <div className="flex items-start gap-3 text-sm text-gray-600">
                <MapPin size={16} className="mt-0.5 flex-shrink-0" />
                <span>Pahalwan Dairy, Jogabai Extention, Jamia Nagar, Delhi 110025</span>
              </div>
            </div>
          </div>

          {/* Departments */}
          <div>
            <h3 className="mb-5 text-xl font-bold text-brand-black">Departments</h3>
            <ul className="space-y-3">
              {departments.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-base text-gray-600 transition-colors hover:text-brand-black"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-5 text-xl font-bold text-brand-black">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-base text-gray-600 transition-colors hover:text-brand-black"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="mb-5 text-xl font-bold text-brand-black">Let&apos;s keep in touch</h3>
            <p className="mb-5 text-base text-gray-600">
              Get recommendations, tips, updates and more.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Input
                type="email"
                placeholder="info@mail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubscribe()}
                className="flex-1"
                disabled={isSubscribing}
              />
              <Button
                onClick={handleSubscribe}
                disabled={isSubscribing}
                variant="danger"
                size="md"
                className="h-11 !rounded-xl !bg-red-500 px-6 hover:!bg-red-600 whitespace-nowrap"
              >
                {isSubscribing ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Subscribe'}
              </Button>
            </div>
            <p className="mt-6 mb-3 text-sm font-semibold text-gray-600">Let&apos;s keep in touch</p>
            <div className="flex items-center gap-3">
              <a href="#" className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </a>
              <a href="#" className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
              </a>
              <a href="#" className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-brand-border">
        <div className="px-6 py-5" style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <p className="text-sm text-gray-500 text-center">
            Copyright © 2026 <span className="font-semibold text-brand-black">RoadsRide</span>. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
