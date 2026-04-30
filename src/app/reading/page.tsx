"use client";
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';
import { BookOpen, Library, FileText, HelpCircle, Sparkles, ArrowRight, ArrowLeft, AlertTriangle } from 'lucide-react';

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
    A1: { bg: 'rgba(16,185,129,0.1)', color: 'var(--accent-emerald)', border: 'rgba(16,185,129,0.2)' },
    A2: { bg: 'rgba(16,185,129,0.1)', color: 'var(--accent-emerald)', border: 'rgba(16,185,129,0.2)' },
    B1: { bg: 'rgba(59,130,246,0.1)', color: 'var(--accent-blue)', border: 'rgba(59,130,246,0.2)' },
    B2: { bg: 'rgba(59,130,246,0.1)', color: 'var(--accent-blue)', border: 'rgba(59,130,246,0.2)' },
    C1: { bg: 'rgba(139,92,246,0.1)', color: 'var(--accent-violet)', border: 'rgba(139,92,246,0.2)' },
    C2: { bg: 'rgba(139,92,246,0.1)', color: 'var(--accent-violet)', border: 'rgba(139,92,246,0.2)' },
  };
  return map[level] || map.B1;
}

function ReadingSkeleton() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 page-animate">
      <div className="flex flex-col items-center mb-10"><div className="skeleton h-16 w-16 rounded-[1.5rem] mb-4" /><div className="skeleton h-10 w-64 mb-3" /><div className="skeleton h-5 w-96" /></div>
      <div className="flex flex-wrap justify-center gap-3 mb-8">{[...Array(7)].map((_, i) => <div key={i} className="skeleton h-12 w-20 rounded-2xl" />)}</div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="p-6 rounded-[2rem]">
            <div className="flex items-start justify-between gap-3 mb-4"><div className="skeleton h-6 w-3/4 rounded-lg" /><div className="skeleton h-6 w-12 rounded-full" /></div>
            <div className="skeleton h-4 w-full mb-3 rounded-md" /><div className="skeleton h-4 w-full mb-3 rounded-md" /><div className="skeleton h-4 w-2/3 mb-4 rounded-md" />
            <div className="skeleton h-8 w-24 rounded-lg mt-auto" />
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

  useEffect(() => { fetchPassages(); }, []);

  const fetchPassages = async () => {
    try { setLoading(true); const res = await fetch('/api/reading'); if (!res.ok) throw new Error('Failed to fetch passages'); setPassages(await res.json()); }
    catch (error: any) { toast.error(error.message); } finally { setLoading(false); }
  };

  const filteredPassages = activeLevel === 'All' ? passages : passages.filter(p => p.level === activeLevel);
  const handleAnswer = (qi: number, oi: number) => { if (submitted) return; setAnswers(prev => ({ ...prev, [qi]: oi })); };
  const handleSubmitAnswers = () => setSubmitted(true);
  const handleReset = () => { setAnswers({}); setSubmitted(false); };

  const getScore = () => { if (!selectedPassage) return 0; return selectedPassage.questions.filter((q, i) => answers[i] === q.correctIndex).length; };
  const isPerfectScore = () => selectedPassage ? getScore() === selectedPassage.questions.length : false;

  const handleCompletePassage = async () => {
    if (!selectedPassage) return;
    setReplacing(true);
    try {
      const res = await fetch('/api/reading', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ passageId: selectedPassage._id, quizScore: { correct: getScore(), total: selectedPassage.questions.length } }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to replace passage');

      // Check for level-up: if user leveled up, re-fetch all passages
      // so the list updates to show stories for the new CEFR level
      const didLevelUp = data.xp?.leveledUp;

      if (didLevelUp) {
        toast.success(`🎉 Level up! You're now ${data.xp.newLevel}! Loading new stories...`, { duration: 4000 });
        // Re-fetch passages to match the new level filter
        setTimeout(async () => {
          setSelectedPassage(null);
          handleReset();
          try {
            const freshRes = await fetch('/api/reading');
            if (freshRes.ok) setPassages(await freshRes.json());
          } catch {}
        }, 2500);
      } else if (data.replaced && data.newPassage) {
        setPassages(prev => prev.map(p => p._id === selectedPassage._id ? data.newPassage : p));
        toast.success('New passage generated! Going back to the list...');
        setTimeout(() => { setSelectedPassage(null); handleReset(); }, 2000);
      } else {
        setPassages(prev => prev.filter(p => p._id !== selectedPassage._id));
        toast.success(data.reason || 'Passage completed. Refresh later for a new one.');
        setTimeout(() => { setSelectedPassage(null); handleReset(); }, 2000);
      }
    } catch (error: any) { toast.error(error.message); } finally { setReplacing(false); }
  };

  if (loading) return <ReadingSkeleton />;

  return (
    <div className="max-w-6xl mx-auto space-y-8 page-animate">
      
      {!selectedPassage && (
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-[1.5rem] mb-4 bg-[var(--accent-emerald)]/10 text-[var(--accent-emerald)] shadow-inner">
            <BookOpen size={32} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3" style={{ color: 'var(--text-primary)' }}>Reading Practice</h1>
          <p className="text-[17px] font-medium" style={{ color: 'var(--text-secondary)' }}>Read passages tailored to your level, answer questions, and unlock fresh AI-generated stories.</p>
        </div>
      )}


      {!selectedPassage ? (
        <>
          <div className="flex flex-wrap justify-center gap-3 mb-8" role="tablist" aria-label="Filter by level">
            {LEVELS.map((level) => {
              const isActive = activeLevel === level;
              const count = level === 'All' ? passages.length : passages.filter(p => p.level === level).length;
              return (
                <button key={level} onClick={() => setActiveLevel(level)} role="tab" aria-selected={isActive}
                  className="px-6 py-3 rounded-2xl text-[15px] font-bold transition-all duration-300 shadow-sm hover:shadow-md"
                  style={isActive ? { background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-indigo))', color: '#fff', border: '1px solid transparent', transform: 'translateY(-2px)' } : { background: 'var(--bg-card)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}
                >{level} {count > 0 && <span className={isActive ? "ml-1.5 opacity-80 font-medium" : "ml-1.5 opacity-60 font-medium"}>({count})</span>}</button>
              );
            })}
          </div>

          {filteredPassages.length === 0 ? (
            <Card className="p-10 sm:p-16 text-center rounded-[2.5rem] border-[var(--border-subtle)] shadow-sm bg-[var(--bg-card)]/50 backdrop-blur-md">
              <div className="space-y-6">
                <div className="w-24 h-24 rounded-full bg-[var(--bg-input)] flex items-center justify-center mx-auto mb-6 text-[var(--text-muted)]">
                  <Library size={40} />
                </div>
                <h2 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>{passages.length === 0 ? 'No Reading Passages Yet' : `No ${activeLevel} Passages Available`}</h2>
                <p style={{ color: 'var(--text-secondary)' }} className="max-w-md mx-auto text-[16px] font-medium">{passages.length === 0 ? "Loading initial passages... Try refreshing the page." : `You've completed all ${activeLevel} passages! Check back soon or try another level.`}</p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPassages.map((passage) => {
                const lc = getLevelColor(passage.level);
                return (
                  <Card key={passage._id} className="group p-6 sm:p-8 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl rounded-[2rem] border-[var(--border-subtle)] flex flex-col h-full bg-[var(--bg-card)]">
                    <button onClick={() => { setSelectedPassage(passage); handleReset(); }} className="w-full text-left flex flex-col h-full">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <h3 className="text-xl font-bold leading-tight group-hover:text-[var(--accent-blue)] transition-colors line-clamp-2" style={{ color: 'var(--text-primary)' }}>{passage.title}</h3>
                        <span className="shrink-0 text-[13px] px-3 py-1.5 rounded-xl font-bold uppercase tracking-wider" style={{ background: lc.bg, color: lc.color, border: `1px solid ${lc.border}` }}>{passage.level}</span>
                      </div>
                      <p className="mb-6 text-[15px] leading-relaxed font-medium line-clamp-3 flex-1" style={{ color: 'var(--text-secondary)' }}>{passage.content.slice(0, 160)}...</p>
                      
                      <div className="mt-auto flex items-center justify-between pt-4 border-t border-[var(--border-subtle)]">
                        <div className="text-[13px] font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                          <FileText size={16} /> {passage.questions.length} Question{passage.questions.length !== 1 ? 's' : ''}
                        </div>
                        <span className="text-[var(--accent-blue)] opacity-0 group-hover:opacity-100 transition-opacity"><ArrowRight size={20} /></span>
                      </div>
                    </button>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      ) : (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
          <nav aria-label="Breadcrumb" className="flex items-center gap-3 text-[15px] font-semibold bg-[var(--bg-card)] p-4 rounded-2xl border border-[var(--border-subtle)] shadow-sm w-fit">
            <button onClick={() => { setSelectedPassage(null); handleReset(); }} className="hover:text-[var(--accent-blue)] transition-colors flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
              <ArrowLeft size={16} /> Reading
            </button>
            <span style={{ color: 'var(--border-subtle)' }}>/</span>
            <span className="truncate max-w-[200px] sm:max-w-[400px]" style={{ color: 'var(--text-primary)' }}>{selectedPassage.title}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <Card className="lg:col-span-3 p-6 sm:p-10 rounded-[2.5rem] border-[var(--border-subtle)] shadow-sm bg-[var(--bg-card)]">
              <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-8 pb-6 border-b border-[var(--border-subtle)]">
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>{selectedPassage.title}</h2>
                <span className="shrink-0 text-[14px] px-4 py-2 rounded-xl font-bold uppercase tracking-wider" style={{ background: getLevelColor(selectedPassage.level).bg, color: getLevelColor(selectedPassage.level).color, border: `1px solid ${getLevelColor(selectedPassage.level).border}` }}>Level {selectedPassage.level}</span>
              </div>
              <div className="prose prose-sm sm:prose-base max-w-none whitespace-pre-wrap text-[16px] sm:text-[17px] font-medium" style={{ color: 'var(--text-primary)', lineHeight: '1.9' }}>{selectedPassage.content}</div>
            </Card>

            {selectedPassage.questions.length > 0 && (
              <div className="lg:col-span-2 space-y-6">
                <Card className="p-6 sm:p-8 rounded-[2.5rem] border-[var(--border-subtle)] shadow-sm bg-[var(--bg-card)] sticky top-6">
                  <h3 className="text-xl font-bold mb-8 flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
                    <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--accent-blue)]/10 text-[var(--accent-blue)]"><HelpCircle size={20} /></span>
                    Comprehension
                  </h3>
                  
                  <div className="space-y-10">
                    {selectedPassage.questions.map((q, qi) => (
                      <div key={qi} className="space-y-4">
                        <p className="font-bold text-[16px] leading-snug" style={{ color: 'var(--text-primary)' }}>
                          <span className="text-[var(--accent-blue)] mr-2">{qi + 1}.</span> 
                          {q.text}
                        </p>
                        <div className="flex flex-col gap-3" role="radiogroup" aria-label={`Question ${qi + 1}`}>
                          {q.options.map((opt, oi) => {
                            const isSelected = answers[qi] === oi;
                            const isCorrect = submitted && q.correctIndex === oi;
                            const isWrong = submitted && isSelected && q.correctIndex !== oi;
                            
                            let s: React.CSSProperties = { background: 'var(--bg-input)', borderColor: 'transparent', color: 'var(--text-secondary)' };
                            let ringClass = "hover:border-[var(--accent-blue)]/50";
                            
                            if (isSelected && !submitted) {
                              s = { background: 'var(--accent-blue)', borderColor: 'var(--accent-blue)', color: '#fff' };
                              ringClass = "shadow-md shadow-blue-500/20";
                            }
                            else if (isCorrect) {
                              s = { background: 'var(--accent-emerald)', borderColor: 'var(--accent-emerald)', color: '#fff' };
                              ringClass = "shadow-md shadow-emerald-500/20";
                            }
                            else if (isWrong) {
                              s = { background: 'var(--accent-red)', borderColor: 'var(--accent-red)', color: '#fff' };
                              ringClass = "shadow-md shadow-red-500/20";
                            }
                            
                            return (
                              <button 
                                key={oi} 
                                onClick={() => handleAnswer(qi, oi)} 
                                disabled={submitted} 
                                role="radio" 
                                aria-checked={isSelected} 
                                className={`text-left px-5 py-4 rounded-2xl border-2 text-[15px] font-semibold transition-all duration-200 disabled:cursor-default ${ringClass}`} 
                                style={s}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-10 pt-8 border-t border-[var(--border-subtle)] flex flex-col gap-4">
                    {!submitted ? (
                      <Button 
                        onClick={handleSubmitAnswers} 
                        disabled={Object.keys(answers).length < selectedPassage.questions.length}
                        className="w-full h-14 rounded-2xl font-bold text-[16px] shadow-lg hover:shadow-xl transition-shadow"
                      >
                        Submit Answers
                      </Button>
                    ) : (
                      <div className="flex flex-col gap-6 animate-in fade-in zoom-in-95">
                        <div className="flex items-center justify-between p-5 rounded-2xl bg-[var(--bg-input)] border border-[var(--border-subtle)]">
                          <span className="font-bold text-[var(--text-secondary)]">Final Score</span>
                          <span className="text-2xl font-black" style={{ color: isPerfectScore() ? 'var(--accent-emerald)' : 'var(--accent-amber)' }}>
                            {getScore()} <span className="text-lg text-[var(--text-muted)]">/ {selectedPassage.questions.length}</span>
                          </span>
                        </div>
                        {isPerfectScore() ? (
                          <Button 
                            onClick={handleCompletePassage} 
                            isLoading={replacing} 
                            disabled={replacing}
                            className="w-full h-14 rounded-2xl font-bold text-[16px] shadow-lg shadow-emerald-500/20 bg-[var(--accent-emerald)] hover:bg-emerald-500 text-white flex items-center justify-center gap-2"
                          >
                            {replacing ? 'Generating...' : <><Sparkles size={18} /> Next Story</>}
                          </Button>
                        ) : (
                          <Button variant="outline" onClick={handleReset} className="w-full h-14 rounded-2xl font-bold text-[16px] border-2">
                            Try Again
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                  
                </Card>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
