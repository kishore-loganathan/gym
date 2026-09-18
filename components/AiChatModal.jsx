'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, X, Sparkles, RefreshCw, MessageSquare } from 'lucide-react';
import { useToast } from '@/components/ToastProvider';

export default function AiChatModal({ isOpen, onClose, stats }) {
  const { showToast } = useToast();
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: `Hello! I am your **FIT-TRACK AI Fitness Coach**. I have access to your live weight loss progress, protein intake averages, and workout logs. How can I help you today?`
    }
  ]);

  const [inputMsg, setInputMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  if (!isOpen) return null;

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputMsg.trim() || loading) return;

    const userText = inputMsg.trim();
    setInputMsg('');

    // Append user message
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setLoading(true);

    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText })
      });

      if (res.ok) {
        const json = await res.json();
        setMessages(prev => [...prev, { sender: 'ai', text: json.answer || 'Keep pushing towards your 80 kg target!' }]);
        if (json.source === 'fallback') {
          showToast('AI is offline right now — showing general guidance instead of a personalized answer.', 'warning');
        }
      } else {
        showToast('AI Coach request failed. Please try again.', 'error');
        setMessages(prev => [...prev, { sender: 'ai', text: 'Sorry, I could not process that just now. Please try again in a moment.' }]);
      }
    } catch (err) {
      showToast('Network error reaching AI Coach.', 'error');
      setMessages(prev => [...prev, { sender: 'ai', text: 'Sorry, I could not process that just now. Please try again in a moment.' }]);
    } finally {
      setLoading(false);
    }
  };

  const quickQuestions = [
    "How can I increase my protein intake?",
    "What should I eat before morning cardio?",
    "Why is my daily scale weight fluctuating?",
    "Give me 3 tips to accelerate fat loss"
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm modal-backdrop">
      <div className="bg-white rounded-2xl w-full max-w-xl h-[80vh] flex flex-col relative border border-slate-200 shadow-2xl animate-in fade-in zoom-in duration-200 text-slate-900 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center shadow-md shadow-emerald-600/20">
              <Bot className="w-5 h-5 text-white stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base font-bold font-heading text-slate-900 flex items-center gap-2">
                💬 Ask AI Fitness Coach
              </h3>
              <p className="text-xs text-slate-500">Ask questions about diet, protein, sleep & cardio</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'ai' && (
                <div className="w-8 h-8 rounded-lg bg-emerald-100 border border-emerald-200 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[80%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-emerald-600 text-white font-semibold rounded-tr-none shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm'
                }`}
              >
                {msg.text}
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-slate-500 p-2">
              <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
              <span>AI Coach is analyzing your metrics and drafting response...</span>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 overflow-x-auto flex items-center gap-2 text-[11px] whitespace-nowrap">
          <span className="text-slate-500 font-semibold flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-emerald-600" /> Suggestions:
          </span>
          {quickQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => {
                setInputMsg(q);
              }}
              className="px-2.5 py-1 rounded-full bg-white border border-slate-200 hover:border-emerald-500 text-slate-600 hover:text-emerald-700 transition shadow-2xs"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-3 border-t border-slate-200 bg-white flex items-center gap-2">
          <input
            type="text"
            placeholder="Ask AI coach anything about diet, protein, sleep, workouts..."
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
          />
          <button
            type="submit"
            disabled={!inputMsg.trim() || loading}
            className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-sm hover:bg-emerald-700 transition disabled:opacity-50 flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Ask</span>
          </button>
        </form>

      </div>
    </div>
  );
}
