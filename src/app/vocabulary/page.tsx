"use client";
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import toast from 'react-hot-toast';
import { Library, Sparkles, Search, Trash2 } from 'lucide-react';

interface VocabEntry {
  _id: string;
  word: string;
  contextSentence: string;
  translatedDefinition: string;
  createdAt: string;
}

function VocabSkeleton() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 page-animate">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div><div className="skeleton h-10 w-48 mb-3" /><div className="skeleton h-5 w-72" /></div>
        <div className="skeleton h-12 w-32 rounded-2xl" />
      </div>
      <div className="skeleton h-14 w-full rounded-2xl" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="p-6 rounded-[2rem]">
            <div className="skeleton h-6 w-32 mb-4" />
            <div className="skeleton h-4 w-full mb-3" />
            <div className="skeleton h-4 w-3/4 mb-4" />
            <div className="skeleton h-3 w-20 mt-auto" />
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function VocabularyPage() {
  const [entries, setEntries] = useState<VocabEntry[]>([]);
  const [loading, setLoading] = useState(true);
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
    catch (error: any) { toast.error(error.message); } finally { setLoading(false); }
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
      toast.success('Word added successfully!');
    } catch (error: any) { toast.error(error.message); } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    try { const res = await fetch(`/api/vocabulary?id=${id}`, { method: 'DELETE' }); if (!res.ok) throw new Error('Failed to delete entry'); setEntries(prev => prev.filter(e => e._id !== id)); toast.success('Word deleted!'); }
    catch (error: any) { toast.error(error.message); }
  };

  const filteredEntries = entries.filter(e =>
    e.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.contextSentence.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <VocabSkeleton />;

  return (
    <div className="max-w-6xl mx-auto space-y-8 page-animate">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center justify-center w-14 h-14 rounded-2xl bg-[var(--accent-emerald)]/10 text-[var(--accent-emerald)] shadow-inner">
            <Library size={28} />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>Vocabulary</h1>
            <p className="mt-1.5 text-[16px] font-medium" style={{ color: 'var(--text-secondary)' }}>Build and review your personal word bank.</p>
          </div>
        </div>
        <Button 
          onClick={() => setShowAddForm(!showAddForm)}
          className={`h-12 px-6 rounded-2xl font-bold shadow-md transition-all ${showAddForm ? 'bg-[var(--bg-input)] text-[var(--text-primary)] hover:bg-[var(--bg-card)]' : 'bg-[var(--accent-blue)] text-white hover:shadow-lg'}`}
          variant={showAddForm ? 'outline' : 'primary'}
        >
          {showAddForm ? 'Cancel' : '+ Add Word'}
        </Button>
      </div>


      {showAddForm && (
        <Card className="p-6 sm:p-8 rounded-[2.5rem] border-[var(--border-subtle)] shadow-sm bg-[var(--bg-card)] animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles size={24} className="text-[var(--accent-blue)]" />
            <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Add New Word</h2>
          </div>
          <form onSubmit={handleAdd} className="space-y-5 max-w-2xl">
            <Input 
              label="Word or Phrase" 
              id="vocab-word" 
              name="word" 
              placeholder="e.g. ubiquitous" 
              value={word} 
              onChange={(e) => setWord(e.target.value)} 
              required 
              className="h-14 rounded-2xl bg-[var(--bg-input)] border-transparent focus:bg-[var(--bg-primary)] focus:border-[var(--accent-blue)]"
            />
            <Input 
              label="Context Sentence (optional)" 
              id="vocab-context" 
              name="context" 
              placeholder='e.g. "Smartphones have become ubiquitous in modern society."' 
              value={contextSentence} 
              onChange={(e) => setContextSentence(e.target.value)} 
              className="h-14 rounded-2xl bg-[var(--bg-input)] border-transparent focus:bg-[var(--bg-primary)] focus:border-[var(--accent-blue)]"
            />
            <Input 
              label="Definition / Translation (optional)" 
              id="vocab-definition" 
              name="definition" 
              placeholder="Leave blank for AI auto-definition" 
              value={translatedDefinition} 
              onChange={(e) => setTranslatedDefinition(e.target.value)} 
              className="h-14 rounded-2xl bg-[var(--bg-input)] border-transparent focus:bg-[var(--bg-primary)] focus:border-[var(--accent-blue)]"
            />
            <div className="pt-2">
              <Button type="submit" isLoading={saving} disabled={!word.trim()} className="h-14 px-8 rounded-2xl font-bold shadow-md hover:shadow-lg transition-all">
                Save Word &rarr;
              </Button>
            </div>
          </form>
        </Card>
      )}

      {entries.length > 0 && (
        <div className="w-full relative">
          <Input 
            placeholder="Search your vocabulary..." 
            id="vocab-search" 
            name="search" 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
            className="h-14 rounded-2xl bg-[var(--bg-card)] border-[var(--border-subtle)] focus:border-[var(--accent-blue)] pl-12 text-[15px] font-medium shadow-sm"
          />
          <span className="absolute left-4 top-1/2 -translate-y-1/2 opacity-50"><Search size={20} /></span>
        </div>
      )}

      {entries.length === 0 ? (
        <Card className="p-10 sm:p-16 text-center rounded-[2.5rem] border-[var(--border-subtle)] shadow-sm bg-[var(--bg-card)]/50 backdrop-blur-md">
          <div className="space-y-6">
            <div className="w-24 h-24 rounded-full bg-[var(--bg-input)] flex items-center justify-center mx-auto mb-6 text-[var(--text-muted)]">
              <Library size={48} />
            </div>
            <h2 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Your Vocabulary is Empty</h2>
            <p style={{ color: 'var(--text-secondary)' }} className="max-w-md mx-auto text-[16px] font-medium">Start building your word bank by adding new words you encounter during your studies.</p>
            <Button onClick={() => setShowAddForm(true)} className="h-14 px-8 rounded-2xl font-bold shadow-lg">
              Add Your First Word
            </Button>
          </div>
        </Card>
      ) : filteredEntries.length === 0 ? (
        <div className="text-center py-16 text-[16px] font-medium bg-[var(--bg-card)] rounded-[2.5rem] border border-[var(--border-subtle)]" style={{ color: 'var(--text-muted)' }}>
          No words match &ldquo;{searchQuery}&rdquo;
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEntries.map((entry) => (
            <Card key={entry._id} className="p-6 flex flex-col group relative rounded-[2rem] border-[var(--border-subtle)] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl bg-[var(--bg-card)]">
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="text-xl font-bold break-words pr-8 leading-tight group-hover:text-[var(--accent-blue)] transition-colors" style={{ color: 'var(--text-primary)' }}>{entry.word}</h3>
                <button onClick={() => handleDelete(entry._id)} className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 rounded-xl text-sm bg-[var(--accent-red)]/10 text-[var(--accent-red)] hover:bg-[var(--accent-red)] hover:text-white" title="Delete word" aria-label={`Delete word: ${entry.word}`}>
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="flex-1 space-y-3">
                {entry.translatedDefinition && (
                  <p className="text-[15px] font-medium leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {entry.translatedDefinition}
                  </p>
                )}
                {entry.contextSentence && (
                  <p className="text-[14px] italic leading-relaxed p-3 rounded-xl bg-[var(--bg-input)]" style={{ color: 'var(--text-muted)' }}>
                    &ldquo;{entry.contextSentence}&rdquo;
                  </p>
                )}
              </div>
              <div className="mt-6 pt-4 border-t border-[var(--border-subtle)] text-[12px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                Added {new Date(entry.createdAt).toLocaleDateString()}
              </div>
            </Card>
          ))}
        </div>
      )}

      {entries.length > 0 && (
        <div className="text-center font-bold tracking-wider uppercase text-[12px] pb-6" style={{ color: 'var(--text-muted)' }}>
          {entries.length} word{entries.length !== 1 ? 's' : ''} in total
        </div>
      )}
    </div>
  );
}
