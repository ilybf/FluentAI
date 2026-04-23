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
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#f0f2f5]">AI English Tutor</h1>
        <p className="text-[#8b92a5]">Practice your English conversation skills with real-time corrections.</p>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden shadow-xl shadow-black/10 border-[rgba(255,255,255,0.06)]">
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <div className="text-6xl inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-blue-500/10">👋</div>
              <div>
                <h3 className="text-xl font-medium text-[#f0f2f5]">Start a conversation!</h3>
                <p className="text-[#8b92a5] max-w-sm mx-auto mt-2">
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
                className={`max-w-[80%] rounded-2xl px-5 py-3 ${
                  m.role === 'user'
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-br-none shadow-lg shadow-blue-500/15'
                    : 'bg-[rgba(255,255,255,0.05)] text-[#e0e4ed] rounded-bl-none border border-[rgba(255,255,255,0.06)]'
                }`}
              >
                <div className="prose prose-sm max-w-none prose-invert">
                  {m.content}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-[rgba(255,255,255,0.05)] text-[#e0e4ed] rounded-2xl rounded-bl-none px-5 py-3 flex space-x-2 border border-[rgba(255,255,255,0.06)]">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          )}
          {error && (
            <div className="flex justify-center my-4">
              <div className="bg-red-500/10 text-red-400 px-4 py-2 rounded-xl text-sm border border-red-500/20">
                ⚠️ {error.message || 'An error occurred while communicating with the AI tutor.'}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-[rgba(22,27,45,0.5)] border-t border-[rgba(255,255,255,0.06)]">
          <form onSubmit={handleSubmit} className="flex gap-4">
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
