import React, { ButtonHTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
  glow?: boolean;
  children: React.ReactNode;
};

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-gradient-to-r from-royal-600 via-royal-500 to-royal-400 text-white shadow-lg shadow-royal-500/25 hover:shadow-royal-500/40 hover:shadow-xl',
  secondary: 'bg-gradient-to-r from-royal-100 to-royal-50 text-royal-700 border border-royal-200 hover:border-royal-300 hover:bg-royal-100',
  outline: 'bg-transparent border-2 border-royal-400 text-royal-600 hover:bg-royal-50 hover:border-royal-500',
  ghost: 'bg-transparent text-royal-600 hover:bg-royal-100/50',
  danger: 'bg-gradient-to-r from-rose-500 to-rose-400 text-white shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40'
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-5 py-2.5 text-sm gap-2',
  lg: 'px-7 py-3.5 text-base gap-2.5'
};

export function Button({ 
  className, 
  asChild, 
  variant = 'primary', 
  size = 'md',
  glow = false,
  children, 
  ...props 
}: ButtonProps) {
  const base = twMerge(
    'relative inline-flex items-center justify-center rounded-xl font-semibold',
    'transition-all duration-300 ease-out',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-royal-400 focus-visible:ring-offset-2',
    'disabled:cursor-not-allowed disabled:opacity-50 disabled:pointer-events-none',
    'active:scale-[0.98]',
    'overflow-hidden',
    variantStyles[variant],
    sizeStyles[size],
    glow && variant === 'primary' && 'animate-pulse-glow',
    className
  );

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      className: twMerge(base, (children.props as { className?: string }).className)
    } as object);
  }

  return (
    <button className={base} {...props}>
      {/* Shine effect on hover */}
      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700 ease-out" />
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </button>
  );
}
