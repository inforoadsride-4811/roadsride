export function Card({ className = '', children, ...props }) {
  return (
    <div
      className={`bg-white border border-brand-border rounded-xl shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className = '', children }) {
  return (
    <div className={`px-6 py-4 border-b border-brand-border ${className}`}>
      {children}
    </div>
  );
}

export function CardContent({ className = '', children }) {
  return <div className={`px-6 py-4 ${className}`}>{children}</div>;
}

export function CardFooter({ className = '', children }) {
  return (
    <div className={`px-6 py-4 border-t border-brand-border ${className}`}>
      {children}
    </div>
  );
}
