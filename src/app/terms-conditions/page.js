export const metadata = {
  title: 'Terms & Conditions | RoadsRide',
  description: 'Terms and Conditions for RoadsRide.',
};

export default function TermsConditionsPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16 md:py-24">
      <h1 className="mb-8 text-3xl font-bold text-brand-black md:text-5xl">Terms & Conditions</h1>
      <div className="prose prose-lg text-gray-600 max-w-none">
        <p className="mb-8">
          Welcome to Roads Ride. By accessing and using this website, you agree to comply with and be bound by the following Terms & Conditions. Please read them carefully before using our services.
        </p>

        <h2 className="mt-8 mb-4 text-2xl font-bold text-brand-black">1. Business Information</h2>
        <p>
          Roads Ride deals in automobile car and bike accessories and parts, offering quality products designed for performance, durability, and value. By using our website, you agree to our policies, terms, and conditions.
        </p>

        <h2 className="mt-8 mb-4 text-2xl font-bold text-brand-black">2. Products & Availability</h2>
        <p>
          All products listed on our website are subject to availability. We reserve the right to modify, update, or discontinue any product at any time without prior notice. Product images are for representation purposes; actual products may slightly vary.
        </p>

        <h2 className="mt-8 mb-4 text-2xl font-bold text-brand-black">3. Pricing & Payments</h2>
        <p>
          All prices are listed in INR (₹) and may change without prior notice. While we try to maintain accuracy, errors may occur. In such cases, we reserve the right to cancel or refuse any order. Payments must be completed through the available payment methods on our website.
        </p>

        <h2 className="mt-8 mb-4 text-2xl font-bold text-brand-black">4. Order Acceptance & Cancellation</h2>
        <p>
          We reserve the right to accept or reject any order at our discretion. Orders may be cancelled due to product unavailability, pricing errors, or suspicious activity. Customers will be notified in such cases.
        </p>

        <h2 className="mt-8 mb-4 text-2xl font-bold text-brand-black">5. Shipping & Delivery</h2>
        <p>
          We aim to deliver products within the estimated timeframe. However, delays may occur due to logistics, courier issues, or unforeseen circumstances. We are not responsible for delays caused by third-party delivery partners.
        </p>

        <h2 className="mt-8 mb-4 text-2xl font-bold text-brand-black">6. Returns & Refunds</h2>
        <p>
          At Roads Ride, customer satisfaction is our priority. We offer a 7-day return and refund policy on eligible products.
        </p>
        <h3 className="mt-4 mb-2 text-xl font-semibold text-brand-black">Return Eligibility:</h3>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li>Damaged, used, or incomplete products are not eligible.</li>
          <li>Returns are accepted within 7 days of delivery.</li>
          <li>Product must be unused, unwashed, and in original packaging.</li>
          <li>All tags, accessories, and invoice must be included.</li>
        </ul>

        <h2 className="mt-8 mb-4 text-2xl font-bold text-brand-black">7. Warranty & Product Use</h2>
        <p>
          Some products may carry manufacturer warranty (if applicable). We are not responsible for damage caused by improper use, installation, or handling of products.
        </p>

        <h2 className="mt-8 mb-4 text-2xl font-bold text-brand-black">8. User Responsibilities</h2>
        <p>
          Users agree not to misuse the website or engage in fraudulent, illegal, or harmful activities. Any such action may lead to account suspension or legal action.
        </p>

        <h2 className="mt-8 mb-4 text-2xl font-bold text-brand-black">9. Intellectual Property</h2>
        <p>
          All content including text, images, logos, and graphics on this website belongs to Roads Ride. Unauthorized use, copying, or reproduction is strictly prohibited.
        </p>

        <h2 className="mt-8 mb-4 text-2xl font-bold text-brand-black">10. Limitation of Liability</h2>
        <p>
          Roads Ride shall not be held liable for any indirect, incidental, or consequential damages arising from the use of our products or website.
        </p>

        <h2 className="mt-8 mb-4 text-2xl font-bold text-brand-black">11. Changes to Terms</h2>
        <p>
          We reserve the right to update or modify these Terms & Conditions at any time. Continued use of the website means you accept those changes.
        </p>

        <h2 className="mt-8 mb-4 text-2xl font-bold text-brand-black">12. Contact Information</h2>
        <p>
          For any questions, support, or concerns, feel free to contact us:
        </p>
        <div className="mt-4 p-6 bg-gray-50 rounded-lg">
          <p className="flex items-center gap-2 mb-2">
            <span className="font-semibold">📞 Mobile:</span> <a href="tel:+919097968671" className="text-brand-black hover:underline">+91 90979 68671</a>
          </p>
          <p className="flex items-center gap-2">
            <span className="font-semibold">📧 Email:</span> <a href="mailto:info.roadsride@gmail.com" className="text-brand-black hover:underline">  info.roadsride@gmail.com</a>
          </p>
        </div>
      </div>
    </div>
  );
}
