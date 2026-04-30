"use client";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import toast from 'react-hot-toast';
import { Camera, Edit2, Flame, Languages, TrendingUp, Lock, Star, MessageCircle, PenTool, BookOpen, Library, Sparkles, User } from 'lucide-react';

const AVATAR_PRESETS = [
  '👤', '👩‍🎓', '👨‍🎓', '🧑‍💻', '👩‍🏫', '👨‍🏫', '🦊', '🐱', '🐶', '🦁',
  '🐼', '🐨', '🦄', '🐸', '🌟', '🚀', '🎯', '🎨', '🎸', '💎',
];

const LANGUAGES = ['Spanish', 'French', 'German', 'Arabic', 'Chinese', 'Japanese', 'Portuguese', 'Korean', 'Turkish', 'Russian', 'Hindi', 'Italian'];

interface ProfileData {
  _id: string;
  email: string;
  displayName: string;
  nativeLanguage: string;
  level: string;
  role: string;
  totalScore: number;
  avatarUrl: string;
  bio: string;
  streak: { current: number; longest: number; lastActiveDate: string };
  classroomId: string | null;
  createdAt: string;
}

interface ActivityEvent {
  id: string;
  type: string;
  points: number;
  details: string;
  createdAt: string;
}

const typeIcons: Record<string, React.ReactNode> = {
  writing: <PenTool size={20} />, reading: <BookOpen size={20} />, chat: <MessageCircle size={20} />, vocabulary: <Library size={20} />, streak: <Flame size={20} />, level_up: <Sparkles size={20} />,
};

