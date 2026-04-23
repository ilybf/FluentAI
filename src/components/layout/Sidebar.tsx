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
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0 hidden md:flex">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-blue-600 flex items-center gap-2">
          <span>🚀</span> FluentAI
        </h1>
      </div>
      
      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                isActive 
                  ? 'bg-blue-50 text-blue-700 font-medium' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between">
          <div className="flex flex-col truncate">
            <span className="font-medium text-sm text-gray-900 truncate">{user?.name}</span>
            <span className="text-xs text-gray-500">Level: {user?.level}</span>
          </div>
          <button 
            onClick={() => signOut()} 
            className="text-gray-400 hover:text-red-500 transition-colors"
            title="Log out"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
