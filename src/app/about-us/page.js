import { getAboutPageData } from '@/actions/about';
import AboutClient from '@/components/about/about-client';

export const metadata = {
  title: 'About Us | RoadsRide',
  description: 'Upgrade Your Ride, Drive Smart. Discover premium car and bike accessories designed for performance, comfort, and style.',
};

export default async function AboutPage() {
  const { data } = await getAboutPageData();

  // Fallback defaults if nothing in DB yet
  const aboutData = data || {
    title: 'Upgrade Your Ride,\nDrive Smart',
    introText: 'At RoadsRide, we are passionate about enhancing your driving experience with high-quality car and bike accessories. From everyday essentials to premium upgrades, our products are designed to deliver performance, durability, and style.\n\nWhether you’re maintaining your vehicle or upgrading its look, RoadsRide ensures you get reliable, value-for-money solutions that make every ride smarter and safer.',
    heroImage: null,
    secondaryImage: null,
    features: [
      { title: 'Premium Quality Products', description: 'We focus on durability, performance, and quality so that every product delivers long-lasting value.', icon: 'Shield' },
      { title: 'Wide Range of Accessories', description: 'Explore a complete collection of car and bike accessories including cleaning tools, interior upgrades, safety essentials, and more.', icon: 'Car' }
    ],
    teamMembers: [
      { name: 'Tabish', role: 'Co-Founder', image: null },
      { name: 'Rashi', role: 'Co-Founder', image: null },
      { name: 'Heena', role: 'Manager', image: null }
    ]
  };

  return (
    <main className="min-h-screen bg-white">
      {/* Image Banner */}
      <div className="w-full relative bg-gray-100 border-b-[6px] border-brand-yellow">
        <img 
          src="/ABOUT US BANNER.webp" 
          alt="About Us" 
          className="w-full h-auto object-cover max-h-[400px]"
        />
      </div>

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-12 md:py-20">
        <AboutClient data={aboutData} />
      </div>
    </main>
  );
}
