"use client";
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

type UserData = {
  id: string; email: string; displayName: string; role: string;
  level: string; registrationLevel: string; totalScore: number;
  nativeLanguage: string; avatarUrl: string; bio: string;
  streak: { current: number; longest: number };
  classroomId: string | null; createdAt: string;
};

type ClassroomData = {
  id: string; name: string; description: string; joinCode: string;
  teacherId: string | null; teacherName: string; teacherEmail: string;
  studentCount: number; maxStudents: number; studentIds: string[];
  createdAt: string;
};

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;
const ROLES = ['student', 'teacher', 'admin'] as const;

type Tab = 'overview' | 'users' | 'classrooms';

function AdminSkeleton() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div><div className="skeleton h-8 w-52 mb-2" /><div className="skeleton h-4 w-64" /></div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <Card key={i} className="p-6"><div className="skeleton h-4 w-16 mb-3" /><div className="skeleton h-8 w-12" /></Card>)}
      </div>
      <Card className="p-6">{[...Array(5)].map((_, i) => <div key={i} className="skeleton h-14 w-full mb-3 rounded-xl" />)}</Card>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [tab, setTab] = useState<Tab>('overview');
  const [users, setUsers] = useState<UserData[]>([]);
  const [classrooms, setClassrooms] = useState<ClassroomData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState<'success' | 'error'>('success');

  // Edit user modal state
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [editForm, setEditForm] = useState<Record<string, any>>({});

  // Create classroom state
  const [showCreateClass, setShowCreateClass] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newClassDesc, setNewClassDesc] = useState('');
  const [newClassTeacher, setNewClassTeacher] = useState('');

  // Create user state
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [newUserForm, setNewUserForm] = useState({ name: '', email: '', password: '', role: 'student', level: 'B1' });

  // Reassign teacher state
  const [reassignClassId, setReassignClassId] = useState<string | null>(null);
  const [reassignTeacherId, setReassignTeacherId] = useState('');

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [usersRes, classesRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/classrooms'),
      ]);
      if (usersRes.ok) setUsers(await usersRes.json());
      if (classesRes.ok) setClassrooms(await classesRes.json());
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const showMsg = (text: string, type: 'success' | 'error') => {
    setMsg(text); setMsgType(type);
    setTimeout(() => setMsg(''), 4000);
  };

  // ─── User Actions ──────────────────────────────────────────
  const saveUser = async () => {
    if (!editingUser) return;
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: editingUser.id, ...editForm }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      showMsg('User updated!', 'success');
      setEditingUser(null);
      fetchAll();
    } catch (err: any) { showMsg(err.message, 'error'); }
  };

  const deleteUser = async (userId: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/users?id=${userId}`, { method: 'DELETE' });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      showMsg('User deleted', 'success');
      setUsers(prev => prev.filter(u => u.id !== userId));
    } catch (err: any) { showMsg(err.message, 'error'); }
  };

  const resetUserLevel = async (u: UserData) => {
    if (!confirm(`Reset "${u.displayName}" level from ${u.level} to ${u.registrationLevel}?`)) return;
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: u.id, level: u.registrationLevel, totalScore: 0 }),
      });
      if (!res.ok) throw new Error('Failed');
      showMsg(`Level reset to ${u.registrationLevel}`, 'success');
      fetchAll();
    } catch (err: any) { showMsg(err.message, 'error'); }
  };

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: newUserForm.name,
          email: newUserForm.email,
          password: newUserForm.password,
          role: newUserForm.role,
          level: newUserForm.level,
        }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      showMsg('User created successfully!', 'success');
      setNewUserForm({ name: '', email: '', password: '', role: 'student', level: 'B1' });
      setShowCreateUser(false);
      fetchAll();
    } catch (err: any) { showMsg(err.message, 'error'); }
  };

  // ─── Classroom Actions ─────────────────────────────────────
  const createClassroom = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/classrooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newClassName, description: newClassDesc, teacherId: newClassTeacher || undefined }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      showMsg('Classroom created!', 'success');
      setNewClassName(''); setNewClassDesc(''); setNewClassTeacher('');
      setShowCreateClass(false); fetchAll();
    } catch (err: any) { showMsg(err.message, 'error'); }
  };

  const deleteClassroom = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? Students will be unlinked.`)) return;
    try {
      const res = await fetch(`/api/admin/classrooms?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
      showMsg('Classroom deleted', 'success');
      setClassrooms(prev => prev.filter(c => c.id !== id));
    } catch (err: any) { showMsg(err.message, 'error'); }
  };

  const reassignTeacher = async () => {
    if (!reassignClassId) return;
    try {
      const res = await fetch('/api/admin/classrooms', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ classroomId: reassignClassId, teacherId: reassignTeacherId }),
      });
      if (!res.ok) throw new Error('Failed');
      showMsg('Teacher reassigned!', 'success');
      setReassignClassId(null); fetchAll();
    } catch (err: any) { showMsg(err.message, 'error'); }
  };

  if (loading) return <AdminSkeleton />;

  const teachers = users.filter(u => u.role === 'teacher');
  const students = users.filter(u => u.role === 'student');
  const admins = users.filter(u => u.role === 'admin');
  const filteredUsers = users.filter(u =>
    u.displayName.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );
  const levelMismatch = students.filter(u => {
    const levelOrder = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    const regIdx = levelOrder.indexOf(u.registrationLevel);
    const curIdx = levelOrder.indexOf(u.level);
    return curIdx < regIdx;
  });

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'overview', label: 'Overview', icon: '📊' },
    { key: 'users', label: `Users (${users.length})`, icon: '👥' },
    { key: 'classrooms', label: `Classrooms (${classrooms.length})`, icon: '🏫' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>⚙️ Admin Dashboard</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Full platform management — users, classrooms, and monitoring.</p>
      </div>

      {/* Status message */}
      {msg && (
        <div className="p-3 rounded-xl text-sm" style={{
          background: msgType === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
          color: msgType === 'success' ? 'var(--accent-emerald-text)' : 'var(--accent-red)',
          border: `1px solid ${msgType === 'success' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
        }}>
          {msgType === 'success' ? '✅' : '⚠️'} {msg}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className="px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200"
            style={tab === t.key ? {
              background: 'linear-gradient(to right, rgba(59,130,246,0.2), rgba(99,102,241,0.15))',
              color: 'var(--accent-blue)', border: '1px solid rgba(59,130,246,0.3)',
            } : { background: 'var(--bg-input)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ─── OVERVIEW TAB ───────────────────────────────────── */}
      {tab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { icon: '👥', label: 'Total Users', value: users.length },
              { icon: '🎓', label: 'Students', value: students.length },
              { icon: '👩‍🏫', label: 'Teachers', value: teachers.length },
              { icon: '🏫', label: 'Classrooms', value: classrooms.length },
            ].map(s => (
              <Card key={s.label} className="p-5">
                <span className="text-2xl">{s.icon}</span>
                <h3 className="font-medium text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>{s.label}</h3>
                <p className="text-2xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>{s.value}</p>
              </Card>
            ))}
          </div>

          {/* Level mismatches */}
          {levelMismatch.length > 0 && (
            <Card className="p-5" style={{ border: '1px solid rgba(245,158,11,0.3)' }}>
              <h3 className="font-bold text-sm mb-3 flex items-center gap-2" style={{ color: '#f59e0b' }}>⚠️ Level Mismatches ({levelMismatch.length})</h3>
              <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>These students have a level below their registration level.</p>
              <div className="space-y-2">
                {levelMismatch.map(u => (
                  <div key={u.id} className="flex items-center justify-between p-2.5 rounded-xl" style={{ background: 'var(--bg-input)' }}>
                    <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                      {u.displayName} — Current: <strong>{u.level}</strong>, Registered: <strong>{u.registrationLevel}</strong>
                    </span>
                    <Button size="sm" onClick={() => resetUserLevel(u)}>Reset</Button>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Quick actions */}
          <Card className="p-5">
            <h3 className="font-bold text-sm mb-3" style={{ color: 'var(--text-primary)' }}>Quick Actions</h3>
            <div className="flex flex-wrap gap-3">
              <Button size="sm" onClick={() => setTab('users')}>Manage Users</Button>
              <Button size="sm" onClick={() => setTab('classrooms')}>Manage Classrooms</Button>
              <Button size="sm" variant="outline" onClick={() => { setTab('users'); setSearch('teacher'); }}>View Teachers</Button>
            </div>
          </Card>
        </div>
      )}

      {/* ─── USERS TAB ──────────────────────────────────────── */}
      {tab === 'users' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-between">
            <div className="w-full sm:w-72">
              <Input id="admin-search" name="search" placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Button size="sm" onClick={() => setShowCreateUser(!showCreateUser)}>
              {showCreateUser ? 'Cancel' : '+ Create User'}
            </Button>
          </div>

          {/* Create user form */}
          {showCreateUser && (
            <Card className="p-5">
              <form onSubmit={createUser} className="space-y-4">
                <h3 className="font-bold text-sm mb-2" style={{ color: 'var(--text-primary)' }}>Create New Account</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input label="Name" id="new-user-name" name="newUserName" placeholder="Full name" 
                    value={newUserForm.name} onChange={e => setNewUserForm(p => ({...p, name: e.target.value}))} required />
                  <Input label="Email" id="new-user-email" name="newUserEmail" type="email" placeholder="email@example.com" 
                    value={newUserForm.email} onChange={e => setNewUserForm(p => ({...p, email: e.target.value}))} required />
                  <Input label="Password" id="new-user-pass" name="newUserPass" type="password" placeholder="Min 6 characters" 
                    value={newUserForm.password} onChange={e => setNewUserForm(p => ({...p, password: e.target.value}))} required />
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Role</label>
                      <select value={newUserForm.role} onChange={e => setNewUserForm(p => ({...p, role: e.target.value}))}
                        className="w-full px-3 py-2.5 rounded-xl text-sm" style={{ background: 'var(--bg-input)', color: 'var(--text-primary)', border: '1px solid var(--border-input)' }}>
                        {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Level</label>
                      <select value={newUserForm.level} onChange={e => setNewUserForm(p => ({...p, level: e.target.value}))}
                        className="w-full px-3 py-2.5 rounded-xl text-sm" style={{ background: 'var(--bg-input)', color: 'var(--text-primary)', border: '1px solid var(--border-input)' }}>
                        {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
                <Button type="submit" size="sm" disabled={!newUserForm.name || !newUserForm.email || newUserForm.password.length < 6}>
                  Create Account
                </Button>
              </form>
            </Card>
          )}

          {/* Edit user modal */}
          {editingUser && (
            <Card className="p-5 space-y-4" style={{ border: '1px solid rgba(59,130,246,0.3)' }}>
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Editing: {editingUser.displayName}</h3>
                <button onClick={() => setEditingUser(null)} className="text-sm" style={{ color: 'var(--text-muted)' }}>✕ Close</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input label="Display Name" id="edit-name" name="editName" value={editForm.displayName ?? editingUser.displayName}
                  onChange={e => setEditForm(p => ({ ...p, displayName: e.target.value }))} />
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Role</label>
                  <select value={editForm.role ?? editingUser.role}
                    onChange={e => setEditForm(p => ({ ...p, role: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl text-sm"
                    style={{ background: 'var(--bg-input)', color: 'var(--text-primary)', border: '1px solid var(--border-input)' }}>
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Level</label>
                  <select value={editForm.level ?? editingUser.level}
                    onChange={e => setEditForm(p => ({ ...p, level: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl text-sm"
                    style={{ background: 'var(--bg-input)', color: 'var(--text-primary)', border: '1px solid var(--border-input)' }}>
                    {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <Input label="Total XP" id="edit-xp" name="editXP" type="number"
                  value={editForm.totalScore ?? editingUser.totalScore}
                  onChange={e => setEditForm(p => ({ ...p, totalScore: parseInt(e.target.value) || 0 }))} />
              </div>
              <div className="flex gap-3">
                <Button size="sm" onClick={saveUser}>Save Changes</Button>
                <Button size="sm" variant="outline" onClick={() => setEditingUser(null)}>Cancel</Button>
              </div>
            </Card>
          )}

          {/* User list */}
          <div className="space-y-2">
            {filteredUsers.map(u => (
              <Card key={u.id} className="p-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl shrink-0 overflow-hidden"
                    style={{ background: 'linear-gradient(to bottom right, rgba(59,130,246,0.15), rgba(99,102,241,0.1))' }}>
                    {(u.avatarUrl || '').startsWith('data:image/') ? (
                      <img src={u.avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-lg">{u.avatarUrl || '👤'}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{u.displayName}</p>
                    <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{u.email}</p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-lg capitalize shrink-0" style={{
                    background: u.role === 'admin' ? 'rgba(236,72,153,0.15)' : u.role === 'teacher' ? 'rgba(245,158,11,0.15)' : 'rgba(59,130,246,0.15)',
                    color: u.role === 'admin' ? '#ec4899' : u.role === 'teacher' ? '#f59e0b' : 'var(--accent-blue)',
                  }}>{u.role}</span>
                  <span className="text-xs px-2 py-1 rounded-lg shrink-0" style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--accent-emerald-text)' }}>
                    {u.level}
                  </span>
                  <span className="text-xs font-bold shrink-0" style={{ color: 'var(--accent-blue)' }}>{u.totalScore} XP</span>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => { setEditingUser(u); setEditForm({}); }}
                      className="p-1.5 rounded-lg transition-colors hover:bg-blue-500/10" style={{ color: 'var(--accent-blue)' }} title="Edit">
                      ✏️
                    </button>
                    <button onClick={() => deleteUser(u.id, u.displayName)}
                      className="p-1.5 rounded-lg transition-colors hover:bg-red-500/10" style={{ color: 'var(--accent-red)' }} title="Delete">
                      🗑️
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ─── CLASSROOMS TAB ─────────────────────────────────── */}
      {tab === 'classrooms' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>All Classrooms</h2>
            <Button size="sm" onClick={() => setShowCreateClass(!showCreateClass)}>
              {showCreateClass ? 'Cancel' : '+ Create Classroom'}
            </Button>
          </div>

          {/* Create classroom form */}
          {showCreateClass && (
            <Card className="p-5">
              <form onSubmit={createClassroom} className="space-y-3">
                <Input label="Name" id="new-class-name" name="newClassName" placeholder="e.g. English B1 — Spring 2026"
                  value={newClassName} onChange={e => setNewClassName(e.target.value)} required />
                <Input label="Description" id="new-class-desc" name="newClassDesc" placeholder="Optional"
                  value={newClassDesc} onChange={e => setNewClassDesc(e.target.value)} />
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Assign Teacher</label>
                  <select value={newClassTeacher} onChange={e => setNewClassTeacher(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl text-sm"
                    style={{ background: 'var(--bg-input)', color: 'var(--text-primary)', border: '1px solid var(--border-input)' }}>
                    <option value="">Select a teacher...</option>
                    {teachers.map(t => <option key={t.id} value={t.id}>{t.displayName} ({t.email})</option>)}
                  </select>
                </div>
                <Button type="submit" size="sm" disabled={!newClassName.trim()}>Create</Button>
              </form>
            </Card>
          )}

          {/* Reassign teacher modal */}
          {reassignClassId && (
            <Card className="p-5" style={{ border: '1px solid rgba(59,130,246,0.3)' }}>
              <h3 className="font-bold text-sm mb-3" style={{ color: 'var(--text-primary)' }}>
                Reassign Teacher — {classrooms.find(c => c.id === reassignClassId)?.name}
              </h3>
              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>New Teacher</label>
                  <select value={reassignTeacherId} onChange={e => setReassignTeacherId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl text-sm"
                    style={{ background: 'var(--bg-input)', color: 'var(--text-primary)', border: '1px solid var(--border-input)' }}>
                    <option value="">Select a teacher...</option>
                    {teachers.map(t => <option key={t.id} value={t.id}>{t.displayName} ({t.email})</option>)}
                  </select>
                </div>
                <Button size="sm" onClick={reassignTeacher} disabled={!reassignTeacherId}>Assign</Button>
                <Button size="sm" variant="outline" onClick={() => setReassignClassId(null)}>Cancel</Button>
              </div>
            </Card>
          )}

          {/* Classroom list */}
          {classrooms.length === 0 ? (
            <Card className="p-8 text-center">
              <span className="text-5xl block mb-3">🏫</span>
              <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>No Classrooms</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Create your first classroom above.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {classrooms.map(c => (
                <Card key={c.id} className="p-5 relative overflow-hidden">
                  <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full blur-3xl opacity-20" style={{ background: 'rgba(59,130,246,0.15)' }} />
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>{c.name}</h3>
                      <code className="text-xs px-2 py-1 rounded-lg font-mono font-bold tracking-widest" style={{
                        background: 'var(--bg-input)', color: 'var(--accent-blue)', border: '1px solid var(--border-subtle)',
                      }}>{c.joinCode}</code>
                    </div>
                    {c.description && <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>{c.description}</p>}
                    <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
                      👩‍🏫 <strong>{c.teacherName}</strong> <span className="text-xs" style={{ color: 'var(--text-muted)' }}>({c.teacherEmail})</span>
                    </p>
                    <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                      👥 {c.studentCount}/{c.maxStudents} students
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      <button onClick={() => { setReassignClassId(c.id); setReassignTeacherId(c.teacherId || ''); }}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
                        style={{ background: 'rgba(59,130,246,0.1)', color: 'var(--accent-blue)', border: '1px solid rgba(59,130,246,0.2)' }}>
                        🔄 Reassign Teacher
                      </button>
                      <button onClick={() => deleteClassroom(c.id, c.name)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 hover:bg-red-500/20"
                        style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--accent-red)', border: '1px solid rgba(239,68,68,0.2)' }}>
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
