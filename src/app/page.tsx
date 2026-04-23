import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function LandingPage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4 relative">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-500/8 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-violet-500/8 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-indigo-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-3xl space-y-8 relative z-10">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/20 mb-4 text-4xl shadow-lg shadow-blue-500/10">
          🚀
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
          <span className="text-[#f0f2f5]">Master English with </span>
          <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent">FluentAI</span>
        </h1>
        <p className="text-xl text-[#8b92a5] max-w-2xl mx-auto leading-relaxed">
          Your personal AI language tutor. Practice reading, perfect your writing, and speak confidently with instant feedback.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
          <Link href="/register">
            <Button size="lg" className="w-full sm:w-auto px-8 text-lg rounded-full">
              Start Learning Now
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg" className="w-full sm:w-auto px-8 text-lg rounded-full">
              Sign In
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto text-left relative z-10">
        <div className="p-6 bg-[rgba(22,27,45,0.7)] backdrop-blur-xl rounded-2xl border border-[rgba(255,255,255,0.06)] hover:border-blue-500/20 transition-all duration-300 group">
          <div className="text-3xl mb-4 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-500/10 group-hover:bg-blue-500/15 transition-colors">💬</div>
          <h3 className="text-xl font-bold text-[#f0f2f5] mb-2">AI Chat Tutor</h3>
          <p className="text-[#8b92a5]">Practice real-world conversations and get gentle, precise grammar corrections instantly.</p>
        </div>
        <div className="p-6 bg-[rgba(22,27,45,0.7)] backdrop-blur-xl rounded-2xl border border-[rgba(255,255,255,0.06)] hover:border-indigo-500/20 transition-all duration-300 group">
          <div className="text-3xl mb-4 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-500/10 group-hover:bg-indigo-500/15 transition-colors">✍️</div>
          <h3 className="text-xl font-bold text-[#f0f2f5] mb-2">Writing Analysis</h3>
          <p className="text-[#8b92a5]">Submit essays or emails and receive professional grading, grammar checks, and style suggestions.</p>
        </div>
        <div className="p-6 bg-[rgba(22,27,45,0.7)] backdrop-blur-xl rounded-2xl border border-[rgba(255,255,255,0.06)] hover:border-emerald-500/20 transition-all duration-300 group">
          <div className="text-3xl mb-4 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-500/10 group-hover:bg-emerald-500/15 transition-colors">📖</div>
          <h3 className="text-xl font-bold text-[#f0f2f5] mb-2">Smart Reading</h3>
          <p className="text-[#8b92a5]">Read articles tailored to your CEFR level. Tap any word to get instant translations in context.</p>
        </div>
      </div>
    </div>
  );
}