export default function ProfilePage() {
  const { data: session, update: updateSession } = useSession();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Edit state
  const [editMode, setEditMode] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [nativeLanguage, setNativeLanguage] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Password change state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  // Activity state
  const [activity, setActivity] = useState<ActivityEvent[]>([]);

  useEffect(() => { fetchProfile(); fetchActivity(); }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/user');
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setDisplayName(data.displayName);
        setNativeLanguage(data.nativeLanguage);
        setBio(data.bio || '');
        setAvatarUrl(data.avatarUrl || '');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchActivity = async () => {
    try {
      const res = await fetch('/api/stats');
      if (res.ok) {
        const data = await res.json();
        setActivity(data.recentActivity || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName, nativeLanguage, bio, avatarUrl }),
      });
      if (!res.ok) throw new Error('Failed to update profile');
      const updated = await res.json();
      setProfile(updated);
      setEditMode(false);
      toast.success('Profile updated successfully!');

      // Refresh session to reflect changes
      await updateSession({
        name: displayName,
        nativeLanguage,
        avatarUrl,
      });
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    setChangingPassword(true);
    try {
      const res = await fetch('/api/user/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to change password');
      toast.success('Password changed successfully!');
      setShowPasswordForm(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (2MB max before resize)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be under 2MB');
      return;
    }

    setUploadingAvatar(true);

    try {
      // Resize image on canvas to reduce storage size
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const size = 150; // 150x150px
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d')!;

            // Crop to square from center
            const minDim = Math.min(img.width, img.height);
            const sx = (img.width - minDim) / 2;
            const sy = (img.height - minDim) / 2;
            ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);

            resolve(canvas.toDataURL('image/jpeg', 0.8));
          };
          img.onerror = reject;
          img.src = reader.result as string;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Upload to server
      const res = await fetch('/api/user/avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: dataUrl }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Upload failed');
      }

      setAvatarUrl(dataUrl);
      setProfile(prev => prev ? { ...prev, avatarUrl: dataUrl } : prev);
      toast.success('Profile picture updated!');

      await updateSession({ avatarUrl: dataUrl });
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload image');
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto min-h-[calc(100dvh-6rem)] flex flex-col p-4 sm:p-6 lg:p-8 page-animate">
        <div className="skeleton h-12 w-48 mb-3" /><div className="skeleton h-5 w-72 mb-10" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="p-8 rounded-[2.5rem]"><div className="skeleton h-32 w-32 rounded-[2rem] mx-auto mb-6" /><div className="skeleton h-6 w-40 mx-auto mb-3" /><div className="skeleton h-4 w-48 mx-auto" /></Card>
          <div className="md:col-span-2"><Card className="p-8 rounded-[2.5rem]"><div className="skeleton h-6 w-48 mb-8" /><div className="skeleton h-5 w-full mb-4" /><div className="skeleton h-5 w-full mb-4" /><div className="skeleton h-5 w-2/3" /></Card></div>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="max-w-6xl mx-auto min-h-[calc(100dvh-6rem)] flex flex-col p-4 sm:p-6 lg:p-8 page-animate">
      <div className="mb-8 sm:mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>My Profile</h1>
          <p style={{ color: 'var(--text-secondary)' }} className="text-[17px] font-medium mt-1">Manage your account and view your progress.</p>
        </div>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column - User Info */}
        <div className="md:col-span-1 space-y-8">
          <Card className="p-8 flex flex-col items-center text-center shadow-md relative overflow-hidden group rounded-[2.5rem] border-[var(--border-subtle)] bg-[var(--bg-card)]">
            <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full blur-[60px] pointer-events-none" style={{ background: 'var(--accent-blue)', opacity: 0.1 }}></div>
            <div className="absolute -bottom-20 -left-20 w-48 h-48 rounded-full blur-[60px] pointer-events-none" style={{ background: 'var(--accent-violet)', opacity: 0.1 }}></div>

            {/* Avatar */}
            {editMode ? (
              <div className="relative z-10 mb-6 w-full flex flex-col items-center">
                <div className="w-32 h-32 rounded-[2rem] flex items-center justify-center text-5xl mb-4 shadow-xl overflow-hidden transition-all" style={{ background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-indigo))', padding: avatarUrl.startsWith('data:image/') ? '0' : '4px' }}>
                  {avatarUrl.startsWith('data:image/') ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-[var(--bg-card)] rounded-[1.75rem] flex items-center justify-center">
                      <span className={avatarUrl && AVATAR_PRESETS.includes(avatarUrl) ? "" : "text-[var(--text-muted)]"}>{avatarUrl && AVATAR_PRESETS.includes(avatarUrl) ? avatarUrl : <User size={48} />}</span>
                    </div>
                  )}
                </div>

                {/* Upload button */}
                <label className="w-full max-w-[200px] mb-6 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-[14px] font-bold cursor-pointer transition-all duration-200 hover:shadow-md bg-[var(--bg-input)] hover:bg-[var(--bg-primary)] border border-[var(--border-subtle)]" style={{ color: 'var(--text-primary)' }}>
                  {uploadingAvatar ? (
                    <span>Uploading...</span>
                  ) : (
                    <><Camera size={16} /> Upload Photo</>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingAvatar} />
                </label>

                <p className="text-[13px] font-bold uppercase tracking-wider mb-3 w-full text-left pl-2" style={{ color: 'var(--text-muted)' }}>Or pick an emoji</p>
                <div className="grid grid-cols-5 gap-2 w-full">
                  {AVATAR_PRESETS.map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => setAvatarUrl(emoji)}
                      className="aspect-square rounded-xl flex items-center justify-center text-xl transition-all duration-200 hover:scale-110"
                      style={{
                        background: avatarUrl === emoji ? 'var(--accent-blue)' : 'var(--bg-input)',
                        borderColor: 'transparent',
                      }}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="w-32 h-32 rounded-[2rem] flex items-center justify-center text-5xl mb-6 relative z-10 shadow-xl overflow-hidden" style={{ background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-indigo))', padding: (profile.avatarUrl || '').startsWith('data:image/') ? '0' : '4px' }}>
                {(profile.avatarUrl || '').startsWith('data:image/') ? (
                  <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-[var(--bg-card)] rounded-[1.75rem] flex items-center justify-center text-[var(--text-muted)]">
                    {profile.avatarUrl && AVATAR_PRESETS.includes(profile.avatarUrl) ? <span className="text-5xl">{profile.avatarUrl}</span> : <User size={48} />}
                  </div>
                )}
              </div>
            )}

            <h2 className="text-2xl font-black relative z-10 tracking-tight" style={{ color: 'var(--text-primary)' }}>{profile.displayName}</h2>
            <p className="text-[15px] font-medium mt-1 relative z-10" style={{ color: 'var(--text-secondary)' }}>{profile.email}</p>
            {profile.role !== 'student' && (
              <span className="mt-3 px-4 py-1.5 rounded-xl text-[13px] font-bold uppercase tracking-wider relative z-10" style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)' }}>
                {profile.role}
              </span>
            )}

            <div className="mt-8 w-full pt-6 relative z-10 space-y-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
              <div className="flex justify-between items-center p-3 rounded-2xl bg-[var(--bg-input)]">
                <span className="text-[14px] font-semibold" style={{ color: 'var(--text-secondary)' }}>Member Since</span>
                <span className="text-[14px] font-bold" style={{ color: 'var(--text-primary)' }}>
                  {new Date(profile.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </span>
              </div>
              {profile.streak && profile.streak.longest > 0 && (
                <div className="flex justify-between items-center p-3 rounded-2xl bg-[var(--bg-input)]">
                  <span className="text-[14px] font-semibold" style={{ color: 'var(--text-secondary)' }}>Best Streak</span>
                  <span className="text-[14px] font-bold flex items-center gap-1" style={{ color: '#f59e0b' }}><Flame size={16} /> {profile.streak.longest} days</span>
                </div>
              )}
            </div>

            {!editMode && (
              <button
                onClick={() => setEditMode(true)}
                className="mt-6 w-full py-3.5 rounded-2xl text-[15px] font-bold transition-all duration-300 relative z-10 hover:shadow-md hover:-translate-y-0.5 flex items-center justify-center gap-2"
                style={{ background: 'var(--bg-input)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}
              >
                <Edit2 size={16} /> Edit Profile
              </button>
            )}
          </Card>
        </div>

        {/* Right Column */}
        <div className="md:col-span-2 space-y-8">
          {/* Learning Profile / Edit Form */}
          <Card className="p-6 sm:p-10 shadow-sm relative overflow-hidden rounded-[2.5rem] border-[var(--border-subtle)] bg-[var(--bg-card)]">
            <h3 className="text-2xl font-bold mb-8 relative z-10 tracking-tight" style={{ color: 'var(--text-primary)' }}>
              {editMode ? 'Edit Profile' : 'Learning Profile'}
            </h3>

            {editMode ? (
              <div className="space-y-6 relative z-10">
                <Input 
                  label="Display Name" 
                  id="edit-name" 
                  name="displayName" 
                  value={displayName} 
                  onChange={(e) => setDisplayName(e.target.value)} 
                  required 
                  className="h-14 rounded-2xl bg-[var(--bg-input)] border-transparent focus:bg-[var(--bg-primary)] focus:border-[var(--accent-blue)]"
                />
                <div>
                  <label className="block text-[14px] font-bold mb-2 uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Native Language</label>
                  <div className="relative">
                    <select
                      className="flex h-14 w-full rounded-2xl px-5 py-2.5 text-[15px] font-medium focus:outline-none focus:ring-2 focus:ring-[var(--accent-blue)]/50 transition-all duration-200 appearance-none cursor-pointer"
                      style={{ background: 'var(--bg-input)', border: '1px solid transparent', color: 'var(--text-primary)' }}
                      value={nativeLanguage}
                      onChange={(e) => setNativeLanguage(e.target.value)}
                    >
                      {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">▼</div>
                  </div>
                </div>
                <div>
                  <label className="block text-[14px] font-bold mb-2 uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Bio</label>
                  <textarea
                    className="w-full p-5 rounded-2xl resize-none focus:ring-2 focus:ring-[var(--accent-blue)]/50 outline-none transition-all duration-200 text-[15px] font-medium leading-relaxed"
                    style={{ background: 'var(--bg-input)', border: '1px solid transparent', color: 'var(--text-primary)' }}
                    placeholder="Tell us about yourself..."
                    maxLength={300}
                    rows={4}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                  />
                  <p className="text-[13px] font-bold mt-2 text-right" style={{ color: 'var(--text-muted)' }}>{bio.length}/300</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-[var(--border-subtle)]">
                  <Button onClick={handleSave} isLoading={saving} className="h-14 px-8 rounded-2xl font-bold flex-1">Save Changes</Button>
                  <Button variant="outline" onClick={() => { setEditMode(false); setDisplayName(profile.displayName); setNativeLanguage(profile.nativeLanguage); setBio(profile.bio || ''); setAvatarUrl(profile.avatarUrl || ''); }} className="h-14 px-8 rounded-2xl font-bold border-2">Cancel</Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10">
                <div className="p-6 rounded-[1.5rem] transition-all duration-300 hover:shadow-md bg-[var(--bg-input)] border border-[var(--border-subtle)]">
                  <p className="text-[13px] font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>Native Language</p>
                  <p className="text-xl font-black flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
                    <Languages size={24} className="text-[var(--accent-blue)]" /> {profile.nativeLanguage}
                  </p>
                </div>

                <div className="p-6 rounded-[1.5rem] transition-all duration-300 hover:shadow-md bg-[var(--bg-input)] border border-[var(--border-subtle)]">
                  <p className="text-[13px] font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>English Level</p>
                  <p className="text-xl font-black flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
                    <TrendingUp size={24} className="text-[var(--accent-emerald)]" /> {profile.level}
                  </p>
                </div>

                <div className="p-6 rounded-[1.5rem] transition-all duration-300 hover:shadow-md sm:col-span-2 relative overflow-hidden group border border-transparent" style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(99,102,241,0.1))' }}>
                  <div className="absolute right-0 top-0 w-32 h-32 bg-[var(--accent-blue)] opacity-10 blur-[40px] rounded-full group-hover:opacity-20 transition-opacity"></div>
                  <p className="text-[13px] font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>Total XP Score</p>
                  <div className="flex items-end gap-3 relative z-10">
                    <p className="text-5xl font-black tracking-tighter" style={{ color: 'var(--accent-blue)' }}>
                      {profile.totalScore?.toLocaleString() || 0}
                    </p>
                    <p className="text-lg font-bold mb-1.5" style={{ color: 'var(--text-secondary)' }}>XP</p>
                  </div>
                </div>

                {profile.bio && (
                  <div className="p-6 rounded-[1.5rem] sm:col-span-2 bg-[var(--bg-input)] border border-[var(--border-subtle)]">
                    <p className="text-[13px] font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--text-secondary)' }}>Bio</p>
                    <p className="text-[16px] font-medium leading-relaxed" style={{ color: 'var(--text-primary)' }}>{profile.bio}</p>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Password Change */}
          <Card className="p-6 sm:p-10 shadow-sm rounded-[2.5rem] border-[var(--border-subtle)] bg-[var(--bg-card)]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <h3 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Security</h3>
              {!showPasswordForm && (
                <button onClick={() => setShowPasswordForm(true)} className="text-[14px] font-bold px-4 py-2 rounded-xl bg-[var(--bg-input)] hover:bg-[var(--bg-primary)] transition-colors border border-[var(--border-subtle)]" style={{ color: 'var(--text-primary)' }}>
                  Change Password
                </button>
              )}
            </div>
            {showPasswordForm ? (
              <form onSubmit={handleChangePassword} className="space-y-5 animate-in fade-in slide-in-from-top-4">
                <Input label="Current Password" type="password" id="current-password" name="currentPassword" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required className="h-14 rounded-2xl bg-[var(--bg-input)] border-transparent" />
                <Input label="New Password" type="password" id="new-password" name="newPassword" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} className="h-14 rounded-2xl bg-[var(--bg-input)] border-transparent" />
                <Input label="Confirm New Password" type="password" id="confirm-password" name="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6} className="h-14 rounded-2xl bg-[var(--bg-input)] border-transparent" />
                <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-[var(--border-subtle)]">
                  <Button type="submit" isLoading={changingPassword} className="h-14 px-8 rounded-2xl font-bold flex-1">Update Password</Button>
                  <Button variant="outline" onClick={() => { setShowPasswordForm(false); setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); }} className="h-14 px-8 rounded-2xl font-bold border-2">Cancel</Button>
                </div>
              </form>
            ) : (
              <div className="flex items-center gap-4 p-5 rounded-[1.5rem] bg-[var(--bg-input)] border border-[var(--border-subtle)]">
                <Lock size={24} className="text-[var(--text-muted)]" />
                <p className="text-[15px] font-medium" style={{ color: 'var(--text-secondary)' }}>Your password was last set when you created your account.</p>
              </div>
            )}
          </Card>

          {/* Recent Activity */}
          {activity.length > 0 && (
            <Card className="p-6 sm:p-10 shadow-sm rounded-[2.5rem] border-[var(--border-subtle)] bg-[var(--bg-card)]">
              <h3 className="text-2xl font-bold mb-8 tracking-tight" style={{ color: 'var(--text-primary)' }}>Recent Activity</h3>
              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                {activity.slice(0, 10).map(event => (
                  <div key={event.id} className="flex items-center gap-4 p-4 rounded-[1.5rem] transition-all hover:bg-[var(--bg-primary)] border border-transparent hover:border-[var(--border-subtle)]" style={{ background: 'var(--bg-input)' }}>
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[var(--bg-card)] shadow-sm text-[var(--accent-indigo)] shrink-0">
                      {typeIcons[event.type] || <Star size={20} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[15px] font-bold truncate mb-0.5" style={{ color: 'var(--text-primary)' }}>{event.details}</p>
                      <p className="text-[13px] font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                        {new Date(event.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    {event.points > 0 && (
                      <span className="text-[14px] font-black px-3 py-1.5 rounded-xl shrink-0 shadow-sm" style={{ background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-indigo))', color: '#fff' }}>+{event.points} XP</span>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
