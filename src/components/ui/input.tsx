'use client';

import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = '', ...props }, ref) => {
    return (
      <div className="w-full space-y-1">
        {label && (
          <label className="block text-[12px] font-semibold text-text-primary">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`w-full h-10 px-3 ${
              icon ? 'pl-9' : ''
            } bg-white border border-[#E2E8F0] rounded-[6px] text-[13px] text-text-primary placeholder:text-text-muted outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all ${className}`}
            {...props}
          />
        </div>
        {error && <p className="text-[11px] text-status-danger font-medium">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
