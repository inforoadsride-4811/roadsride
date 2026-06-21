import Link from 'next/link';
import { Image as ImageIcon } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import prisma from '@/lib/db';

export default async function CategoriesGrid({ section }) {
  const { title } = section;

  // Fetch active categories (limit to 6 or 12 for grid)
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
    take: 12,
  });

  if (categories.length === 0) {
    return (
      <section className="px-5 md:px-16 mb-16 max-w-[1440px] mx-auto text-center py-12 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
        <p className="text-gray-500 font-medium">Uh oh, no categories added yet.</p>
      </section>
    );
  }

  return (
    <section className="px-5 md:px-16 mb-16 max-w-[1440px] mx-auto">
      {title && (
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-brand-black">{title}</h2>
        </div>
      )}
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {categories.map((cat) => (
          <Link 
            key={cat.id} 
            href={`/category/${cat.slug}`}
            className="group flex flex-col items-center p-4 bg-white rounded-xl border border-gray-200 hover:border-brand-yellow hover:shadow-md transition-all duration-300 hover:scale-[1.02]"
          >
            <div className="w-16 h-16 rounded-full bg-gray-50 mb-3 flex items-center justify-center overflow-hidden group-hover:bg-brand-yellow/10 transition-colors">
              {cat.image ? (
                cat.image.startsWith('lucide:') ? (
                  <div className="text-gray-700 group-hover:text-brand-black transition-colors">
                    {(() => {
                      const Icon = LucideIcons[cat.image.replace('lucide:', '')] || LucideIcons.HelpCircle;
                      return <Icon size={32} />;
                    })()}
                  </div>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                )
              ) : (
                <ImageIcon className="text-gray-400 group-hover:text-brand-yellow" size={24} />
              )}
            </div>
            <span className="font-semibold text-sm text-brand-black text-center line-clamp-1">{cat.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
