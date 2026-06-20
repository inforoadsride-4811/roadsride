'use client';

import { useState } from 'react';

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
              fontSize: '14px',
              fontWeight: active === i ? '600' : '400',
              color: active === i ? '#F5C400' : '#6b7280',
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
const col = { maxWidth: '860px', margin: '0 auto' };

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
  const tabs = [
    {
      label: 'Description',
      content: (
        <div style={col}>

          {/* Intro paragraph */}
          <p style={{ fontSize: '16px', color: '#374151', lineHeight: '1.85', margin: 0 }}>
            Upgrade your car cleaning routine with this 1200 GSM microfiber car cleaning cloth (40×60 cm), designed for maximum absorption, scratch-free performance, and professional detailing results. Whether you're drying, polishing, or washing your vehicle, this ultra-thick microfiber towel delivers a spotless, streak-free finish every time.
          </p>

          <HR />

          {/* Key Features */}
          <H2>Key Features</H2>
          <FeatureRow
            title="Ultra Thick 1200 GSM Microfiber"
            text="Made with high-density microfiber fabric, this heavy-duty car cleaning cloth is thicker, more durable, and more effective than standard towels. It holds more water and cleans faster."
          />
          <FeatureRow
            title="Super Absorbent & Quick Drying"
            text="The advanced microfiber weave quickly absorbs water, dust, and dirt, making it perfect for car drying, auto detailing, and vehicle cleaning."
          />
          <FeatureRow
            title="Scratch-Free & Paint Safe"
            text="Its ultra-soft fibers ensure a scratch-free and swirl-free finish, keeping your car's paint, coating, and glass completely safe."
          />
          <FeatureRow
            title="Lint-Free & Streak-Free Shine"
            text="This lint-free microfiber towel leaves no residue or marks, giving your car a clean, polished, and professional look."
          />
          <FeatureRow
            title="Perfect Size – 40×60 cm"
            text="An ideal size for easy handling and efficient coverage, suitable for both small and large surfaces."
          />

          <HR />

          {/* Multi-Purpose Use */}
          <H2>Multi-Purpose Use</H2>
          <BulletList items={[
            'Car exterior cleaning and drying',
            'Auto detailing and polishing',
            'Bike and motorcycle cleaning',
            'Glass, windshield, and mirror cleaning',
            'Interior dashboard and surface cleaning',
          ]} />

          <HR />

          {/* Durable & Reusable callout */}
          <Callout>
            This premium microfiber cloth is machine washable and built for long-term use. It maintains its softness and performance even after multiple washes.
          </Callout>

          <HR />

          {/* Why Choose */}
          <H2>Why Choose This Microfiber Cloth?</H2>
          <BulletList items={[
            'High-quality 1200 GSM microfiber towel',
            'Excellent water absorption and quick drying',
            'Safe for car paint, coating, and glass',
            'Ideal for car washing, drying, and detailing',
            'Cost-effective and long-lasting',
          ]} />

          <HR />

          {/* Care Instructions */}
          <H2>1200 GSM Microfiber Care Instructions</H2>
          <BulletList items={[
            'Wash before first use',
            'Do not use fabric softener',
            'Use mild detergent only',
            'Avoid high heat drying',
          ]} />

          <HR />

          {/* Perfect For */}
          <H2>Perfect For</H2>
          <p style={{ fontSize: '16px', color: '#374151', lineHeight: '1.85', margin: 0 }}>
            Car owners, auto enthusiasts, and anyone looking for a premium car cleaning cloth, microfiber drying towel, or detailing cloth that delivers a flawless finish.
          </p>

        </div>
      ),
    },

    {
      label: 'Additional information',
      content: (
        <div style={col}>
          <p style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '20px', marginTop: 0 }}>
            Technical specifications and packaging details.
          </p>
          <div style={{ borderRadius: '10px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <tbody>
                {Object.entries(product.additionalInfo).map(([key, value], i) => (
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ),
    },

    {
      label: 'Reviews (0)',
      content: (
        <div style={col}>
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
            <button style={{ background: '#F5C400', color: '#111', border: 'none', borderRadius: '8px', padding: '10px 22px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
              Write a Review
            </button>
          </div>
        </div>
      ),
    },

    {
      label: 'Q & A',
      content: (
        <div style={col}>
          <div style={{ border: '1px dashed #d1d5db', borderRadius: '12px', padding: '48px 24px', textAlign: 'center' }}>
            <p style={{ fontSize: '28px', margin: '0 0 10px' }}>💬</p>
            <p style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: '600', color: '#111827' }}>No questions yet</p>
            <p style={{ margin: '0 0 20px', fontSize: '13px', color: '#9ca3af' }}>Have something to ask? We'll get back to you.</p>
            <button style={{ background: '#111827', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 22px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
              Ask a Question
            </button>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px', marginTop: '80px' }}>
      <Tabs tabs={tabs} defaultTab={0} />
    </div>
  );
}