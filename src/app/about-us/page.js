export const metadata = {
  title: 'About Us | RoadsRide',
  description: 'Learn more about RoadsRide.',
};

export default function AboutUsPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16 md:py-24">
      <h1 className="mb-8 text-3xl font-bold text-brand-black md:text-5xl">About Us</h1>
      <div className="prose prose-lg text-gray-600">
        <p>
          Welcome to RoadsRide. We provide premium car and bike accessories, focusing on quality, durability, affordability, and enhancing every ride with smart solutions.
        </p>
        <p>
          Our mission is to bring you the best products that make your journey comfortable and stylish.
        </p>
      </div>
    </div>
  );
}
