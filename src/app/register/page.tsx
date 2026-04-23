"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
    nativeLanguage: 'Spanish',
    level: 'A1'
  });
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

      // Automatically redirect to login after successful registration
      router.push('/login?registered=true');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const selectStyle: React.CSSProperties = {
    background: 'var(--bg-input)',
    border: '1px solid var(--border-input)',
    color: 'var(--text-primary)',
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-12 relative">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-72 sm:w-96 h-72 sm:h-96 rounded-full blur-3xl" style={{ background: 'rgba(99,102,241,0.1)' }}></div>
        <div className="absolute bottom-1/3 right-1/3 w-64 sm:w-80 h-64 sm:h-80 rounded-full blur-3xl" style={{ background: 'rgba(16,185,129,0.08)' }}></div>
      </div>

      <Card className="w-full max-w-md p-6 sm:p-8 shadow-2xl relative z-10">
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 text-3xl" style={{ background: 'linear-gradient(to bottom right, rgba(99,102,241,0.2), rgba(139,92,246,0.2))', border: '1px solid rgba(99,102,241,0.2)' }}>
            🎓
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Create Account</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Start mastering English with AI today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Display Name"
            type="text"
            value={formData.displayName}
            onChange={(e) => setFormData({...formData, displayName: e.target.value})}
            required
            placeholder="John Doe"
          />
          <Input
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
            placeholder="you@example.com"
          />
          <Input
            label="Password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            required
            placeholder="••••••••"
            minLength={6}
          />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Native Language</label>
              <select 
                className="flex h-11 w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200 appearance-none cursor-pointer theme-transition"
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
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Current Level</label>
              <select 
                className="flex h-11 w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200 appearance-none cursor-pointer theme-transition"
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
            </div>
          </div>
          
          {error && (
            <div className="p-3 rounded-xl text-sm" style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
              {error}
            </div>
          )}

          <Button type="submit" className="w-full mt-2" size="lg" isLoading={loading}>
            Create Account
          </Button>
        </form>

        <p className="text-center text-sm mt-6" style={{ color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link href="/login" className="font-medium transition-colors hover:underline" style={{ color: 'var(--accent-blue)' }}>
            Sign in
          </Link>
        </p>
      </Card>
    </div>
  );
}
