"use client";

import { useEffect, useState, useCallback } from 'react';
import { Sun, Moon } from 'lucide-react';

/**
 * A standalone theme toggle for pages that don't have the Sidebar
 * (e.g. the landing page for unauthenticated users).
 * Reads/writes the same localStorage key as ThemeProvider.
 */
export function LandingThemeToggle() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('fluentai-theme') as 'dark' | 'light' | null;
      if (stored === 'light' || stored === 'dark') {
        setTheme(stored);
      }
    } catch {}
    setMounted(true);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('fluentai-theme', next);
      document.documentElement.setAttribute('data-theme', next);
      return next;
    });
  }, []);

  if (!mounted) return null;

  return (
    <button
      onClick={toggleTheme}
      className="p-3 rounded-2xl transition-all duration-300 hover:scale-110 shadow-lg border"
      style={{
        background: 'var(--bg-card)',
        borderColor: 'var(--border-subtle)',
        color: 'var(--text-secondary)',
      }}
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}
