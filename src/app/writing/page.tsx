"use client";
import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PenTool, Sparkles, AlertTriangle, CheckCircle, Info, Lightbulb } from 'lucide-react';

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

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'var(--accent-emerald)';
    if (score >= 50) return 'var(--accent-amber)';
    return 'var(--accent-red)';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 page-animate">
      <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-[1.5rem] mb-4 bg-[var(--accent-indigo)]/10 text-[var(--accent-indigo)] shadow-inner">
          <PenTool size={32} />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3" style={{ color: 'var(--text-primary)' }}>Writing Practice</h1>
        <p className="text-[17px] font-medium" style={{ color: 'var(--text-secondary)' }}>Write a short paragraph in English and get instant AI feedback on your grammar, style, and vocabulary.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        <Card className="p-6 sm:p-8 flex flex-col h-[500px] sm:h-[600px] rounded-[2.5rem] border-[var(--border-subtle)] shadow-sm">
          <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Your Text</h2>
          <textarea
            id="writing-input"
            className="flex-1 w-full p-5 rounded-3xl resize-none outline-none transition-all duration-300 text-[15px] leading-relaxed font-medium shadow-inner"
            style={{
              background: 'var(--bg-input)',
              border: '2px solid transparent',
              color: 'var(--text-primary)',
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--accent-indigo)'}
            onBlur={(e) => e.target.style.borderColor = 'transparent'}
            placeholder="Write something in English... For example: 'Yesterday I go to the store and buyed some milks.'"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <span className="text-sm font-semibold uppercase tracking-wider bg-[var(--bg-input)] px-4 py-2 rounded-xl" style={{ color: 'var(--text-muted)' }}>
              {text.split(/\s+/).filter(w => w.length > 0).length} words
            </span>
            <Button 
              onClick={handleSubmit} 
              isLoading={loading} 
              disabled={text.length < 10}
              className="w-full sm:w-auto px-8 h-12 rounded-2xl font-bold shadow-md hover:shadow-lg transition-all"
            >
              Analyze Writing
            </Button>
          </div>
        </Card>

        <Card className="p-6 sm:p-8 h-[500px] sm:h-[600px] overflow-y-auto rounded-[2.5rem] border-[var(--border-subtle)] shadow-sm bg-[var(--bg-card)]">
          <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>AI Feedback</h2>
          
          {!feedback && !loading && !errorMsg && (
            <div className="h-full flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-500">
              <div className="w-24 h-24 rounded-full bg-[var(--bg-input)] flex items-center justify-center mb-6 text-[var(--text-muted)]">
                <Sparkles size={48} />
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Awaiting Submission</h3>
              <p className="max-w-xs font-medium" style={{ color: 'var(--text-muted)' }}>Submit your writing to receive detailed corrections and a professional score.</p>
            </div>
          )}

          {errorMsg && (
            <div className="h-full flex flex-col items-center justify-center animate-in fade-in">
              <div className="w-20 h-20 rounded-full bg-[var(--accent-red)]/10 flex items-center justify-center mb-4 text-[var(--accent-red)]">
                <AlertTriangle size={36} />
              </div>
              <p className="text-center px-4 font-semibold text-[var(--accent-red)]">{errorMsg}</p>
            </div>
          )}

          {loading && (
            <div className="h-full flex flex-col items-center justify-center gap-4 animate-in fade-in">
               <div className="flex space-x-2">
                 <div className="w-3 h-3 bg-[var(--accent-indigo)] rounded-full animate-bounce"></div>
                 <div className="w-3 h-3 bg-[var(--accent-blue)] rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                 <div className="w-3 h-3 bg-[var(--accent-violet)] rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
               </div>
               <p className="font-medium text-[var(--text-secondary)]">Analyzing your text...</p>
            </div>
          )}

          {feedback && !loading && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-6 p-6 rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-input)] shadow-inner">
                <div className="flex items-center justify-center w-20 h-20 rounded-full bg-[var(--bg-card)] shadow-sm">
                  <span className="text-3xl font-black" style={{ color: getScoreColor(feedback.score) }}>
                    {feedback.score}
                  </span>
                </div>
                <div>
                  <div className="text-sm font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-secondary)' }}>Overall Score</div>
                  <div className="text-[15px] font-medium" style={{ color: 'var(--text-primary)' }}>
                    {feedback.score >= 80 ? 'Excellent work!' : feedback.score >= 50 ? 'Good effort, keep practicing.' : 'Needs improvement.'}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <CheckCircle size={20} className="text-[var(--accent-emerald)]" /> Corrected Version
                </h3>
                <div className="p-5 rounded-2xl text-[15px] leading-relaxed font-medium bg-[var(--accent-emerald)]/10 text-[var(--accent-emerald)] border border-[var(--accent-emerald)]/20 shadow-inner">
                  {feedback.correctedText}
                </div>
              </div>

              {feedback.feedback?.grammar?.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                    <Info size={20} className="text-[var(--accent-red)]" /> Grammar Corrections
                  </h3>
                  <ul className="space-y-3">
                    {feedback.feedback.grammar.map((g: string, i: number) => (
                      <li key={i} className="p-4 rounded-xl text-[14px] font-medium leading-relaxed bg-[var(--bg-input)] border border-[var(--border-subtle)] text-[var(--text-secondary)]">
                        {g}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {feedback.feedback?.style?.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                    <Lightbulb size={20} className="text-[var(--accent-blue)]" /> Style Improvements
                  </h3>
                  <ul className="space-y-3">
                    {feedback.feedback.style.map((s: string, i: number) => (
                      <li key={i} className="p-4 rounded-xl text-[14px] font-medium leading-relaxed bg-[var(--bg-input)] border border-[var(--border-subtle)] text-[var(--text-secondary)]">
                        {s}
                      </li>
                    ))}
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
