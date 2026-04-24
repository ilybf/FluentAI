"use client";
import { useChat } from 'ai/react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';

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

  useEffect(() => {
    if (sessionsLoaded && sessions.length > 0 && activeSessionId === null) {
      loadSession(sessions[0]._id);
    }
  }, [sessionsLoaded, sessions]);

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

  const deleteSession = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this conversation?')) return;
    
    try {
      await fetch(`/api/chat?sessionId=${id}`, { method: 'DELETE' });
      if (activeSessionId === id) {
        startNewChat();
      }
      fetchSessions();
    } catch (err) {
      console.error('Failed to delete session', err);
    }
  };

  const handlePromptClick = (prompt: string) => {
    setInput(prompt);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loadingMessages]);

  return (
    <div className="max-w-6xl mx-auto h-[calc(100dvh-6.5rem)] md:h-[calc(100vh-6rem)] flex flex-col md:flex-row gap-4 sm:gap-6 relative">
      
      {/* Mobile Sidebar Toggle */}
      <div className="md:hidden flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>AI Tutor</h1>
        <Button variant="outline" size="sm" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? 'Close History' : 'View History'}
        </Button>
      </div>

      {/* Mobile Chat Sidebar Backdrop */}
      {sidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 z-10 transition-opacity duration-200"
          style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }}
          onClick={() => setSidebarOpen(false)} 
        />
      )}

      {/* Left Sidebar - Chat History */}
      <Card className={`${sidebarOpen ? 'flex' : 'hidden'} md:flex flex-col w-full md:w-72 shrink-0 shadow-lg absolute md:relative z-20 h-[calc(100dvh-10.5rem)] md:h-full`}>
        <div className="p-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
          <Button onClick={startNewChat} className="w-full flex items-center justify-center gap-2">
            <span>+</span> New Conversation
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {!sessionsLoaded && (
            <div className="p-4 text-center text-sm" style={{ color: 'var(--text-muted)' }}>Loading...</div>
          )}
          {sessionsLoaded && sessions.length === 0 && (
            <div className="p-4 text-center text-sm" style={{ color: 'var(--text-muted)' }}>No previous conversations</div>
          )}
          {sessions.map((s) => (
            <div key={s._id} className="relative group">
              <button
                onClick={() => loadSession(s._id)}
                className="w-full text-left px-3 py-3 pr-10 rounded-xl transition-colors text-sm truncate flex flex-col gap-1"
                style={{
                  background: activeSessionId === s._id ? 'var(--bg-input)' : 'transparent',
                  color: activeSessionId === s._id ? 'var(--text-primary)' : 'var(--text-secondary)',
                  border: activeSessionId === s._id ? '1px solid var(--border-subtle)' : '1px solid transparent',
                }}
              >
                <span className="font-medium truncate">{s.title}</span>
                <span className="text-xs opacity-70">
                  {new Date(s.lastActive).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </button>
              <button
                onClick={(e) => deleteSession(e, s._id)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/10 rounded-lg"
                style={{ color: 'var(--accent-red)' }}
                title="Delete Conversation"
                aria-label={`Delete conversation: ${s.title}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* Right Area - Chat Window */}
      <Card className="flex-1 flex flex-col overflow-hidden shadow-xl relative z-10 h-full">
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
          {loadingMessages && (
             <div className="flex justify-center items-center h-full">
               <div className="flex space-x-2">
                 <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
                 <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                 <div className="w-3 h-3 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
               </div>
             </div>
          )}
          
          {!loadingMessages && messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 px-4">
              <div className="text-5xl sm:text-6xl inline-flex items-center justify-center w-16 sm:w-20 h-16 sm:h-20 rounded-2xl" style={{ background: 'rgba(59,130,246,0.1)' }}>👋</div>
              <div>
                <h3 className="text-lg sm:text-xl font-medium" style={{ color: 'var(--text-primary)' }}>Start a new conversation!</h3>
                <p className="max-w-sm mx-auto mt-2 text-sm sm:text-base" style={{ color: 'var(--text-secondary)' }}>
                  Pick a topic below or type your own message to begin.
                </p>
              </div>
              {/* Prompt Suggestions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 w-full max-w-md">
                {PROMPT_SUGGESTIONS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => handlePromptClick(prompt)}
                    className="text-left p-3 rounded-xl text-sm transition-all duration-200 hover:scale-[1.02] group/prompt"
                    style={{
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    <span className="group-hover/prompt:text-blue-400 transition-colors">{prompt}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {!loadingMessages && messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[80%] rounded-2xl px-4 sm:px-5 py-3 text-sm sm:text-base ${
                  m.role === 'user'
                    ? 'rounded-br-none shadow-lg'
                    : 'rounded-bl-none'
                }`}
                style={m.role === 'user' ? {
                  background: `linear-gradient(to right, var(--accent-blue), var(--accent-indigo))`,
                  color: '#ffffff',
                  boxShadow: '0 4px 14px rgba(59,130,246,0.15)',
                } : {
                  background: 'var(--glass-bg)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-subtle)',
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
            <div className="flex justify-start">
              <div className="rounded-2xl rounded-bl-none px-5 py-3 flex space-x-2" style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-subtle)' }}>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          )}
          {error && (
            <div className="flex justify-center my-4">
              <div className="px-4 py-2 rounded-xl text-sm" role="alert" style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--accent-red)', border: '1px solid rgba(239,68,68,0.2)' }}>
                ⚠️ {error.message || 'An error occurred while communicating with the AI tutor.'}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-3 sm:p-4" style={{ background: 'var(--glass-bg)', borderTop: '1px solid var(--border-subtle)' }}>
          <form onSubmit={handleSubmit} className="flex gap-3 sm:gap-4">
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder="Type your message in English..."
              className="flex-1"
              disabled={isLoading || loadingMessages}
              id="chat-input"
              name="chat-input"
            />
            <Button type="submit" disabled={isLoading || loadingMessages || !input.trim()}>
              Send
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
