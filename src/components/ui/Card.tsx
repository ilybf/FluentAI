import React from 'react';

export function Card({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`bg-[rgba(22,27,45,0.7)] backdrop-blur-xl rounded-2xl border border-[rgba(255,255,255,0.06)] overflow-hidden ${className}`}>
      {children}
    </div>
  );
}
