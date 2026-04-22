import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function LandingPage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
      <div className="max-w-3xl space-y-8">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-blue-100 text-blue-600 mb-4 text-4xl shadow-sm">
          🚀
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight">
          Master English with <span className="text-blue-600">FluentAI</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
          Your personal AI language tutor. Practice reading, perfect your writing, and speak confidently with instant feedback.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
          <Link href="/login">
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
      
      <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto text-left">
        <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="text-3xl mb-4">💬</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">AI Chat Tutor</h3>
          <p className="text-gray-500">Practice real-world conversations and get gentle, precise grammar corrections instantly.</p>
        </div>
        <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="text-3xl mb-4">✍️</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Writing Analysis</h3>
          <p className="text-gray-500">Submit essays or emails and receive professional grading, grammar checks, and style suggestions.</p>
        </div>
        <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="text-3xl mb-4">📖</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Smart Reading</h3>
          <p className="text-gray-500">Read articles tailored to your CEFR level. Tap any word to get instant translations in context.</p>
        </div>
      </div>
    </div>
  );
}
