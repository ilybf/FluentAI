"use client";
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

const LEVELS = ['All', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;

interface Passage {
  _id: string;
  title: string;
  content: string;
  level: string;
  questions: {
    text: string;
    options: string[];
    correctIndex: number;
  }[];
}

// Level badge colors
function getLevelColor(level: string) {
  switch (level) {
    case 'A1': return { bg: 'rgba(16,185,129,0.15)', color: '#34d399', border: 'rgba(16,185,129,0.25)' };
    case 'A2': return { bg: 'rgba(52,211,153,0.15)', color: '#6ee7b7', border: 'rgba(52,211,153,0.25)' };
    case 'B1': return { bg: 'rgba(59,130,246,0.15)', color: '#60a5fa', border: 'rgba(59,130,246,0.25)' };
    case 'B2': return { bg: 'rgba(99,102,241,0.15)', color: '#818cf8', border: 'rgba(99,102,241,0.25)' };
    case 'C1': return { bg: 'rgba(168,85,247,0.15)', color: '#c084fc', border: 'rgba(168,85,247,0.25)' };
    case 'C2': return { bg: 'rgba(236,72,153,0.15)', color: '#f472b6', border: 'rgba(236,72,153,0.25)' };
    default:   return { bg: 'rgba(59,130,246,0.15)', color: '#60a5fa', border: 'rgba(59,130,246,0.25)' };
  }
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

  useEffect(() => {
    fetchPassages();
  }, []);

  const fetchPassages = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/reading');
      if (!res.ok) throw new Error('Failed to fetch passages');
      const data = await res.json();
      setPassages(data);
    } catch (error: any) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredPassages = activeLevel === 'All'
    ? passages
    : passages.filter(p => p.level === activeLevel);

  const handleAnswer = (questionIndex: number, optionIndex: number) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [questionIndex]: optionIndex }));
  };

  const handleSubmitAnswers = () => {
    setSubmitted(true);
  };

  const handleReset = () => {
    setAnswers({});
    setSubmitted(false);
    setReplaceMsg('');
  };

  const getScore = () => {
    if (!selectedPassage) return 0;
    let correct = 0;
    selectedPassage.questions.forEach((q, i) => {
      if (answers[i] === q.correctIndex) correct++;
    });
    return correct;
  };

  const isPerfectScore = () => {
    if (!selectedPassage) return false;
    return getScore() === selectedPassage.questions.length;
  };

  /**
   * Called when user gets a perfect score — sends the passageId to the API
   * which deletes it and generates a fresh AI replacement.
   */
  const handleCompletePassage = async () => {
    if (!selectedPassage) return;
    setReplacing(true);
    setReplaceMsg('');

    try {
      const res = await fetch('/api/reading', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passageId: selectedPassage._id }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to replace passage');
      }

      if (data.replaced && data.newPassage) {
        // Swap the completed passage with the new one in local state
        setPassages(prev =>
          prev.map(p => p._id === selectedPassage._id ? data.newPassage : p)
        );
        setReplaceMsg('✨ New passage generated! Going back to the list...');
      } else {
        // AI was unavailable — just remove the completed one from local state
        setPassages(prev => prev.filter(p => p._id !== selectedPassage._id));
        setReplaceMsg(data.reason || 'Passage completed. Refresh later for a new one.');
      }

      // Go back to list after a short delay
      setTimeout(() => {
        setSelectedPassage(null);
        handleReset();
      }, 2000);

    } catch (error: any) {
      setReplaceMsg(`⚠️ ${error.message}`);
    } finally {
      setReplacing(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-500/30 border-t-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Reading Practice</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Read passages, answer questions, and get fresh AI-generated stories when you master them.</p>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl border" style={{ background: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.2)', color: '#f87171' }}>
          ⚠️ {errorMsg}
        </div>
      )}

      {!selectedPassage ? (
        <>
          {/* Level filter tabs */}
          <div className="flex flex-wrap gap-2">
            {LEVELS.map((level) => {
              const isActive = activeLevel === level;
              const count = level === 'All' ? passages.length : passages.filter(p => p.level === level).length;
              return (
                <button
                  key={level}
                  onClick={() => setActiveLevel(level)}
                  className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 theme-transition"
                  style={isActive ? {
                    background: 'linear-gradient(to right, rgba(59,130,246,0.2), rgba(99,102,241,0.15))',
                    color: 'var(--accent-blue)',
                    border: '1px solid rgba(59,130,246,0.3)',
                  } : {
                    background: 'var(--bg-input)',
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  {level} {count > 0 && <span className="ml-1 opacity-60">({count})</span>}
                </button>
              );
            })}
          </div>

          {filteredPassages.length === 0 ? (
            <Card className="p-8 sm:p-12 text-center">
              <div className="space-y-4">
                <span className="text-5xl sm:text-6xl block">📖</span>
                <h2 className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {passages.length === 0 ? 'No Reading Passages Yet' : `No ${activeLevel} Passages`}
                </h2>
                <p style={{ color: 'var(--text-secondary)' }} className="max-w-md mx-auto text-sm sm:text-base">
                  {passages.length === 0
                    ? "Loading initial passages... Try refreshing the page."
                    : `You've completed all ${activeLevel} passages! New ones will be generated as you practice.`
                  }
                </p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {filteredPassages.map((passage) => {
                const levelColor = getLevelColor(passage.level);
                return (
                  <Card
                    key={passage._id}
                    className="p-5 sm:p-6 cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/5"
                  >
                    <button
                      onClick={() => { setSelectedPassage(passage); handleReset(); }}
                      className="w-full text-left"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-base sm:text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{passage.title}</h3>
                        <span
                          className="shrink-0 text-xs px-2.5 py-1 rounded-full font-medium"
                          style={{ background: levelColor.bg, color: levelColor.color, border: `1px solid ${levelColor.border}` }}
                        >
                          {passage.level}
                        </span>
                      </div>
                      <p className="mt-2 text-sm line-clamp-3" style={{ color: 'var(--text-secondary)' }}>
                        {passage.content.slice(0, 150)}...
                      </p>
                      <div className="mt-3 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                        {passage.questions.length} question{passage.questions.length !== 1 ? 's' : ''}
                      </div>
                    </button>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      ) : (
        <div className="space-y-6">
          <button
            onClick={() => { setSelectedPassage(null); handleReset(); }}
            className="inline-flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-80"
            style={{ color: 'var(--text-secondary)' }}
          >
            ← Back to Passages
          </button>

          <Card className="p-5 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start justify-between gap-3 mb-6">
              <h2 className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{selectedPassage.title}</h2>
              <span
                className="shrink-0 text-xs px-2.5 py-1 rounded-full font-medium"
                style={{
                  background: getLevelColor(selectedPassage.level).bg,
                  color: getLevelColor(selectedPassage.level).color,
                  border: `1px solid ${getLevelColor(selectedPassage.level).border}`,
                }}
              >
                {selectedPassage.level}
              </span>
            </div>
            <div
              className="prose prose-sm sm:prose max-w-none leading-relaxed whitespace-pre-wrap text-sm sm:text-base"
              style={{ color: 'var(--text-secondary)' }}
            >
              {selectedPassage.content}
            </div>
          </Card>

          {selectedPassage.questions.length > 0 && (
            <Card className="p-5 sm:p-8">
              <h3 className="text-lg sm:text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Comprehension Questions</h3>
              <div className="space-y-6">
                {selectedPassage.questions.map((q, qi) => (
                  <div key={qi} className="space-y-3">
                    <p className="font-medium text-sm sm:text-base" style={{ color: 'var(--text-primary)' }}>
                      {qi + 1}. {q.text}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {q.options.map((opt, oi) => {
                        const isSelected = answers[qi] === oi;
                        const isCorrect = submitted && q.correctIndex === oi;
                        const isWrong = submitted && isSelected && q.correctIndex !== oi;

                        let optStyle: React.CSSProperties = {
                          background: 'var(--bg-input)',
                          borderColor: 'var(--border-input)',
                          color: 'var(--text-secondary)',
                        };

                        if (isSelected && !submitted) {
                          optStyle = {
                            background: 'rgba(59,130,246,0.15)',
                            borderColor: 'rgba(59,130,246,0.4)',
                            color: '#60a5fa',
                          };
                        } else if (isCorrect) {
                          optStyle = {
                            background: 'rgba(16,185,129,0.15)',
                            borderColor: 'rgba(16,185,129,0.4)',
                            color: '#34d399',
                          };
                        } else if (isWrong) {
                          optStyle = {
                            background: 'rgba(239,68,68,0.15)',
                            borderColor: 'rgba(239,68,68,0.4)',
                            color: '#f87171',
                          };
                        }

                        return (
                          <button
                            key={oi}
                            onClick={() => handleAnswer(qi, oi)}
                            disabled={submitted}
                            className="text-left p-3 rounded-xl border text-sm transition-all duration-200 disabled:cursor-default"
                            style={optStyle}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
                {!submitted ? (
                  <Button
                    onClick={handleSubmitAnswers}
                    disabled={Object.keys(answers).length < selectedPassage.questions.length}
                  >
                    Submit Answers
                  </Button>
                ) : (
                  <>
                    <div className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                      Score: <span className={isPerfectScore() ? 'text-emerald-400' : 'text-amber-400'}>
                        {getScore()}/{selectedPassage.questions.length}
                      </span>
                    </div>

                    {isPerfectScore() ? (
                      <Button
                        onClick={handleCompletePassage}
                        isLoading={replacing}
                        disabled={replacing}
                      >
                        {replacing ? 'Generating new passage...' : '✨ Complete & Get New Passage'}
                      </Button>
                    ) : (
                      <Button variant="outline" onClick={handleReset}>
                        Try Again
                      </Button>
                    )}
                  </>
                )}
              </div>

              {/* Replace status message */}
              {replaceMsg && (
                <div className="mt-4 p-3 rounded-xl text-sm" style={{
                  background: replaceMsg.startsWith('⚠️') ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
                  color: replaceMsg.startsWith('⚠️') ? '#f87171' : '#34d399',
                  border: `1px solid ${replaceMsg.startsWith('⚠️') ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)'}`,
                }}>
                  {replaceMsg}
                </div>
              )}
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
