import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Card } from '@/components/ui/Card';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Welcome back, {session.user.name}!</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Here is your English learning progress.</p>
        </div>
        <div className="px-4 py-2 rounded-full font-medium text-sm" style={{ background: 'rgba(59,130,246,0.12)', color: 'var(--accent-blue)', border: '1px solid rgba(59,130,246,0.2)' }}>
          CEFR Level: <span className="font-bold">{session.user.level}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        <Card className="p-5 sm:p-6">
          <div className="text-4xl mb-4 inline-flex items-center justify-center w-14 h-14 rounded-xl" style={{ background: 'rgba(245,158,11,0.1)' }}>🏆</div>
          <h3 className="font-medium text-sm" style={{ color: 'var(--text-secondary)' }}>Total Score</h3>
          <p className="text-3xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>{session.user.totalScore}</p>
        </Card>
        
        <Card className="p-5 sm:p-6">
          <div className="text-4xl mb-4 inline-flex items-center justify-center w-14 h-14 rounded-xl" style={{ background: 'rgba(59,130,246,0.1)' }}>💬</div>
          <h3 className="font-medium text-sm" style={{ color: 'var(--text-secondary)' }}>Conversations</h3>
          <p className="text-3xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>12</p>
        </Card>
        
        <Card className="p-5 sm:p-6">
          <div className="text-4xl mb-4 inline-flex items-center justify-center w-14 h-14 rounded-xl" style={{ background: 'rgba(16,185,129,0.1)' }}>📚</div>
          <h3 className="font-medium text-sm" style={{ color: 'var(--text-secondary)' }}>Vocabulary Mastered</h3>
          <p className="text-3xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>45 words</p>
        </Card>
      </div>

      <h2 className="text-xl sm:text-2xl font-bold pt-4" style={{ color: 'var(--text-primary)' }}>Continue Learning</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <Link href="/chat" className="group block">
          <Card className="p-5 sm:p-6 h-full transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/5" style={{ boxShadow: '0 0 0 transparent' }}>
            <h3 className="text-lg sm:text-xl font-bold mb-2 group-hover:opacity-80 transition-colors" style={{ color: 'var(--accent-blue)' }}>Chat Tutor</h3>
            <p style={{ color: 'var(--text-secondary)' }} className="text-sm sm:text-base">Practice your English conversation skills with our AI tutor. Get instant grammar corrections.</p>
            <div className="mt-4 flex items-center gap-1 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200" style={{ color: 'var(--accent-blue)' }}>
              Start practicing
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </div>
          </Card>
        </Link>
        
        <Link href="/writing" className="group block">
          <Card className="p-5 sm:p-6 h-full transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/5" style={{ boxShadow: '0 0 0 transparent' }}>
            <h3 className="text-lg sm:text-xl font-bold mb-2 group-hover:opacity-80 transition-colors" style={{ color: 'var(--accent-indigo)' }}>Writing Practice</h3>
            <p style={{ color: 'var(--text-secondary)' }} className="text-sm sm:text-base">Write an essay or a short paragraph and receive detailed feedback on style, tone, and grammar.</p>
            <div className="mt-4 flex items-center gap-1 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200" style={{ color: 'var(--accent-indigo)' }}>
              Start writing
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </div>
          </Card>
        </Link>

        <Link href="/reading" className="group block">
          <Card className="p-5 sm:p-6 h-full transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/5" style={{ boxShadow: '0 0 0 transparent' }}>
            <h3 className="text-lg sm:text-xl font-bold mb-2 group-hover:opacity-80 transition-colors" style={{ color: 'var(--accent-emerald)' }}>Reading Practice</h3>
            <p style={{ color: 'var(--text-secondary)' }} className="text-sm sm:text-base">Read articles tailored to your CEFR level and test your comprehension with quiz questions.</p>
            <div className="mt-4 flex items-center gap-1 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200" style={{ color: 'var(--accent-emerald)' }}>
              Start reading
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </div>
          </Card>
        </Link>

        <Link href="/vocabulary" className="group block">
          <Card className="p-5 sm:p-6 h-full transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/5" style={{ boxShadow: '0 0 0 transparent' }}>
            <h3 className="text-lg sm:text-xl font-bold mb-2 group-hover:opacity-80 transition-colors" style={{ color: 'var(--accent-violet)' }}>Vocabulary</h3>
            <p style={{ color: 'var(--text-secondary)' }} className="text-sm sm:text-base">Build your personal word bank and review definitions with context sentences.</p>
            <div className="mt-4 flex items-center gap-1 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200" style={{ color: 'var(--accent-violet)' }}>
              Review words
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
}
