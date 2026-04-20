'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Globe, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';

export default function ChatHolocron() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{role: 'user'|'model', text: string}[]>([
    { role: 'model', text: "Greetings, Padawan. Seek you my wisdom? Through the Force, answer I will." }
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      });
      
      if (!res.ok) throw new Error("A disturbance in the Force.");
      
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'model', text: data.text }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'model', text: "Clouded, my vision is. Try again you must." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full glass rounded-2xl overflow-hidden shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-transparent">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center glow-emerald">
            <Globe size={16} className="text-emerald-400" />
          </div>
          <div>
            <h2 className="text-sm font-light text-slate-100 tracking-wide">Yoda&apos;s Insight</h2>
            <p className="text-[10px] text-emerald-500/60 uppercase tracking-widest font-bold mt-0.5">Global Search Grounded</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-6">
        {messages.map((msg, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={i} 
            className={cn("flex", msg.role === 'user' ? "justify-end" : "justify-start")}
          >
            <div 
              className={cn(
                "max-w-[85%] md:max-w-[70%] p-4 rounded-2xl text-lg font-light leading-relaxed shadow-sm",
                msg.role === 'user' 
                  ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-br-[4px] serif italic" 
                  : "bg-transparent border border-white/5 text-slate-300 rounded-bl-[4px]"
              )}
            >
              {msg.text}
            </div>
          </motion.div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="p-4 rounded-2xl border border-white/5 bg-transparent rounded-bl-[4px] flex gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400/50 animate-bounce" style={{animationDelay: '0ms'}}/>
              <span className="w-2 h-2 rounded-full bg-emerald-400/50 animate-bounce" style={{animationDelay: '150ms'}}/>
              <span className="w-2 h-2 rounded-full bg-emerald-400/50 animate-bounce" style={{animationDelay: '300ms'}}/>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-white/5 bg-transparent">
        <form onSubmit={handleSubmit} className="flex gap-3 relative max-w-4xl mx-auto w-full">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            placeholder="Type here, you must..."
            className="flex-1 bg-transparent border border-white/5 focus:border-emerald-500/50 outline-none rounded-full px-6 py-3.5 text-slate-100 placeholder:text-slate-700 transition-all disabled:opacity-50 text-xl font-light glass"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-6 rounded-full transition-all disabled:opacity-50 disabled:hover:bg-emerald-500/10 flex items-center justify-center font-bold glow-emerald"
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} className="ml-0.5" />}
          </button>
        </form>
      </div>
    </div>
  );
}
