/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Bot, User, ShieldCheck, HelpCircle, Loader2 } from 'lucide-react';
import { chatWithCopilot } from '../services/geminiService';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

interface ChatCopilotProps {
  kb: { definitions: Record<string, string>, data: any[] };
}

const ChatCopilot: React.FC<ChatCopilotProps> = ({ kb }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'model',
      text: 'Hello! I have indexed the Subrogation Claims Knowledge Base. I can answer questions regarding claim status, creation dates, updates, and personnel involved. What would you like to know?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const history = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));

    // Placeholder for the AI response
    const aiMessageId = (Date.now() + 1).toString();
    const modelMsg: Message = {
      id: aiMessageId,
      role: 'model',
      text: '',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, modelMsg]);

    let accumulatedText = "";
    
    try {
      await chatWithCopilot(input, kb, history, (chunk) => {
        accumulatedText += chunk;
        setMessages((prev) => 
          prev.map(msg => 
            msg.id === aiMessageId ? { ...msg, text: accumulatedText } : msg
          )
        );
      });
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => 
        prev.map(msg => 
          msg.id === aiMessageId ? { ...msg, text: "I'm sorry, I encountered an error. Please try again." } : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-white overflow-hidden font-sans">
      {/* Header */}
      <div className="bg-white text-slate-900 p-5 flex items-center justify-between border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-slate-900 flex items-center justify-center shadow-lg">
            <Bot className="text-white w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-tight text-slate-900">Subrogation Copilot</h1>
            <p className="text-[11px] text-green-500 flex items-center gap-1 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              Ultra-Fast & Re-indexed
            </p>
          </div>
        </div>
        <div className="flex gap-4">
          <HelpCircle className="text-slate-400 w-5 h-5 cursor-pointer hover:text-slate-600 transition-colors" />
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50 min-h-0"
      >
        <AnimatePresence initial={false}>
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`flex gap-4 items-start ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold shadow-sm ${
                m.role === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-slate-200 text-slate-600'
              }`}>
                {m.role === 'user' ? 'JD' : 'AI'}
              </div>
              
              <div className={`p-4 rounded-2xl shadow-sm text-sm leading-relaxed max-w-[85%] ${
                m.role === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-none'
                  : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
              }`}>
                <div className="whitespace-pre-wrap">{m.text}</div>
                <div className={`text-[10px] mt-2 font-medium opacity-50 ${
                  m.role === 'user' ? 'text-right' : 'text-left'
                }`}>
                  {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </motion.div>
          ))}
          
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start gap-4 items-start"
            >
               <div className="w-8 h-8 rounded-full bg-slate-200 flex-shrink-0 flex items-center justify-center">
                  <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                </div>
                <div className="p-4 bg-white border border-slate-100 rounded-2xl rounded-tl-none shadow-sm min-w-[60px]">
                  <div className="flex gap-1 justify-center">
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></span>
                  </div>
                </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input Area */}
      <footer className="p-6 bg-white border-t border-slate-100">
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="relative flex items-center"
        >
          <input
            id="chat-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about claim status, history, or creators..."
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 pr-16 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 placeholder:text-slate-400"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-3 bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-md active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </footer>
    </div>
  );
};

export default ChatCopilot;
