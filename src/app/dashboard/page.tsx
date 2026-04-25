"use client";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';

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

const typeIcons: Record<string, string> = {
  writing: '✍️',
  reading: '📖',
  chat: '💬',
  vocabulary: '📚',
  streak: '🔥',
  level_up: '🎉',
};

const typeColors: Record<string, string> = {
  writing: 'rgba(99,102,241,0.15)',
  reading: 'rgba(16,185,129,0.15)',
  chat: 'rgba(59,130,246,0.15)',
  vocabulary: 'rgba(168,85,247,0.15)',
  streak: 'rgba(245,158,11,0.15)',
  level_up: 'rgba(236,72,153,0.15)',
};

function timeAgo(dateStr: string) {
  const now = Date.now();
  const diff = now - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function DashboardSkeleton() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div><div className="skeleton h-8 w-72 mb-2" /><div className="skeleton h-4 w-48" /></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <Card key={i} className="p-6"><div className="skeleton h-5 w-20 mb-3" /><div className="skeleton h-8 w-16" /></Card>)}
      </div>
      <div className="skeleton h-6 w-full rounded-full" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6"><div className="skeleton h-5 w-40 mb-4" />{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-4 w-full mb-2" />)}</Card>
        <Card className="p-6"><div className="skeleton h-5 w-40 mb-4" />{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-8 w-full mb-2 rounded-lg" />)}</Card>
      </div>
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
        if (res.ok) {
          setStats(await res.json());
        }
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

  // Score breakdown for chart
  const breakdownTypes = ['writing', 'reading', 'chat', 'vocabulary', 'streak'];
  const maxBreakdown = Math.max(
    ...breakdownTypes.map(t => stats?.scoreBreakdown?.[t]?.total || 0),
    1
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Welcome back, {userName}!</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Here is your English learning progress.</p>
        </div>
        <div className="flex items-center gap-3">
          {stats?.streak && stats.streak.current > 0 && (
            <div className="px-4 py-2 rounded-full font-medium text-sm flex items-center gap-2" style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)' }}>
              🔥 {stats.streak.current}-day streak
            </div>
          )}
          <div className="px-4 py-2 rounded-full font-medium text-sm" style={{ background: 'rgba(59,130,246,0.12)', color: 'var(--accent-blue)', border: '1px solid rgba(59,130,246,0.2)' }}>
            CEFR Level: <span className="font-bold">{userLevel}</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-5 sm:p-6">
          <div className="text-3xl mb-3 inline-flex items-center justify-center w-12 h-12 rounded-xl" style={{ background: 'rgba(245,158,11,0.1)' }}>🏆</div>
          <h3 className="font-medium text-sm" style={{ color: 'var(--text-secondary)' }}>Total XP</h3>
          <p className="text-2xl sm:text-3xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>{totalScore.toLocaleString()}</p>
        </Card>

        <Card className="p-5 sm:p-6">
          <div className="text-3xl mb-3 inline-flex items-center justify-center w-12 h-12 rounded-xl" style={{ background: 'rgba(59,130,246,0.1)' }}>💬</div>
          <h3 className="font-medium text-sm" style={{ color: 'var(--text-secondary)' }}>Conversations</h3>
          <p className="text-2xl sm:text-3xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>{stats?.conversations ?? 0}</p>
        </Card>

        <Card className="p-5 sm:p-6">
          <div className="text-3xl mb-3 inline-flex items-center justify-center w-12 h-12 rounded-xl" style={{ background: 'rgba(16,185,129,0.1)' }}>📚</div>
          <h3 className="font-medium text-sm" style={{ color: 'var(--text-secondary)' }}>Vocabulary</h3>
          <p className="text-2xl sm:text-3xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>{stats?.vocabularyWords ?? 0} words</p>
        </Card>

        <Card className="p-5 sm:p-6">
          <div className="text-3xl mb-3 inline-flex items-center justify-center w-12 h-12 rounded-xl" style={{ background: 'rgba(99,102,241,0.1)' }}>✍️</div>
          <h3 className="font-medium text-sm" style={{ color: 'var(--text-secondary)' }}>Essays Written</h3>
          <p className="text-2xl sm:text-3xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>{stats?.writingSubmissions ?? 0}</p>
        </Card>
      </div>

      {/* XP Progress Bar */}
      {stats?.levelProgress?.nextLevel && (
        <Card className="p-5 sm:p-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
              Progress to {stats.levelProgress.nextLevel}
            </h3>
            <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
              {stats.levelProgress.xpCurrent.toLocaleString()} / {stats.levelProgress.xpForNext.toLocaleString()} XP
            </span>
          </div>
          <div className="w-full rounded-full h-3 overflow-hidden" style={{ background: 'var(--bg-input)' }}>
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${stats.levelProgress.progress}%`,
                background: 'linear-gradient(to right, var(--accent-blue), var(--accent-violet))',
                minWidth: stats.levelProgress.progress > 0 ? '8px' : '0',
              }}
            />
          </div>
          <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
            {stats.levelProgress.progress}% complete — {(stats.levelProgress.xpForNext - stats.levelProgress.xpCurrent).toLocaleString()} XP to go
          </p>
        </Card>
      )}

      {/* Score Breakdown + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score Breakdown Chart */}
        <Card className="p-5 sm:p-6">
          <h3 className="font-bold text-base mb-5" style={{ color: 'var(--text-primary)' }}>XP Breakdown</h3>
          <div className="space-y-3">
            {breakdownTypes.map(type => {
              const data = stats?.scoreBreakdown?.[type];
              const total = data?.total || 0;
              const pct = maxBreakdown > 0 ? (total / maxBreakdown) * 100 : 0;
              return (
                <div key={type} className="flex items-center gap-3">
                  <span className="text-lg w-7 text-center">{typeIcons[type]}</span>
                  <span className="text-sm font-medium capitalize w-20" style={{ color: 'var(--text-secondary)' }}>{type}</span>
                  <div className="flex-1 rounded-full h-2.5 overflow-hidden" style={{ background: 'var(--bg-input)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, background: typeColors[type]?.replace('0.15', '0.6') || 'var(--accent-blue)', minWidth: total > 0 ? '4px' : '0' }}
                    />
                  </div>
                  <span className="text-xs font-semibold w-14 text-right" style={{ color: 'var(--text-primary)' }}>{total.toLocaleString()}</span>
                </div>
              );
            })}
          </div>
          {Object.keys(stats?.scoreBreakdown || {}).length === 0 && (
            <p className="text-sm text-center mt-4" style={{ color: 'var(--text-muted)' }}>Complete activities to see your breakdown</p>
          )}
        </Card>

        {/* Recent Activity */}
        <Card className="p-5 sm:p-6">
          <h3 className="font-bold text-base mb-5" style={{ color: 'var(--text-primary)' }}>Recent Activity</h3>
          {(!stats?.recentActivity || stats.recentActivity.length === 0) ? (
            <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
              <span className="text-4xl block mb-2">📋</span>
              <p className="text-sm">Start learning to see your activity here</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {stats.recentActivity.map(event => (
                <div key={event.id} className="flex items-center gap-3 p-2.5 rounded-xl transition-colors" style={{ background: typeColors[event.type] || 'var(--bg-input)' }}>
                  <span className="text-base">{typeIcons[event.type] || '⭐'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate" style={{ color: 'var(--text-primary)' }}>{event.details || event.type}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{timeAgo(event.createdAt)}</p>
                  </div>
                  {event.points > 0 && (
                    <span className="text-xs font-bold shrink-0 px-2 py-1 rounded-lg" style={{ background: 'rgba(59,130,246,0.1)', color: 'var(--accent-blue)' }}>+{event.points} XP</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Continue Learning */}
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
