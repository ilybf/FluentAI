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
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {session.user.name}!</h1>
          <p className="text-gray-500">Here is your English learning progress.</p>
        </div>
        <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full font-medium border border-blue-100 shadow-sm">
          CEFR Level: <span className="font-bold">{session.user.level}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-gradient-to-br from-white to-gray-50 border-gray-200">
          <div className="text-4xl mb-4">🏆</div>
          <h3 className="text-gray-500 font-medium text-sm">Total Score</h3>
          <p className="text-3xl font-bold text-gray-900 mt-1">{session.user.totalScore}</p>
        </Card>
        
        <Card className="p-6 bg-gradient-to-br from-white to-gray-50 border-gray-200">
          <div className="text-4xl mb-4">💬</div>
          <h3 className="text-gray-500 font-medium text-sm">Conversations</h3>
          <p className="text-3xl font-bold text-gray-900 mt-1">12</p>
        </Card>
        
        <Card className="p-6 bg-gradient-to-br from-white to-gray-50 border-gray-200">
          <div className="text-4xl mb-4">📚</div>
          <h3 className="text-gray-500 font-medium text-sm">Vocabulary Mastered</h3>
          <p className="text-3xl font-bold text-gray-900 mt-1">45 words</p>
        </Card>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 pt-4">Continue Learning</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <a href="/chat" className="group block">
          <Card className="p-6 h-full transition-shadow hover:shadow-md border-blue-100 bg-white">
            <h3 className="text-xl font-bold text-blue-600 mb-2 group-hover:underline">Chat Tutor</h3>
            <p className="text-gray-600">Practice your English conversation skills with our AI tutor. Get instant grammar corrections.</p>
          </Card>
        </a>
        
        <a href="/writing" className="group block">
          <Card className="p-6 h-full transition-shadow hover:shadow-md border-indigo-100 bg-white">
            <h3 className="text-xl font-bold text-indigo-600 mb-2 group-hover:underline">Writing Practice</h3>
            <p className="text-gray-600">Write an essay or a short paragraph and receive detailed feedback on style, tone, and grammar.</p>
          </Card>
        </a>
      </div>
    </div>
  );
}
