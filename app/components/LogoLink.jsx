const sizeClasses = {
  header: 'h-12 w-12 rounded-2xl shadow-lg shadow-brand-glow/20',
  footer: 'h-9 w-9 rounded-xl shadow-md shadow-brand-glow/20',
  admin: 'h-14 w-14 rounded-2xl',
};

const textClasses = {
  header: 'font-extrabold text-xl tracking-tight text-white block',
  footer: 'font-extrabold tracking-tight text-white',
  admin: 'sr-only',
};

export default function LogoLink({ variant = 'header', showSlogan = false, className = '' }) {
  return (
    <a href="/" className={`flex items-center gap-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-primary/60 ${className}`}>
      <img
        src="/aegis-logo.svg"
        alt="Aegis logotyp"
        className={sizeClasses[variant] || sizeClasses.header}
      />
      <div>
        <span className={textClasses[variant] || textClasses.header}>Aegis</span>
        {showSlogan && (
          <span className="block text-xs font-mono text-brand-muted">
            Secure by Design. Built for Tomorrow.
          </span>
        )}
      </div>
    </a>
  );
}
