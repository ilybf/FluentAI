"use client";
import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

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

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Writing Practice</h1>
        <p className="text-gray-500">Write a short paragraph in English and get instant AI feedback on your grammar and style.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 flex flex-col h-[500px]">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Your Text</h2>
          <textarea
            className="flex-1 w-full p-4 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            placeholder="Write something in English... For example: 'Yesterday I go to the store and buyed some milks.'"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="mt-4 flex justify-between items-center">
            <span className="text-sm text-gray-400">{text.split(/\s+/).filter(w => w.length > 0).length} words</span>
            <Button onClick={handleSubmit} isLoading={loading} disabled={text.length < 10}>
              Get AI Feedback
            </Button>
          </div>
        </Card>

        <Card className="p-6 h-[500px] overflow-y-auto bg-gray-50 border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 mb-4">AI Feedback</h2>
          
          {!feedback && !loading && !errorMsg && (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <span className="text-4xl mb-2">📝</span>
              <p>Submit your writing to see corrections here.</p>
            </div>
          )}

          {errorMsg && (
            <div className="h-full flex flex-col items-center justify-center text-red-500">
              <span className="text-4xl mb-2">⚠️</span>
              <p>{errorMsg}</p>
            </div>
          )}

          {loading && (
            <div className="h-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}

          {feedback && !loading && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className={`text-3xl font-bold ${feedback.score >= 80 ? 'text-green-500' : feedback.score >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>
                  {feedback.score}/100
                </div>
                <div className="text-sm text-gray-500 font-medium uppercase tracking-wider">Overall Score</div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Corrected Version:</h3>
                <div className="p-4 bg-white rounded-xl border border-green-200 text-green-900">
                  {feedback.correctedText}
                </div>
              </div>

              {feedback.feedback?.grammar?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Grammar Corrections:</h3>
                  <ul className="list-disc pl-5 space-y-1 text-gray-700">
                    {feedback.feedback.grammar.map((g: string, i: number) => <li key={i}>{g}</li>)}
                  </ul>
                </div>
              )}

              {feedback.feedback?.style?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Style Improvements:</h3>
                  <ul className="list-disc pl-5 space-y-1 text-gray-700">
                    {feedback.feedback.style.map((s: string, i: number) => <li key={i}>{s}</li>)}
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
