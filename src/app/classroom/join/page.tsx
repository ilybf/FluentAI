"use client";
import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';

export default function JoinClassroomPage() {
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; classroomName?: string } | null>(null);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/classroom/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ joinCode: joinCode.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        setResult({ success: false, message: data.error || 'Failed to join classroom' });
      } else {
        setResult({ success: true, message: data.message, classroomName: data.classroom?.name });
      }
    } catch (err: any) {
      setResult({ success: false, message: err.message || 'Something went wrong' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto min-h-[60vh] flex flex-col items-center justify-center p-4">
      <Card className="w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full blur-3xl" style={{ background: 'rgba(59,130,246,0.08)' }} />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 rounded-full blur-3xl" style={{ background: 'rgba(139,92,246,0.08)' }} />

        <div className="text-center mb-6 relative z-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 text-3xl" style={{ background: 'linear-gradient(to bottom right, rgba(59,130,246,0.2), rgba(99,102,241,0.2))', border: '1px solid rgba(59,130,246,0.2)' }}>
            🎓
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Join a Classroom</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Enter the 6-character code your teacher gave you.</p>
        </div>

        {result && (
          <div className="mb-6 p-3 rounded-xl text-sm relative z-10" style={{
            background: result.success ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
            color: result.success ? 'var(--accent-emerald-text)' : 'var(--accent-red)',
            border: `1px solid ${result.success ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
          }}>
            {result.success ? '✅' : '⚠️'} {result.message}
          </div>
        )}

        {result?.success ? (
          <div className="text-center relative z-10">
            <p className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              Welcome to <span style={{ color: 'var(--accent-blue)' }}>{result.classroomName}</span>!
            </p>
            <Link href="/dashboard">
              <Button className="w-full">Go to Dashboard</Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleJoin} className="space-y-5 relative z-10">
            <Input
              label="Join Code"
              id="join-code"
              name="joinCode"
              placeholder="ABC123"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              required
              maxLength={6}
            />
            <Button type="submit" className="w-full" size="lg" isLoading={loading} disabled={joinCode.trim().length < 4}>
              Join Classroom
            </Button>
          </form>
        )}

        <div className="mt-6 text-center relative z-10">
          <Link href="/dashboard" className="text-sm transition-colors hover:underline" style={{ color: 'var(--text-muted)' }}>
            ← Back to Dashboard
          </Link>
        </div>
      </Card>
    </div>
  );
}
