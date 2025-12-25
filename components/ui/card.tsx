import { HTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

type CardVariant = 'default' | 'glow' | 'elevated' | 'outline';

type CardProps = HTMLAttributes<HTMLDivElement> & { 
  children: React.ReactNode;
  variant?: CardVariant;
  hover?: boolean;
};

const cardVariants: Record<CardVariant, string> = {
  default: 'bg-gradient-to-b from-white/95 to-royal-50/90 border-royal-200/30 shadow-lg shadow-royal-900/5',
  glow: 'bg-gradient-to-b from-white/95 to-royal-50/90 border-royal-300/40 shadow-xl shadow-royal-500/10',
  elevated: 'bg-white border-royal-100 shadow-2xl shadow-royal-900/10',
  outline: 'bg-transparent border-2 border-royal-200 shadow-none'
};

export function Card({ className, children, variant = 'default', hover = true, ...rest }: CardProps) {
  return (
    <div 
      className={twMerge(
        'rounded-2xl border p-6 backdrop-blur-xl transition-all duration-300',
        cardVariants[variant],
        hover && 'hover:shadow-2xl hover:shadow-royal-500/15 hover:-translate-y-1 hover:border-royal-300/50',
        className
      )} 
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, action, icon }: { title: string; action?: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-royal-500 to-royal-600 text-white shadow-lg shadow-royal-500/30">
            {icon}
          </div>
        )}
        <h3 className="text-base font-bold tracking-tight text-royal-900">{title}</h3>
      </div>
      {action}
    </div>
  );
}

export function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={twMerge('text-sm text-royal-800', className)}>{children}</div>;
}

export function CardFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={twMerge('mt-4 flex items-center gap-3 border-t border-royal-100 pt-4', className)}>
      {children}
    </div>
  );
}
