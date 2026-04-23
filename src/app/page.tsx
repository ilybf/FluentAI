import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function LandingPage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4 relative">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] rounded-full blur-3xl" style={{ background: 'rgba(59,130,246,0.08)' }}></div>
        <div className="absolute bottom-1/4 right-1/4 w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] rounded-full blur-3xl" style={{ background: 'rgba(139,92,246,0.08)' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[600px] h-[200px] sm:h-[300px] rounded-full blur-3xl" style={{ background: 'rgba(99,102,241,0.05)' }}></div>
      </div>

      <div className="max-w-3xl space-y-6 sm:space-y-8 relative z-10">
        <div className="inline-flex items-center justify-center w-16 sm:w-20 h-16 sm:h-20 rounded-3xl mb-4 text-3xl sm:text-4xl shadow-lg" style={{ background: 'linear-gradient(to bottom right, rgba(59,130,246,0.2), rgba(99,102,241,0.2))', border: '1px solid rgba(59,130,246,0.2)', boxShadow: '0 8px 25px rgba(59,130,246,0.1)' }}>
          🚀
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight">
          <span style={{ color: 'var(--text-primary)' }}>Master English with </span>
          <span style={{ background: `linear-gradient(to right, var(--accent-blue), var(--accent-indigo), var(--accent-violet))`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>FluentAI</span>
        </h1>
        <p className="text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          Your personal AI language tutor. Practice reading, perfect your writing, and speak confidently with instant feedback.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6 sm:pt-8">
          <Link href="/register">
            <Button size="lg" className="w-full sm:w-auto px-8 text-base sm:text-lg rounded-full">
              Start Learning Now
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg" className="w-full sm:w-auto px-8 text-base sm:text-lg rounded-full">
              Sign In
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="mt-16 sm:mt-24 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto text-left relative z-10">
        <div className="p-5 sm:p-6 backdrop-blur-xl rounded-2xl transition-all duration-300 group theme-transition" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
          <div className="text-3xl mb-4 inline-flex items-center justify-center w-12 h-12 rounded-xl group-hover:scale-105 transition-transform" style={{ background: 'rgba(59,130,246,0.1)' }}>💬</div>
          <h3 className="text-lg sm:text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>AI Chat Tutor</h3>
          <p className="text-sm sm:text-base" style={{ color: 'var(--text-secondary)' }}>Practice real-world conversations and get gentle, precise grammar corrections instantly.</p>
        </div>
        <div className="p-5 sm:p-6 backdrop-blur-xl rounded-2xl transition-all duration-300 group theme-transition" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
          <div className="text-3xl mb-4 inline-flex items-center justify-center w-12 h-12 rounded-xl group-hover:scale-105 transition-transform" style={{ background: 'rgba(99,102,241,0.1)' }}>✍️</div>
          <h3 className="text-lg sm:text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Writing Analysis</h3>
          <p className="text-sm sm:text-base" style={{ color: 'var(--text-secondary)' }}>Submit essays or emails and receive professional grading, grammar checks, and style suggestions.</p>
        </div>
        <div className="p-5 sm:p-6 backdrop-blur-xl rounded-2xl transition-all duration-300 group theme-transition sm:col-span-2 md:col-span-1" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
          <div className="text-3xl mb-4 inline-flex items-center justify-center w-12 h-12 rounded-xl group-hover:scale-105 transition-transform" style={{ background: 'rgba(16,185,129,0.1)' }}>📖</div>
          <h3 className="text-lg sm:text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Smart Reading</h3>
          <p className="text-sm sm:text-base" style={{ color: 'var(--text-secondary)' }}>Read articles tailored to your CEFR level. Tap any word to get instant translations in context.</p>
        </div>
      </div>
    </div>
  );
}
