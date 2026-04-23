import React from 'react';

export function Card({ children, className = '', style = {} }: { children: React.ReactNode, className?: string, style?: React.CSSProperties }) {
  return (
    <div
      className={`backdrop-blur-xl rounded-2xl overflow-hidden theme-transition ${className}`}
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
