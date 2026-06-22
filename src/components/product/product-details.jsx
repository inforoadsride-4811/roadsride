'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Star, ThumbsUp, ThumbsDown, UserCircle2, MessageSquare, CheckCircle2 } from 'lucide-react';
import AskQuestionModal from './ask-question-modal';
import WriteReviewModal from './write-review-modal';
import { toggleReviewHelpful } from '@/actions/review';
import { useToast } from '@/components/ui/toast';

// ─── Helpful Button with optimistic toggle + debounce ──────────────────────
function HelpfulButton({ reviewId, initialCount }) {
  const STORAGE_KEY = 'rr_liked_reviews';
  
  // Read initial liked state from localStorage
  const getInitialLiked = () => {
    if (typeof window === 'undefined') return false;
    try {
      const liked = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      return liked.includes(reviewId);
    } catch { return false; }
  };

  const [isLiked, setIsLiked] = useState(false);
  const [count, setCount] = useState(initialCount || 0);
  const [busy, setBusy] = useState(false);
  const debounceRef = useRef(null);

  // Hydrate from localStorage on mount
  useEffect(() => {
    setIsLiked(getInitialLiked());
  }, [reviewId]);

  const persistLikeState = (liked) => {
    try {
      const arr = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      if (liked) {
        if (!arr.includes(reviewId)) arr.push(reviewId);
      } else {
        const idx = arr.indexOf(reviewId);
        if (idx > -1) arr.splice(idx, 1);
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
    } catch {}
  };

  const handleToggle = useCallback(() => {
    if (busy) return;

    // Optimistic update
    const newLiked = !isLiked;
    setIsLiked(newLiked);
    setCount(prev => newLiked ? prev + 1 : Math.max(0, prev - 1));
    persistLikeState(newLiked);

    // Debounce the API call (500ms)
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setBusy(true);
      const res = await toggleReviewHelpful(reviewId, !newLiked); // pass OLD state
      if (!res.success) {
        // Revert on failure
        setIsLiked(!newLiked);
        setCount(prev => !newLiked ? prev + 1 : Math.max(0, prev - 1));
        persistLikeState(!newLiked);
      }
      setBusy(false);
    }, 500);
  }, [isLiked, busy, reviewId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <button
      onClick={handleToggle}
      style={{
        display: 'flex', alignItems: 'center', gap: '6px',
        background: isLiked ? '#ecfdf5' : 'none',
        border: isLiked ? '1px solid #a7f3d0' : 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        color: isLiked ? '#059669' : '#6b7280',
        padding: isLiked ? '4px 10px' : '0',
        fontSize: '12px', fontWeight: '500',
        transition: 'all 0.15s ease',
      }}
    >
      <ThumbsUp size={14} fill={isLiked ? 'currentColor' : 'none'} /> Helpful ({count})
    </button>
  );
}

// Hide scrollbar on tab row (webkit)
const hideScrollbarStyle = `
  .rr-tab-bar::-webkit-scrollbar { display: none; }
`;

// ─── Tabs ─────────────────────────────────────────────────────────────────────
// TAB_PX must match CONTENT_PX so the first tab label lines up with body text
const TAB_PX = 0;      // tabs start flush left — no left padding on first tab
const CONTENT_PX = 0;  // content also flush; outer wrapper handles the padding

