import './globals.css';
import { Sidebar } from '@/components/layout/Sidebar';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AuthProvider } from '@/components/providers/AuthProvider';

export const metadata = {
  title: 'FluentAI | English Learning',
  description: 'AI-powered English learning platform',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body className="bg-[#0f1117] text-[#f0f2f5] font-sans antialiased min-h-screen flex">
        <AuthProvider>
          {session && <Sidebar user={session.user} />}
          <main className="flex-1 flex flex-col min-w-0">
            <div className="flex-1 p-4 md:p-8 overflow-auto">
              {children}
            </div>
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
