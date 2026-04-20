'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';
import { useAuth } from '@/components/AuthProvider';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import WisdomCard from '@/components/WisdomCard';
import HolocronAvatar from '@/components/HolocronAvatar';
import PaywallModal from '@/components/PaywallModal';
import { consumeQuota, getQuotaState } from '@/lib/quota';
import { recordQuestion } from '@/lib/gamification';
import { extractFirstQuote } from '@/lib/wisdom';

type Msg = { role: 'user' | 'model'; text: string; id?: string };

const STARTER_PROMPTS = [
  'I am paralyzed between two job offers. How do I choose?',
  'How do I have a hard conversation without losing the relationship?',
  'I feel stuck creatively. What would you ask me?',
  'Is the fear telling me to stop, or to keep going?',
];

export default function ChatHolocron() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Msg[]>([
    { role: 'model', text: 'Greetings, Padawan. Seek you my wisdom? Through the Force, answer I will.' },
  ]);
  const [loading, setLoading] = useState(false);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'users', user.uid, 'messages'), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loaded: Msg[] = [];
      snapshot.forEach((d) => {
        const data = d.data() as Msg;
        if (data.role === 'user' || data.role === 'model') {
          loaded.push({ id: d.id, role: data.role, text: data.text });
        }
      });
      if (loaded.length > 0) setMessages(loaded);
      else
        setMessages([
          { role: 'model', text: 'Greetings, young one. Linked we are. Seek you my wisdom?' },
        ]);
    });
    return () => unsubscribe();
  }, [user]);

  const persist = async (msg: Msg) => {
    if (!user) {
      setMessages((prev) => [...prev, msg]);
      return;
    }
    await addDoc(collection(db, 'users', user.uid, 'messages'), {
      userId: user.uid,
      role: msg.role,
      text: msg.text,
      createdAt: serverTimestamp(),
    });
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const quota = getQuotaState();
    if (quota.isExceeded) {
      setPaywallOpen(true);
      return;
    }

    const consumed = consumeQuota();
    if (!consumed.ok) {
      setPaywallOpen(true);
      return;
    }

    setLoading(true);
    setInput('');
    await persist({ role: 'user', text });
    recordQuestion(text);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });
      if (!res.ok) throw new Error('A disturbance in the Force.');
      const data = await res.json();
      await persist({ role: 'model', text: data.text });
    } catch {
      await persist({ role: 'model', text: 'Clouded, my vision is. Try again you must.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const showStarters = messages.filter((m) => m.role === 'user').length === 0;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <header className="border-b border-white/5 px-5 md:px-8 py-4 flex items-center gap-4 glass-strong z-10">
        <div className="relative">
          <HolocronAvatar size={48} active={loading} />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-crystal-white font-headers font-medium text-base leading-tight">Master Yoda</h2>
          <p className="text-sage-green text-[11px] font-mono tracking-widest uppercase mt-0.5">
            {loading ? 'Channeling the Force…' : 'Online · sensing wisdom'}
          </p>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 md:py-10">
        <div className="max-w-3xl mx-auto flex flex-col gap-7">
          {messages.map((msg, i) => {
            const quote = msg.role === 'model' ? extractFirstQuote(msg.text) : null;
            return (
              <motion.div
                key={msg.id || i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn('flex flex-col', msg.role === 'user' ? 'items-end' : 'items-start')}
              >
                <div className={cn('flex gap-3 max-w-[88%]', msg.role === 'user' ? 'flex-row-reverse' : 'flex-row')}>
                  {msg.role === 'model' ? (
                    <div className="w-9 h-9 rounded-xl bg-sage-green/10 border border-sage-green/30 flex-shrink-0 flex items-center justify-center mt-0.5">
                      <span className="text-sage-green text-xs font-headers font-bold">Y</span>
                    </div>
                  ) : (
                    <div className="w-9 h-9 rounded-xl bg-energy-blue/10 border border-energy-blue/30 flex-shrink-0 flex items-center justify-center mt-0.5">
                      <span className="text-energy-blue text-xs font-headers font-bold">U</span>
                    </div>
                  )}

                  <div
                    className={cn(
                      'px-5 py-4 rounded-2xl shadow-sm border',
                      msg.role === 'user'
                        ? 'bg-energy-blue/10 backdrop-blur text-crystal-white border-energy-blue/25'
                        : 'glass border-sage-green/15 wisdom-text'
                    )}
                  >
                    {msg.text.split('\n').map((p, j) => (
                      <p key={j} className={cn(j > 0 && 'mt-3')}>
                        {p}
                      </p>
                    ))}

                    {msg.role === 'model' && msg.text.length > 280 && (
                      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-sage-green/10 text-[10px] font-mono uppercase tracking-widest text-wisdom-gold">
                        <Sparkles size={10} className="animate-pulse" />
                        Deep wisdom · +5 pts
                      </div>
                    )}
                  </div>
                </div>

                {quote && (
                  <div className="ml-12 mt-4 w-full max-w-[88%]">
                    <WisdomCard quote={quote} />
                  </div>
                )}
              </motion.div>
            );
          })}

          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="flex gap-3 max-w-[85%]">
                <div className="w-9 h-9 rounded-xl bg-sage-green/10 border border-sage-green/30 flex-shrink-0 flex items-center justify-center mt-0.5">
                  <span className="text-sage-green text-xs font-headers font-bold">Y</span>
                </div>
                <div className="glass border border-sage-green/15 px-5 py-4 rounded-2xl flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-sage-green/70 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-sage-green/70 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-sage-green/70 animate-bounce" style={{ animationDelay: '300ms' }} />
                  <span className="font-mono text-[10px] uppercase tracking-widest text-sage-green/80 ml-1">Channeling</span>
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Starter prompts */}
      {showStarters && !loading && (
        <div className="px-4 md:px-8 pb-3">
          <div className="max-w-3xl mx-auto">
            <p className="eyebrow mb-3">Try asking</p>
            <div className="flex flex-wrap gap-2">
              {STARTER_PROMPTS.map((p) => (
                <button
                  key={p}
                  onClick={() => sendMessage(p)}
                  className="text-left text-xs px-3 py-2 rounded-xl bg-white/3 border border-white/8 text-sage-green hover:text-crystal-white hover:border-sage-green/35 hover:bg-sage-green/5 transition"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="px-4 md:px-8 pb-20 md:pb-6 pt-4 border-t border-white/5 bg-gradient-to-t from-void-black to-transparent">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto relative">
          <div className="relative glass-strong rounded-2xl border border-white/10 focus-within:border-sage-green/50 focus-within:glow-force transition">
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              placeholder="Ask for wisdom… (Enter to send)"
              className="w-full resize-none bg-transparent outline-none px-5 py-4 pr-16 text-crystal-white placeholder:text-sage-green/40 text-base disabled:opacity-50 max-h-40"
              style={{ minHeight: '56px' }}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl btn-primary disabled:opacity-40 disabled:cursor-not-allowed p-0"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-sage-green/40 mt-2 text-center">
            Wisdom takes shape · honor the silence between thoughts
          </p>
        </form>
      </div>

      <PaywallModal open={paywallOpen} onClose={() => setPaywallOpen(false)} />
    </div>
  );
}
