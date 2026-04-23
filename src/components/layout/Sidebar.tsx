"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';

// Static data hoisted to module scope — allocated once, never re-created across renders
const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: '📊' },
  { name: 'Reading', href: '/reading', icon: '📖' },
  { name: 'Writing', href: '/writing', icon: '✍️' },
  { name: 'Chat Tutor', href: '/chat', icon: '💬' },
  { name: 'Vocabulary', href: '/vocabulary', icon: '📚' },
] as const;

export function Sidebar({ user }: { user: any }) {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-[#161922]/80 backdrop-blur-xl border-r border-[rgba(255,255,255,0.06)] flex flex-col h-screen sticky top-0 hidden md:flex">
      <div className="p-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <span>🚀</span>
          <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">FluentAI</span>
        </h1>
      </div>
      
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-gradient-to-r from-blue-500/15 to-indigo-500/10 text-blue-300 font-medium border border-blue-500/20 shadow-sm shadow-blue-500/5' 
                  : 'text-[#8b92a5] hover:bg-[rgba(255,255,255,0.04)] hover:text-[#b0b8cc]'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[rgba(255,255,255,0.06)]">
        <div className="bg-[rgba(255,255,255,0.03)] rounded-xl p-4 flex items-center justify-between">
          <div className="flex flex-col truncate">
            <span className="font-medium text-sm text-[#e0e4ed] truncate">{user?.name}</span>
            <span className="text-xs text-[#5a6178]">Level: {user?.level}</span>
          </div>
          <button 
            onClick={() => signOut()} 
            className="text-[#5a6178] hover:text-red-400 transition-colors duration-200 p-1.5 rounded-lg hover:bg-red-500/10"
            title="Log out"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
