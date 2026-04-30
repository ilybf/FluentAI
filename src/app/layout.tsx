import './globals.css';
import { Sidebar } from '@/components/layout/Sidebar';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { Toaster } from 'react-hot-toast';

export const metadata = {
  title: 'FluentAI | English Learning',
  description: 'AI-powered English learning platform — practice reading, writing, conversation, and vocabulary with intelligent feedback.',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" suppressHydrationWarning style={{ height: '100%' }}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          try {
            var t = localStorage.getItem('fluentai-theme');
            if (t === 'light') document.documentElement.setAttribute('data-theme', 'light');
          } catch(e) {}
        `}} />
      </head>
      <body
        className="font-sans antialiased flex flex-col md:flex-row min-h-[100dvh] overflow-hidden"
        style={{
          background: 'var(--bg-primary)',
          color: 'var(--text-primary)',
          margin: 0,
        }}
      >
        <AuthProvider>
          <ThemeProvider>
            {session && <Sidebar user={session.user} />}
            <main 
              className="flex-1 flex flex-col min-w-0"
              style={{ minHeight: '100dvh' }}
            >
              <div className="flex-1 overflow-y-auto overflow-x-hidden page-animate flex flex-col scroll-smooth">
                {/* Mobile spacer */}
                <div className="md:hidden shrink-0 w-full" style={{ height: '72px' }} />
                <div className="p-4 md:p-8 flex-1 flex flex-col max-w-[1400px] w-full mx-auto">
                  {children}
                </div>
              </div>
            </main>
            <Toaster position="top-center" toastOptions={{
              style: {
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '1rem',
              }
            }} />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
