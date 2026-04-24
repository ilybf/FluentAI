"use client";
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

const LEVELS = ['All', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;

interface Passage {
  _id: string;
  title: string;
  content: string;
  level: string;
  questions: { text: string; options: string[]; correctIndex: number; }[];
}

function getLevelColor(level: string) {
  const map: Record<string, { bg: string; color: string; border: string }> = {
    A1: { bg: 'rgba(16,185,129,0.15)', color: '#34d399', border: 'rgba(16,185,129,0.25)' },
    A2: { bg: 'rgba(52,211,153,0.15)', color: '#6ee7b7', border: 'rgba(52,211,153,0.25)' },
    B1: { bg: 'rgba(59,130,246,0.15)', color: '#60a5fa', border: 'rgba(59,130,246,0.25)' },
    B2: { bg: 'rgba(99,102,241,0.15)', color: '#818cf8', border: 'rgba(99,102,241,0.25)' },
    C1: { bg: 'rgba(168,85,247,0.15)', color: '#c084fc', border: 'rgba(168,85,247,0.25)' },
    C2: { bg: 'rgba(236,72,153,0.15)', color: '#f472b6', border: 'rgba(236,72,153,0.25)' },
  };
  return map[level] || map.B1;
}

function ReadingSkeleton() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div><div className="skeleton h-8 w-52 mb-2" /><div className="skeleton h-4 w-80" /></div>
      <div className="flex flex-wrap gap-2">{[...Array(7)].map((_, i) => <div key={i} className="skeleton h-10 w-16 rounded-xl" />)}</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-6">
            <div className="flex items-start justify-between gap-3 mb-3"><div className="skeleton h-5 w-3/4" /><div className="skeleton h-6 w-10 rounded-full" /></div>
            <div className="skeleton h-3 w-full mb-2" /><div className="skeleton h-3 w-full mb-2" /><div className="skeleton h-3 w-2/3 mb-3" /><div className="skeleton h-3 w-20" />
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function ReadingPracticePage() {
  const [passages, setPassages] = useState<Passage[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedPassage, setSelectedPassage] = useState<Passage | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [activeLevel, setActiveLevel] = useState<string>('All');
  const [replacing, setReplacing] = useState(false);
  const [replaceMsg, setReplaceMsg] = useState('');

  useEffect(() => { fetchPassages(); }, []);

  const fetchPassages = async () => {
    try { setLoading(true); const res = await fetch('/api/reading'); if (!res.ok) throw new Error('Failed to fetch passages'); setPassages(await res.json()); }
    catch (error: any) { setErrorMsg(error.message); } finally { setLoading(false); }
  };

  const filteredPassages = activeLevel === 'All' ? passages : passages.filter(p => p.level === activeLevel);
  const handleAnswer = (qi: number, oi: number) => { if (submitted) return; setAnswers(prev => ({ ...prev, [qi]: oi })); };
  const handleSubmitAnswers = () => setSubmitted(true);
  const handleReset = () => { setAnswers({}); setSubmitted(false); setReplaceMsg(''); };

  const getScore = () => { if (!selectedPassage) return 0; return selectedPassage.questions.filter((q, i) => answers[i] === q.correctIndex).length; };
  const isPerfectScore = () => selectedPassage ? getScore() === selectedPassage.questions.length : false;

  const handleCompletePassage = async () => {
    if (!selectedPassage) return;
    setReplacing(true); setReplaceMsg('');
    try {
      const res = await fetch('/api/reading', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ passageId: selectedPassage._id }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to replace passage');
      if (data.replaced && data.newPassage) {
        setPassages(prev => prev.map(p => p._id === selectedPassage._id ? data.newPassage : p));
        setReplaceMsg('✨ New passage generated! Going back to the list...');
      } else {
        setPassages(prev => prev.filter(p => p._id !== selectedPassage._id));
        setReplaceMsg(data.reason || 'Passage completed. Refresh later for a new one.');
      }
      setTimeout(() => { setSelectedPassage(null); handleReset(); }, 2000);
    } catch (error: any) { setReplaceMsg(`⚠️ ${error.message}`); } finally { setReplacing(false); }
  };

  if (loading) return <ReadingSkeleton />;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <header className="border-b pb-4" style={{ borderColor: 'var(--border-subtle)' }}>
        <h1 className="text-2xl sm:text-3xl font-extrabold" style={{ color: 'var(--text-primary)' }}>
          Reading Practice
        </h1>
        <p className="mt-2 text-sm sm:text-base" style={{ color: 'var(--text-secondary)' }}>
          Read passages, answer questions, and get fresh AI-generated stories when you master them.
        </p>
      </header>

      {errorMsg && (<div className="p-4 rounded-xl border" role="alert" style={{ background: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.2)', color: 'var(--accent-red)' }}>⚠️ {errorMsg}</div>)}

      {!selectedPassage ? (
        <>
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter by level">
            {LEVELS.map((level) => {
              const isActive = activeLevel === level;
              const count = level === 'All' ? passages.length : passages.filter(p => p.level === level).length;
              return (
                <button key={level} onClick={() => setActiveLevel(level)} role="tab" aria-selected={isActive}
                  className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 theme-transition"
                  style={isActive ? { background: 'linear-gradient(to right, rgba(59,130,246,0.2), rgba(99,102,241,0.15))', color: 'var(--accent-blue)', border: '1px solid rgba(59,130,246,0.3)' } : { background: 'var(--bg-input)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}
                >{level} {count > 0 && <span className="ml-1 opacity-60">({count})</span>}</button>
              );
            })}
          </div>

          {filteredPassages.length === 0 ? (
            <Card className="p-8 sm:p-12 text-center">
              <div className="space-y-4">
                <span className="text-5xl sm:text-6xl block">📖</span>
                <h2 className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{passages.length === 0 ? 'No Reading Passages Yet' : `No ${activeLevel} Passages`}</h2>
                <p style={{ color: 'var(--text-secondary)' }} className="max-w-md mx-auto text-sm sm:text-base">{passages.length === 0 ? "Loading initial passages... Try refreshing the page." : `You've completed all ${activeLevel} passages! New ones will be generated as you practice.`}</p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {filteredPassages.map((passage) => {
                const lc = getLevelColor(passage.level);
                return (
                  <Card key={passage._id} className="p-5 sm:p-6 cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/5">
                    <button onClick={() => { setSelectedPassage(passage); handleReset(); }} className="w-full text-left">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-base sm:text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{passage.title}</h3>
                        <span className="shrink-0 text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: lc.bg, color: lc.color, border: `1px solid ${lc.border}` }}>{passage.level}</span>
                      </div>
                      <p className="mt-2 text-sm line-clamp-3" style={{ color: 'var(--text-secondary)' }}>{passage.content.slice(0, 150)}...</p>
                      <div className="mt-3 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{passage.questions.length} question{passage.questions.length !== 1 ? 's' : ''}</div>
                    </button>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      ) : (
        <div className="space-y-6">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm">
            <button onClick={() => { setSelectedPassage(null); handleReset(); }} className="hover:underline transition-colors" style={{ color: 'var(--text-muted)' }}>Reading</button>
            <span style={{ color: 'var(--text-muted)' }}>/</span>
            <span className="font-medium truncate max-w-[250px]" style={{ color: 'var(--text-primary)' }}>{selectedPassage.title}</span>
          </nav>

          <Card className="p-5 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start justify-between gap-3 mb-6">
              <h2 className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{selectedPassage.title}</h2>
              <span className="shrink-0 text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: getLevelColor(selectedPassage.level).bg, color: getLevelColor(selectedPassage.level).color, border: `1px solid ${getLevelColor(selectedPassage.level).border}` }}>{selectedPassage.level}</span>
            </div>
            <div className="prose prose-sm sm:prose max-w-none whitespace-pre-wrap text-sm sm:text-base" style={{ color: 'var(--text-primary)', lineHeight: '1.85' }}>{selectedPassage.content}</div>
          </Card>

          {selectedPassage.questions.length > 0 && (
            <Card className="p-5 sm:p-8">
              <h3 className="text-lg sm:text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Comprehension Questions</h3>
              <div className="space-y-6">
                {selectedPassage.questions.map((q, qi) => (
                  <div key={qi} className="space-y-3">
                    <p className="font-medium text-sm sm:text-base" style={{ color: 'var(--text-primary)' }}>{qi + 1}. {q.text}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2" role="radiogroup" aria-label={`Question ${qi + 1}`}>
                      {q.options.map((opt, oi) => {
                        const isSelected = answers[qi] === oi;
                        const isCorrect = submitted && q.correctIndex === oi;
                        const isWrong = submitted && isSelected && q.correctIndex !== oi;
                        let s: React.CSSProperties = { background: 'var(--bg-input)', borderColor: 'var(--border-input)', color: 'var(--text-secondary)' };
                        if (isSelected && !submitted) s = { background: 'rgba(59,130,246,0.15)', borderColor: 'rgba(59,130,246,0.4)', color: '#60a5fa' };
                        else if (isCorrect) s = { background: 'rgba(16,185,129,0.15)', borderColor: 'rgba(16,185,129,0.4)', color: 'var(--score-high)' };
                        else if (isWrong) s = { background: 'rgba(239,68,68,0.15)', borderColor: 'rgba(239,68,68,0.4)', color: 'var(--score-low)' };
                        return (<button key={oi} onClick={() => handleAnswer(qi, oi)} disabled={submitted} role="radio" aria-checked={isSelected} className="text-left p-3 rounded-xl border text-sm transition-all duration-200 disabled:cursor-default" style={s}>{opt}</button>);
                      })}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
                {!submitted ? (
                  <Button onClick={handleSubmitAnswers} disabled={Object.keys(answers).length < selectedPassage.questions.length}>Submit Answers</Button>
                ) : (
                  <>
                    <div className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Score: <span style={{ color: isPerfectScore() ? 'var(--score-high)' : 'var(--score-mid)' }}>{getScore()}/{selectedPassage.questions.length}</span></div>
                    {isPerfectScore() ? (
                      <Button onClick={handleCompletePassage} isLoading={replacing} disabled={replacing}>{replacing ? 'Generating new passage...' : '✨ Complete & Get New Passage'}</Button>
                    ) : (<Button variant="outline" onClick={handleReset}>Try Again</Button>)}
                  </>
                )}
              </div>
              {replaceMsg && (
                <div className="mt-4 p-3 rounded-xl text-sm" style={{ background: replaceMsg.startsWith('⚠️') ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)', color: replaceMsg.startsWith('⚠️') ? 'var(--accent-red)' : 'var(--accent-emerald-text)', border: `1px solid ${replaceMsg.startsWith('⚠️') ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)'}` }}>{replaceMsg}</div>
              )}
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
