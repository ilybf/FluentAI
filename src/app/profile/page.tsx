"use client";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

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

const typeIcons: Record<string, string> = {
  writing: '✍️', reading: '📖', chat: '💬', vocabulary: '📚', streak: '🔥', level_up: '🎉',
};

export default function ProfilePage() {
  const { data: session, update: updateSession } = useSession();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState<'success' | 'error'>('success');

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
    setMsg('');
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
      setMsg('Profile updated successfully!');
      setMsgType('success');

      // Refresh session to reflect changes
      await updateSession({
        name: displayName,
        nativeLanguage,
        avatarUrl,
      });
    } catch (err: any) {
      setMsg(err.message);
      setMsgType('error');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMsg('Passwords do not match');
      setMsgType('error');
      return;
    }
    if (newPassword.length < 6) {
      setMsg('New password must be at least 6 characters');
      setMsgType('error');
      return;
    }
    setChangingPassword(true);
    setMsg('');
    try {
      const res = await fetch('/api/user/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to change password');
      setMsg('Password changed successfully!');
      setMsgType('success');
      setShowPasswordForm(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setMsg(err.message);
      setMsgType('error');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMsg('Please select an image file');
      setMsgType('error');
      return;
    }

    // Validate file size (2MB max before resize)
    if (file.size > 2 * 1024 * 1024) {
      setMsg('Image must be under 2MB');
      setMsgType('error');
      return;
    }

    setUploadingAvatar(true);
    setMsg('');

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
      setMsg('Profile picture updated!');
      setMsgType('success');

      await updateSession({ avatarUrl: dataUrl });
    } catch (err: any) {
      setMsg(err.message || 'Failed to upload image');
      setMsgType('error');
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto min-h-[calc(100dvh-6rem)] flex flex-col p-4 sm:p-6 lg:p-8">
        <div className="skeleton h-10 w-40 mb-2" /><div className="skeleton h-4 w-64 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6"><div className="skeleton h-24 w-24 rounded-full mx-auto mb-4" /><div className="skeleton h-5 w-32 mx-auto mb-2" /><div className="skeleton h-3 w-40 mx-auto" /></Card>
          <div className="md:col-span-2"><Card className="p-6"><div className="skeleton h-5 w-40 mb-6" /><div className="skeleton h-4 w-full mb-3" /><div className="skeleton h-4 w-full mb-3" /><div className="skeleton h-4 w-2/3" /></Card></div>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const selectedAvatar = avatarUrl || '👤';

  return (
    <div className="max-w-4xl mx-auto min-h-[calc(100dvh-6rem)] flex flex-col p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>My Profile</h1>
        <p style={{ color: 'var(--text-secondary)' }} className="text-base sm:text-lg mt-1">Manage your account and view your progress.</p>
      </div>

      {/* Status message */}
      {msg && (
        <div className="mb-6 p-3 rounded-xl text-sm" style={{
          background: msgType === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
          color: msgType === 'success' ? 'var(--accent-emerald-text)' : 'var(--accent-red)',
          border: `1px solid ${msgType === 'success' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
        }}>
          {msgType === 'success' ? '✅' : '⚠️'} {msg}
          <button className="ml-3 underline text-xs" onClick={() => setMsg('')}>Dismiss</button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - User Info */}
        <div className="md:col-span-1 space-y-6">
          <Card className="p-6 flex flex-col items-center text-center shadow-lg relative overflow-hidden group">
            <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl" style={{ background: 'rgba(59,130,246,0.1)' }}></div>
            <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full blur-2xl" style={{ background: 'rgba(139,92,246,0.1)' }}></div>

            {/* Avatar */}
            {editMode ? (
              <div className="relative z-10 mb-4">
                <div className="w-24 h-24 rounded-full flex items-center justify-center text-4xl mb-3 shadow-inner overflow-hidden" style={{ background: 'linear-gradient(to bottom right, rgba(59,130,246,0.2), rgba(99,102,241,0.2))', border: '2px solid rgba(255,255,255,0.1)' }}>
                  {avatarUrl.startsWith('data:image/') ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span>{avatarUrl || '👤'}</span>
                  )}
                </div>

                {/* Upload button */}
                <label className="w-full mb-3 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium cursor-pointer transition-all duration-200 hover:scale-[1.02]" style={{ background: 'rgba(59,130,246,0.1)', color: 'var(--accent-blue)', border: '1px solid rgba(59,130,246,0.2)' }}>
                  {uploadingAvatar ? (
                    <span>Uploading...</span>
                  ) : (
                    <><span>📷</span> Upload Photo</>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingAvatar} />
                </label>

                <p className="text-xs text-center mb-2" style={{ color: 'var(--text-muted)' }}>Or pick an emoji:</p>
                <div className="grid grid-cols-5 gap-1.5">
                  {AVATAR_PRESETS.map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => setAvatarUrl(emoji)}
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-lg transition-all duration-150 hover:scale-110"
                      style={{
                        background: avatarUrl === emoji ? 'rgba(59,130,246,0.2)' : 'var(--bg-input)',
                        border: avatarUrl === emoji ? '2px solid var(--accent-blue)' : '1px solid var(--border-subtle)',
                      }}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="w-24 h-24 rounded-full flex items-center justify-center text-4xl mb-4 relative z-10 shadow-inner overflow-hidden" style={{ background: 'linear-gradient(to bottom right, rgba(59,130,246,0.2), rgba(99,102,241,0.2))', border: '2px solid rgba(255,255,255,0.1)' }}>
                {(profile.avatarUrl || '').startsWith('data:image/') ? (
                  <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span>{profile.avatarUrl || '👤'}</span>
                )}
              </div>
            )}

            <h2 className="text-xl font-bold relative z-10" style={{ color: 'var(--text-primary)' }}>{profile.displayName}</h2>
            <p className="text-sm mt-1 relative z-10" style={{ color: 'var(--text-secondary)' }}>{profile.email}</p>
            {profile.role !== 'student' && (
              <span className="mt-2 px-3 py-1 rounded-full text-xs font-medium capitalize relative z-10" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' }}>
                {profile.role}
              </span>
            )}

            <div className="mt-6 w-full pt-4 relative z-10" style={{ borderTop: '1px solid var(--border-subtle)' }}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Member Since</span>
                <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {new Date(profile.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </span>
              </div>
              {profile.streak && profile.streak.longest > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Best Streak</span>
                  <span className="text-sm font-semibold" style={{ color: '#f59e0b' }}>🔥 {profile.streak.longest} days</span>
                </div>
              )}
            </div>

            {!editMode && (
              <button
                onClick={() => setEditMode(true)}
                className="mt-4 w-full py-2 rounded-xl text-sm font-medium transition-all duration-200 relative z-10"
                style={{ background: 'var(--bg-input)', color: 'var(--accent-blue)', border: '1px solid var(--border-subtle)' }}
              >
                ✏️ Edit Profile
              </button>
            )}
          </Card>
        </div>

        {/* Right Column */}
        <div className="md:col-span-2 space-y-6">
          {/* Learning Profile / Edit Form */}
          <Card className="p-6 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-50" style={{ background: 'rgba(16,185,129,0.05)' }}></div>

            <h3 className="text-lg font-bold mb-6 relative z-10" style={{ color: 'var(--text-primary)' }}>
              {editMode ? 'Edit Profile' : 'Learning Profile'}
            </h3>

            {editMode ? (
              <div className="space-y-4 relative z-10">
                <Input label="Display Name" id="edit-name" name="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Native Language</label>
                  <select
                    className="flex h-11 w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200 appearance-none cursor-pointer theme-transition"
                    style={{ background: 'var(--bg-input)', border: '1px solid var(--border-input)', color: 'var(--text-primary)' }}
                    value={nativeLanguage}
                    onChange={(e) => setNativeLanguage(e.target.value)}
                  >
                    {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Bio</label>
                  <textarea
                    className="w-full p-3 rounded-xl resize-none focus:ring-2 focus:ring-blue-500/50 outline-none transition-all duration-200 text-sm theme-transition"
                    style={{ background: 'var(--bg-input)', border: '1px solid var(--border-input)', color: 'var(--text-primary)' }}
                    placeholder="Tell us about yourself..."
                    maxLength={300}
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                  />
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{bio.length}/300</p>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button onClick={handleSave} isLoading={saving}>Save Changes</Button>
                  <Button variant="outline" onClick={() => { setEditMode(false); setDisplayName(profile.displayName); setNativeLanguage(profile.nativeLanguage); setBio(profile.bio || ''); setAvatarUrl(profile.avatarUrl || ''); }}>Cancel</Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
                <div className="p-4 rounded-xl transition-all duration-300 hover:scale-[1.02]" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-subtle)' }}>
                  <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Native Language</p>
                  <p className="text-lg font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                    <span>🗣️</span> {profile.nativeLanguage}
                  </p>
                </div>

                <div className="p-4 rounded-xl transition-all duration-300 hover:scale-[1.02]" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-subtle)' }}>
                  <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>English Level</p>
                  <p className="text-lg font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                    <span>📈</span> {profile.level}
                  </p>
                </div>

                <div className="p-4 rounded-xl transition-all duration-300 hover:scale-[1.02] sm:col-span-2" style={{ background: 'linear-gradient(to right, rgba(59,130,246,0.05), rgba(99,102,241,0.05))', border: '1px solid rgba(59,130,246,0.1)' }}>
                  <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Total XP Score</p>
                  <div className="flex items-end gap-2">
                    <p className="text-3xl font-bold" style={{ color: 'var(--accent-blue)' }}>
                      {profile.totalScore?.toLocaleString() || 0}
                    </p>
                    <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-muted)' }}>XP</p>
                  </div>
                </div>

                {profile.bio && (
                  <div className="p-4 rounded-xl sm:col-span-2" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-subtle)' }}>
                    <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Bio</p>
                    <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{profile.bio}</p>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Password Change */}
          <Card className="p-6 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Security</h3>
              {!showPasswordForm && (
                <button onClick={() => setShowPasswordForm(true)} className="text-sm font-medium transition-colors" style={{ color: 'var(--accent-blue)' }}>
                  Change Password
                </button>
              )}
            </div>
            {showPasswordForm ? (
              <form onSubmit={handleChangePassword} className="space-y-4">
                <Input label="Current Password" type="password" id="current-password" name="currentPassword" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
                <Input label="New Password" type="password" id="new-password" name="newPassword" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} />
                <Input label="Confirm New Password" type="password" id="confirm-password" name="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6} />
                <div className="flex gap-3">
                  <Button type="submit" isLoading={changingPassword}>Update Password</Button>
                  <Button variant="outline" onClick={() => { setShowPasswordForm(false); setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); }}>Cancel</Button>
                </div>
              </form>
            ) : (
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Your password was last set when you created your account.</p>
            )}
          </Card>

          {/* Recent Activity */}
          {activity.length > 0 && (
            <Card className="p-6 shadow-lg">
              <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Recent Activity</h3>
              <div className="space-y-2 max-h-[250px] overflow-y-auto">
                {activity.slice(0, 10).map(event => (
                  <div key={event.id} className="flex items-center gap-3 p-2.5 rounded-xl" style={{ background: 'var(--bg-input)' }}>
                    <span className="text-base">{typeIcons[event.type] || '⭐'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate" style={{ color: 'var(--text-primary)' }}>{event.details}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {new Date(event.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    {event.points > 0 && (
                      <span className="text-xs font-bold px-2 py-1 rounded-lg" style={{ background: 'rgba(59,130,246,0.1)', color: 'var(--accent-blue)' }}>+{event.points} XP</span>
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