function Tabs({ tabs, defaultTab = 0 }) {
  const [active, setActive] = useState(defaultTab);

  return (
    <div>
      <style>{hideScrollbarStyle}</style>
      <div
        className="rr-tab-bar"
        style={{
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}>
        {tabs.map((tab, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            style={{
              paddingTop: '14px',
              paddingBottom: '14px',
              paddingLeft: i === 0 ? '0' : '20px',
              paddingRight: '20px',
              fontSize: '16px',
              fontWeight: active === i ? '600' : '400',
              color: active === i ? '#000' : '#6b7280',
              background: 'none',
              border: 'none',
              borderBottom: active === i ? '2px solid #F5C400' : '2px solid transparent',
              marginBottom: '-1px',
              cursor: 'pointer',
              transition: 'color 0.15s',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div style={{ paddingTop: '40px', paddingBottom: '72px' }}>
        {tabs[active].content}
      </div>
    </div>
  );
}

// ─── Shared reading column ────────────────────────────────────────────────────
const col = { maxWidth: '100%', margin: '0 auto' };

// ─── Section heading — matches reference: large bold, tight spacing ───────────
function H2({ children }) {
  return (
    <h2 style={{
      fontSize: '30px',
      fontWeight: '700',
      color: '#111827',
      margin: '44px 0 20px',
      letterSpacing: '-0.02em',
      lineHeight: '1.2',
    }}>
      {children}
    </h2>
  );
}

// ─── Divider ─────────────────────────────────────────────────────────────────
function HR() {
  return <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '36px 0' }} />;
}

// ─── Bullet list — plain dots like reference ──────────────────────────────────
function BulletList({ items }) {
  return (
    <ul style={{ listStyle: 'disc', paddingLeft: '22px', margin: '0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {items.map((item, i) => (
        <li key={i} style={{ fontSize: '16px', color: '#374151', lineHeight: '1.75' }}>{item}</li>
      ))}
    </ul>
  );
}

// ─── Key feature row — bold title + body text ─────────────────────────────────
function FeatureRow({ title, text }) {
  return (
    <div style={{ marginBottom: '24px' }}>
      <p style={{ fontSize: '16px', fontWeight: '700', color: '#111827', margin: '0 0 5px' }}>{title}</p>
      <p style={{ fontSize: '16px', color: '#374151', lineHeight: '1.8', margin: 0 }}>{text}</p>
    </div>
  );
}

// ─── Callout box — subtle yellow bg like reference's durable box ──────────────
function Callout({ children }) {
  return (
    <div style={{
      background: '#fffdf0',
      border: '1px solid #f0e68c',
      borderRadius: '8px',
      padding: '16px 20px',
      margin: '0',
    }}>
      <p style={{ fontSize: '16px', color: '#374151', lineHeight: '1.8', margin: 0 }}>{children}</p>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function ProductDetails({ product }) {
  const { addToast } = useToast();
  const [activeImage, setActiveImage] = useState(0);
  const [selectedPack, setSelectedPack] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showAskModal, setShowAskModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [lightboxMedia, setLightboxMedia] = useState(null);

  const tabs = [
    {
      label: 'Description',
      content: product.description ? (
        <div 
          style={col} 
          className="rr-description prose max-w-none text-gray-700" 
          dangerouslySetInnerHTML={{ 
            __html: product.description.replace(/<img([^>]*)src="([^"]+)"([^>]*)>/gi, (match, before, src, after) => {
              // Only optimize local images, ignore external ones just in case
              if (src.startsWith('/')) {
                const optimizedSrc = `/_next/image?url=${encodeURIComponent(src)}&w=1200&q=75`;
                return `<img${before}src="${optimizedSrc}" loading="lazy" decoding="async"${after}>`;
              }
              return `<img${before}src="${src}" loading="lazy" decoding="async"${after}>`;
            }) 
          }} 
        />
      ) : (
        <div style={col}>
          <p style={{ fontSize: '15px', color: '#6b7280', textAlign: 'center', padding: '40px 0' }}>
            No description available for this product.
          </p>
        </div>
      ),
    },

    {
      label: 'Additional information',
      content: (
        <div style={col}>
          <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '20px', marginTop: 0 }}>
            Technical specifications and packaging details.
          </p>
          <div style={{ borderRadius: '10px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <tbody>
                {product.specs && product.specs.length > 0 ? (
                  product.specs.map((spec, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#f9fafb' }}>
                      <th style={{
                        width: '38%',
                        padding: '13px 20px',
                        textAlign: 'left',
                        fontSize: '12px',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: '#6b7280',
                        borderRight: '1px solid #f0f0f0',
                      }}>
                        {spec.label}
                      </th>
                      <td style={{ padding: '13px 20px', fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                        {spec.value}
                      </td>
                    </tr>
                  ))
                ) : product.additionalInfo ? (
                  Object.entries(product.additionalInfo).map(([key, value], i) => (
                    <tr key={key} style={{ background: i % 2 === 0 ? '#fff' : '#f9fafb' }}>
                      <th style={{
                        width: '38%',
                        padding: '13px 20px',
                        textAlign: 'left',
                        fontSize: '12px',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: '#6b7280',
                        borderRight: '1px solid #f0f0f0',
                      }}>
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </th>
                      <td style={{ padding: '13px 20px', fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                        {value}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>
                      No specifications available for this product.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ),
    },

    {
      label: 'Q & A',
      content: (
        <div style={col}>
          {product.qas && product.qas.length > 0 ? (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Customer Questions</h3>
                <button 
                  onClick={() => setShowAskModal(true)}
                  className="bg-brand-black text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors"
                >
                  Ask a Question
                </button>
              </div>
              <div className="space-y-6">
                {product.qas.map((qa) => (
                  <div key={qa.id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-sm">
                          {qa.author.charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <p className="font-semibold text-gray-900 text-sm flex items-center gap-2 flex-wrap">
                            {qa.author} <span className="text-gray-400 font-normal">asked on {qa.date}</span>
                            {qa.isPending && (
                              <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full text-[11px] font-semibold border border-amber-200">
                                ⏳ Awaiting Answer
                              </span>
                            )}
                          </p>
                        </div>
                        <h4 className="font-bold text-gray-900 text-base mb-3">{qa.question}</h4>
                        
                        {qa.answer ? (
                          <div className="bg-gray-50 rounded-lg p-4 mt-3">
                            <p className="text-sm text-gray-700 whitespace-pre-wrap"><span className="font-bold text-brand-black">A:</span> {qa.answer}</p>
                          </div>
                        ) : qa.isPending && (
                          <div className="bg-amber-50 rounded-lg p-3 mt-3 border border-amber-100">
                            <p className="text-xs text-amber-700">Your question has been submitted. We&apos;ll answer it soon!</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ border: '1px dashed #d1d5db', borderRadius: '12px', padding: '48px 24px', textAlign: 'center' }}>
              <p style={{ fontSize: '28px', margin: '0 0 10px' }}>💬</p>
              <p style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: '600', color: '#111827' }}>No questions yet</p>
              <p style={{ margin: '0 0 20px', fontSize: '13px', color: '#9ca3af' }}>Have something to ask? We'll get back to you.</p>
              <button 
                onClick={() => setShowAskModal(true)}
                style={{ background: '#111827', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 22px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
              >
                Ask a Question
              </button>
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px', marginTop: '80px' }}>
      <Tabs tabs={tabs} defaultTab={0} />

      {/* Customer Reviews Section */}
      <div id="reviews-section" style={{ marginTop: '40px', paddingTop: '40px', borderTop: '1px solid #e5e7eb' }}>
        <H2>Customer Reviews</H2>
        <div style={col}>
          {product.reviews && product.reviews.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              {product.reviews.map((review) => (
                <div key={review.id} style={{ display: 'flex', gap: '16px', borderBottom: '1px solid #e5e7eb', paddingBottom: '24px' }}>
                  <div style={{ color: '#d1d5db', marginTop: '4px' }}>
                    {review.avatar ? (
                      <img src={review.avatar} alt="Avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      <UserCircle2 size={40} strokeWidth={1.5} />
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#F5C400', marginBottom: '8px' }}>
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} fill={i < review.rating ? 'currentColor' : 'none'} className={i < review.rating ? '' : 'text-gray-300'} />
                      ))}
                    </div>
                    <p style={{ fontSize: '13px', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: '700', color: '#111827' }}>{review.author}</span>
                      {review.isPending && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: '#d97706', fontSize: '11px', fontWeight: '600', background: '#fef3c7', padding: '2px 8px', borderRadius: '99px' }}>
                          ⏳ Pending Approval
                        </span>
                      )}
                      {review.verified && !review.isPending && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', color: '#10b981', fontSize: '11px', fontWeight: '600' }}>
                          <CheckCircle2 size={12} /> Verified Purchase
                        </span>
                      )}
                      <span style={{ color: '#6b7280' }}> – {review.date}</span>
                    </p>
                    {review.title && <h4 style={{ margin: '8px 0 6px', fontSize: '15px', fontWeight: 'bold', color: '#111827' }}>{review.title}</h4>}
                    <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6', margin: '0 0 16px 0' }}>
                      {review.content}
                    </p>
                    {review.images && review.images.length > 0 ? (
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                        {review.images.map((media, idx) => {
                          const isVideo = typeof media === 'string' && media.match(/\.(mp4|webm|mov)(\?|$)/i);
                          return (
                            <div key={idx} onClick={() => setLightboxMedia(media)}>
                              <div style={{ borderRadius: '8px', overflow: 'hidden', width: '100px', height: '100px', position: 'relative', cursor: 'pointer' }}>
                                {isVideo ? (
                                  <>
                                    <video src={media} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted preload="metadata" />
                                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                      <span style={{ color: '#fff', fontSize: '24px' }}>▶</span>
                                    </div>
                                  </>
                                ) : (
                                  <Image src={media} alt="Review" fill style={{ objectFit: 'cover' }} sizes="112px" />
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : review.image && (
                      <div onClick={() => setLightboxMedia(review.image)} style={{ marginBottom: '16px', borderRadius: '8px', overflow: 'hidden', width: '100px', height: '100px', position: 'relative', cursor: 'pointer' }}>
                        <Image src={review.image} alt="Review Image" fill style={{ objectFit: 'cover' }} sizes="(max-width: 768px) 100vw, 50vw" />
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: '16px', color: '#6b7280', fontSize: '12px', fontWeight: '500' }}>
                      <HelpfulButton reviewId={review.id} initialCount={review.helpfulCount || 0} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div style={{
                display: 'flex',
                gap: '32px',
                alignItems: 'center',
                background: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '24px 28px',
                marginBottom: '24px',
              }}>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '44px', fontWeight: '800', color: '#111827', margin: 0, lineHeight: 1 }}>—</p>
                  <div style={{ color: '#d1d5db', fontSize: '18px', marginTop: '6px', letterSpacing: '3px' }}>★★★★★</div>
                  <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#9ca3af' }}>No ratings yet</p>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[5, 4, 3, 2, 1].map((s) => (
                    <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '11px', color: '#9ca3af', width: '8px' }}>{s}</span>
                      <span style={{ fontSize: '11px', color: '#d1d5db' }}>★</span>
                      <div style={{ flex: 1, height: '6px', borderRadius: '99px', background: '#e5e7eb' }} />
                      <span style={{ fontSize: '11px', color: '#9ca3af', width: '14px' }}>0</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ border: '1px dashed #d1d5db', borderRadius: '12px', padding: '48px 24px', textAlign: 'center' }}>
                <p style={{ fontSize: '28px', margin: '0 0 10px' }}>✍️</p>
                <p style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: '600', color: '#111827' }}>No reviews yet</p>
                <p style={{ margin: '0 0 20px', fontSize: '13px', color: '#9ca3af' }}>Be the first to share your experience.</p>
                <button 
                  onClick={() => setShowReviewModal(true)}
                  style={{ background: '#F5C400', color: '#111', border: 'none', borderRadius: '8px', padding: '10px 22px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
                >
                  Write a Review
                </button>
              </div>
            </>
          )}
          
          {product.reviews && product.reviews.length > 0 && (
            <div style={{ marginTop: '24px', textAlign: 'center' }}>
              <button 
                onClick={() => setShowReviewModal(true)}
                style={{ background: '#111827', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 24px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
              >
                Write a Review
              </button>
            </div>
          )}
        </div>
      </div>
      
      {showAskModal && (
        <AskQuestionModal 
          productId={product.id} 
          onClose={() => setShowAskModal(false)}
          onSuccess={() => setShowAskModal(false)}
        />
      )}

      {showReviewModal && (
        <WriteReviewModal 
          productId={product.id} 
          onClose={() => setShowReviewModal(false)}
          onSuccess={() => {
            setShowReviewModal(false);
            window.location.reload();
          }}
        />
      )}

      {lightboxMedia && (
        <div 
          style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
          onClick={() => setLightboxMedia(null)}
        >
          <button 
            onClick={() => setLightboxMedia(null)}
            style={{ position: 'absolute', top: '24px', right: '24px', background: 'transparent', border: 'none', color: '#fff', fontSize: '36px', cursor: 'pointer' }}
          >
            ×
          </button>
          
          <div onClick={(e) => e.stopPropagation()} style={{ position: 'relative', width: '100%', maxWidth: '900px', height: '100%', maxHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {typeof lightboxMedia === 'string' && lightboxMedia.match(/\.(mp4|webm|mov)(\?|$)/i) ? (
              <video src={lightboxMedia} controls autoPlay style={{ maxWidth: '100%', maxHeight: '100%', outline: 'none' }} />
            ) : (
              <img src={lightboxMedia} alt="Review Media" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}