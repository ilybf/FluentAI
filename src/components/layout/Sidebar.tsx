"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useTheme } from '@/components/providers/ThemeProvider';

import { LayoutDashboard, BookOpen, PenTool, MessageCircle, Library, GraduationCap, User, Sun, Moon, ChevronLeft, ChevronRight, LogOut, Menu, X } from 'lucide-react';

const studentNavItems = [
  { name: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={20} /> },
  { name: 'Reading', href: '/reading', icon: <BookOpen size={20} /> },
  { name: 'Writing', href: '/writing', icon: <PenTool size={20} /> },
  { name: 'Chat Tutor', href: '/chat', icon: <MessageCircle size={20} /> },
  { name: 'Vocabulary', href: '/vocabulary', icon: <Library size={20} /> },
  { name: 'Classroom', href: '/classroom', icon: <GraduationCap size={20} /> },
  { name: 'Profile', href: '/profile', icon: <User size={20} /> },
];

const teacherNavItems = [
  { name: 'Dashboard', href: '/teacher/dashboard', icon: <LayoutDashboard size={20} /> },
  { name: 'Profile', href: '/profile', icon: <User size={20} /> },
];

const adminNavItems = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
  { name: 'Profile', href: '/profile', icon: <User size={20} /> },
];

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

  // Load persisted collapsed state
  useEffect(() => {
    try {
      const stored = localStorage.getItem('fluentai-sidebar-collapsed');
      if (stored === 'true') setCollapsed(true);
    } catch {}
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const handleToggleCollapse = () => {
    setCollapsed(prev => {
      const next = !prev;
      try { localStorage.setItem('fluentai-sidebar-collapsed', String(next)); } catch {}
      return next;
    });
  };

  return (
    <>
      {/* MOBILE TOP BAR */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-5 py-4 backdrop-blur-xl theme-transition" style={{ background: 'var(--sidebar-bg)', borderBottom: '1px solid var(--border-subtle)' }}>
        <button onClick={() => setMobileOpen(true)} className="p-2 -ml-2 rounded-xl transition-colors" style={{ color: 'var(--text-secondary)' }} aria-label="Open menu">
          <Menu size={24} />
        </button>
        <h1 className="text-xl font-bold tracking-tight">FluentAI</h1>
        <button onClick={toggleTheme} className="p-2 -mr-2 rounded-xl" style={{ color: 'var(--text-secondary)' }}>
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      <div className={`sidebar-backdrop md:hidden ${mobileOpen ? 'active' : ''}`} onClick={() => setMobileOpen(false)} />

      {/* MOBILE SIDEBAR */}
      <div className={`fixed inset-y-0 left-0 w-[280px] z-50 flex flex-col md:hidden sidebar-mobile ${mobileOpen ? 'open' : ''} backdrop-blur-2xl theme-transition`} style={{ background: 'var(--sidebar-bg)', borderRight: '1px solid var(--border-subtle)' }}>
        <div className="p-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">FluentAI</h1>
          <button onClick={() => setMobileOpen(false)} className="p-2 rounded-xl" style={{ color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          {getNavItems(user?.role || 'student').map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link key={item.name} href={item.href} className="flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-200 theme-transition" style={isActive ? { background: 'var(--text-primary)', color: 'var(--bg-primary)', fontWeight: 600 } : { color: 'var(--text-secondary)' }}>
                <span className="text-xl opacity-80">{item.icon}</span>
                <span className="text-[15px]">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* DESKTOP SIDEBAR */}
      <div
        className="hidden md:flex flex-col h-screen sticky top-0 theme-transition shrink-0 p-4 border-r border-[var(--border-subtle)]"
        style={{
          background: 'var(--sidebar-bg)',
          width: collapsed ? '80px' : '260px',
          transition: 'width 0.3s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.4s ease',
        }}
      >
        <div className={`py-6 mb-4 flex items-center ${collapsed ? 'justify-center px-0' : 'justify-between px-4'}`}>
          {!collapsed && (
            <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>FluentAI.</h1>
          )}
          <button
            onClick={handleToggleCollapse}
            className="p-2 rounded-xl transition-all hover:bg-[var(--bg-input)]"
            style={{ color: 'var(--text-muted)' }}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>
        <nav className="flex-1 space-y-1.5 overflow-y-auto px-1">
          {getNavItems(user?.role || 'student').map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-4 rounded-2xl transition-all duration-300 group"
                style={{
                  ...(isActive
                    ? { background: 'var(--text-primary)', color: 'var(--bg-primary)', fontWeight: 600, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }
                    : { color: 'var(--text-secondary)' }),
                  padding: collapsed ? '14px' : '14px 16px',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                }}
                title={collapsed ? item.name : undefined}
              >
                <span className={`text-xl transition-transform duration-300 shrink-0 ${isActive ? 'scale-110' : 'group-hover:scale-110 grayscale group-hover:grayscale-0'}`}>{item.icon}</span>
                {!collapsed && <span className="text-[15px] tracking-wide whitespace-nowrap">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Theme toggle */}
        <div className={`px-1 pb-2 flex ${collapsed ? 'justify-center' : ''}`}>
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl transition-all hover:bg-[var(--bg-input)]"
            style={{ color: 'var(--text-muted)' }}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>

        {/* User info */}
        <div className="mt-auto pt-2 px-1">
          <div className={`rounded-3xl flex items-center ${collapsed ? 'justify-center p-3' : 'justify-between p-4'}`} style={{ background: 'var(--bg-input)' }}>
            {!collapsed && (
              <div className="flex flex-col min-w-0 pr-2">
                <span className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{user?.name || 'User'}</span>
                <span className="text-xs truncate mt-0.5" style={{ color: 'var(--text-muted)' }}>{user?.role === 'teacher' ? 'Teacher' : user?.role === 'admin' ? 'Admin' : `Lvl ${user?.level || '1'}`}</span>
              </div>
            )}
            <button onClick={() => signOut({ callbackUrl: '/' })} className="p-2 rounded-xl hover:bg-red-500/10 hover:text-red-500 transition-colors shrink-0" style={{ color: 'var(--text-muted)' }} title="Sign out">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
