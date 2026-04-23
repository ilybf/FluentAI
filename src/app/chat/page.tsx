"use client";
import { useChat } from 'ai/react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useEffect, useRef } from 'react';

export default function ChatTutorPage() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: '/api/chat',
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-6rem)] flex flex-col">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>AI English Tutor</h1>
        <p style={{ color: 'var(--text-secondary)' }} className="text-sm sm:text-base">Practice your English conversation skills with real-time corrections.</p>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden shadow-xl">
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 px-4">
              <div className="text-5xl sm:text-6xl inline-flex items-center justify-center w-16 sm:w-20 h-16 sm:h-20 rounded-2xl" style={{ background: 'rgba(59,130,246,0.1)' }}>👋</div>
              <div>
                <h3 className="text-lg sm:text-xl font-medium" style={{ color: 'var(--text-primary)' }}>Start a conversation!</h3>
                <p className="max-w-sm mx-auto mt-2 text-sm sm:text-base" style={{ color: 'var(--text-secondary)' }}>
                  Try asking: &ldquo;Can we practice ordering food in a restaurant?&rdquo; or &ldquo;Can you explain the past perfect tense?&rdquo;
                </p>
              </div>
            </div>
          )}
          
          {messages.map((m) => (
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
                <div className="prose prose-sm max-w-none">
                  {m.content}
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
              <div className="px-4 py-2 rounded-xl text-sm" style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
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
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading || !input.trim()}>
              Send
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
