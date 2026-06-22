export default function AnnouncementBar({ settings }) {
  if (settings && settings.announcementEnabled === false) {
    return null;
  }

  const text = settings?.announcementText || "Cash on Delivery - 5% Discount on Prepaid Orders";
  const speed = settings?.announcementSpeed || 30; // seconds
  const items = Array(20).fill(text);

  return (
    <div className="bg-brand-yellow text-brand-black py-2 overflow-hidden flex whitespace-nowrap">
      <div 
        className="animate-marquee font-medium text-sm inline-flex items-center"
        style={{ animationDuration: `${speed}s` }}
      >
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
