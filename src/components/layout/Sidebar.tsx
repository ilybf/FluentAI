"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useTheme } from '@/components/providers/ThemeProvider';

// Static data hoisted to module scope — allocated once, never re-created across renders
const studentNavItems = [
  { name: 'Dashboard', href: '/dashboard', icon: '📊' },
  { name: 'Reading', href: '/reading', icon: '📖' },
  { name: 'Writing', href: '/writing', icon: '✍️' },
  { name: 'Chat Tutor', href: '/chat', icon: '💬' },
  { name: 'Vocabulary', href: '/vocabulary', icon: '📚' },
  { name: 'Classroom', href: '/classroom', icon: '🎓' },
  { name: 'Profile', href: '/profile', icon: '👤' },
] as const;

const teacherNavItems = [
  { name: 'Dashboard', href: '/teacher/dashboard', icon: '📊' },
  { name: 'Profile', href: '/profile', icon: '👤' },
] as const;

const adminNavItems = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: '⚙️' },
  { name: 'Users', href: '/admin/dashboard', icon: '👥' },
  { name: 'Classrooms', href: '/admin/dashboard', icon: '🏫' },
  { name: 'Profile', href: '/profile', icon: '👤' },
] as const;

function getNavItems(role: string) {
  if (role === 'teacher') return teacherNavItems;
  if (role === 'admin') return adminNavItems;
  return studentNavItems;
}

