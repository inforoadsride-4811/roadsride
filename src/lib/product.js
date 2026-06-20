export const product = {
  id: '1',
  name: '1200 GSM Microfiber Car Cleaning Cloth (40×60 cm) | Ultra Thick, Super Absorbent, Car & Bike Drying Towel',
  slug: '1200-gsm-microfiber-car-cleaning-cloth',
  shortName: '1200 GSM Microfiber Car Cleaning Cloth',
  originalPrice: 899.00,
  price: 599.00,
  discount: 33,
  currency: '₹',
  stock: 95,
  soldCount: 202,
  soldPeriod: '12 hours',
  store: {
    name: 'RoadsRide',
    rating: 4.64,
    reviewCount: 84,
  },
  images: [
    { id: 1, src: '/products/product-1.png', alt: 'Microfiber cloth folded - main view' },
    { id: 2, src: '/products/product-2.png', alt: 'Car cleaning with microfiber cloth' },
    { id: 3, src: '/products/product-3.png', alt: 'Microfiber cloth texture closeup' },
    { id: 4, src: '/products/product-4.png', alt: 'Stacked microfiber cloths' },
    { id: 5, src: '/products/product-5.png', alt: 'Microfiber cloth unfolded full size' },
    { id: 6, src: '/products/product-6.png', alt: 'Glass cleaning with microfiber' },
    { id: 7, src: '/products/product-7.png', alt: 'Rolled microfiber cloth' },
    { id: 8, src: '/products/product-8.png', alt: 'Bike cleaning with microfiber cloth' },
  ],
  features: [
    { bold: '1200 GSM Ultra Thick Microfiber Cloth', text: 'for superior cleaning performance' },
    { bold: 'Super Absorbent Towel', text: '– quickly soaks water, dust & dirt' },
    { bold: 'Scratch-Free & Paint Safe', text: '– ideal for car, bike & glass surfaces' },
    { bold: 'Lint-Free & Streak-Free Finish', text: 'for a clean, shiny look' },
    { bold: 'Perfect Size (40×60 cm)', text: '– easy handling & better coverage' },
    { bold: 'Multi-Purpose Use', text: '– car drying, detailing, polishing & interior cleaning' },
    { bold: 'Durable & Reusable', text: '– long-lasting premium microfiber material' },
  ],
  breadcrumb: [
    { name: 'Home', href: '/' },
    { name: 'Car & Bike Accessories', href: '#' },
    { name: 'Car External Accessories', href: '#' },
  ],
  additionalInfo: {
    weight: '120g',
    dimensions: '40 × 60 cm',
    material: '80% Polyester, 20% Polyamide',
    gsm: '1200 GSM',
    color: 'Teal / Turquoise',
    care: 'Machine Washable',
    packageContents: '1 × Microfiber Cleaning Cloth',
  },
  description: {
    intro: 'Upgrade your car cleaning routine with this 1200 GSM microfiber car cleaning cloth (40×60 cm), designed for maximum absorption, scratch-free performance, and professional detailing results. Whether you\'re drying, polishing, or washing your vehicle, this ultra-thick microfiber towel delivers a spotless, streak-free finish every time.',
    keyFeatures: [
      {
        title: 'Ultra Thick 1200 GSM Microfiber',
        text: 'Made with high-density microfiber fabric, this heavy-duty car cleaning cloth is thicker, more durable, and more effective than standard towels. It holds more water and cleans faster.',
      },
      {
        title: 'Super Absorbent & Quick Drying',
        text: 'The advanced microfiber weave quickly absorbs water, dust, and dirt, making it perfect for car drying, auto detailing, and vehicle cleaning.',
      },
      {
        title: 'Scratch-Free & Paint Safe',
        text: 'Its ultra-soft fibers ensure a scratch-free and swirl-free finish, keeping your car\'s paint, coating, and glass completely safe.',
      },
      {
        title: 'Lint-Free & Streak-Free Shine',
        text: 'This lint-free microfiber towel leaves no residue or marks, giving your car a clean, polished, and professional look.',
      },
      {
        title: 'Perfect Size – 40×60 cm',
        text: 'An ideal size for easy handling and efficient coverage, suitable for both small and large surfaces.',
      },
    ],
    multiPurposeUse: [
      'Car exterior cleaning and drying',
      'Auto detailing and polishing',
      'Bike and motorcycle cleaning',
      'Glass, windshield, and mirror cleaning',
      'Interior dashboard and surface cleaning',
    ],
    durableText: 'This premium microfiber cloth is machine washable and built for long-term use. It maintains its softness and performance even after multiple washes.',
    whyChoose: [
      'High-quality 1200 GSM microfiber towel',
      'Excellent water absorption and quick drying',
      'Safe for car paint, coating, and glass',
      'Ideal for car washing, drying, and detailing',
      'Cost-effective and long-lasting',
    ],
    careInstructions: [
      'Wash before first use',
      'Do not use fabric softener',
      'Use mild detergent only',
      'Avoid high heat drying',
    ],
    perfectFor: 'Car owners, auto enthusiasts, and anyone looking for a premium car cleaning cloth, microfiber drying towel, or detailing cloth that delivers a flawless finish.',
  },
};

export const PREPAID_DISCOUNT_PERCENT = 5;
export const SHIPPING_COST = 0; // Free shipping

export function calculatePrepaidDiscount(subtotal) {
  return Math.round((subtotal * PREPAID_DISCOUNT_PERCENT / 100) * 100) / 100;
}

export function formatPrice(amount) {
  return `₹${amount.toFixed(2)}`;
}

export function generateOrderNumber() {
  const prefix = 'RR';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}
