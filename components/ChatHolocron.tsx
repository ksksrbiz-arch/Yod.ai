'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Globe, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';
import { useAuth } from '@/components/AuthProvider';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import WisdomCard from '@/components/WisdomCard';

export default function ChatHolocron() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{role: 'user'|'model', text: string, id?: string}[]>([
    { role: 'model', text: "Greetings, Padawan. Seek you my wisdom? Through the Force, answer I will." }
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'users', user.uid, 'messages'), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const loadedMessages: {role: 'user'|'model', text: string, id: string}[] = [];
        snapshot.forEach((doc) => {
            const data = doc.data();
            loadedMessages.push({
                id: doc.id,
                role: data.role as 'user' | 'model',
                text: data.text
            });
        });
        if (loadedMessages.length > 0) {
            setMessages(loadedMessages);
        } else {
            setMessages([{ role: 'model', text: "Greetings, young one. Linked we are. Seek you my wisdom?" }]);
        }
    });

    return () => unsubscribe();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setLoading(true);

    if (!user) {
        setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    } else {
        await addDoc(collection(db, 'users', user.uid, 'messages'), {
            userId: user.uid,
            role: 'user',
            text: userMessage,
            createdAt: serverTimestamp()
        });
    }

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      });
      
      if (!res.ok) throw new Error("A disturbance in the Force.");
      
      const data = await res.json();
      
      if (!user) {
          setMessages(prev => [...prev, { role: 'model', text: data.text }]);
      } else {
          await addDoc(collection(db, 'users', user.uid, 'messages'), {
              userId: user.uid,
              role: 'model',
              text: data.text,
              createdAt: serverTimestamp()
          });
      }
    } catch (err) {
      if (!user) {
          setMessages(prev => [...prev, { role: 'model', text: "Clouded, my vision is. Try again you must." }]);
      } else {
          await addDoc(collection(db, 'users', user.uid, 'messages'), {
              userId: user.uid,
              role: 'model',
              text: "Clouded, my vision is. Try again you must.",
              createdAt: serverTimestamp()
          });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-shadow-black rounded-2xl overflow-hidden shadow-2xl border border-force-green/20">
      {/* Header */}
      <header className="bg-deep-forest/50 backdrop-blur border-b border-force-green/20 p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-force-green/20 flex items-center justify-center glow-force">
            <Globe size={18} className="text-force-green" />
          </div>
          <div>
            <h2 className="text-crystal-white font-headers font-medium text-lg">Master Yoda</h2>
            <p className="text-sage-green text-xs font-mono tracking-wider">Online • Sensing wisdom...</p>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-6">
        {messages.map((msg, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={i} 
            className={cn("flex flex-col", msg.role === 'user' ? "items-end" : "items-start")}
          >
            <div className={cn("flex gap-3 max-w-[85%] md:max-w-[70%]", msg.role === 'user' ? "flex-row-reverse" : "flex-row")}>
              {(!msg.role || msg.role === 'model') ? (
                <div className="w-8 h-8 rounded-full bg-force-green/10 border border-force-green/30 flex-shrink-0 flex items-center justify-center mt-1">
                   <span className="text-force-green text-xs font-headers font-bold">Y</span>
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-holocron-blue/10 border border-holocron-blue/30 flex-shrink-0 flex items-center justify-center mt-1">
                   <span className="text-holocron-blue text-xs font-headers font-bold">U</span>
                </div>
              )}
              
              <div 
                className={cn(
                  "p-4 rounded-2xl text-md leading-relaxed shadow-sm border",
                  msg.role === 'user' 
                    ? "bg-holocron-blue/20 backdrop-blur text-crystal-white border-holocron-blue/30 font-sans" 
                    : "bg-deep-forest/40 backdrop-blur text-sage-green border-force-green/20"
                )}
              >
                {/* Text render */}
                {msg.text.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-2 last:mb-0">
                    {paragraph}
                  </p>
                ))}
                
                {msg.role !== 'user' && msg.text.length > 100 && (
                  <div className="flex items-center gap-2 mt-3 text-xs text-force-green font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-wisdom-gold animate-pulse"></span>
                    Deep Wisdom
                  </div>
                )}
              </div>
            </div>
            {msg.role !== 'user' && msg.text.match(/"([^"]+)"/) && (
                <div className={cn("ml-11 mt-2 flex w-full max-w-[85%] md:max-w-[70%]")}>
                    <WisdomCard quote={msg.text.match(/"([^"]+)"/)![1]} />
                </div>
            )}
            
          </motion.div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="flex gap-3 max-w-[85%]">
               <div className="w-8 h-8 rounded-full bg-force-green/10 border border-force-green/30 flex-shrink-0 flex items-center justify-center mt-1">
                 <span className="text-force-green text-xs font-headers font-bold">Y</span>
               </div>
               <div className="bg-deep-forest/40 backdrop-blur border border-force-green/20 text-sage-green p-4 rounded-2xl flex items-center gap-3">
                 <span className="w-2 h-2 rounded-full bg-force-green/50 animate-bounce" style={{animationDelay: '0ms'}}/>
                 <span className="w-2 h-2 rounded-full bg-force-green/50 animate-bounce" style={{animationDelay: '150ms'}}/>
                 <span className="w-2 h-2 rounded-full bg-force-green/50 animate-bounce" style={{animationDelay: '300ms'}}/>
                 <span className="font-mono text-xs tracking-wider ml-2">Channeling...</span>
               </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 md:p-6 border-t border-force-green/20 bg-deep-forest/30 backdrop-blur">
        <form onSubmit={handleSubmit} className="flex gap-3 relative w-full">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            placeholder="Ask for wisdom..."
            className="flex-1 bg-shadow-black/80 border border-force-green/30 focus:border-force-green outline-none rounded-xl px-4 py-4 text-crystal-white placeholder-sage-green/50 transition-all disabled:opacity-50 text-md font-sans focus:ring-1 focus:ring-force-green"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-force-green/20 text-force-green hover:bg-force-green/30 hover:text-crystal-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </form>
      </div>
    </div>
  );
}
