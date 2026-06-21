'use client';

export default function ShopLoading() {
  return (
    <div style={{ maxWidth: '1170px', margin: '0 auto', padding: '24px 16px' }}>
      {/* Page Title Skeleton */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ width: '200px', height: '32px', background: '#e5e7eb', borderRadius: '8px', animation: 'pulse 1.5s ease-in-out infinite' }} />
        <div style={{ width: '300px', height: '16px', background: '#f3f4f6', borderRadius: '6px', marginTop: '12px', animation: 'pulse 1.5s ease-in-out infinite' }} />
      </div>

      <div style={{ display: 'flex', gap: '32px' }}>
        {/* Sidebar Filter Skeleton (desktop) */}
        <div className="hidden lg:block" style={{ width: '240px', flexShrink: 0 }}>
          <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '20px' }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ marginBottom: '24px' }}>
                <div style={{ width: '100px', height: '14px', background: '#e5e7eb', borderRadius: '4px', marginBottom: '12px', animation: 'pulse 1.5s ease-in-out infinite' }} />
                {[1, 2, 3, 4].map(j => (
                  <div key={j} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <div style={{ width: '16px', height: '16px', background: '#f3f4f6', borderRadius: '4px', animation: 'pulse 1.5s ease-in-out infinite' }} />
                    <div style={{ width: `${60 + j * 15}px`, height: '12px', background: '#f3f4f6', borderRadius: '4px', animation: 'pulse 1.5s ease-in-out infinite' }} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Product Grid Skeleton */}
        <div style={{ flex: 1 }}>
          {/* Sort/Filter Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div style={{ width: '120px', height: '14px', background: '#f3f4f6', borderRadius: '4px', animation: 'pulse 1.5s ease-in-out infinite' }} />
            <div style={{ width: '160px', height: '36px', background: '#f3f4f6', borderRadius: '8px', animation: 'pulse 1.5s ease-in-out infinite' }} />
          </div>

          {/* Product Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={{
                background: '#fff',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                overflow: 'hidden',
                animation: 'pulse 1.5s ease-in-out infinite',
                animationDelay: `${i * 0.1}s`,
              }}>
                {/* Image Skeleton */}
                <div style={{ width: '100%', aspectRatio: '1', background: '#f3f4f6' }} />
                {/* Content Skeleton */}
                <div style={{ padding: '16px' }}>
                  <div style={{ width: '80%', height: '14px', background: '#e5e7eb', borderRadius: '4px', marginBottom: '10px' }} />
                  <div style={{ width: '60%', height: '12px', background: '#f3f4f6', borderRadius: '4px', marginBottom: '12px' }} />
                  {/* Stars */}
                  <div style={{ display: 'flex', gap: '3px', marginBottom: '12px' }}>
                    {[1, 2, 3, 4, 5].map(s => (
                      <div key={s} style={{ width: '14px', height: '14px', background: '#f3f4f6', borderRadius: '2px' }} />
                    ))}
                  </div>
                  {/* Price */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '70px', height: '20px', background: '#e5e7eb', borderRadius: '4px' }} />
                    <div style={{ width: '50px', height: '14px', background: '#f3f4f6', borderRadius: '4px' }} />
                  </div>
                  {/* Button */}
                  <div style={{ width: '100%', height: '38px', background: '#f3f4f6', borderRadius: '8px', marginTop: '14px' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
