import Link from 'next/link';

export default function CtaSection({ section }) {
  const { title, subtitle, linkText, linkUrl } = section;

  return (
    <section className="px-5 md:px-16 mb-16 max-w-[1440px] mx-auto">
      <div className="bg-brand-yellow rounded-2xl p-8 md:p-16 text-center flex flex-col items-center shadow-sm">
        {title && (
          <h2 className="text-3xl md:text-5xl font-extrabold text-brand-black mb-4 tracking-tight">
            {title}
          </h2>
        )}
        
        {subtitle && (
          <p className="text-lg text-brand-black/80 mb-8 max-w-2xl font-medium">
            {subtitle}
          </p>
        )}
        
        <div className="flex flex-col sm:flex-row gap-4">
          {linkText && linkUrl && (
            <Link href={linkUrl} className="bg-brand-black text-white hover:bg-gray-900 font-bold px-10 py-4 rounded-lg transition-all duration-300 shadow-lg hover:-translate-y-1">
              {linkText}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
