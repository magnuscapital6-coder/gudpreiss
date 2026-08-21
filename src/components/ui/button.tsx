'use client';

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-semibold transition-all duration-150 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.97] hover:scale-[1.02] hover:-translate-y-px';

  const variants = {
    primary: 'bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white rounded-sm shadow-small',
    secondary: 'bg-white hover:bg-surface-soft text-primary-500 border border-slate-200 rounded-sm shadow-small',
    ghost: 'bg-transparent hover:bg-surface-soft text-slate-600 rounded-sm',
    icon: 'bg-white hover:bg-surface-soft text-slate-600 border border-slate-200 rounded-sm w-9 h-9 p-0 flex items-center justify-center',
  };

  const sizes = {
    sm: 'h-8 px-3 text-[11px]',
    md: 'h-10 px-4 text-[12px]',
    lg: 'h-12 px-6 text-[14px]',
  };

  const sizeClass = variant === 'icon' ? '' : sizes[size];

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizeClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
