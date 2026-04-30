"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';
import { GraduationCap } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
    nativeLanguage: 'Spanish',
    level: 'A1'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      router.push('/login?registered=true');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const selectStyle: React.CSSProperties = {
    background: 'var(--bg-input)',
    borderColor: 'transparent',
    color: 'var(--text-primary)',
  };

  const ChevronIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
    </svg>
  );

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 py-12 relative page-animate">
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--accent-indigo)] opacity-[0.03] rounded-full blur-[100px]" />
      </div>

      <Card className="w-full max-w-[480px] p-8 sm:p-10 shadow-2xl rounded-[2.5rem] relative z-10 border-[var(--border-subtle)]">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-[1.5rem] mb-6 bg-[var(--accent-indigo)]/10 text-[var(--accent-indigo)] shadow-inner">
            <GraduationCap size={32} />
          </div>
          <h1 className="text-3xl font-extrabold mb-2 tracking-tight" style={{ color: 'var(--text-primary)' }}>Create Account</h1>
          <p className="font-medium" style={{ color: 'var(--text-secondary)' }}>Start mastering English today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Full Name"
            type="text"
            id="register-name"
            name="displayName"
            value={formData.displayName}
            onChange={(e) => setFormData({...formData, displayName: e.target.value})}
            required
            placeholder="John Doe"
            className="h-14 rounded-2xl bg-[var(--bg-input)] border-transparent focus:bg-[var(--bg-primary)] focus:border-[var(--accent-indigo)]"
          />
          <Input
            label="Email Address"
            type="email"
            id="register-email"
            name="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
            placeholder="you@example.com"
            className="h-14 rounded-2xl bg-[var(--bg-input)] border-transparent focus:bg-[var(--bg-primary)] focus:border-[var(--accent-indigo)]"
          />
          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              id="register-password"
              name="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
              placeholder="••••••••"
              minLength={6}
              className="h-14 rounded-2xl bg-[var(--bg-input)] border-transparent focus:bg-[var(--bg-primary)] focus:border-[var(--accent-indigo)]"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-[44px] p-1.5 rounded-lg transition-colors duration-150 hover:bg-[var(--bg-card)]"
              style={{ color: 'var(--text-muted)' }}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              tabIndex={-1}
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              )}
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor="register-language" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Native Language</label>
              <div className="select-wrapper">
                <select 
                  id="register-language"
                  className="flex h-14 w-full rounded-2xl px-4 pr-12 text-[15px] font-medium focus:outline-none focus:ring-2 focus:ring-[var(--accent-indigo)]/50 transition-all duration-200 appearance-none cursor-pointer border border-transparent focus:bg-[var(--bg-primary)]"
                  style={selectStyle}
                  value={formData.nativeLanguage}
                  onChange={(e) => setFormData({...formData, nativeLanguage: e.target.value})}
                >
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                  <option value="German">German</option>
                  <option value="Arabic">Arabic</option>
                  <option value="Chinese">Chinese</option>
                  <option value="Japanese">Japanese</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-muted)]">
                  <ChevronIcon />
                </div>
              </div>
            </div>
            <div>
              <label htmlFor="register-level" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Current Level</label>
              <div className="select-wrapper">
                <select 
                  id="register-level"
                  className="flex h-14 w-full rounded-2xl px-4 pr-12 text-[15px] font-medium focus:outline-none focus:ring-2 focus:ring-[var(--accent-indigo)]/50 transition-all duration-200 appearance-none cursor-pointer border border-transparent focus:bg-[var(--bg-primary)]"
                  style={selectStyle}
                  value={formData.level}
                  onChange={(e) => setFormData({...formData, level: e.target.value})}
                >
                  <option value="A1">A1 (Beginner)</option>
                  <option value="A2">A2 (Elementary)</option>
                  <option value="B1">B1 (Intermediate)</option>
                  <option value="B2">B2 (Upper Int.)</option>
                  <option value="C1">C1 (Advanced)</option>
                  <option value="C2">C2 (Mastery)</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-muted)]">
                  <ChevronIcon />
                </div>
              </div>
            </div>
          </div>
          
          {error && (
            <div className="p-4 rounded-2xl text-[15px] font-semibold bg-[var(--accent-red)]/10 text-[var(--accent-red)] border border-[var(--accent-red)]/20">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full mt-4 h-14 rounded-2xl font-bold text-[17px] shadow-lg shadow-[var(--accent-indigo)]/20 hover:shadow-[var(--accent-indigo)]/30 hover:-translate-y-0.5 transition-all" size="lg" isLoading={loading}>
            Create Account &rarr;
          </Button>
        </form>

        <p className="text-center font-medium mt-8" style={{ color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link href="/login" className="font-bold transition-colors hover:underline" style={{ color: 'var(--accent-indigo)' }}>
            Sign in
          </Link>
        </p>
      </Card>
    </div>
  );
}
