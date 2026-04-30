"use client";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import toast from 'react-hot-toast';
import { Users, TrendingUp, CheckCircle, AlertTriangle, School, Trash2, Copy, PenTool, BookOpen, MessageCircle, Library, Flame, Sparkles, ArrowLeft, ChevronRight, User, Search, Activity, Star } from 'lucide-react';

const AVATAR_PRESETS = [
  '👤', '👩‍🎓', '👨‍🎓', '🧑‍💻', '👩‍🏫', '👨‍🏫', '🦊', '🐱', '🐶', '🦁',
  '🐼', '🐨', '🦄', '🐸', '🌟', '🚀', '🎯', '🎨', '🎸', '💎',
];

function renderAvatar(avatarUrl: string | undefined, size: 'sm' | 'md' | 'lg') {
  const sizeClasses = { sm: 'w-5 h-5', md: 'w-full h-full', lg: 'w-full h-full' };
  const radiusClasses = { sm: 'rounded-full', md: 'rounded-[1rem]', lg: 'rounded-[1.35rem]' };
  const iconSizes = { sm: 16, md: 24, lg: 36 };
  const url = avatarUrl || '';
  if (url.startsWith('data:image/')) {
    return <img src={url} alt="Avatar" className={`${sizeClasses[size]} ${radiusClasses[size]} object-cover`} />;
  }
  if (url && AVATAR_PRESETS.includes(url)) {
    const textSizes = { sm: 'text-sm', md: 'text-xl', lg: 'text-3xl' };
    return <span className={textSizes[size]}>{url}</span>;
  }
  return <User size={iconSizes[size]} />;
}

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

