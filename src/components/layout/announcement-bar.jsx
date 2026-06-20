export default function AnnouncementBar() {
  const text = "Cash on Delivery - 5% Discount on Prepaid Orders";
  const items = Array(20).fill(text);

  return (
    <div className="bg-brand-yellow text-brand-black py-2 overflow-hidden flex whitespace-nowrap">
      <div className="animate-marquee font-medium text-sm inline-flex items-center">
        {items.map((item, i) => (
          <span key={i} className="flex items-center">
            <span className="mx-6">{item}</span>
            <span className="text-[10px] opacity-50">●</span>
          </span>
        ))}
      </div>
    </div>
  );
}