export function Sidebar({ user }: { user: any }) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <>
      {/* ============ MOBILE TOP BAR ============ */}
      <div
        className="md:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-3 backdrop-blur-xl theme-transition"
        style={{
          background: 'var(--sidebar-bg)',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-lg transition-colors"
          style={{ color: 'var(--text-secondary)' }}
          aria-label="Open menu"
          id="mobile-menu-btn"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="text-lg font-bold flex items-center gap-2">
          <span>🚀</span>
          <span style={{ background: `linear-gradient(to right, var(--accent-blue), var(--accent-violet))`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            FluentAI
          </span>
        </h1>
        {/* Small theme toggle — top right on mobile */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg transition-all duration-200"
          style={{ color: 'var(--text-secondary)', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)' }}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          id="theme-toggle-mobile"
        >
          <span className="text-sm">{theme === 'dark' ? '☀️' : '🌙'}</span>
        </button>
      </div>

      {/* ============ MOBILE BACKDROP ============ */}
      <div
        className={`sidebar-backdrop md:hidden ${mobileOpen ? 'active' : ''}`}
        onClick={() => setMobileOpen(false)}
      />

      {/* ============ MOBILE SIDEBAR OVERLAY ============ */}
      <div
        className={`fixed top-0 left-0 bottom-0 w-72 z-50 flex flex-col md:hidden sidebar-mobile ${mobileOpen ? 'open' : ''} backdrop-blur-xl theme-transition`}
        style={{
          background: 'var(--sidebar-bg)',
          borderRight: '1px solid var(--border-subtle)',
        }}
      >
        {/* Mobile Header */}
        <div className="p-5 flex items-center justify-between">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <span>🚀</span>
            <span style={{ background: `linear-gradient(to right, var(--accent-blue), var(--accent-violet))`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              FluentAI
            </span>
          </h1>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-2 rounded-lg transition-colors"
            style={{ color: 'var(--text-muted)' }}
            aria-label="Close menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Mobile Nav */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {getNavItems(user?.role || 'student').map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 theme-transition"
                style={isActive ? {
                  background: `linear-gradient(to right, rgba(59,130,246,0.15), rgba(99,102,241,0.1))`,
                  color: 'var(--accent-blue)',
                  fontWeight: 500,
                  border: '1px solid rgba(59,130,246,0.2)',
                } : {
                  color: 'var(--text-secondary)',
                  border: '1px solid transparent',
                }}
              >
                <span className="text-xl">{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Mobile Footer */}
        <div className="p-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <div className="rounded-xl p-3 flex items-center justify-between theme-transition" style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-subtle)' }}>
            <div className="flex flex-col truncate">
              <span className="font-medium text-sm truncate" style={{ color: 'var(--text-primary)' }}>{user?.name}</span>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{user?.role === 'teacher' ? '👩‍🏫 Teacher' : `Level: ${user?.level}`}</span>
            </div>
            <button
              onClick={() => signOut()}
              className="p-1.5 rounded-lg transition-colors duration-200 hover:bg-red-500/10"
              style={{ color: 'var(--text-muted)' }}
              title="Log out"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </button>
          </div>
        </div>
      </div>

      {/* ============ DESKTOP SIDEBAR ============ */}
      <div
        className="hidden md:flex flex-col h-screen sticky top-0 backdrop-blur-xl theme-transition shrink-0"
        style={{
          width: collapsed ? '68px' : '256px',
          background: 'var(--sidebar-bg)',
          borderRight: '1px solid var(--border-subtle)',
          transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.3s ease, border-color 0.3s ease',
        }}
      >
        {/* Top: Logo + Theme toggle */}
        <div className="p-4 flex items-center justify-between" style={{ minHeight: '64px' }}>
          {!collapsed && (
            <h1 className="text-xl font-bold flex items-center gap-2 whitespace-nowrap overflow-hidden">
              <span>🚀</span>
              <span style={{ background: `linear-gradient(to right, var(--accent-blue), var(--accent-violet))`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                FluentAI
              </span>
            </h1>
          )}
          {collapsed && (
            <span className="text-xl mx-auto">🚀</span>
          )}
          {/* Small theme toggle button — top right */}
          {!collapsed && (
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg transition-all duration-200 shrink-0"
              style={{ color: 'var(--text-secondary)', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)' }}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              id="theme-toggle-btn"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              <span className="text-sm leading-none">{theme === 'dark' ? '☀️' : '🌙'}</span>
            </button>
          )}
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-2 space-y-1 overflow-y-auto overflow-x-hidden">
          {getNavItems(user?.role || 'student').map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                title={collapsed ? item.name : undefined}
                className="flex items-center gap-3 rounded-xl transition-all duration-200 theme-transition"
                style={{
                  padding: collapsed ? '10px' : '10px 16px',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  ...(isActive ? {
                    background: `linear-gradient(to right, rgba(59,130,246,0.15), rgba(99,102,241,0.1))`,
                    color: 'var(--accent-blue)',
                    fontWeight: 500,
                    border: '1px solid rgba(59,130,246,0.2)',
                  } : {
                    color: 'var(--text-secondary)',
                    border: '1px solid transparent',
                  }),
                }}
              >
                <span className="text-xl shrink-0">{item.icon}</span>
                {!collapsed && <span className="whitespace-nowrap overflow-hidden text-sm">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Theme toggle when collapsed — show below nav */}
        {collapsed && (
          <div className="px-2 pb-1">
            <button
              onClick={toggleTheme}
              className="w-full flex items-center justify-center p-2.5 rounded-xl transition-all duration-200"
              style={{ color: 'var(--text-secondary)', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)' }}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            >
              <span className="text-base">{theme === 'dark' ? '☀️' : '🌙'}</span>
            </button>
          </div>
        )}

        {/* Bottom: Collapse toggle + User info */}
        <div className="p-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          {/* Collapse / Expand button */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center p-2 rounded-lg transition-all duration-200 mb-2"
            style={{ color: 'var(--text-muted)', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)' }}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            id="sidebar-toggle-btn"
          >
            <svg className="w-4 h-4 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"
              style={{ transform: collapsed ? 'rotate(180deg)' : 'none' }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>

          {/* User info */}
          {!collapsed ? (
            <div className="rounded-xl p-3 flex items-center justify-between theme-transition" style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-subtle)' }}>
              <div className="flex flex-col truncate">
                <span className="font-medium text-sm truncate" style={{ color: 'var(--text-primary)' }}>{user?.name}</span>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{user?.role === 'teacher' ? '👩‍🏫 Teacher' : `Level: ${user?.level}`}</span>
              </div>
              <button
                onClick={() => signOut()}
                className="p-1.5 rounded-lg transition-colors duration-200 hover:bg-red-500/10 shrink-0"
                style={{ color: 'var(--text-muted)' }}
                title="Log out"
                id="logout-btn"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              </button>
            </div>
          ) : (
            <button
              onClick={() => signOut()}
              className="w-full flex items-center justify-center p-2.5 rounded-xl transition-colors duration-200 hover:bg-red-500/10"
              style={{ color: 'var(--text-muted)', background: 'var(--glass-bg)', border: '1px solid var(--border-subtle)' }}
              title="Log out"
              id="logout-btn"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </button>
          )}
        </div>
      </div>
    </>
  );
}