const typeIcons: Record<string, React.ReactNode> = {
  writing: <PenTool size={20} />, reading: <BookOpen size={20} />, chat: <MessageCircle size={20} />, vocabulary: <Library size={20} />, streak: <Flame size={20} />, level_up: <Sparkles size={20} />,
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
    <div className="max-w-6xl mx-auto space-y-8 page-animate">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div><div className="skeleton h-10 w-72 mb-3" /><div className="skeleton h-5 w-56" /></div>
        <div className="skeleton h-12 w-48 rounded-2xl" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => <Card key={i} className="p-8 rounded-[2rem]"><div className="skeleton h-12 w-12 rounded-xl mb-4" /><div className="skeleton h-5 w-24 mb-3" /><div className="skeleton h-10 w-16" /></Card>)}
      </div>
      <Card className="p-8 rounded-[2.5rem]">{[...Array(5)].map((_, i) => <div key={i} className="skeleton h-20 w-full mb-4 rounded-[1.5rem]" />)}</Card>
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
    toast.success('Join code copied!');
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const executeDeleteClassroom = async (classroomId: string) => {
    try {
      const res = await fetch(`/api/classroom?id=${classroomId}`, { method: 'DELETE' });
      if (res.ok) {
        setClassrooms(prev => prev.filter(c => c.id !== classroomId));
        toast.success('Classroom deleted');
        fetchData(); // Refresh student list
      } else {
        toast.error('Failed to delete classroom');
      }
    } catch (err) {
      console.error('Failed to delete classroom:', err);
      toast.error('Failed to delete classroom');
    }
  };

  const deleteClassroom = (classroomId: string, name: string) => {
    toast((t) => (
      <div className="flex flex-col gap-3 p-1">
        <div className="flex items-center gap-2 font-bold"><AlertTriangle className="text-amber-500" size={20} /> Delete "{name}"?</div>
        <p className="text-sm">All students will be removed from this class.</p>
        <div className="flex justify-end gap-2 mt-2">
          <Button variant="outline" size="sm" onClick={() => toast.dismiss(t.id)}>Cancel</Button>
          <Button size="sm" className="bg-red-500 text-white hover:bg-red-600" onClick={() => { toast.dismiss(t.id); executeDeleteClassroom(classroomId); }}>Delete</Button>
        </div>
      </div>
    ), { duration: 5000 });
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
    <div className="max-w-6xl mx-auto space-y-10 page-animate">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center justify-center w-14 h-14 rounded-2xl bg-[var(--accent-blue)]/10 text-[var(--accent-blue)] shadow-inner">
            <Activity size={28} />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Teacher Dashboard
            </h1>
            <p className="mt-1.5 text-[16px] font-medium" style={{ color: 'var(--text-secondary)' }}>Monitor your students&apos; progress and performance.</p>
          </div>
        </div>
        <Button 
          onClick={() => setShowCreateForm(!showCreateForm)}
          className={`h-12 px-6 rounded-2xl font-bold shadow-md transition-all ${showCreateForm ? 'bg-[var(--bg-input)] text-[var(--text-primary)] hover:bg-[var(--bg-card)]' : 'bg-[var(--accent-blue)] text-white hover:shadow-lg'}`}
          variant={showCreateForm ? 'outline' : 'primary'}
        >
          {showCreateForm ? 'Cancel' : '+ Create Classroom'}
        </Button>
      </div>

      {/* Create Classroom Form */}
      {showCreateForm && (
        <Card className="p-6 sm:p-8 rounded-[2.5rem] border-[var(--border-subtle)] shadow-sm bg-[var(--bg-card)] animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center gap-3 mb-6">
            <School size={28} className="text-[var(--accent-indigo)]" />
            <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Create New Classroom</h3>
          </div>
          <form onSubmit={handleCreateClassroom} className="space-y-5 max-w-2xl">
            <Input 
              label="Classroom Name" 
              id="class-name" 
              name="className" 
              placeholder="e.g. English B1 — Spring 2026" 
              value={className} 
              onChange={(e) => setClassName(e.target.value)} 
              required 
              className="h-14 rounded-2xl bg-[var(--bg-input)] border-transparent focus:bg-[var(--bg-primary)] focus:border-[var(--accent-blue)]"
            />
            <Input 
              label="Description (optional)" 
              id="class-desc" 
              name="classDesc" 
              placeholder="Brief description..." 
              value={classDesc} 
              onChange={(e) => setClassDesc(e.target.value)} 
              className="h-14 rounded-2xl bg-[var(--bg-input)] border-transparent focus:bg-[var(--bg-primary)] focus:border-[var(--accent-blue)]"
            />
            <div className="pt-2">
              <Button type="submit" isLoading={creating} disabled={!className.trim()} className="h-14 px-8 rounded-2xl font-bold shadow-md hover:shadow-lg transition-all">
                Create Classroom
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Classroom Cards */}
      {classrooms.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {classrooms.map(c => (
            <Card key={c.id} className="p-6 relative overflow-hidden rounded-[2rem] border-[var(--border-subtle)] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl bg-[var(--bg-card)] group">
              <div className="absolute top-0 right-0 w-40 h-40 rounded-full blur-[50px] opacity-20 pointer-events-none transition-opacity group-hover:opacity-40" style={{ background: 'var(--accent-blue)' }} />
              <h3 className="text-xl font-bold mb-2 relative z-10 tracking-tight" style={{ color: 'var(--text-primary)' }}>{c.name}</h3>
              <p className="text-[15px] font-medium mb-6 relative z-10" style={{ color: 'var(--text-secondary)' }}>
                <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{c.studentCount}</span> / {c.maxStudents} students
              </p>
              <div className="flex items-center gap-3 relative z-10 pt-4 border-t border-[var(--border-subtle)]">
                <code className="px-4 py-2 rounded-xl text-[14px] font-mono font-bold tracking-widest flex-1 text-center" style={{ background: 'var(--bg-input)', color: 'var(--accent-blue)', border: '1px solid var(--border-subtle)' }}>
                  {c.joinCode}
                </code>
                <button
                  onClick={() => copyCode(c.joinCode)}
                  className="px-4 py-2 rounded-xl text-[14px] font-bold transition-all duration-200 flex items-center justify-center gap-2"
                  style={{ background: 'rgba(59,130,246,0.1)', color: 'var(--accent-blue)', border: '1px solid rgba(59,130,246,0.2)' }}
                >
                  {codeCopied ? <CheckCircle size={16} /> : <Copy size={16} />} {codeCopied ? 'Copied' : 'Copy'}
                </button>
                <button
                  onClick={() => deleteClassroom(c.id, c.name)}
                  className="px-3 py-2 rounded-xl text-[14px] font-bold transition-all duration-200 hover:bg-[var(--accent-red)] hover:text-white flex items-center justify-center"
                  style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--accent-red)', border: '1px solid rgba(239,68,68,0.2)' }}
                  title="Delete Classroom"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="p-6 sm:p-8 rounded-[2rem] border-[var(--border-subtle)] bg-[var(--bg-card)] transition-all hover:shadow-lg">
          <div className="mb-4 inline-flex items-center justify-center w-14 h-14 rounded-[1rem] shadow-inner" style={{ background: 'rgba(59,130,246,0.1)', color: 'var(--accent-blue)' }}><Users size={28} /></div>
          <h3 className="text-[14px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-secondary)' }}>Total Students</h3>
          <p className="text-3xl sm:text-4xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>{students.length}</p>
        </Card>
        <Card className="p-6 sm:p-8 rounded-[2rem] border-[var(--border-subtle)] bg-[var(--bg-card)] transition-all hover:shadow-lg">
          <div className="mb-4 inline-flex items-center justify-center w-14 h-14 rounded-[1rem] shadow-inner" style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}><TrendingUp size={28} /></div>
          <h3 className="text-[14px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-secondary)' }}>Average XP</h3>
          <p className="text-3xl sm:text-4xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>{avgScore.toLocaleString()}</p>
        </Card>
        <Card className="p-6 sm:p-8 rounded-[2rem] border-[var(--border-subtle)] bg-[var(--bg-card)] transition-all hover:shadow-lg">
          <div className="mb-4 inline-flex items-center justify-center w-14 h-14 rounded-[1rem] shadow-inner" style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--accent-emerald)' }}><CheckCircle size={28} /></div>
          <h3 className="text-[14px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-secondary)' }}>Active Today</h3>
          <p className="text-3xl sm:text-4xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>{activeToday}</p>
        </Card>
      </div>

      {/* Needs Attention */}
      {needsAttention.length > 0 && (
        <Card className="p-6 sm:p-8 rounded-[2rem]" style={{ border: '1px solid rgba(245,158,11,0.3)', background: 'rgba(245,158,11,0.05)' }}>
          <h3 className="text-[16px] font-bold mb-4 flex items-center gap-2 uppercase tracking-wider" style={{ color: '#f59e0b' }}><AlertTriangle size={20} /> Needs Attention</h3>
          <div className="flex flex-wrap gap-3">
            {needsAttention.slice(0, 5).map(s => (
              <span key={s._id} className="px-4 py-2 rounded-xl text-[14px] font-medium flex items-center gap-2 shadow-sm" style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid rgba(245,158,11,0.2)' }}>
                <span>{renderAvatar(s.avatarUrl, 'sm')}</span>
                <span className="font-bold">{s.displayName}</span>
                <span className="opacity-60">— inactive {s.streak?.lastActiveDate ? `since ${new Date(s.streak.lastActiveDate).toLocaleDateString()}` : 'never active'}</span>
              </span>
            ))}
          </div>
        </Card>
      )}

      {/* Student List */}
      <div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Students</h2>
          <div className="w-full sm:w-80 relative">
            <Input 
              placeholder="Search students..." 
              id="teacher-search" 
              name="search" 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 rounded-2xl bg-[var(--bg-card)] border-[var(--border-subtle)] focus:border-[var(--accent-blue)] pl-12 text-[15px] font-medium shadow-sm" 
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 opacity-50"><Search size={18} /></span>
          </div>
        </div>

        {students.length === 0 ? (
          <Card className="p-10 sm:p-16 text-center rounded-[2.5rem] border-[var(--border-subtle)] shadow-sm bg-[var(--bg-card)]">
            <div className="space-y-6">
              <div className="w-24 h-24 rounded-full bg-[var(--bg-input)] flex items-center justify-center mx-auto mb-6 text-[var(--text-muted)]">
                <Users size={48} />
              </div>
              <h3 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>No Students Yet</h3>
              <p style={{ color: 'var(--text-secondary)' }} className="max-w-md mx-auto text-[16px] font-medium">Create a classroom and share the join code with your students to get started.</p>
            </div>
          </Card>
        ) : selectedStudent ? (
          /* Student Detail View */
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <button onClick={() => setSelectedStudent(null)} className="text-[15px] font-bold flex items-center gap-2 transition-colors hover:text-[var(--accent-blue)]" style={{ color: 'var(--text-muted)' }}>
              <ArrowLeft size={16} /> Back to list
            </button>
            <Card className="p-6 sm:p-8 rounded-[2.5rem] border-[var(--border-subtle)] shadow-lg bg-[var(--bg-card)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-[80px] opacity-10 pointer-events-none" style={{ background: 'var(--accent-blue)' }} />
              
              <div className="flex flex-col sm:flex-row sm:items-center gap-6 mb-8 relative z-10">
                <div className="w-20 h-20 rounded-[1.5rem] flex items-center justify-center text-4xl shadow-xl overflow-hidden" style={{ background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-indigo))', padding: (selectedStudent.avatarUrl || '').startsWith('data:image/') ? '0' : '2px' }}>
                  <div className="w-full h-full bg-[var(--bg-card)] rounded-[1.35rem] flex items-center justify-center overflow-hidden">
                    {renderAvatar(selectedStudent.avatarUrl, 'lg')}
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>{selectedStudent.displayName}</h2>
                  <p className="text-[15px] font-medium mt-1" style={{ color: 'var(--text-secondary)' }}>{selectedStudent.email}</p>
                </div>
                <div className="sm:ml-auto flex items-end sm:flex-col gap-3 sm:gap-1 sm:text-right">
                  <p className="text-3xl font-black tracking-tighter" style={{ color: 'var(--accent-blue)' }}>{selectedStudent.totalScore.toLocaleString()} XP</p>
                  <span className="text-[13px] font-bold px-3 py-1 rounded-xl uppercase tracking-wider" style={{ background: 'rgba(59,130,246,0.1)', color: 'var(--accent-blue)' }}>Level {selectedStudent.level}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-8 relative z-10">
                <div className="p-4 rounded-[1.5rem] text-center transition-all hover:bg-[var(--bg-primary)]" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-subtle)' }}>
                  <p className="text-2xl font-black mb-1" style={{ color: 'var(--text-primary)' }}>{selectedStudent.writingCount}</p>
                  <p className="text-[13px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Essays</p>
                </div>
                <div className="p-4 rounded-[1.5rem] text-center transition-all hover:bg-[var(--bg-primary)]" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-subtle)' }}>
                  <p className="text-2xl font-black mb-1" style={{ color: 'var(--text-primary)' }}>{selectedStudent.chatCount}</p>
                  <p className="text-[13px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Chats</p>
                </div>
                <div className="p-4 rounded-[1.5rem] text-center transition-all hover:bg-[var(--bg-primary)]" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-subtle)' }}>
                  <p className="text-2xl font-black mb-1" style={{ color: 'var(--text-primary)' }}>{selectedStudent.vocabCount}</p>
                  <p className="text-[13px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Words</p>
                </div>
              </div>

              {selectedStudent.recentEvents.length > 0 && (
                <div className="relative z-10 pt-6 border-t border-[var(--border-subtle)]">
                  <h4 className="font-bold text-[16px] mb-4 tracking-tight" style={{ color: 'var(--text-primary)' }}>Recent Activity</h4>
                  <div className="space-y-3">
                    {selectedStudent.recentEvents.map((e, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 rounded-[1.5rem] transition-all hover:border-[var(--border-subtle)] border border-transparent" style={{ background: 'var(--bg-input)' }}>
                        <span className="w-10 h-10 flex items-center justify-center bg-[var(--bg-card)] rounded-xl shadow-sm text-[var(--accent-indigo)]">{typeIcons[e.type] || <Star size={20} />}</span>
                        <div className="flex-1 min-w-0">
                          <span className="block text-[15px] font-bold truncate mb-0.5" style={{ color: 'var(--text-primary)' }}>{e.details}</span>
                          <span className="text-[13px] font-medium" style={{ color: 'var(--text-muted)' }}>{timeAgo(e.createdAt)}</span>
                        </div>
                        {e.points > 0 && <span className="text-[14px] font-black px-3 py-1.5 rounded-xl shadow-sm" style={{ background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-indigo))', color: '#fff' }}>+{e.points} XP</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </div>
        ) : (
          /* Student List */
          <div className="space-y-3">
            {filteredStudents.map((student, i) => (
              <Card
                key={student._id}
                className="p-4 sm:p-5 cursor-pointer rounded-[1.5rem] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg border-[var(--border-subtle)] bg-[var(--bg-card)] group"
                onClick={() => setSelectedStudent(student)}
              >
                <div className="flex items-center gap-4">
                  <span className="text-[14px] font-bold w-6 text-center opacity-50 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--text-muted)' }}>{i + 1}</span>
                  <div className="w-12 h-12 rounded-[1rem] flex items-center justify-center text-[var(--text-muted)] shrink-0 shadow-inner overflow-hidden" style={{ background: 'var(--bg-input)' }}>
                    {renderAvatar(student.avatarUrl, 'md')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[16px] truncate mb-0.5 group-hover:text-[var(--accent-blue)] transition-colors" style={{ color: 'var(--text-primary)' }}>{student.displayName}</p>
                    <p className="text-[13px] font-medium truncate flex gap-2 items-center" style={{ color: 'var(--text-muted)' }}>
                      <span className="px-2 py-0.5 rounded-md" style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--accent-emerald)' }}>{student.level}</span>
                      <span>·</span>
                      <span>{student.writingCount} essays</span>
                      <span className="hidden sm:inline">·</span>
                      <span className="hidden sm:inline">{student.vocabCount} words</span>
                    </p>
                  </div>
                  {student.streak?.current > 0 && (
                    <span className="text-[13px] font-bold px-3 py-1.5 rounded-xl shrink-0 hidden sm:flex items-center gap-1" style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}><Flame size={16} /> {student.streak.current}d</span>
                  )}
                  <div className="text-right shrink-0 px-2">
                    <p className="font-black text-[16px]" style={{ color: 'var(--accent-blue)' }}>{student.totalScore.toLocaleString()} XP</p>
                  </div>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all bg-[var(--bg-input)]">
                    <ChevronRight size={16} />
                  </div>
                </div>
              </Card>
            ))}
            {filteredStudents.length === 0 && searchQuery && (
              <div className="text-center py-16 text-[16px] font-medium bg-[var(--bg-card)] rounded-[2.5rem] border border-[var(--border-subtle)]" style={{ color: 'var(--text-muted)' }}>
                No students match &ldquo;{searchQuery}&rdquo;
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
