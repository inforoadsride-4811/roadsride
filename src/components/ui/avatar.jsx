export function Avatar({ name, className = '', size = 'md' }) {
  const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-12 h-12 text-base' };
  const initials = name
    ? name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <div
      className={`inline-flex items-center justify-center rounded-full bg-brand-yellow/20 text-brand-black font-semibold ${sizes[size]} ${className}`}
    >
      {initials}
    </div>
  );
}
