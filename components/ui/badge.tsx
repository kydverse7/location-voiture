import { twMerge } from 'tailwind-merge';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'royal';
type BadgeSize = 'sm' | 'md' | 'lg';

const variants: Record<BadgeVariant, string> = {
  success: 'bg-gradient-to-r from-emerald-500/15 to-emerald-400/10 text-emerald-700 border-emerald-400/30 shadow-emerald-500/10',
  warning: 'bg-gradient-to-r from-amber-500/15 to-amber-400/10 text-amber-700 border-amber-400/30 shadow-amber-500/10',
  danger: 'bg-gradient-to-r from-rose-500/15 to-rose-400/10 text-rose-700 border-rose-400/30 shadow-rose-500/10',
  info: 'bg-gradient-to-r from-sky-500/15 to-sky-400/10 text-sky-700 border-sky-400/30 shadow-sky-500/10',
  neutral: 'bg-gradient-to-r from-royal-100/80 to-royal-50/60 text-royal-700 border-royal-200/40 shadow-royal-500/5',
  royal: 'bg-gradient-to-r from-royal-500/20 to-royal-400/15 text-royal-800 border-royal-400/40 shadow-royal-500/15'
};

const sizes: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-3 py-1 text-[11px]',
  lg: 'px-4 py-1.5 text-xs'
};

export function Badge({
  children,
  variant = 'neutral',
  size = 'md',
  glow = false,
  className
}: {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  glow?: boolean;
  className?: string;
}) {
  return (
    <span
      className={twMerge(
        'inline-flex items-center gap-1.5 rounded-full border font-semibold tracking-wide shadow-sm',
        'transition-all duration-200',
        variants[variant] ?? variants.neutral,
        sizes[size],
        glow && 'shadow-lg animate-pulse',
        className
      )}
    >
      {children}
    </span>
  );
}
