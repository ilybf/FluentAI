"use client";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface StudentData {
  _id: string;
  displayName: string;
  email: string;
  level: string;
  totalScore: number;
  avatarUrl: string;
  streak: { current: number; longest: number; lastActiveDate: string };
  writingCount: number;
  chatCount: number;
  vocabCount: number;
  recentEvents: { type: string; points: number; details: string; createdAt: string }[];
}

interface ClassroomData {
  id: string;
  name: string;
  joinCode: string;
  studentCount: number;
  maxStudents: number;
}

const typeIcons: Record<string, string> = {
  writing: '✍️', reading: '📖', chat: '💬', vocabulary: '📚', streak: '🔥', level_up: '🎉',
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

function TeacherSkeleton() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div><div className="skeleton h-8 w-64 mb-2" /><div className="skeleton h-4 w-48" /></div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => <Card key={i} className="p-6"><div className="skeleton h-5 w-20 mb-3" /><div className="skeleton h-8 w-16" /></Card>)}
      </div>
      <Card className="p-6">{[...Array(5)].map((_, i) => <div key={i} className="skeleton h-16 w-full mb-3 rounded-xl" />)}</Card>
    </div>
  );
}

export default function TeacherDashboardPage() {
  const { data: session } = useSession();
  const [students, setStudents] = useState<StudentData[]>([]);
  const [classrooms, setClassrooms] = useState<ClassroomData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [codeCopied, setCodeCopied] = useState(false);

  // Create classroom state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [className, setClassName] = useState('');
  const [classDesc, setClassDesc] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/teacher/students');
      if (res.ok) {
        const data = await res.json();
        setStudents(data.students || []);
        setClassrooms(data.classrooms || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClassroom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!className.trim()) return;
    setCreating(true);
    try {
      const res = await fetch('/api/classroom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: className, description: classDesc }),
      });
      if (res.ok) {
        const newClass = await res.json();
        setClassrooms(prev => [newClass, ...prev]);
        setClassName('');
        setClassDesc('');
        setShowCreateForm(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const deleteClassroom = async (classroomId: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? All students will be removed from this class.`)) return;
    try {
      const res = await fetch(`/api/classroom?id=${classroomId}`, { method: 'DELETE' });
      if (res.ok) {
        setClassrooms(prev => prev.filter(c => c.id !== classroomId));
        fetchData(); // Refresh student list
      }
    } catch (err) {
      console.error('Failed to delete classroom:', err);
    }
  };

  if (loading) return <TeacherSkeleton />;

  const avgScore = students.length > 0
    ? Math.round(students.reduce((sum, s) => sum + (s.totalScore || 0), 0) / students.length)
    : 0;

  const activeToday = students.filter(s => {
    const today = new Date().toISOString().slice(0, 10);
    return s.streak?.lastActiveDate === today;
  }).length;

  const filteredStudents = students.filter(s =>
    s.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const needsAttention = students.filter(s => {
    if (!s.streak?.lastActiveDate) return true;
    const last = new Date(s.streak.lastActiveDate);
    const daysSince = Math.floor((Date.now() - last.getTime()) / 86400000);
    return daysSince >= 7;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            📊 Teacher Dashboard
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Monitor your students&apos; progress and performance.</p>
        </div>
        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          {showCreateForm ? 'Cancel' : '+ Create Classroom'}
        </Button>
      </div>

      {/* Create Classroom Form */}
      {showCreateForm && (
        <Card className="p-6">
          <h3 className="font-bold text-base mb-4" style={{ color: 'var(--text-primary)' }}>Create New Classroom</h3>
          <form onSubmit={handleCreateClassroom} className="space-y-4">
            <Input label="Classroom Name" id="class-name" name="className" placeholder="e.g. English B1 — Spring 2026" value={className} onChange={(e) => setClassName(e.target.value)} required />
            <Input label="Description (optional)" id="class-desc" name="classDesc" placeholder="Brief description..." value={classDesc} onChange={(e) => setClassDesc(e.target.value)} />
            <Button type="submit" isLoading={creating} disabled={!className.trim()}>Create Classroom</Button>
          </form>
        </Card>
      )}

      {/* Classroom Cards */}
      {classrooms.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {classrooms.map(c => (
            <Card key={c.id} className="p-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-30" style={{ background: 'rgba(59,130,246,0.1)' }} />
              <h3 className="font-bold text-base mb-1 relative z-10" style={{ color: 'var(--text-primary)' }}>{c.name}</h3>
              <p className="text-sm mb-3 relative z-10" style={{ color: 'var(--text-muted)' }}>{c.studentCount}/{c.maxStudents} students</p>
              <div className="flex items-center gap-2 relative z-10">
                <code className="px-3 py-1.5 rounded-lg text-sm font-mono font-bold tracking-widest" style={{ background: 'var(--bg-input)', color: 'var(--accent-blue)', border: '1px solid var(--border-subtle)' }}>
                  {c.joinCode}
                </code>
                <button
                  onClick={() => copyCode(c.joinCode)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
                  style={{ background: 'rgba(59,130,246,0.1)', color: 'var(--accent-blue)', border: '1px solid rgba(59,130,246,0.2)' }}
                >
                  {codeCopied ? '✓ Copied' : 'Copy'}
                </button>
                <button
                  onClick={() => deleteClassroom(c.id, c.name)}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 hover:bg-red-500/20"
                  style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--accent-red)', border: '1px solid rgba(239,68,68,0.2)' }}
                  title="Delete Classroom"
                >
                  🗑️
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 sm:p-6">
          <div className="text-3xl mb-3 inline-flex items-center justify-center w-12 h-12 rounded-xl" style={{ background: 'rgba(59,130,246,0.1)' }}>👥</div>
          <h3 className="font-medium text-sm" style={{ color: 'var(--text-secondary)' }}>Total Students</h3>
          <p className="text-2xl sm:text-3xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>{students.length}</p>
        </Card>
        <Card className="p-5 sm:p-6">
          <div className="text-3xl mb-3 inline-flex items-center justify-center w-12 h-12 rounded-xl" style={{ background: 'rgba(245,158,11,0.1)' }}>📈</div>
          <h3 className="font-medium text-sm" style={{ color: 'var(--text-secondary)' }}>Average XP</h3>
          <p className="text-2xl sm:text-3xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>{avgScore.toLocaleString()}</p>
        </Card>
        <Card className="p-5 sm:p-6">
          <div className="text-3xl mb-3 inline-flex items-center justify-center w-12 h-12 rounded-xl" style={{ background: 'rgba(16,185,129,0.1)' }}>🟢</div>
          <h3 className="font-medium text-sm" style={{ color: 'var(--text-secondary)' }}>Active Today</h3>
          <p className="text-2xl sm:text-3xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>{activeToday}</p>
        </Card>
      </div>

      {/* Needs Attention */}
      {needsAttention.length > 0 && (
        <Card className="p-5 sm:p-6" style={{ border: '1px solid rgba(245,158,11,0.3)' }}>
          <h3 className="font-bold text-base mb-3 flex items-center gap-2" style={{ color: '#f59e0b' }}>⚠️ Needs Attention</h3>
          <div className="flex flex-wrap gap-2">
            {needsAttention.slice(0, 5).map(s => (
              <span key={s._id} className="px-3 py-1.5 rounded-lg text-sm" style={{ background: 'rgba(245,158,11,0.1)', color: 'var(--text-secondary)' }}>
                {s.avatarUrl || '👤'} {s.displayName} — inactive {s.streak?.lastActiveDate ? `since ${new Date(s.streak.lastActiveDate).toLocaleDateString()}` : 'never active'}
              </span>
            ))}
          </div>
        </Card>
      )}

      {/* Student List */}
      <div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Students</h2>
          <div className="w-full sm:w-72">
            <Input placeholder="Search students..." id="teacher-search" name="search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
        </div>

        {students.length === 0 ? (
          <Card className="p-8 sm:p-12 text-center">
            <span className="text-5xl block mb-3">🎓</span>
            <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>No Students Yet</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Create a classroom and share the join code with your students.</p>
          </Card>
        ) : selectedStudent ? (
          /* Student Detail View */
          <div className="space-y-6">
            <button onClick={() => setSelectedStudent(null)} className="text-sm flex items-center gap-1 transition-colors hover:underline" style={{ color: 'var(--text-muted)' }}>
              ← Back to list
            </button>
            <Card className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl" style={{ background: 'linear-gradient(to bottom right, rgba(59,130,246,0.2), rgba(99,102,241,0.2))' }}>
                  {selectedStudent.avatarUrl || '👤'}
                </div>
                <div>
                  <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{selectedStudent.displayName}</h2>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{selectedStudent.email}</p>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-2xl font-bold" style={{ color: 'var(--accent-blue)' }}>{selectedStudent.totalScore.toLocaleString()} XP</p>
                  <span className="text-xs px-2 py-1 rounded-full" style={{ background: 'rgba(59,130,246,0.1)', color: 'var(--accent-blue)' }}>Level {selectedStudent.level}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="p-3 rounded-xl text-center" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-subtle)' }}>
                  <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{selectedStudent.writingCount}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Essays</p>
                </div>
                <div className="p-3 rounded-xl text-center" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-subtle)' }}>
                  <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{selectedStudent.chatCount}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Chats</p>
                </div>
                <div className="p-3 rounded-xl text-center" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-subtle)' }}>
                  <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{selectedStudent.vocabCount}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Words</p>
                </div>
              </div>

              {selectedStudent.recentEvents.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>Recent Activity</h4>
                  <div className="space-y-2">
                    {selectedStudent.recentEvents.map((e, i) => (
                      <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl" style={{ background: 'var(--bg-input)' }}>
                        <span>{typeIcons[e.type] || '⭐'}</span>
                        <span className="flex-1 text-sm truncate" style={{ color: 'var(--text-primary)' }}>{e.details}</span>
                        {e.points > 0 && <span className="text-xs font-bold" style={{ color: 'var(--accent-blue)' }}>+{e.points} XP</span>}
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{timeAgo(e.createdAt)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </div>
        ) : (
          /* Student List */
          <div className="space-y-2">
            {filteredStudents.map((student, i) => (
              <Card
                key={student._id}
                className="p-4 cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/5"
                onClick={() => setSelectedStudent(student)}
              >
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium w-6 text-center" style={{ color: 'var(--text-muted)' }}>#{i + 1}</span>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl shrink-0" style={{ background: 'linear-gradient(to bottom right, rgba(59,130,246,0.15), rgba(99,102,241,0.1))' }}>
                    {student.avatarUrl || '👤'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{student.displayName}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Level {student.level} · {student.writingCount} essays · {student.vocabCount} words</p>
                  </div>
                  {student.streak?.current > 0 && (
                    <span className="text-xs px-2 py-1 rounded-lg shrink-0" style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}>🔥 {student.streak.current}d</span>
                  )}
                  <div className="text-right shrink-0">
                    <p className="font-bold text-sm" style={{ color: 'var(--accent-blue)' }}>{student.totalScore.toLocaleString()} XP</p>
                  </div>
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--text-muted)' }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
