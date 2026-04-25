"use client";
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface MyClassroom {
  id: string;
  name: string;
  description: string;
  teacherName: string;
  studentCount: number;
  maxStudents: number;
}

function ClassroomSkeleton() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div><div className="skeleton h-8 w-52 mb-2" /><div className="skeleton h-4 w-72" /></div>
      <Card className="p-6"><div className="skeleton h-10 w-full mb-3" /><div className="skeleton h-10 w-32" /></Card>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[...Array(2)].map((_, i) => <Card key={i} className="p-6"><div className="skeleton h-5 w-40 mb-3" /><div className="skeleton h-4 w-32 mb-2" /><div className="skeleton h-3 w-20" /></Card>)}
      </div>
    </div>
  );
}

export default function MyClassroomsPage() {
  const [classrooms, setClassrooms] = useState<MyClassroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [joinCode, setJoinCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState<'success' | 'error'>('success');

  useEffect(() => { fetchClassrooms(); }, []);

  const fetchClassrooms = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/classroom/my');
      if (res.ok) setClassrooms(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    setJoining(true);
    setMsg('');

    try {
      const res = await fetch('/api/classroom/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ joinCode: joinCode.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMsg(data.error || 'Failed to join');
        setMsgType('error');
      } else {
        setMsg(data.message || 'Joined successfully!');
        setMsgType('success');
        setJoinCode('');
        fetchClassrooms(); // Refresh the list
      }
    } catch (err: any) {
      setMsg(err.message || 'Something went wrong');
      setMsgType('error');
    } finally {
      setJoining(false);
    }
  };

  if (loading) return <ClassroomSkeleton />;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>🎓 My Classrooms</h1>
        <p style={{ color: 'var(--text-secondary)' }}>View your enrolled classrooms or join a new one.</p>
      </div>

      {/* Join Classroom */}
      <Card className="p-5 sm:p-6 relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full blur-3xl" style={{ background: 'rgba(59,130,246,0.06)' }} />
        <h2 className="font-bold text-base mb-4 relative z-10" style={{ color: 'var(--text-primary)' }}>Join a Classroom</h2>
        <form onSubmit={handleJoin} className="flex flex-col sm:flex-row gap-3 relative z-10">
          <div className="flex-1">
            <Input
              id="join-code"
              name="joinCode"
              placeholder="Enter 6-character class code..."
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              maxLength={6}
            />
          </div>
          <Button type="submit" isLoading={joining} disabled={joinCode.trim().length < 4}>Join</Button>
        </form>
        {msg && (
          <div className="mt-3 p-3 rounded-xl text-sm relative z-10" style={{
            background: msgType === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
            color: msgType === 'success' ? 'var(--accent-emerald-text)' : 'var(--accent-red)',
            border: `1px solid ${msgType === 'success' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
          }}>
            {msgType === 'success' ? '✅' : '⚠️'} {msg}
          </div>
        )}
      </Card>

      {/* Enrolled Classrooms */}
      <div>
        <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Enrolled Classrooms</h2>
        {classrooms.length === 0 ? (
          <Card className="p-8 text-center">
            <span className="text-5xl block mb-3">📋</span>
            <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Not enrolled yet</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Ask your teacher for a class code and enter it above.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {classrooms.map(c => (
              <Card key={c.id} className="p-5 relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full blur-3xl opacity-30" style={{ background: 'rgba(99,102,241,0.15)' }} />
                <h3 className="font-bold text-base mb-1 relative z-10" style={{ color: 'var(--text-primary)' }}>{c.name}</h3>
                {c.description && <p className="text-sm mb-2 relative z-10" style={{ color: 'var(--text-muted)' }}>{c.description}</p>}
                <div className="space-y-1 relative z-10">
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <span className="font-medium">👩‍🏫 Teacher:</span> {c.teacherName}
                  </p>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <span className="font-medium">👥 Students:</span> {c.studentCount}/{c.maxStudents}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
