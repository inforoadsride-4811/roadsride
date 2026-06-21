import { getHomepageSections } from '@/actions/admin-homepage';
import HeroSection from '@/components/homepage/HeroSection';
import CategoriesGrid from '@/components/homepage/CategoriesGrid';
import ProductsGrid from '@/components/homepage/ProductsGrid';
import PromoBento from '@/components/homepage/PromoBento';
import CtaSection from '@/components/homepage/CtaSection';

export const metadata = {
  title: 'RoadsRide - High-Performance Automotive & Lifestyle Retail',
  description: 'Drive Smart, Stay Safe. Discover our premium collection of car and bike accessories designed for ultimate performance and protection.',
};

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const { success, sections, error } = await getHomepageSections();

  if (!success) {
    return <div className="text-center py-20 text-red-500">Failed to load homepage sections.</div>;
  }

  // Filter only active sections and sort by order
  const activeSections = sections.filter(s => s.isActive).sort((a, b) => a.order - b.order);

  const heroSlides = activeSections.filter(s => s.type === 'HERO');
  const categoriesSec = activeSections.find(s => s.type === 'CATEGORIES') || { type: 'CATEGORIES', id: 'empty-cat' };
  const productsSec = activeSections.find(s => s.type === 'PRODUCTS') || { type: 'PRODUCTS', id: 'empty-prod' };
  const promoSec = activeSections.find(s => s.type === 'PROMO_BENTO') || { type: 'PROMO_BENTO', id: 'empty-promo' };
  const ctaSec = activeSections.find(s => s.type === 'CTA') || { type: 'CTA', id: 'empty-cta' };

  const finalSections = [
    { type: 'HERO_CAROUSEL', id: 'hero-cluster', slides: heroSlides },
    categoriesSec,
    productsSec,
    promoSec,
    ctaSec
  ];

  return (
    <div className="bg-[#f8f8f8] pb-16">
      {finalSections.map(section => {
        switch (section.type) {
          case 'HERO': // Fallback if single, though handled by CAROUSEL
          case 'HERO_CAROUSEL':
            return <HeroSection key={section.id} slides={section.slides} />;
          case 'CATEGORIES':
            return <CategoriesGrid key={section.id} section={section} />;
          case 'PRODUCTS':
            return <ProductsGrid key={section.id} section={section} />;
          case 'PROMO_BENTO':
            return <PromoBento key={section.id} section={section} />;
          case 'CTA':
            return <CtaSection key={section.id} section={section} />;
          default:
            return null;
        }
      })}
    </div>
  );
}
