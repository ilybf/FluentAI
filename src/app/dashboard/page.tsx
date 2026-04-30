"use client";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';
import { Trophy, MessageCircle, Library, PenTool, Flame, Sparkles, BookOpen } from 'lucide-react';

interface StatsData {
  totalScore: number;
  level: string;
  streak: { current: number; longest: number; lastActiveDate: string };
  conversations: number;
  vocabularyWords: number;
  writingSubmissions: number;
  levelProgress: {
    nextLevel: string | null;
    xpForNext: number;
    xpCurrent: number;
    progress: number;
  };
  scoreBreakdown: Record<string, { total: number; count: number }>;
  recentActivity: {
    id: string;
    type: string;
    points: number;
    details: string;
    createdAt: string;
  }[];
}

const typeIcons: Record<string, any> = {
  writing: <PenTool size={24} />, reading: <BookOpen size={24} />, chat: <MessageCircle size={24} />, vocabulary: <Library size={24} />, streak: <Flame size={24} />, level_up: <Sparkles size={24} />,
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function DashboardSkeleton() {
  return (
    <div className="space-y-10 w-full animate-pulse">
      <div className="h-12 w-64 bg-[var(--bg-input)] rounded-xl" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-[var(--bg-input)] rounded-3xl" />)}
      </div>
      <div className="h-40 bg-[var(--bg-input)] rounded-3xl" />
    </div>
  );
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/stats');
        if (res.ok) setStats(await res.json());
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading || !session) return <DashboardSkeleton />;

  const userName = session.user?.name || 'Learner';
  const userLevel = stats?.level || session.user?.level || 'B1';
  const totalScore = stats?.totalScore ?? 0;

  const breakdownTypes = ['writing', 'reading', 'chat', 'vocabulary', 'streak'];
  const maxBreakdown = Math.max(...breakdownTypes.map(t => stats?.scoreBreakdown?.[t]?.total || 0), 1);

  return (
    <div className="space-y-12 pb-10 w-full page-animate">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <p className="text-[var(--text-secondary)] font-medium tracking-wide uppercase text-sm">Dashboard</p>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Welcome back, <br className="hidden md:block" /> {userName}.
          </h1>
        </div>
        <div className="flex gap-3">
          {stats?.streak && stats.streak.current > 0 && (
            <div className="px-5 py-2.5 rounded-2xl font-bold flex items-center gap-2" style={{ background: 'var(--text-primary)', color: 'var(--bg-primary)' }}>
              <Flame size={18} /> {stats.streak.current} Day Streak
            </div>
          )}
          <div className="px-5 py-2.5 rounded-2xl font-bold border" style={{ borderColor: 'var(--border-input)', color: 'var(--text-primary)' }}>
            Level {userLevel}
          </div>
        </div>
      </div>

      {/* QUICK STATS (Now 4 blocks) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Card className="p-6 rounded-[2rem] shadow-sm hover:scale-[1.02] transition-transform">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-[var(--text-secondary)] font-semibold text-sm uppercase tracking-wider">Total XP</h3>
            <div className="text-[var(--accent-amber)]"><Trophy size={28} /></div>
          </div>
          <p className="text-4xl font-black">{totalScore.toLocaleString()}</p>
        </Card>
        <Card className="p-6 rounded-[2rem] shadow-sm hover:scale-[1.02] transition-transform">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-[var(--text-secondary)] font-semibold text-sm uppercase tracking-wider">Conversations</h3>
            <div className="text-[var(--accent-blue)]"><MessageCircle size={28} /></div>
          </div>
          <p className="text-4xl font-black">{stats?.conversations ?? 0}</p>
        </Card>
        <Card className="p-6 rounded-[2rem] shadow-sm hover:scale-[1.02] transition-transform">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-[var(--text-secondary)] font-semibold text-sm uppercase tracking-wider">Words Mastered</h3>
            <div className="text-[var(--accent-emerald)]"><Library size={28} /></div>
          </div>
          <p className="text-4xl font-black">{stats?.vocabularyWords ?? 0}</p>
        </Card>
        <Card className="p-6 rounded-[2rem] shadow-sm hover:scale-[1.02] transition-transform">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-[var(--text-secondary)] font-semibold text-sm uppercase tracking-wider">Essays</h3>
            <div className="text-[var(--accent-indigo)]"><PenTool size={28} /></div>
          </div>
          <p className="text-4xl font-black">{stats?.writingSubmissions ?? 0}</p>
        </Card>
      </div>

      {/* LEVEL PROGRESS */}
      {stats?.levelProgress?.nextLevel && (
        <Card className="p-8 rounded-[2.5rem] shadow-md border-0" style={{ background: 'linear-gradient(135deg, var(--accent-violet) 0%, var(--accent-indigo) 100%)', color: '#ffffff' }}>
          <div className="flex flex-col md:flex-row justify-between items-end mb-6 gap-4">
            <div>
              <h2 className="text-3xl font-extrabold mb-1">Level Up Progress</h2>
              <p className="opacity-80 font-medium">Reaching for {stats.levelProgress.nextLevel}</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold">{stats.levelProgress.progress}%</span>
            </div>
          </div>
          <div className="w-full h-4 rounded-full overflow-hidden bg-white/20 relative">
            <div
              className="absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out"
              style={{
                width: `${stats.levelProgress.progress}%`,
                background: 'var(--accent-emerald)',
              }}
            />
          </div>
          <div className="mt-4 flex justify-between font-semibold text-sm opacity-80">
            <span>{stats.levelProgress.xpCurrent.toLocaleString()} XP</span>
            <span>{stats.levelProgress.xpForNext.toLocaleString()} XP</span>
          </div>
        </Card>
      )}

      {/* CHARTS & ACTIVITY */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* XP Breakdown */}
        <Card className="p-6 md:p-8 rounded-[2rem]">
          <h3 className="text-xl font-bold mb-6">XP Breakdown</h3>
          <div className="space-y-5">
            {breakdownTypes.map(type => {
              const total = stats?.scoreBreakdown?.[type]?.total || 0;
              const pct = maxBreakdown > 0 ? (total / maxBreakdown) * 100 : 0;
              return (
                <div key={type} className="flex items-center gap-4">
                  <div className="w-8 flex justify-center text-[var(--accent-indigo)]">{typeIcons[type]}</div>
                  <span className="text-[15px] font-semibold capitalize w-24 text-[var(--text-secondary)]">{type}</span>
                  <div className="flex-1 h-3 rounded-full overflow-hidden bg-[var(--bg-input)]">
                    <div className="h-full rounded-full bg-[var(--accent-indigo)]" style={{ width: `${pct}%`, minWidth: total > 0 ? '8px' : '0' }} />
                  </div>
                  <span className="text-sm font-bold w-12 text-right">{total}</span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Activity Feed */}
        <Card className="p-6 md:p-8 rounded-[2rem] flex flex-col">
          <h3 className="text-xl font-bold mb-6">Recent Activity</h3>
          {!stats?.recentActivity?.length ? (
            <div className="flex-1 flex flex-col items-center justify-center text-[var(--text-muted)] py-10">
              <div className="mb-4 opacity-50"><MessageCircle size={48} /></div>
              <p className="font-medium">No activity yet. Time to learn!</p>
            </div>
          ) : (
            <div className="space-y-3 overflow-y-auto max-h-[300px] pr-2">
              {stats.recentActivity.map(event => (
                <div key={event.id} className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--bg-input)] hover:bg-[var(--border-subtle)] transition-colors">
                  <div className="text-[var(--accent-indigo)]">{typeIcons[event.type] || <Sparkles size={24} />}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[15px] truncate text-[var(--text-primary)]">{event.details || event.type}</p>
                    <p className="text-xs font-medium text-[var(--text-muted)] mt-0.5">{timeAgo(event.createdAt)}</p>
                  </div>
                  {event.points > 0 && (
                    <span className="font-bold text-sm text-[var(--accent-emerald)] bg-[var(--accent-emerald)]/10 px-3 py-1.5 rounded-xl">
                      +{event.points} XP
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* QUICK ACTIONS */}
      <div className="pt-6">
        <h2 className="text-2xl font-bold mb-6">Continue Learning</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <Link href="/chat" className="block group">
            <Card className="p-6 rounded-[2rem] h-full flex flex-col border-[var(--border-subtle)] hover:border-[var(--accent-blue)] transition-colors">
              <div className="mb-4 text-[var(--accent-blue)] group-hover:scale-110 transition-transform origin-left"><MessageCircle size={36} /></div>
              <h3 className="text-lg font-bold mb-2">Chat Tutor</h3>
              <p className="text-sm text-[var(--text-secondary)] font-medium mb-6 flex-1">Practice free-flowing conversation with AI.</p>
              <div className="text-[var(--accent-blue)] font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                Start Chatting &rarr;
              </div>
            </Card>
          </Link>
          <Link href="/writing" className="block group">
            <Card className="p-6 rounded-[2rem] h-full flex flex-col border-[var(--border-subtle)] hover:border-[var(--accent-indigo)] transition-colors">
              <div className="mb-4 text-[var(--accent-indigo)] group-hover:scale-110 transition-transform origin-left"><PenTool size={36} /></div>
              <h3 className="text-lg font-bold mb-2">Writing</h3>
              <p className="text-sm text-[var(--text-secondary)] font-medium mb-6 flex-1">Get precise feedback on your essays.</p>
              <div className="text-[var(--accent-indigo)] font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                Write Essay &rarr;
              </div>
            </Card>
          </Link>
          <Link href="/reading" className="block group">
            <Card className="p-6 rounded-[2rem] h-full flex flex-col border-[var(--border-subtle)] hover:border-[var(--accent-emerald)] transition-colors">
              <div className="mb-4 text-[var(--accent-emerald)] group-hover:scale-110 transition-transform origin-left"><BookOpen size={36} /></div>
              <h3 className="text-lg font-bold mb-2">Reading</h3>
              <p className="text-sm text-[var(--text-secondary)] font-medium mb-6 flex-1">Read leveled articles & take quizzes.</p>
              <div className="text-[var(--accent-emerald)] font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                Start Reading &rarr;
              </div>
            </Card>
          </Link>
          <Link href="/vocabulary" className="block group">
            <Card className="p-6 rounded-[2rem] h-full flex flex-col border-[var(--border-subtle)] hover:border-[var(--accent-amber)] transition-colors">
              <div className="mb-4 text-[var(--accent-amber)] group-hover:scale-110 transition-transform origin-left"><Library size={36} /></div>
              <h3 className="text-lg font-bold mb-2">Vocabulary</h3>
              <p className="text-sm text-[var(--text-secondary)] font-medium mb-6 flex-1">Review your personal word bank.</p>
              <div className="text-[var(--accent-amber)] font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                Study Words &rarr;
              </div>
            </Card>
          </Link>
        </div>
      </div>

    </div>
  );
}
