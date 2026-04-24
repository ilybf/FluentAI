import './globals.css';
import { Sidebar } from '@/components/layout/Sidebar';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { ThemeProvider } from '@/components/providers/ThemeProvider';

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
        className="font-sans antialiased flex flex-col md:flex-row min-h-screen overflow-hidden"
        style={{
          background: 'var(--bg-primary)',
          color: 'var(--text-primary)',
          margin: 0,
        }}
      >
        <a href="#main-content" className="skip-to-content">
          Skip to content
        </a>
        <AuthProvider>
          <ThemeProvider>
            {session && <Sidebar user={session.user} />}
            <main 
              id="main-content" 
              className="flex-1 flex flex-col min-w-0"
              style={{ minHeight: '100vh' }}
            >
              <div className="flex-1 overflow-auto page-animate">
                {/* Mobile spacer: pushes content below the fixed header, but scrolls with the content */}
                <div className="md:hidden shrink-0 w-full" style={{ height: '72px' }} />
                <div className="p-4 md:p-8">
                  {children}
                </div>
              </div>
            </main>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
