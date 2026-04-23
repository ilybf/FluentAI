import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Card } from '@/components/ui/Card';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#f0f2f5]">Welcome back, {session.user.name}!</h1>
          <p className="text-[#8b92a5]">Here is your English learning progress.</p>
        </div>
        <div className="px-4 py-2 bg-gradient-to-r from-blue-500/15 to-indigo-500/15 text-blue-300 rounded-full font-medium border border-blue-500/20 shadow-sm">
          CEFR Level: <span className="font-bold">{session.user.level}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-gradient-to-br from-[rgba(22,27,45,0.8)] to-[rgba(30,35,55,0.5)] border-[rgba(255,255,255,0.06)]">
          <div className="text-4xl mb-4 inline-flex items-center justify-center w-14 h-14 rounded-xl bg-amber-500/10">🏆</div>
          <h3 className="text-[#8b92a5] font-medium text-sm">Total Score</h3>
          <p className="text-3xl font-bold text-[#f0f2f5] mt-1">{session.user.totalScore}</p>
        </Card>
        
        <Card className="p-6 bg-gradient-to-br from-[rgba(22,27,45,0.8)] to-[rgba(30,35,55,0.5)] border-[rgba(255,255,255,0.06)]">
          <div className="text-4xl mb-4 inline-flex items-center justify-center w-14 h-14 rounded-xl bg-blue-500/10">💬</div>
          <h3 className="text-[#8b92a5] font-medium text-sm">Conversations</h3>
          <p className="text-3xl font-bold text-[#f0f2f5] mt-1">12</p>
        </Card>
        
        <Card className="p-6 bg-gradient-to-br from-[rgba(22,27,45,0.8)] to-[rgba(30,35,55,0.5)] border-[rgba(255,255,255,0.06)]">
          <div className="text-4xl mb-4 inline-flex items-center justify-center w-14 h-14 rounded-xl bg-emerald-500/10">📚</div>
          <h3 className="text-[#8b92a5] font-medium text-sm">Vocabulary Mastered</h3>
          <p className="text-3xl font-bold text-[#f0f2f5] mt-1">45 words</p>
        </Card>
      </div>

      <h2 className="text-2xl font-bold text-[#f0f2f5] pt-4">Continue Learning</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <a href="/chat" className="group block">
          <Card className="p-6 h-full transition-all duration-300 hover:border-blue-500/20 hover:shadow-lg hover:shadow-blue-500/5">
            <h3 className="text-xl font-bold text-blue-400 mb-2 group-hover:text-blue-300 transition-colors">Chat Tutor</h3>
            <p className="text-[#8b92a5]">Practice your English conversation skills with our AI tutor. Get instant grammar corrections.</p>
          </Card>
        </a>
        
        <a href="/writing" className="group block">
          <Card className="p-6 h-full transition-all duration-300 hover:border-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/5">
            <h3 className="text-xl font-bold text-indigo-400 mb-2 group-hover:text-indigo-300 transition-colors">Writing Practice</h3>
            <p className="text-[#8b92a5]">Write an essay or a short paragraph and receive detailed feedback on style, tone, and grammar.</p>
          </Card>
        </a>
      </div>
    </div>
  );
}
