import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { LandingThemeToggle } from '@/components/ui/LandingThemeToggle';
import { MessageCircle, PenTool, BookOpen, Sparkles, Brain, Target, Globe } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center text-center px-4 relative min-h-[100dvh] overflow-x-hidden">
      
      {/* Dynamic Background Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-[var(--accent-blue)] opacity-[0.05] rounded-full blur-[100px] animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-[var(--accent-violet)] opacity-[0.05] rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: '2s' }} />
      </div>

      {/* Header / Nav area */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-50">
        <div className="flex items-center gap-2 font-black text-2xl tracking-tight" style={{ color: 'var(--text-primary)' }}>
          <div className="w-8 h-8 rounded-lg bg-[var(--accent-blue)] flex items-center justify-center text-white">
            <Globe size={20} />
          </div>
          FluentAI
        </div>
        <div className="flex items-center gap-3">
          <LandingThemeToggle />
          <Link href="/login">
            <Button variant="outline" className="rounded-xl px-6 font-bold shadow-sm bg-[var(--bg-card)] hover:bg-[var(--bg-input)]">Log In</Button>
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-5xl space-y-8 relative z-10 py-32 mt-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="inline-flex items-center gap-2 justify-center px-6 py-2.5 rounded-full font-bold text-sm tracking-wide mb-4 shadow-sm border border-[var(--border-subtle)] bg-[var(--bg-card)] backdrop-blur-md" style={{ color: 'var(--accent-blue)' }}>
          <Sparkles size={16} />
          The next generation of language learning
        </div>
        
        <h1 className="text-5xl sm:text-6xl md:text-8xl font-black tracking-tight leading-[1.05]">
          <span style={{ color: 'var(--text-primary)' }}>Speak English with </span>
          <br className="hidden md:block" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[var(--accent-blue)] via-[var(--accent-indigo)] to-[var(--accent-violet)]">
            absolute confidence.
          </span>
        </h1>
        
        <p className="text-lg sm:text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed font-medium mt-6" style={{ color: 'var(--text-secondary)' }}>
          Practice real conversations, get instant grammar feedback, and master vocabulary with your personal AI tutor tailored to your CEFR level.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-10">
          <Link href="/register" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto h-16 px-12 text-[17px] rounded-2xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all hover:-translate-y-1">
              Start Learning for Free
            </Button>
          </Link>
          <Link href="#features" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full sm:w-auto h-16 px-10 text-[17px] rounded-2xl bg-[var(--bg-card)] hover:bg-[var(--bg-input)] text-[var(--text-secondary)] border-transparent transition-all">
              Discover Features
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Features Grid */}
      <div id="features" className="py-24 max-w-6xl mx-auto relative z-10 w-full scroll-mt-20">
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          <h2 className="text-3xl md:text-5xl font-black mb-4" style={{ color: 'var(--text-primary)' }}>Master every skill.</h2>
          <p className="text-xl font-medium max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>Everything you need to reach fluency, powered by advanced AI.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          <div className="p-8 rounded-[2.5rem] transition-all duration-300 hover:-translate-y-2 hover:shadow-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] backdrop-blur-xl group">
            <div className="text-4xl mb-6 bg-[var(--accent-blue)]/10 text-[var(--accent-blue)] w-16 h-16 flex items-center justify-center rounded-2xl group-hover:scale-110 transition-transform">
              <MessageCircle size={32} />
            </div>
            <h3 className="text-2xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>AI Chat Tutor</h3>
            <p className="text-[16px] leading-relaxed font-medium" style={{ color: 'var(--text-secondary)' }}>Practice real-world conversations and get gentle, precise grammar corrections instantly without judgment.</p>
          </div>
          <div className="p-8 rounded-[2.5rem] transition-all duration-300 hover:-translate-y-2 hover:shadow-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] backdrop-blur-xl group">
            <div className="text-4xl mb-6 bg-[var(--accent-indigo)]/10 text-[var(--accent-indigo)] w-16 h-16 flex items-center justify-center rounded-2xl group-hover:scale-110 transition-transform">
              <PenTool size={32} />
            </div>
            <h3 className="text-2xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Smart Writing</h3>
            <p className="text-[16px] leading-relaxed font-medium" style={{ color: 'var(--text-secondary)' }}>Submit essays or professional emails and receive detailed grading, grammar checks, and style suggestions.</p>
          </div>
          <div className="p-8 rounded-[2.5rem] transition-all duration-300 hover:-translate-y-2 hover:shadow-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] backdrop-blur-xl group">
            <div className="text-4xl mb-6 bg-[var(--accent-emerald)]/10 text-[var(--accent-emerald)] w-16 h-16 flex items-center justify-center rounded-2xl group-hover:scale-110 transition-transform">
              <BookOpen size={32} />
            </div>
            <h3 className="text-2xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Active Reading</h3>
            <p className="text-[16px] leading-relaxed font-medium" style={{ color: 'var(--text-secondary)' }}>Read articles perfectly tailored to your level. Tap any word to get instant translations in context.</p>
          </div>
        </div>
      </div>

      {/* How it works / Stats */}
      <div className="py-24 max-w-6xl mx-auto relative z-10 w-full border-t border-[var(--border-subtle)]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="text-left space-y-8 animate-in fade-in slide-in-from-left-8 duration-700">
            <div className="inline-flex items-center gap-2 justify-center px-4 py-2 rounded-xl font-bold text-sm tracking-wide shadow-sm border border-[var(--border-subtle)] bg-[var(--bg-card)]" style={{ color: 'var(--accent-violet)' }}>
              <Brain size={16} /> Intelligent Progression
            </div>
            <h2 className="text-4xl md:text-5xl font-black leading-tight" style={{ color: 'var(--text-primary)' }}>
              Learn smarter, not harder.
            </h2>
            <p className="text-[18px] leading-relaxed font-medium" style={{ color: 'var(--text-secondary)' }}>
              FluentAI uses the CEFR standard (A1 to C2) to track your progress. As you chat, read, and write, the AI automatically adapts its vocabulary and complexity to match your true level, pushing you gently toward fluency.
            </p>
            <div className="flex gap-4">
              <div className="flex-1 p-6 rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-input)]">
                <div className="text-[var(--accent-emerald)] mb-2"><Target size={28} /></div>
                <h4 className="font-bold text-xl mb-1" style={{ color: 'var(--text-primary)' }}>CEFR Aligned</h4>
                <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>From A1 to C2 mastery</p>
              </div>
              <div className="flex-1 p-6 rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-input)]">
                <div className="text-[var(--accent-amber)] mb-2"><Sparkles size={28} /></div>
                <h4 className="font-bold text-xl mb-1" style={{ color: 'var(--text-primary)' }}>XP System</h4>
                <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Earn points and level up</p>
              </div>
            </div>
          </div>
          <div className="relative animate-in fade-in slide-in-from-right-8 duration-700">
            <div className="absolute inset-0 bg-gradient-to-tr from-[var(--accent-blue)] to-[var(--accent-violet)] opacity-10 blur-3xl rounded-full" />
            <div className="p-8 rounded-[3rem] border border-[var(--border-subtle)] bg-[var(--bg-card)] shadow-2xl relative z-10 backdrop-blur-xl">
              <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--bg-input)] border border-[var(--border-subtle)]">
                  <div className="w-12 h-12 rounded-xl bg-[var(--accent-emerald)]/20 flex items-center justify-center text-[var(--accent-emerald)]"><BookOpen size={24} /></div>
                  <div>
                    <p className="font-bold text-[16px]" style={{ color: 'var(--text-primary)' }}>Completed Reading Quiz</p>
                    <p className="font-medium text-sm text-[var(--accent-emerald)]">+250 XP • Perfect Score</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--bg-input)] border border-[var(--border-subtle)]">
                  <div className="w-12 h-12 rounded-xl bg-[var(--accent-blue)]/20 flex items-center justify-center text-[var(--accent-blue)]"><MessageCircle size={24} /></div>
                  <div>
                    <p className="font-bold text-[16px]" style={{ color: 'var(--text-primary)' }}>15-min Conversation</p>
                    <p className="font-medium text-sm text-[var(--accent-blue)]">+150 XP • 5 new words</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--bg-input)] border border-[var(--border-subtle)]">
                  <div className="w-12 h-12 rounded-xl bg-[var(--accent-indigo)]/20 flex items-center justify-center text-[var(--accent-indigo)]"><PenTool size={24} /></div>
                  <div>
                    <p className="font-bold text-[16px]" style={{ color: 'var(--text-primary)' }}>B2 Essay Submission</p>
                    <p className="font-medium text-sm text-[var(--accent-indigo)]">+400 XP • Excellent Grammar</p>
                  </div>
                </div>
                
                <div className="pt-6 border-t border-[var(--border-subtle)]">
                  <div className="flex justify-between items-end mb-2">
                    <span className="font-bold" style={{ color: 'var(--text-primary)' }}>Level B1</span>
                    <span className="font-bold text-[var(--accent-blue)]">75% to B2</span>
                  </div>
                  <div className="h-3 w-full bg-[var(--bg-primary)] rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--accent-blue)] rounded-full w-[75%]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer CTA */}
      <div className="py-32 max-w-4xl mx-auto w-full text-center relative z-10 border-t border-[var(--border-subtle)]">
        <h2 className="text-4xl md:text-5xl font-black mb-8" style={{ color: 'var(--text-primary)' }}>Ready to become fluent?</h2>
        <Link href="/register">
          <Button size="lg" className="h-16 px-12 text-[17px] rounded-2xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all hover:-translate-y-1">
            Create Your Free Account
          </Button>
        </Link>
      </div>

    </div>
  );
}
