import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`flex h-11 w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 theme-transition ${className}`}
          style={{
            background: 'var(--bg-input)',
            border: `1px solid ${error ? 'rgba(239,68,68,0.5)' : 'var(--border-input)'}`,
            color: 'var(--text-primary)',
          }}
          {...props}
        />
        {error && <p className="mt-1.5 text-sm" style={{ color: '#f87171' }}>{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';
