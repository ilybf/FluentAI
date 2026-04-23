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
        <h1 className="text-3xl font-bold text-[#f0f2f5]">Writing Practice</h1>
        <p className="text-[#8b92a5]">Write a short paragraph in English and get instant AI feedback on your grammar and style.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 flex flex-col h-[500px]">
          <h2 className="text-lg font-medium text-[#e0e4ed] mb-4">Your Text</h2>
          <textarea
            className="flex-1 w-full p-4 border border-[rgba(255,255,255,0.1)] bg-[rgba(30,35,55,0.8)] text-[#f0f2f5] rounded-xl resize-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none placeholder:text-[#5a6178] transition-all duration-200"
            placeholder="Write something in English... For example: 'Yesterday I go to the store and buyed some milks.'"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="mt-4 flex justify-between items-center">
            <span className="text-sm text-[#5a6178]">{text.split(/\s+/).filter(w => w.length > 0).length} words</span>
            <Button onClick={handleSubmit} isLoading={loading} disabled={text.length < 10}>
              Get AI Feedback
            </Button>
          </div>
        </Card>

        <Card className="p-6 h-[500px] overflow-y-auto border-[rgba(255,255,255,0.06)]">
          <h2 className="text-lg font-medium text-[#e0e4ed] mb-4">AI Feedback</h2>
          
          {!feedback && !loading && !errorMsg && (
            <div className="h-full flex flex-col items-center justify-center text-[#5a6178]">
              <span className="text-4xl mb-2">📝</span>
              <p>Submit your writing to see corrections here.</p>
            </div>
          )}

          {errorMsg && (
            <div className="h-full flex flex-col items-center justify-center text-red-400">
              <span className="text-4xl mb-2">⚠️</span>
              <p>{errorMsg}</p>
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
                <div className="text-sm text-[#8b92a5] font-medium uppercase tracking-wider">Overall Score</div>
              </div>

              <div>
                <h3 className="font-semibold text-[#e0e4ed] mb-2">Corrected Version:</h3>
                <div className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-300">
                  {feedback.correctedText}
                </div>
              </div>

              {feedback.feedback?.grammar?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-[#e0e4ed] mb-2">Grammar Corrections:</h3>
                  <ul className="list-disc pl-5 space-y-1 text-[#b0b8cc]">
                    {feedback.feedback.grammar.map((g: string, i: number) => <li key={i}>{g}</li>)}
                  </ul>
                </div>
              )}

              {feedback.feedback?.style?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-[#e0e4ed] mb-2">Style Improvements:</h3>
                  <ul className="list-disc pl-5 space-y-1 text-[#b0b8cc]">
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
