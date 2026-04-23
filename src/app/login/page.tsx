"use client";
import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    if (res?.error) {
      setError(res.error);
      setLoading(false);
    } else {
      router.push('/dashboard');
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 sm:w-96 h-72 sm:h-96 rounded-full blur-3xl" style={{ background: 'rgba(59,130,246,0.1)' }}></div>
        <div className="absolute bottom-1/4 right-1/4 w-72 sm:w-96 h-72 sm:h-96 rounded-full blur-3xl" style={{ background: 'rgba(139,92,246,0.1)' }}></div>
      </div>

      <Card className="w-full max-w-md p-6 sm:p-8 shadow-2xl relative z-10">
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 text-3xl" style={{ background: 'linear-gradient(to bottom right, rgba(59,130,246,0.2), rgba(99,102,241,0.2))', border: '1px solid rgba(59,130,246,0.2)' }}>
            🚀
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Welcome Back</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Sign in to continue your English journey</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
          />
          
          {error && (
            <div className="p-3 rounded-xl text-sm" style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" size="lg" isLoading={loading}>
            Sign In
          </Button>
        </form>

        <p className="text-center text-sm mt-6" style={{ color: 'var(--text-muted)' }}>
          Don&apos;t have an account?{' '}
          <a href="/register" className="font-medium transition-colors hover:underline" style={{ color: 'var(--accent-blue)' }}>
            Sign up
          </a>
        </p>
      </Card>
    </div>
  );
}
