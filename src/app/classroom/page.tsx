"use client";
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import toast from 'react-hot-toast';
import { GraduationCap, School, UserCog, Users, ClipboardList } from 'lucide-react';

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
    <div className="max-w-4xl mx-auto space-y-8 page-animate">
      <div className="flex flex-col items-center mb-10"><div className="skeleton h-16 w-16 rounded-[1.5rem] mb-4" /><div className="skeleton h-10 w-64 mb-3" /><div className="skeleton h-5 w-96" /></div>
      <Card className="p-8 rounded-[2.5rem]"><div className="skeleton h-8 w-48 mb-6" /><div className="skeleton h-14 w-full rounded-2xl" /></Card>
      <div>
        <div className="skeleton h-8 w-48 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => <Card key={i} className="p-8 rounded-[2rem]"><div className="skeleton h-6 w-3/4 mb-3" /><div className="skeleton h-4 w-full mb-6" /><div className="skeleton h-4 w-1/2 mb-2" /><div className="skeleton h-4 w-1/3" /></Card>)}
        </div>
      </div>
    </div>
  );
}

export default function MyClassroomsPage() {
  const [classrooms, setClassrooms] = useState<MyClassroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [joinCode, setJoinCode] = useState('');
  const [joining, setJoining] = useState(false);

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

    try {
      const res = await fetch('/api/classroom/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ joinCode: joinCode.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Failed to join');
      } else {
        toast.success(data.message || 'Joined successfully!');
        setJoinCode('');
        fetchClassrooms(); // Refresh the list
      }
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong');
    } finally {
      setJoining(false);
    }
  };

  if (loading) return <ClassroomSkeleton />;

  return (
    <div className="max-w-4xl mx-auto space-y-10 page-animate">
      {/* Header */}
      <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-[1.5rem] mb-4 bg-[var(--accent-amber)]/10 text-[#f59e0b] shadow-inner">
          <GraduationCap size={32} />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3" style={{ color: 'var(--text-primary)' }}>My Classrooms</h1>
        <p className="text-[17px] font-medium" style={{ color: 'var(--text-secondary)' }}>View your enrolled classrooms or join a new one using a class code.</p>
      </div>

      {/* Join Classroom */}
      <Card className="p-6 sm:p-10 relative overflow-hidden rounded-[2.5rem] border-[var(--border-subtle)] shadow-sm bg-[var(--bg-card)]">
        <div className="absolute -top-32 -right-32 w-64 h-64 rounded-full blur-[80px] pointer-events-none" style={{ background: 'var(--accent-blue)', opacity: 0.15 }} />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="md:w-1/3">
            <h2 className="text-xl font-bold mb-2 tracking-tight" style={{ color: 'var(--text-primary)' }}>Join a Classroom</h2>
            <p className="text-[14px] font-medium" style={{ color: 'var(--text-secondary)' }}>Ask your teacher for the 6-character access code.</p>
          </div>
          
          <div className="flex-1 w-full">
            <form onSubmit={handleJoin} className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  id="join-code"
                  name="joinCode"
                  placeholder="Enter 6-character code"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  maxLength={6}
                  className="h-14 rounded-2xl bg-[var(--bg-input)] border-transparent focus:bg-[var(--bg-primary)] focus:border-[var(--accent-blue)] text-center text-lg tracking-widest font-bold uppercase placeholder:tracking-normal placeholder:font-normal placeholder:text-[15px]"
                />
              </div>
              <Button type="submit" isLoading={joining} disabled={joinCode.trim().length < 4} className="h-14 px-8 rounded-2xl font-bold shadow-md hover:shadow-lg transition-all sm:w-auto w-full">
                Join Class
              </Button>
            </form>
          </div>
        </div>
      </Card>

      {/* Enrolled Classrooms */}
      <div className="pt-4">
        <div className="flex items-center gap-3 mb-8">
          <h2 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Enrolled Classrooms</h2>
          <span className="px-3 py-1 bg-[var(--bg-input)] rounded-full text-[13px] font-bold" style={{ color: 'var(--text-secondary)' }}>{classrooms.length}</span>
        </div>
        
        {classrooms.length === 0 ? (
          <Card className="p-10 sm:p-16 text-center rounded-[2.5rem] border-[var(--border-subtle)] shadow-sm bg-[var(--bg-card)]/50 backdrop-blur-md">
            <div className="space-y-6">
              <div className="w-24 h-24 rounded-full bg-[var(--bg-input)] flex items-center justify-center mx-auto mb-6 text-[var(--text-muted)]">
                <ClipboardList size={48} />
              </div>
              <h3 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Not Enrolled Yet</h3>
              <p style={{ color: 'var(--text-secondary)' }} className="max-w-md mx-auto text-[16px] font-medium">You haven't joined any classrooms. Ask your teacher for a class code and enter it above to get started.</p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {classrooms.map(c => (
              <Card key={c.id} className="p-8 relative overflow-hidden rounded-[2rem] border-[var(--border-subtle)] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl bg-[var(--bg-card)] group">
                <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full blur-[50px] opacity-20 pointer-events-none transition-opacity group-hover:opacity-40" style={{ background: 'var(--accent-indigo)' }} />
                
                <div className="flex items-center gap-4 mb-5 relative z-10">
                  <div className="w-12 h-12 rounded-[1rem] bg-[var(--accent-indigo)]/10 text-[var(--accent-indigo)] flex items-center justify-center shadow-inner">
                    <School size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold tracking-tight leading-tight" style={{ color: 'var(--text-primary)' }}>{c.name}</h3>
                  </div>
                </div>
                
                {c.description && <p className="text-[15px] mb-6 relative z-10 font-medium leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{c.description}</p>}
                
                <div className="space-y-3 relative z-10 pt-4 border-t border-[var(--border-subtle)]">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-input)]">
                    <span className="text-[13px] font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                      <UserCog size={16} /> Teacher
                    </span>
                    <span className="text-[14px] font-bold" style={{ color: 'var(--text-primary)' }}>{c.teacherName}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-input)]">
                    <span className="text-[13px] font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                      <Users size={16} /> Students
                    </span>
                    <span className="text-[14px] font-bold" style={{ color: 'var(--text-primary)' }}>{c.studentCount} <span className="opacity-50 font-medium">/ {c.maxStudents}</span></span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
