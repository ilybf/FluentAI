"use client";
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import toast from 'react-hot-toast';
import { Settings, BarChart2, Users, School, Sparkles, GraduationCap, UserCog, Search, AlertTriangle, RefreshCw, Trash2, X } from 'lucide-react';

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
    <div className="max-w-6xl mx-auto space-y-8 page-animate">
      <div><div className="skeleton h-10 w-64 mb-3" /><div className="skeleton h-5 w-80" /></div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => <Card key={i} className="p-8 rounded-[2rem]"><div className="skeleton h-5 w-20 mb-3" /><div className="skeleton h-10 w-16" /></Card>)}
      </div>
      <Card className="p-8 rounded-[2.5rem]">{[...Array(5)].map((_, i) => <div key={i} className="skeleton h-16 w-full mb-4 rounded-xl" />)}</Card>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [tab, setTab] = useState<Tab>('overview');
  const [users, setUsers] = useState<UserData[]>([]);
  const [classrooms, setClassrooms] = useState<ClassroomData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

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
    if (type === 'success') toast.success(text);
    else toast.error(text);
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

  const executeDeleteUser = async (userId: string) => {
    try {
      const res = await fetch(`/api/admin/users?id=${userId}`, { method: 'DELETE' });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      showMsg('User deleted', 'success');
      setUsers(prev => prev.filter(u => u.id !== userId));
    } catch (err: any) { showMsg(err.message, 'error'); }
  };

  const deleteUser = (userId: string, name: string) => {
    toast((t) => (
      <div className="flex flex-col gap-3 p-1">
        <div className="flex items-center gap-2 font-bold"><AlertTriangle className="text-amber-500" size={20} /> Delete "{name}"?</div>
        <p className="text-sm">This cannot be undone.</p>
        <div className="flex justify-end gap-2 mt-2">
          <Button variant="outline" size="sm" onClick={() => toast.dismiss(t.id)}>Cancel</Button>
          <Button size="sm" className="bg-red-500 text-white hover:bg-red-600" onClick={() => { toast.dismiss(t.id); executeDeleteUser(userId); }}>Delete</Button>
        </div>
      </div>
    ), { duration: 5000 });
  };

  const executeResetLevel = async (u: UserData) => {
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

  const resetUserLevel = (u: UserData) => {
    toast((t) => (
      <div className="flex flex-col gap-3 p-1">
        <div className="flex items-center gap-2 font-bold"><AlertTriangle className="text-amber-500" size={20} /> Reset level?</div>
        <p className="text-sm">Reset "{u.displayName}" from {u.level} to {u.registrationLevel}?</p>
        <div className="flex justify-end gap-2 mt-2">
          <Button variant="outline" size="sm" onClick={() => toast.dismiss(t.id)}>Cancel</Button>
          <Button size="sm" className="bg-amber-500 text-white hover:bg-amber-600" onClick={() => { toast.dismiss(t.id); executeResetLevel(u); }}>Reset</Button>
        </div>
      </div>
    ), { duration: 5000 });
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

  const executeDeleteClassroom = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/classrooms?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
      showMsg('Classroom deleted', 'success');
      setClassrooms(prev => prev.filter(c => c.id !== id));
    } catch (err: any) { showMsg(err.message, 'error'); }
  };

  const deleteClassroom = (id: string, name: string) => {
    toast((t) => (
      <div className="flex flex-col gap-3 p-1">
        <div className="flex items-center gap-2 font-bold"><AlertTriangle className="text-amber-500" size={20} /> Delete classroom?</div>
        <p className="text-sm">Delete "{name}"? Students will be unlinked.</p>
        <div className="flex justify-end gap-2 mt-2">
          <Button variant="outline" size="sm" onClick={() => toast.dismiss(t.id)}>Cancel</Button>
          <Button size="sm" className="bg-red-500 text-white hover:bg-red-600" onClick={() => { toast.dismiss(t.id); executeDeleteClassroom(id); }}>Delete</Button>
        </div>
      </div>
    ), { duration: 5000 });
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

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'overview', label: 'Overview', icon: <BarChart2 size={18} /> },
    { key: 'users', label: `Users (${users.length})`, icon: <Users size={18} /> },
    { key: 'classrooms', label: `Classrooms (${classrooms.length})`, icon: <School size={18} /> },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 page-animate">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center justify-center w-14 h-14 rounded-2xl bg-[var(--accent-violet)]/10 text-[var(--accent-violet)] shadow-inner">
            <Settings size={28} />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>Admin Dashboard</h1>
            <p className="mt-1.5 text-[16px] font-medium" style={{ color: 'var(--text-secondary)' }}>Full platform management — users, classrooms, and monitoring.</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-5 py-3 rounded-2xl text-[15px] font-bold whitespace-nowrap transition-all duration-200 ${tab === t.key ? 'shadow-md' : 'hover:bg-[var(--bg-card)]'}`}
            style={tab === t.key ? {
              background: 'linear-gradient(135deg, var(--accent-violet), var(--accent-indigo))',
              color: '#fff', border: '1px solid transparent',
            } : { background: 'var(--bg-input)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}
          >
            {t.icon} <span className="ml-1">{t.label}</span>
          </button>
        ))}
      </div>

      {/* ─── OVERVIEW TAB ───────────────────────────────────── */}
      {tab === 'overview' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {[
              { icon: <Users size={28} />, label: 'Total Users', value: users.length, color: 'var(--accent-blue)' },
              { icon: <GraduationCap size={28} />, label: 'Students', value: students.length, color: 'var(--accent-emerald)' },
              { icon: <UserCog size={28} />, label: 'Teachers', value: teachers.length, color: '#f59e0b' },
              { icon: <School size={28} />, label: 'Classrooms', value: classrooms.length, color: 'var(--accent-indigo)' },
            ].map(s => (
              <Card key={s.label} className="p-6 sm:p-8 rounded-[2rem] border-[var(--border-subtle)] bg-[var(--bg-card)] hover:-translate-y-1 transition-all hover:shadow-lg">
                <span className="text-3xl mb-4 inline-flex items-center justify-center w-14 h-14 rounded-[1rem] shadow-inner" style={{ background: `${s.color}20`, color: s.color }}>{s.icon}</span>
                <h3 className="font-bold text-[13px] uppercase tracking-wider mt-2 mb-1" style={{ color: 'var(--text-secondary)' }}>{s.label}</h3>
                <p className="text-3xl sm:text-4xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>{s.value}</p>
              </Card>
            ))}
          </div>

          {/* Level mismatches */}
          {levelMismatch.length > 0 && (
            <Card className="p-6 sm:p-8 rounded-[2rem]" style={{ border: '1px solid rgba(245,158,11,0.3)', background: 'rgba(245,158,11,0.05)' }}>
              <h3 className="font-bold text-[16px] mb-4 flex items-center gap-2 uppercase tracking-wider" style={{ color: '#f59e0b' }}><AlertTriangle size={20} /> Level Mismatches ({levelMismatch.length})</h3>
              <p className="text-[14px] font-medium mb-4" style={{ color: 'var(--text-muted)' }}>These students have a level below their registration level.</p>
              <div className="space-y-3">
                {levelMismatch.map(u => (
                  <div key={u.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl shadow-sm" style={{ background: 'var(--bg-card)', border: '1px solid rgba(245,158,11,0.2)' }}>
                    <span className="text-[15px] font-bold" style={{ color: 'var(--text-primary)' }}>
                      {u.displayName} <span className="opacity-50 mx-2">|</span> Current: <span style={{ color: 'var(--accent-red)' }}>{u.level}</span> <span className="opacity-50 mx-2">|</span> Registered: <span style={{ color: 'var(--accent-emerald)' }}>{u.registrationLevel}</span>
                    </span>
                    <Button size="sm" onClick={() => resetUserLevel(u)} className="rounded-xl px-6 font-bold shadow-sm sm:w-auto w-full">Reset Level</Button>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Quick actions */}
          <Card className="p-6 sm:p-8 rounded-[2rem] border-[var(--border-subtle)] bg-[var(--bg-card)]">
            <h3 className="font-bold text-xl mb-4 tracking-tight" style={{ color: 'var(--text-primary)' }}>Quick Actions</h3>
            <div className="flex flex-wrap gap-4">
              <Button onClick={() => setTab('users')} className="h-12 px-6 rounded-xl font-bold shadow-md">Manage Users</Button>
              <Button onClick={() => setTab('classrooms')} className="h-12 px-6 rounded-xl font-bold shadow-md">Manage Classrooms</Button>
              <Button variant="outline" onClick={() => { setTab('users'); setSearch('teacher'); }} className="h-12 px-6 rounded-xl font-bold bg-[var(--bg-input)] hover:bg-[var(--bg-primary)] border-transparent text-[var(--text-primary)]">View Teachers</Button>
            </div>
          </Card>
        </div>
      )}

      {/* ─── USERS TAB ──────────────────────────────────────── */}
      {tab === 'users' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="w-full sm:w-80 relative">
              <Input 
                id="admin-search" 
                name="search" 
                placeholder="Search users..." 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                className="h-12 rounded-2xl bg-[var(--bg-card)] border-[var(--border-subtle)] focus:border-[var(--accent-blue)] pl-12 text-[15px] font-medium shadow-sm" 
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 opacity-50"><Search size={18} /></span>
            </div>
            <Button onClick={() => setShowCreateUser(!showCreateUser)} className={`h-12 px-6 rounded-2xl font-bold transition-all sm:w-auto w-full ${showCreateUser ? 'bg-[var(--bg-input)] text-[var(--text-primary)] hover:bg-[var(--bg-card)] border border-[var(--border-subtle)]' : 'shadow-md'}`}>
              {showCreateUser ? 'Cancel' : '+ Create User'}
            </Button>
          </div>

          {/* Create user form */}
          {showCreateUser && (
            <Card className="p-6 sm:p-8 rounded-[2.5rem] border-[var(--border-subtle)] bg-[var(--bg-card)] shadow-md">
              <form onSubmit={createUser} className="space-y-6">
                <h3 className="font-bold text-xl mb-4 tracking-tight flex items-center gap-2" style={{ color: 'var(--text-primary)' }}><Sparkles size={20} className="text-[var(--accent-blue)]" /> Create New Account</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Name" id="new-user-name" name="newUserName" placeholder="Full name" 
                    value={newUserForm.name} onChange={e => setNewUserForm(p => ({...p, name: e.target.value}))} required className="h-14 rounded-2xl bg-[var(--bg-input)] border-transparent" />
                  <Input label="Email" id="new-user-email" name="newUserEmail" type="email" placeholder="email@example.com" 
                    value={newUserForm.email} onChange={e => setNewUserForm(p => ({...p, email: e.target.value}))} required className="h-14 rounded-2xl bg-[var(--bg-input)] border-transparent" />
                  <Input label="Password" id="new-user-pass" name="newUserPass" type="password" placeholder="Min 6 characters" 
                    value={newUserForm.password} onChange={e => setNewUserForm(p => ({...p, password: e.target.value}))} required className="h-14 rounded-2xl bg-[var(--bg-input)] border-transparent" />
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-[13px] font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>Role</label>
                      <div className="relative">
                        <select value={newUserForm.role} onChange={e => setNewUserForm(p => ({...p, role: e.target.value}))}
                          className="w-full h-14 px-4 rounded-2xl text-[15px] font-medium appearance-none" style={{ background: 'var(--bg-input)', color: 'var(--text-primary)', border: '1px solid transparent' }}>
                          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">▼</div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <label className="block text-[13px] font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>Level</label>
                      <div className="relative">
                        <select value={newUserForm.level} onChange={e => setNewUserForm(p => ({...p, level: e.target.value}))}
                          className="w-full h-14 px-4 rounded-2xl text-[15px] font-medium appearance-none" style={{ background: 'var(--bg-input)', color: 'var(--text-primary)', border: '1px solid transparent' }}>
                          {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">▼</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="pt-2">
                  <Button type="submit" className="h-14 px-8 rounded-2xl font-bold shadow-md" disabled={!newUserForm.name || !newUserForm.email || newUserForm.password.length < 6}>
                    Create Account
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* Edit user modal */}
          {editingUser && (
            <Card className="p-6 sm:p-8 rounded-[2.5rem] bg-[var(--bg-card)] shadow-lg" style={{ border: '2px solid var(--accent-blue)' }}>
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-xl tracking-tight" style={{ color: 'var(--text-primary)' }}>Editing: <span style={{ color: 'var(--accent-blue)' }}>{editingUser.displayName}</span></h3>
                <button onClick={() => setEditingUser(null)} className="text-[14px] font-bold px-4 py-2 rounded-xl bg-[var(--bg-input)] hover:bg-[var(--bg-primary)] transition-colors" style={{ color: 'var(--text-muted)' }}>✕ Close</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Display Name" id="edit-name" name="editName" value={editForm.displayName ?? editingUser.displayName}
                  onChange={e => setEditForm(p => ({ ...p, displayName: e.target.value }))} className="h-14 rounded-2xl bg-[var(--bg-input)] border-transparent" />
                <div>
                  <label className="block text-[13px] font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>Role</label>
                  <div className="relative">
                    <select value={editForm.role ?? editingUser.role}
                      onChange={e => setEditForm(p => ({ ...p, role: e.target.value }))}
                      className="w-full h-14 px-4 rounded-2xl text-[15px] font-medium appearance-none"
                      style={{ background: 'var(--bg-input)', color: 'var(--text-primary)', border: '1px solid transparent' }}>
                      {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">▼</div>
                  </div>
                </div>
                <div>
                  <label className="block text-[13px] font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>Level</label>
                  <div className="relative">
                    <select value={editForm.level ?? editingUser.level}
                      onChange={e => setEditForm(p => ({ ...p, level: e.target.value }))}
                      className="w-full h-14 px-4 rounded-2xl text-[15px] font-medium appearance-none"
                      style={{ background: 'var(--bg-input)', color: 'var(--text-primary)', border: '1px solid transparent' }}>
                      {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">▼</div>
                  </div>
                </div>
                <Input label="Total XP" id="edit-xp" name="editXP" type="number"
                  value={editForm.totalScore ?? editingUser.totalScore}
                  onChange={e => setEditForm(p => ({ ...p, totalScore: parseInt(e.target.value) || 0 }))} className="h-14 rounded-2xl bg-[var(--bg-input)] border-transparent" />
              </div>
              <div className="flex gap-4 pt-6 mt-6 border-t border-[var(--border-subtle)]">
                <Button onClick={saveUser} className="h-12 px-6 rounded-xl font-bold shadow-md">Save Changes</Button>
                <Button variant="outline" onClick={() => setEditingUser(null)} className="h-12 px-6 rounded-xl font-bold bg-[var(--bg-input)] hover:bg-[var(--bg-primary)] border-transparent text-[var(--text-primary)]">Cancel</Button>
              </div>
            </Card>
          )}

          {/* User list */}
          <div className="space-y-3">
            {filteredUsers.map(u => (
              <Card key={u.id} className="p-4 sm:p-5 rounded-[1.5rem] border-[var(--border-subtle)] bg-[var(--bg-card)] transition-all hover:-translate-y-0.5 hover:shadow-lg">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="w-12 h-12 rounded-[1rem] flex items-center justify-center text-2xl shrink-0 overflow-hidden shadow-inner"
                    style={{ background: 'var(--bg-input)' }}>
                    {(u.avatarUrl || '').startsWith('data:image/') ? (
                      <img src={u.avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span>{u.avatarUrl || '👤'}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 min-w-[150px]">
                    <p className="font-bold text-[16px] truncate" style={{ color: 'var(--text-primary)' }}>{u.displayName}</p>
                    <p className="text-[13px] font-medium truncate" style={{ color: 'var(--text-muted)' }}>{u.email}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[12px] font-bold px-3 py-1.5 rounded-xl uppercase tracking-wider shrink-0" style={{
                      background: u.role === 'admin' ? 'rgba(236,72,153,0.1)' : u.role === 'teacher' ? 'rgba(245,158,11,0.1)' : 'rgba(59,130,246,0.1)',
                      color: u.role === 'admin' ? '#ec4899' : u.role === 'teacher' ? '#f59e0b' : 'var(--accent-blue)',
                      border: `1px solid ${u.role === 'admin' ? 'rgba(236,72,153,0.2)' : u.role === 'teacher' ? 'rgba(245,158,11,0.2)' : 'rgba(59,130,246,0.2)'}`
                    }}>{u.role}</span>
                    <span className="text-[12px] font-bold px-3 py-1.5 rounded-xl shrink-0" style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--accent-emerald)', border: '1px solid rgba(16,185,129,0.2)' }}>
                      {u.level}
                    </span>
                    <span className="text-[14px] font-black shrink-0 px-2" style={{ color: 'var(--accent-blue)' }}>{u.totalScore.toLocaleString()} XP</span>
                  </div>
                  <div className="flex gap-2 shrink-0 ml-auto w-full sm:w-auto justify-end mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-0 border-[var(--border-subtle)]">
                    <button onClick={() => { setEditingUser(u); setEditForm({}); }}
                      className="px-4 py-2 rounded-xl text-[14px] font-bold transition-colors hover:bg-[var(--accent-blue)] hover:text-white" style={{ background: 'rgba(59,130,246,0.1)', color: 'var(--accent-blue)' }}>
                      Edit
                    </button>
                    <button onClick={() => deleteUser(u.id, u.displayName)}
                      className="px-4 py-2 rounded-xl text-[14px] font-bold transition-colors hover:bg-[var(--accent-red)] hover:text-white" style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--accent-red)' }}>
                      Delete
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
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>All Classrooms</h2>
            <Button onClick={() => setShowCreateClass(!showCreateClass)} className={`h-12 px-6 rounded-2xl font-bold transition-all ${showCreateClass ? 'bg-[var(--bg-input)] text-[var(--text-primary)] hover:bg-[var(--bg-card)] border border-[var(--border-subtle)]' : 'shadow-md'}`}>
              {showCreateClass ? 'Cancel' : '+ Create Classroom'}
            </Button>
          </div>

          {/* Create classroom form */}
          {showCreateClass && (
            <Card className="p-6 sm:p-8 rounded-[2.5rem] border-[var(--border-subtle)] bg-[var(--bg-card)] shadow-md">
              <form onSubmit={createClassroom} className="space-y-5 max-w-2xl">
                <h3 className="font-bold text-xl mb-4 tracking-tight flex items-center gap-2" style={{ color: 'var(--text-primary)' }}><School size={24} className="text-[var(--accent-indigo)]" /> Create New Classroom</h3>
                <Input label="Name" id="new-class-name" name="newClassName" placeholder="e.g. English B1 — Spring 2026"
                  value={newClassName} onChange={e => setNewClassName(e.target.value)} required className="h-14 rounded-2xl bg-[var(--bg-input)] border-transparent" />
                <Input label="Description (Optional)" id="new-class-desc" name="newClassDesc" placeholder="Brief description..."
                  value={newClassDesc} onChange={e => setNewClassDesc(e.target.value)} className="h-14 rounded-2xl bg-[var(--bg-input)] border-transparent" />
                <div>
                  <label className="block text-[13px] font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>Assign Teacher</label>
                  <div className="relative">
                    <select value={newClassTeacher} onChange={e => setNewClassTeacher(e.target.value)}
                      className="w-full h-14 px-4 rounded-2xl text-[15px] font-medium appearance-none"
                      style={{ background: 'var(--bg-input)', color: 'var(--text-primary)', border: '1px solid transparent' }}>
                      <option value="">Select a teacher...</option>
                      {teachers.map(t => <option key={t.id} value={t.id}>{t.displayName} ({t.email})</option>)}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">▼</div>
                  </div>
                </div>
                <div className="pt-2">
                  <Button type="submit" className="h-14 px-8 rounded-2xl font-bold shadow-md" disabled={!newClassName.trim()}>Create Classroom</Button>
                </div>
              </form>
            </Card>
          )}

          {/* Reassign teacher modal */}
          {reassignClassId && (
            <Card className="p-6 sm:p-8 rounded-[2.5rem] bg-[var(--bg-card)] shadow-lg" style={{ border: '2px solid var(--accent-indigo)' }}>
              <h3 className="font-bold text-xl mb-6 tracking-tight flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
                <RefreshCw size={24} className="text-[var(--accent-blue)]" /> Reassign Teacher
                <span className="text-[16px] font-medium px-3 py-1 rounded-xl bg-[var(--bg-input)]" style={{ color: 'var(--text-secondary)' }}>{classrooms.find(c => c.id === reassignClassId)?.name}</span>
              </h3>
              <div className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="flex-1 w-full">
                  <label className="block text-[13px] font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>New Teacher</label>
                  <div className="relative">
                    <select value={reassignTeacherId} onChange={e => setReassignTeacherId(e.target.value)}
                      className="w-full h-14 px-4 rounded-2xl text-[15px] font-medium appearance-none"
                      style={{ background: 'var(--bg-input)', color: 'var(--text-primary)', border: '1px solid transparent' }}>
                      <option value="">Select a teacher...</option>
                      {teachers.map(t => <option key={t.id} value={t.id}>{t.displayName} ({t.email})</option>)}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">▼</div>
                  </div>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                  <Button onClick={reassignTeacher} disabled={!reassignTeacherId} className="h-14 px-8 rounded-2xl font-bold shadow-md flex-1 sm:flex-none">Assign</Button>
                  <Button variant="outline" onClick={() => setReassignClassId(null)} className="h-14 px-6 rounded-2xl font-bold bg-[var(--bg-input)] hover:bg-[var(--bg-primary)] border-transparent text-[var(--text-primary)]">Cancel</Button>
                </div>
              </div>
            </Card>
          )}

          {/* Classroom list */}
          {classrooms.length === 0 ? (
            <Card className="p-10 sm:p-16 text-center rounded-[2.5rem] border-[var(--border-subtle)] shadow-sm bg-[var(--bg-card)]">
              <div className="space-y-6">
                <div className="w-24 h-24 rounded-full bg-[var(--bg-input)] flex items-center justify-center mx-auto mb-6 text-[var(--text-muted)]">
                  <School size={40} />
                </div>
                <h3 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>No Classrooms</h3>
                <p style={{ color: 'var(--text-secondary)' }} className="max-w-md mx-auto text-[16px] font-medium">Create your first classroom above to start managing students.</p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {classrooms.map(c => (
                <Card key={c.id} className="p-6 sm:p-8 relative overflow-hidden rounded-[2rem] border-[var(--border-subtle)] bg-[var(--bg-card)] transition-all hover:-translate-y-1 hover:shadow-xl group">
                  <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full blur-[60px] opacity-20 pointer-events-none transition-opacity group-hover:opacity-40" style={{ background: 'var(--accent-indigo)' }} />
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4 gap-4">
                      <h3 className="font-black text-xl tracking-tight leading-tight" style={{ color: 'var(--text-primary)' }}>{c.name}</h3>
                      <code className="text-[14px] px-3 py-1.5 rounded-xl font-mono font-bold tracking-widest shrink-0" style={{
                        background: 'var(--bg-input)', color: 'var(--accent-blue)', border: '1px solid var(--border-subtle)',
                      }}>{c.joinCode}</code>
                    </div>
                    {c.description && <p className="text-[15px] font-medium mb-6 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{c.description}</p>}
                    
                    <div className="space-y-3 pt-4 border-t border-[var(--border-subtle)] mb-6">
                      <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-input)]">
                        <span className="text-[13px] font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                          <UserCog size={16} /> Teacher
                        </span>
                        <div className="text-right">
                          <p className="text-[14px] font-bold" style={{ color: 'var(--text-primary)' }}>{c.teacherName}</p>
                          <p className="text-[12px] font-medium" style={{ color: 'var(--text-muted)' }}>{c.teacherEmail}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-input)]">
                        <span className="text-[13px] font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                          <Users size={16} /> Students
                        </span>
                        <span className="text-[14px] font-bold" style={{ color: 'var(--text-primary)' }}>{c.studentCount} <span className="opacity-50 font-medium">/ {c.maxStudents}</span></span>
                      </div>
                    </div>
                    
                    <div className="flex gap-3 flex-wrap pt-2">
                      <button onClick={() => { setReassignClassId(c.id); setReassignTeacherId(c.teacherId || ''); }}
                        className="px-4 py-2 rounded-xl text-[14px] font-bold transition-all duration-200 hover:bg-[var(--accent-blue)] hover:text-white flex-1 flex items-center justify-center gap-2"
                        style={{ background: 'rgba(59,130,246,0.1)', color: 'var(--accent-blue)' }}>
                        <RefreshCw size={16} /> Reassign
                      </button>
                      <button onClick={() => deleteClassroom(c.id, c.name)}
                        className="px-4 py-2 rounded-xl text-[14px] font-bold transition-all duration-200 hover:bg-[var(--accent-red)] hover:text-white flex-1 flex items-center justify-center gap-2"
                        style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--accent-red)' }}>
                        <Trash2 size={16} /> Delete
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
