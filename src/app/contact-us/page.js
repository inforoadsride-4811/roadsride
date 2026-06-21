export const metadata = {
  title: 'Contact Us | RoadsRide',
  description: 'Get in touch with RoadsRide.',
};

export default function ContactUsPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16 md:py-24">
      <h1 className="mb-8 text-3xl font-bold text-brand-black md:text-5xl">Contact Us</h1>
      <div className="prose prose-lg text-gray-600">
        <p>If you have any questions or need assistance, feel free to reach out to us.</p>
        <div className="mt-8 space-y-4">
          <p><strong>Phone:</strong> +91 90979 68671, +91 8192-878149</p>
          <p><strong>Email:</strong> info.roadsride@gmail.com</p>
          <p><strong>Address:</strong> Pahalwan Dairy, Jogabai Extention, Jamia Nagar, Delhi 110025</p>
        </div>
      </div>
    </div>
  );
}
