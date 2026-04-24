import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { User } from '@/models/User';
import dbConnect from '@/lib/db/mongoose';
import { redirect } from 'next/navigation';
import { Card } from '@/components/ui/Card';

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    redirect('/login');
  }

  await dbConnect();
  const dbUser = await User.findOne({ email: session.user.email }).select('-passwordHash').lean();

  if (!dbUser) {
    redirect('/login');
  }

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-6rem)] flex flex-col p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>My Profile</h1>
        <p style={{ color: 'var(--text-secondary)' }} className="text-base sm:text-lg mt-1">Manage your account and view your progress.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - User Info */}
        <div className="md:col-span-1 space-y-6">
          <Card className="p-6 flex flex-col items-center text-center shadow-lg relative overflow-hidden group">
            {/* Background decoration */}
            <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl" style={{ background: 'rgba(59,130,246,0.1)' }}></div>
            <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full blur-2xl" style={{ background: 'rgba(139,92,246,0.1)' }}></div>
            
            <div className="w-24 h-24 rounded-full flex items-center justify-center text-4xl mb-4 relative z-10 shadow-inner" style={{ background: 'linear-gradient(to bottom right, rgba(59,130,246,0.2), rgba(99,102,241,0.2))', border: '2px solid rgba(255,255,255,0.1)' }}>
              👤
            </div>
            <h2 className="text-xl font-bold relative z-10" style={{ color: 'var(--text-primary)' }}>{dbUser.displayName}</h2>
            <p className="text-sm mt-1 relative z-10" style={{ color: 'var(--text-secondary)' }}>{dbUser.email}</p>
            
            <div className="mt-6 w-full pt-4 relative z-10" style={{ borderTop: '1px solid var(--border-subtle)' }}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Member Since</span>
                <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {new Date(dbUser.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column - Stats & Settings */}
        <div className="md:col-span-2 space-y-6">
          <Card className="p-6 shadow-lg relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-50" style={{ background: 'rgba(16,185,129,0.05)' }}></div>
             
             <h3 className="text-lg font-bold mb-6 relative z-10" style={{ color: 'var(--text-primary)' }}>Learning Profile</h3>
             
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
               <div className="p-4 rounded-xl transition-all duration-300 hover:scale-[1.02]" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-subtle)' }}>
                 <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Native Language</p>
                 <p className="text-lg font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                   <span>🗣️</span> {dbUser.nativeLanguage}
                 </p>
               </div>
               
               <div className="p-4 rounded-xl transition-all duration-300 hover:scale-[1.02]" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-subtle)' }}>
                 <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>English Level</p>
                 <p className="text-lg font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                   <span>📈</span> {dbUser.level}
                 </p>
               </div>

               <div className="p-4 rounded-xl transition-all duration-300 hover:scale-[1.02] sm:col-span-2" style={{ background: 'linear-gradient(to right, rgba(59,130,246,0.05), rgba(99,102,241,0.05))', border: '1px solid rgba(59,130,246,0.1)' }}>
                 <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Total XP Score</p>
                 <div className="flex items-end gap-2">
                   <p className="text-3xl font-bold" style={{ color: 'var(--accent-blue)' }}>
                     {dbUser.totalScore?.toLocaleString() || 0}
                   </p>
                   <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-muted)' }}>XP</p>
                 </div>
               </div>
             </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
