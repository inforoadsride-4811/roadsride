/**
 * Migrate hardcoded description to DB for the 1200 GSM Microfiber product.
 * Run: node scripts/migrate-description.mjs
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const descriptionHTML = `
<p style="font-size:16px;color:#374151;line-height:1.85">
  Upgrade your car cleaning routine with this 1200 GSM microfiber car cleaning cloth (40×60 cm), designed for maximum absorption, scratch-free performance, and professional detailing results. Whether you're drying, polishing, or washing your vehicle, this ultra-thick microfiber towel delivers a spotless, streak-free finish every time.
</p>

<div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(250px, 1fr));gap:20px;margin:40px 0">
  <iframe width="100%" height="500" src="https://www.youtube.com/embed/HdmUVKFcIrk" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="border-radius:12px;box-shadow:0 4px 12px rgba(0,0,0,0.05)"></iframe>
  <iframe width="100%" height="500" src="https://www.youtube.com/embed/KtmjFRxic08" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="border-radius:12px;box-shadow:0 4px 12px rgba(0,0,0,0.05)"></iframe>
  <iframe width="100%" height="500" src="https://www.youtube.com/embed/qU08yuclneI" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="border-radius:12px;box-shadow:0 4px 12px rgba(0,0,0,0.05)"></iframe>
</div>

<div style="margin:40px 0;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.05)">
  <img src="/images/1200 GSM Microfiber 1st.png" alt="1200 GSM Premium Microfiber Infographic" style="width:100%;height:auto;display:block" />
</div>

<hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0" />

<h2 style="font-size:22px;font-weight:800;color:#111827;margin:32px 0 16px">Key Features</h2>

<div style="margin-bottom:16px">
  <h3 style="font-size:16px;font-weight:700;color:#111827;margin:0 0 4px">Ultra Thick 1200 GSM Microfiber</h3>
  <p style="font-size:15px;color:#374151;line-height:1.7;margin:0">Made with high-density microfiber fabric, this heavy-duty car cleaning cloth is thicker, more durable, and more effective than standard towels. It holds more water and cleans faster.</p>
</div>

<div style="margin-bottom:16px">
  <h3 style="font-size:16px;font-weight:700;color:#111827;margin:0 0 4px">Super Absorbent & Quick Drying</h3>
  <p style="font-size:15px;color:#374151;line-height:1.7;margin:0">The advanced microfiber weave quickly absorbs water, dust, and dirt, making it perfect for car drying, auto detailing, and vehicle cleaning.</p>
</div>

<div style="margin-bottom:16px">
  <h3 style="font-size:16px;font-weight:700;color:#111827;margin:0 0 4px">Scratch-Free & Paint Safe</h3>
  <p style="font-size:15px;color:#374151;line-height:1.7;margin:0">Its ultra-soft fibers ensure a scratch-free and swirl-free finish, keeping your car's paint, coating, and glass completely safe.</p>
</div>

<div style="margin-bottom:16px">
  <h3 style="font-size:16px;font-weight:700;color:#111827;margin:0 0 4px">Lint-Free & Streak-Free Shine</h3>
  <p style="font-size:15px;color:#374151;line-height:1.7;margin:0">This lint-free microfiber towel leaves no residue or marks, giving your car a clean, polished, and professional look.</p>
</div>

<div style="margin-bottom:16px">
  <h3 style="font-size:16px;font-weight:700;color:#111827;margin:0 0 4px">Perfect Size – 40 × 60 cm , 40cm = 15.75 Inch, 60 cm = 23.62 inch</h3>
  <p style="font-size:15px;color:#374151;line-height:1.7;margin:0">An ideal size for easy handling and efficient coverage, suitable for both small and large surfaces.</p>
</div>

<div style="margin:40px 0;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.05)">
  <img src="/images/1200 GSM Microfiber 3rd.png" alt="1200 GSM Premium Microfiber Infographic" style="width:100%;height:auto;display:block" />
</div>

<h2 style="font-size:22px;font-weight:800;color:#111827;margin:32px 0 16px">Key Benefits of 1200 GSM Microfiber Towel</h2>
<ul style="list-style:disc;padding-left:24px;font-size:15px;color:#374151;line-height:2">
  <li>Ultra-Fast Drying – Absorbs water quickly and dries surfaces in seconds.</li>
  <li>Reusable & Washable – Machine washable and built for hundreds of uses.</li>
  <li>Thick & Durable – Heavyweight 1200 GSM microfiber for long-lasting performance.</li>
  <li>Lint-Free & Streak-Free – Leaves a spotless, clean finish without lint residue.</li>
  <li>Super Absorbent – Holds more water for efficient cleaning and drying.</li>
  <li>Ultra Soft Microfiber – Gentle on paint, glass, screens, and sensitive surfaces.</li>
  <li>Multi-Surface Use – Perfect for cars, mirrors, glass, electronics, furniture, and home cleaning.</li>
  <li>Eco-Friendly Choice – Reusable design helps reduce waste from disposable cloths.</li>
  <li>Professional Cleaning Performance – Ideal for detailing, polishing, drying, and everyday cleaning.</li>
</ul>

<hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0" />

<div style="margin:40px 0;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.05)">
  <img src="/images/1200 GSM Microfiber 4rth.png" alt="1200 GSM Premium Microfiber Infographic" style="width:100%;height:auto;display:block" />
</div>

<div style="margin:40px 0;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.05)">
  <img src="/images/4th.png" alt="1200 GSM Premium Microfiber Infographic" style="width:100%;height:auto;display:block" />
</div>

<h2 style="font-size:22px;font-weight:800;color:#111827;margin:32px 0 16px">Multi-Purpose Use</h2>
<ul style="list-style:disc;padding-left:24px;font-size:15px;color:#374151;line-height:2">
  <li>Car exterior cleaning and drying</li>
  <li>Auto detailing and polishing</li>
  <li>Bike and motorcycle cleaning</li>
  <li>Glass, windshield, and mirror cleaning</li>
  <li>Interior dashboard and surface cleaning</li>
</ul>

<div style="margin:40px 0;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.05)">
  <img src="/images/1200 GSM Microfiber 5th.png" alt="1200 GSM Premium Microfiber Infographic" style="width:100%;height:auto;display:block" />
</div>

<hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0" />

<div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:10px;padding:20px 24px;font-size:15px;color:#0c4a6e;line-height:1.7;margin:24px 0">
  This premium microfiber cloth is machine washable and built for long-term use. It maintains its softness and performance even after multiple washes.
</div>

<hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0" />

<h2 style="font-size:22px;font-weight:800;color:#111827;margin:32px 0 16px">Why Choose This Microfiber Cloth?</h2>
<ul style="list-style:disc;padding-left:24px;font-size:15px;color:#374151;line-height:2">
  <li>High-quality 1200 GSM microfiber towel</li>
  <li>Excellent water absorption and quick drying</li>
  <li>Safe for car paint, coating, and glass</li>
  <li>Ideal for car washing, drying, and detailing</li>
  <li>Cost-effective and long-lasting</li>
</ul>

<hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0" />

<h2 style="font-size:22px;font-weight:800;color:#111827;margin:32px 0 16px">1200 GSM Microfiber Care Instructions</h2>
<ul style="list-style:disc;padding-left:24px;font-size:15px;color:#374151;line-height:2">
  <li>Wash before first use</li>
  <li>Do not use fabric softener</li>
  <li>Use mild detergent only</li>
  <li>Avoid high heat drying</li>
</ul>

<hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0" />

<h2 style="font-size:22px;font-weight:800;color:#111827;margin:32px 0 16px">Perfect For</h2>
<p style="font-size:16px;color:#374151;line-height:1.85">
  Car owners, auto enthusiasts, and anyone looking for a premium car cleaning cloth, microfiber drying towel, or detailing cloth that delivers a flawless finish.
</p>
`;

async function main() {
  // Find product by slug
  const product = await prisma.product.findFirst({
    where: { slug: '1200-gsm-microfiber-car-cleaning-cloth' },
    select: { id: true, name: true, slug: true, description: true },
  });

  if (!product) {
    console.log('❌ Product not found with slug "1200-gsm-microfiber-car-cleaning-cloth"');
    // List all products to help
    const all = await prisma.product.findMany({ select: { id: true, slug: true, name: true } });
    console.log('Available products:');
    all.forEach(p => console.log(`  - ${p.slug} (${p.name})`));
    process.exit(1);
  }

  console.log(`✅ Found: "${product.name}" (${product.slug})`);
  console.log(`   Current description length: ${(product.description || '').length} chars`);

  // Update description
  await prisma.product.update({
    where: { id: product.id },
    data: { description: descriptionHTML.trim() },
  });

  console.log(`✅ Description updated! New length: ${descriptionHTML.trim().length} chars`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
