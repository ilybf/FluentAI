"use client";
import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function WritingPracticePage() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setErrorMsg('');
    setFeedback(null);
    
    try {
      const res = await fetch('/api/writing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit writing');
      }
      
      setFeedback(data);
    } catch (error: any) {
      console.error(error);
      setErrorMsg(error.message || 'An error occurred while evaluating your writing.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Writing Practice</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Write a short paragraph in English and get instant AI feedback on your grammar and style.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card className="p-4 sm:p-6 flex flex-col h-[400px] sm:h-[500px]">
          <h2 className="text-lg font-medium mb-4" style={{ color: 'var(--text-primary)' }}>Your Text</h2>
          <textarea
            className="flex-1 w-full p-3 sm:p-4 rounded-xl resize-none focus:ring-2 focus:ring-blue-500/50 outline-none transition-all duration-200 text-sm sm:text-base theme-transition"
            style={{
              background: 'var(--bg-input)',
              border: '1px solid var(--border-input)',
              color: 'var(--text-primary)',
            }}
            placeholder="Write something in English... For example: 'Yesterday I go to the store and buyed some milks.'"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{text.split(/\s+/).filter(w => w.length > 0).length} words</span>
            <Button onClick={handleSubmit} isLoading={loading} disabled={text.length < 10}>
              Get AI Feedback
            </Button>
          </div>
        </Card>

        <Card className="p-4 sm:p-6 h-[400px] sm:h-[500px] overflow-y-auto">
          <h2 className="text-lg font-medium mb-4" style={{ color: 'var(--text-primary)' }}>AI Feedback</h2>
          
          {!feedback && !loading && !errorMsg && (
            <div className="h-full flex flex-col items-center justify-center" style={{ color: 'var(--text-muted)' }}>
              <span className="text-4xl mb-2">📝</span>
              <p>Submit your writing to see corrections here.</p>
            </div>
          )}

          {errorMsg && (
            <div className="h-full flex flex-col items-center justify-center text-red-400">
              <span className="text-4xl mb-2">⚠️</span>
              <p className="text-center px-4">{errorMsg}</p>
            </div>
          )}

          {loading && (
            <div className="h-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500/30 border-t-blue-500"></div>
            </div>
          )}

          {feedback && !loading && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className={`text-3xl font-bold ${feedback.score >= 80 ? 'text-emerald-400' : feedback.score >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                  {feedback.score}/100
                </div>
                <div className="text-sm font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Overall Score</div>
              </div>

              <div>
                <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Corrected Version:</h3>
                <div className="p-3 sm:p-4 rounded-xl text-sm sm:text-base" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#34d399' }}>
                  {feedback.correctedText}
                </div>
              </div>

              {feedback.feedback?.grammar?.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Grammar Corrections:</h3>
                  <ul className="list-disc pl-5 space-y-1 text-sm sm:text-base" style={{ color: 'var(--text-secondary)' }}>
                    {feedback.feedback.grammar.map((g: string, i: number) => <li key={i}>{g}</li>)}
                  </ul>
                </div>
              )}

              {feedback.feedback?.style?.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Style Improvements:</h3>
                  <ul className="list-disc pl-5 space-y-1 text-sm sm:text-base" style={{ color: 'var(--text-secondary)' }}>
                    {feedback.feedback.style.map((s: string, i: number) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
