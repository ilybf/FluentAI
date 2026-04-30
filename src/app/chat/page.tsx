"use client";
import { useChat } from 'ai/react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import toast from 'react-hot-toast';
import { Trash2, Plus, MessageCircle, AlertTriangle } from 'lucide-react';

type ChatSessionMeta = {
  _id: string;
  title: string;
  lastActive: string;
};

const PROMPT_SUGGESTIONS = [
  "Can we practice ordering food at a restaurant?",
  "Help me write a formal email to my boss",
  "Let's discuss a current news topic",
  "Quiz me on irregular verbs",
];

export default function ChatTutorPage() {
  const [sessions, setSessions] = useState<ChatSessionMeta[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [sessionsLoaded, setSessionsLoaded] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { messages, setMessages, input, setInput, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: '/api/chat',
    body: {
      sessionId: activeSessionId,
    },
    onResponse: (response) => {
      const newSessionId = response.headers.get('X-Session-Id');
      if (newSessionId && newSessionId !== activeSessionId) {
        setActiveSessionId(newSessionId);
        fetchSessions();
      }
    }
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchSessions = async () => {
    try {
      const res = await fetch('/api/chat');
      const data = await res.json();
      if (Array.isArray(data)) {
        setSessions(data);
      }
    } catch (err) {
      console.error("Failed to fetch sessions", err);
    } finally {
      setSessionsLoaded(true);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const loadSession = async (id: string) => {
    setActiveSessionId(id);
    setLoadingMessages(true);
    setSidebarOpen(false);
    try {
      const res = await fetch(`/api/chat?sessionId=${id}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setMessages(data);
      }
    } catch (err) {
      console.error("Failed to load messages", err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const startNewChat = () => {
    setActiveSessionId(null);
    setMessages([]);
    setSidebarOpen(false);
  };

  const executeDelete = async (id: string) => {
    try {
      await fetch(`/api/chat?sessionId=${id}`, { method: 'DELETE' });
      if (activeSessionId === id) {
        startNewChat();
      }
      fetchSessions();
      toast.success('Conversation deleted');
    } catch (err) {
      console.error('Failed to delete session', err);
      toast.error('Failed to delete conversation');
    }
  };

  const deleteSession = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    toast((t) => (
      <div className="flex flex-col gap-3 p-1">
        <div className="flex items-center gap-2 text-[var(--text-primary)] font-bold">
          <AlertTriangle className="text-[var(--accent-amber)]" size={20} />
          <span>Delete conversation?</span>
        </div>
        <p className="text-sm text-[var(--text-secondary)]">This action cannot be undone.</p>
        <div className="flex justify-end gap-2 mt-2">
          <Button variant="outline" size="sm" onClick={() => toast.dismiss(t.id)}>Cancel</Button>
          <Button size="sm" className="bg-red-500 hover:bg-red-600 text-white" onClick={() => { toast.dismiss(t.id); executeDelete(id); }}>Delete</Button>
        </div>
      </div>
    ), { duration: 5000 });
  };

  const handlePromptClick = (prompt: string) => {
    setInput(prompt);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loadingMessages]);

  return (
    <div className="w-full flex-1 flex flex-col md:flex-row gap-6 relative min-h-0 page-animate">
      
      {/* Mobile Sidebar Toggle */}
      <div className="md:hidden flex items-center justify-between mb-2 px-1">
        <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">AI Tutor</h1>
        <Button variant="outline" size="sm" onClick={() => setSidebarOpen(!sidebarOpen)} className="rounded-xl">
          {sidebarOpen ? 'Close History' : 'View History'}
        </Button>
      </div>

      {/* Mobile Chat Sidebar Backdrop */}
      {sidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 z-10 transition-opacity duration-300"
          style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }}
          onClick={() => setSidebarOpen(false)} 
        />
      )}

      {/* Left Sidebar - Chat History */}
      <Card className={`${sidebarOpen ? 'flex' : 'hidden'} md:flex flex-col w-full md:w-[320px] shrink-0 shadow-sm border-[var(--border-subtle)] absolute md:relative z-20 h-full rounded-[2rem] bg-[var(--bg-card)]`}>
        <div className="p-6 border-b border-[var(--border-subtle)]">
          <Button onClick={startNewChat} className="w-full flex items-center justify-center gap-2 rounded-2xl h-12 text-sm shadow-sm hover:shadow-md transition-shadow">
            <Plus size={18} /> New Conversation
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5 scroll-smooth">
          {!sessionsLoaded && (
            <div className="p-6 text-center text-sm text-[var(--text-muted)] font-medium animate-pulse">Loading...</div>
          )}
          {sessionsLoaded && sessions.length === 0 && (
            <div className="p-6 text-center text-sm text-[var(--text-muted)] font-medium">No previous conversations</div>
          )}
          {sessions.map((s) => (
            <div key={s._id} className="relative group">
              <button
                onClick={() => loadSession(s._id)}
                className="w-full text-left px-4 py-3.5 pr-12 rounded-2xl transition-all duration-200 text-sm flex flex-col gap-1.5"
                style={{
                  background: activeSessionId === s._id ? 'var(--bg-input)' : 'transparent',
                  color: activeSessionId === s._id ? 'var(--text-primary)' : 'var(--text-secondary)',
                }}
              >
                <span className={`font-semibold truncate ${activeSessionId === s._id ? 'text-[var(--text-primary)]' : ''}`}>{s.title}</span>
                <span className="text-[11px] font-medium opacity-70 tracking-wide uppercase">
                  {new Date(s.lastActive).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
              </button>
              <button
                onClick={(e) => deleteSession(e, s._id)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/10 rounded-xl text-red-500"
                title="Delete Conversation"
                aria-label={`Delete conversation: ${s.title}`}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* Right Area - Chat Window */}
      <Card className="flex-1 flex flex-col overflow-hidden shadow-sm border-[var(--border-subtle)] relative z-10 h-full min-h-0 rounded-[2.5rem] bg-[var(--bg-card)]">
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scroll-smooth">
          {loadingMessages && (
             <div className="flex justify-center items-center h-full">
               <div className="flex space-x-2">
                 <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
                 <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                 <div className="w-3 h-3 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
               </div>
             </div>
          )}
          
          {!loadingMessages && messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-6 px-4 animate-in fade-in zoom-in duration-500">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-[var(--accent-blue)]/10 text-[var(--accent-blue)] mb-2 shadow-inner">
                <MessageCircle size={48} />
              </div>
              <div>
                <h3 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Start chatting!</h3>
                <p className="max-w-md mx-auto mt-3 text-[15px] font-medium text-[var(--text-secondary)]">
                  Pick a topic below or type your own message to begin practicing your English.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 w-full max-w-xl">
                {PROMPT_SUGGESTIONS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => handlePromptClick(prompt)}
                    className="text-left p-4 rounded-2xl text-sm font-semibold transition-all duration-300 hover:-translate-y-1 hover:shadow-md group/prompt bg-[var(--bg-input)] border border-transparent hover:border-[var(--accent-blue)]/30 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  >
                    <span>{prompt}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {!loadingMessages && messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4 duration-300`}
            >
              <div
                className={`max-w-[85%] md:max-w-[75%] rounded-[1.5rem] px-6 py-4 text-[15px] leading-relaxed font-medium ${
                  m.role === 'user'
                    ? 'rounded-br-sm shadow-md'
                    : 'rounded-bl-sm border border-[var(--border-subtle)]'
                }`}
                style={m.role === 'user' ? {
                  background: `linear-gradient(135deg, var(--accent-blue), var(--accent-indigo))`,
                  color: '#ffffff',
                } : {
                  background: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                }}
              >
                <div className="prose prose-sm max-w-none dark:prose-invert" style={{ color: 'inherit' }}>
                  {m.role === 'user' ? (
                    m.content
                  ) : (
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start animate-in fade-in">
              <div className="rounded-[1.5rem] rounded-bl-sm px-6 py-4 flex space-x-2 border border-[var(--border-subtle)] bg-[var(--bg-input)]">
                <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                <div className="w-2.5 h-2.5 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
              </div>
            </div>
          )}
          
          {error && (
            <div className="flex justify-center my-6">
              <div className="px-6 py-3 rounded-2xl text-sm font-semibold border flex items-center gap-2" role="alert" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--accent-red)', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
                <AlertTriangle size={18} /> {error.message || 'An error occurred. Please try again.'}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} className="h-1" />
        </div>

        <div className="p-4 md:p-6 border-t border-[var(--border-subtle)] bg-[var(--bg-card)]/50 backdrop-blur-md">
          <form onSubmit={handleSubmit} className="flex gap-3 md:gap-4 max-w-4xl mx-auto">
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder="Type your message in English..."
              className="flex-1 h-14 rounded-2xl text-[15px] font-medium bg-[var(--bg-input)] border-transparent focus:bg-[var(--bg-primary)] focus:border-[var(--accent-blue)] transition-all shadow-inner"
              disabled={isLoading || loadingMessages}
              id="chat-input"
              name="chat-input"
            />
            <Button type="submit" disabled={isLoading || loadingMessages || !input.trim()} className="h-14 px-8 rounded-2xl font-bold shadow-md hover:shadow-lg transition-all">
              Send
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
