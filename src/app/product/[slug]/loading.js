'use client';

export default function ProductLoading() {
  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1170px', margin: '0 auto', padding: '16px 16px 0' }}>
        {/* Breadcrumb Skeleton */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '8px 0', marginBottom: '16px' }}>
          <div style={{ width: '40px', height: '12px', background: '#e5e7eb', borderRadius: '4px', animation: 'pulse 1.5s ease-in-out infinite' }} />
          <span style={{ color: '#d1d5db' }}>›</span>
          <div style={{ width: '80px', height: '12px', background: '#e5e7eb', borderRadius: '4px', animation: 'pulse 1.5s ease-in-out infinite' }} />
          <span style={{ color: '#d1d5db' }}>›</span>
          <div style={{ width: '120px', height: '12px', background: '#e5e7eb', borderRadius: '4px', animation: 'pulse 1.5s ease-in-out infinite' }} />
        </div>

        {/* Main: Gallery + Info */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px', marginTop: '24px' }}>
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-start" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
            {/* Gallery Skeleton */}
            <div>
              {/* Main Image */}
              <div style={{ width: '100%', aspectRatio: '1', background: '#e5e7eb', borderRadius: '12px', marginBottom: '12px', animation: 'pulse 1.5s ease-in-out infinite' }} />
              {/* Thumbnails */}
              <div style={{ display: 'flex', gap: '8px' }}>
                {[1, 2, 3, 4].map(i => (
                  <div key={i} style={{ width: '64px', height: '64px', background: '#e5e7eb', borderRadius: '8px', animation: 'pulse 1.5s ease-in-out infinite', animationDelay: `${i * 0.1}s` }} />
                ))}
              </div>
            </div>

            {/* Product Info Skeleton */}
            <div style={{ padding: '0 0 24px' }}>
              {/* Title */}
              <div style={{ width: '90%', height: '24px', background: '#e5e7eb', borderRadius: '6px', marginBottom: '8px', animation: 'pulse 1.5s ease-in-out infinite' }} />
              <div style={{ width: '70%', height: '24px', background: '#e5e7eb', borderRadius: '6px', marginBottom: '16px', animation: 'pulse 1.5s ease-in-out infinite' }} />

              {/* Stars + Reviews */}
              <div style={{ display: 'flex', gap: '4px', marginBottom: '16px', alignItems: 'center' }}>
                {[1, 2, 3, 4, 5].map(s => (
                  <div key={s} style={{ width: '16px', height: '16px', background: '#f3f4f6', borderRadius: '2px', animation: 'pulse 1.5s ease-in-out infinite' }} />
                ))}
                <div style={{ width: '80px', height: '12px', background: '#f3f4f6', borderRadius: '4px', marginLeft: '8px', animation: 'pulse 1.5s ease-in-out infinite' }} />
              </div>

              {/* Price */}
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ width: '100px', height: '32px', background: '#e5e7eb', borderRadius: '6px', animation: 'pulse 1.5s ease-in-out infinite' }} />
                <div style={{ width: '70px', height: '20px', background: '#f3f4f6', borderRadius: '4px', animation: 'pulse 1.5s ease-in-out infinite' }} />
                <div style={{ width: '50px', height: '24px', background: '#dcfce7', borderRadius: '6px', animation: 'pulse 1.5s ease-in-out infinite' }} />
              </div>

              {/* Features list */}
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ width: '16px', height: '16px', background: '#dcfce7', borderRadius: '50%', animation: 'pulse 1.5s ease-in-out infinite' }} />
                  <div style={{ width: `${50 + i * 25}%`, maxWidth: '350px', height: '14px', background: '#f3f4f6', borderRadius: '4px', animation: 'pulse 1.5s ease-in-out infinite', animationDelay: `${i * 0.1}s` }} />
                </div>
              ))}

              {/* Pack Selector */}
              <div style={{ display: 'flex', gap: '10px', margin: '24px 0' }}>
                {[1, 2, 3].map(i => (
                  <div key={i} style={{ width: '100px', height: '44px', background: i === 1 ? '#fef9c3' : '#f3f4f6', border: i === 1 ? '2px solid #F5C400' : '1px solid #e5e7eb', borderRadius: '10px', animation: 'pulse 1.5s ease-in-out infinite' }} />
                ))}
              </div>

              {/* Add to Cart + Buy */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                <div style={{ flex: 1, height: '48px', background: '#F5C400', borderRadius: '10px', opacity: 0.3, animation: 'pulse 1.5s ease-in-out infinite' }} />
                <div style={{ flex: 1, height: '48px', background: '#111827', borderRadius: '10px', opacity: 0.3, animation: 'pulse 1.5s ease-in-out infinite' }} />
              </div>
            </div>
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
