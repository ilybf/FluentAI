import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

// Static style maps hoisted to module scope — allocated once, shared across all Button instances
const baseStyles = 'inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none theme-transition';

const sizes = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-5 py-2 text-sm',
  lg: 'h-12 px-8 text-base',
} as const;

function getVariantStyle(variant: string): React.CSSProperties {
  switch (variant) {
    case 'primary':
      return {
        background: `linear-gradient(to right, var(--accent-blue), var(--accent-indigo))`,
        color: '#ffffff',
        boxShadow: '0 4px 14px rgba(59,130,246,0.2)',
      };
    case 'secondary':
      return {
        background: 'rgba(99,102,241,0.15)',
        color: 'var(--accent-indigo)',
        border: '1px solid rgba(99,102,241,0.2)',
      };
    case 'outline':
      return {
        background: 'transparent',
        color: 'var(--text-secondary)',
        border: '1px solid var(--border-input)',
      };
    case 'ghost':
      return {
        background: 'transparent',
        color: 'var(--text-secondary)',
      };
    default:
      return {};
  }
}

export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  isLoading, 
  className = '',
  disabled,
  style = {},
  ...props 
}: ButtonProps) {
  return (
    <button 
      className={`${baseStyles} ${sizes[size]} ${className}`}
      style={{
        ...getVariantStyle(variant),
        focusRingColor: 'var(--accent-blue)',
        ...style,
      } as React.CSSProperties}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : null}
      {children}
    </button>
  );
}
