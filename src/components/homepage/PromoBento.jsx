import Link from 'next/link';

export default function PromoBento({ section }) {
  const { title, subtitle, badge, linkText, linkUrl, imageUrl } = section;

  return (
    <section className="px-5 md:px-16 mb-16 max-w-[1440px] mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 rounded-2xl overflow-hidden border border-gray-200">
        <div className="p-8 md:p-12 flex flex-col justify-center">
          {badge && (
            <span className="text-brand-yellow font-bold text-xs uppercase tracking-wider mb-2">
              {badge}
            </span>
          )}
          
          {title && (
            <h2 className="text-3xl md:text-5xl font-extrabold text-brand-black mb-4 tracking-tight">
              {title}
            </h2>
          )}
          
          {subtitle && (
            <p className="text-base md:text-lg text-gray-600 mb-8 leading-relaxed">
              {subtitle}
            </p>
          )}
          
          {linkText && linkUrl && (
            <Link href={linkUrl} className="bg-brand-black text-white hover:bg-brand-yellow hover:text-brand-black font-bold px-8 py-4 rounded-lg w-fit transition-colors shadow-sm">
              {linkText}
            </Link>
          )}
        </div>
        
        {imageUrl ? (
          <div className="relative min-h-[300px] md:min-h-[400px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="absolute inset-0 w-full h-full object-cover" alt={title || "Promo Image"} src={imageUrl} />
          </div>
        ) : (
          <div className="relative min-h-[300px] md:min-h-[400px] bg-gray-200 border-l border-dashed border-gray-300 flex items-center justify-center">
            <p className="text-gray-500 font-medium">No Promo Image Added</p>
          </div>
        )}
      </div>
    </section>
  );
}
