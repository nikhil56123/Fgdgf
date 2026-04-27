import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Loader2, Bot, User, Trash2, Wand2 } from 'lucide-react';
import { generateModCode } from '../lib/gemini';
import { useProjectStore } from '../store';
import { motion, AnimatePresence } from 'motion/react';

interface Message {
  id: string;
  role: 'bot' | 'user';
  text: string;
  code?: string;
}

export function AIAssistant() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'bot', text: 'Hello! I am your Mod Architect. Describe any feature, block, or item you want to create, and I will write the code for you.' }
  ]);
  const { project, addFile } = useProjectStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleGenerate = async () => {
    if (!input || !project) return;
    
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await generateModCode(input, project.modType);
      
      const codeMatch = response?.match(/```java\n([\s\S]*?)```/);
      const code = codeMatch ? codeMatch[1] : '';
      const text = response?.replace(/```java\n[\s\S]*?```/, '').trim() || 'Here is the code you requested:';

      const botMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        role: 'bot', 
        text,
        code: code || undefined
      };
      
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        role: 'bot', 
        text: 'Sorry, I encountered an error. Please check your API key or try again.' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const importCode = (code: string) => {
    const fileName = `ModFeature_${Math.floor(Math.random() * 1000)}.java`;
    addFile({
      name: fileName,
      content: code,
      language: 'java'
    });
  };

  return (
    <div className="flex flex-col h-[380px] bg-zinc-950 border-t border-zinc-900 overflow-hidden">
      <div className="p-3 border-b border-zinc-900 bg-zinc-950/50 backdrop-blur-md flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-emerald-400" />
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-400 font-bold">Mod Assistant</span>
        </div>
        <button 
          onClick={() => setMessages([messages[0]])}
          className="text-zinc-600 hover:text-zinc-400 transition-colors"
        >
          <Trash2 size={12} />
        </button>
      </div>
      
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-gradient-to-b from-zinc-950 to-zinc-900/20"
      >
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`flex gap-2 max-w-[90%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border ${
                msg.role === 'bot' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-zinc-800 border-zinc-700 text-zinc-400'
              }`}>
                {msg.role === 'bot' ? <Bot size={14} /> : <User size={14} />}
              </div>
              <div className={`px-3 py-2 rounded-2xl text-[11px] leading-relaxed ${
                msg.role === 'user' ? 'bg-zinc-800 text-zinc-200' : 'bg-zinc-900/50 border border-zinc-800 text-zinc-300'
              }`}>
                {msg.text}
              </div>
            </div>
            {msg.code && (
              <motion.div 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 ml-8 mr-2 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950"
              >
                <div className="px-3 py-1.5 bg-zinc-900 border-b border-zinc-800 flex justify-between items-center">
                  <span className="text-[9px] font-mono text-zinc-500 uppercase">Java Snippet</span>
                  <button 
                    onClick={() => importCode(msg.code!)}
                    className="flex items-center gap-1 text-[9px] font-bold text-emerald-400 hover:text-emerald-300 uppercase tracking-tighter"
                  >
                    <Wand2 size={10} /> Cast to src
                  </button>
                </div>
                <pre className="p-3 text-[10px] font-mono overflow-x-auto text-zinc-400 max-h-32">
                  {msg.code}
                </pre>
              </motion.div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex gap-2 items-center text-emerald-400/50">
            <Loader2 size={12} className="animate-spin" />
            <span className="text-[10px] font-mono animate-pulse uppercase tracking-widest">Architect is thinking...</span>
          </div>
        )}
      </div>

      <div className="p-3 bg-zinc-950">
        <div className="relative">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            placeholder="Ask to create a mod feature..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-full pl-4 pr-10 py-2.5 text-xs text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50 transition-all"
          />
          <button
            onClick={handleGenerate}
            disabled={loading || !input}
            className="absolute right-1.5 top-1.5 p-1.5 bg-emerald-500 text-white rounded-full hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
