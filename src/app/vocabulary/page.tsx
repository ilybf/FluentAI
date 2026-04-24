"use client";
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface VocabEntry {
  _id: string;
  word: string;
  contextSentence: string;
  translatedDefinition: string;
  createdAt: string;
}

function VocabSkeleton() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div><div className="skeleton h-8 w-40 mb-2" /><div className="skeleton h-4 w-64" /></div>
        <div className="skeleton h-10 w-28 rounded-xl" />
      </div>
      <div className="skeleton h-11 w-full rounded-xl" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="p-5">
            <div className="skeleton h-5 w-24 mb-3" />
            <div className="skeleton h-3 w-full mb-2" />
            <div className="skeleton h-3 w-3/4 mb-3" />
            <div className="skeleton h-3 w-16" />
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function VocabularyPage() {
  const [entries, setEntries] = useState<VocabEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form state
  const [word, setWord] = useState('');
  const [contextSentence, setContextSentence] = useState('');
  const [translatedDefinition, setTranslatedDefinition] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchEntries(); }, []);

  const fetchEntries = async () => {
    try { setLoading(true); const res = await fetch('/api/vocabulary'); if (!res.ok) throw new Error('Failed to fetch vocabulary'); setEntries(await res.json()); }
    catch (error: any) { setErrorMsg(error.message); } finally { setLoading(false); }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!word.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/vocabulary', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word, contextSentence: contextSentence || undefined, translatedDefinition: translatedDefinition || undefined }),
      });
      if (!res.ok) throw new Error('Failed to add vocabulary');
      const newEntry = await res.json();
      setEntries(prev => [newEntry, ...prev]);
      setWord(''); setContextSentence(''); setTranslatedDefinition('');
      setShowAddForm(false);
    } catch (error: any) { setErrorMsg(error.message); } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    try { const res = await fetch(`/api/vocabulary?id=${id}`, { method: 'DELETE' }); if (!res.ok) throw new Error('Failed to delete entry'); setEntries(prev => prev.filter(e => e._id !== id)); }
    catch (error: any) { setErrorMsg(error.message); }
  };

  const filteredEntries = entries.filter(e =>
    e.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.contextSentence.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <VocabSkeleton />;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Vocabulary</h1>
          <p className="mt-1 text-sm sm:text-base" style={{ color: 'var(--text-secondary)' }}>Build and review your personal word bank.</p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? 'Cancel' : '+ Add Word'}
        </Button>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl border" role="alert" style={{ background: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.2)', color: 'var(--accent-red)' }}>
          ⚠️ {errorMsg}
          <button className="ml-3 underline text-sm" onClick={() => setErrorMsg('')}>Dismiss</button>
        </div>
      )}

      {showAddForm && (
        <Card className="p-5 sm:p-6">
          <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Add New Word</h2>
          <form onSubmit={handleAdd} className="space-y-4">
            <Input label="Word or Phrase" id="vocab-word" name="word" placeholder="e.g. ubiquitous" value={word} onChange={(e) => setWord(e.target.value)} required />
            <Input label="Context Sentence (optional)" id="vocab-context" name="context" placeholder='e.g. "Smartphones have become ubiquitous in modern society."' value={contextSentence} onChange={(e) => setContextSentence(e.target.value)} />
            <Input label="Definition / Translation (optional)" id="vocab-definition" name="definition" placeholder="Leave blank for AI auto-definition" value={translatedDefinition} onChange={(e) => setTranslatedDefinition(e.target.value)} />
            <Button type="submit" isLoading={saving} disabled={!word.trim()}>Save Word</Button>
          </form>
        </Card>
      )}

      {entries.length > 0 && (
        <div className="w-full">
          <Input placeholder="Search your vocabulary..." id="vocab-search" name="search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
      )}

      {entries.length === 0 ? (
        <Card className="p-8 sm:p-12 text-center">
          <div className="space-y-4">
            <span className="text-5xl sm:text-6xl block">📚</span>
            <h2 className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Your Vocabulary is Empty</h2>
            <p style={{ color: 'var(--text-secondary)' }} className="max-w-md mx-auto text-sm sm:text-base">Start building your word bank by adding new words you encounter during your studies.</p>
            <Button onClick={() => setShowAddForm(true)}>Add Your First Word</Button>
          </div>
        </Card>
      ) : filteredEntries.length === 0 ? (
        <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>No words match &ldquo;{searchQuery}&rdquo;</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEntries.map((entry) => (
            <Card key={entry._id} className="p-4 sm:p-5 flex flex-col group relative">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-lg font-bold" style={{ color: 'var(--accent-blue)' }}>{entry.word}</h3>
                <button onClick={() => handleDelete(entry._id)} className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1.5 rounded-lg text-sm" style={{ color: 'var(--text-muted)' }} title="Delete word" aria-label={`Delete word: ${entry.word}`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
              <p className="mt-2 text-sm italic" style={{ color: 'var(--text-muted)' }}>&ldquo;{entry.contextSentence}&rdquo;</p>
              <p className="mt-2 text-sm flex-1" style={{ color: 'var(--text-secondary)' }}>{entry.translatedDefinition}</p>
              <div className="mt-3 text-xs" style={{ color: 'var(--text-muted)' }}>{new Date(entry.createdAt).toLocaleDateString()}</div>
            </Card>
          ))}
        </div>
      )}

      {entries.length > 0 && (
        <div className="text-center text-sm pb-4" style={{ color: 'var(--text-muted)' }}>{entries.length} word{entries.length !== 1 ? 's' : ''} in your vocabulary</div>
      )}
    </div>
  );
}
