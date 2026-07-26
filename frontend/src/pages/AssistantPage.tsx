import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, User, Sparkles } from 'lucide-react';
import { aiResponses, suggestedQuestions } from '../data/mockUser';
import type { ChatMessage } from '../types';

function getAIResponse(question: string): string {
  const q = question.toLowerCase();
  for (const [key, response] of Object.entries(aiResponses)) {
    if (key !== 'default' && q.includes(key.toLowerCase().split(' ')[0])) {
      return response;
    }
  }
  return aiResponses['default'];
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '0',
      role: 'assistant',
      content: aiResponses['default'],
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: text, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    await new Promise((r) => setTimeout(r, 1200 + Math.random() * 800));

    const responseText = getAIResponse(text);
    const aiMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: responseText,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, aiMsg]);
    setIsTyping(false);
  };

  const handleSend = () => sendMessage(input);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatMessage = (text: string) => {
    // Bold text
    return text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-800">$1</strong>');
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-4 flex-shrink-0"
      >
        <div className="w-11 h-11 bg-gradient-to-br from-emerald-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
          <Sparkles size={22} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800 font-display">Kargha AI Assistant</h1>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-xs text-emerald-600 font-semibold">Online • Ready to help</span>
          </div>
        </div>
      </motion.div>

      {/* Suggested Questions */}
      <div className="flex gap-2 overflow-x-auto pb-3 flex-shrink-0">
        {suggestedQuestions.map((q) => (
          <motion.button
            key={q.id}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => sendMessage(q.text)}
            className="flex-shrink-0 px-4 py-2 bg-white rounded-2xl text-xs font-semibold text-slate-600 border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 transition-all shadow-sm"
          >
            {q.text}
          </motion.button>
        ))}
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4 pr-1">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm mt-1">
                  <Bot size={16} className="text-white" />
                </div>
              )}

              <div
                className={[
                  'max-w-[80%] rounded-3xl px-4 py-3 text-sm leading-relaxed',
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-tr-sm'
                    : 'bg-white border border-slate-100 text-slate-700 shadow-sm rounded-tl-sm',
                ].join(' ')}
              >
                <p
                  dangerouslySetInnerHTML={{ __html: formatMessage(msg.content).replace(/\n/g, '<br>') }}
                />
                <p className={`text-[10px] mt-1.5 ${msg.role === 'user' ? 'text-white/60' : 'text-slate-400'}`}>
                  {msg.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm mt-1">
                  <User size={16} className="text-white" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing Indicator */}
        <AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex items-center gap-3"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
                <Bot size={16} className="text-white" />
              </div>
              <div className="bg-white border border-slate-100 rounded-3xl rounded-tl-sm px-4 py-3 shadow-sm flex items-center gap-1.5">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
                    className="w-2 h-2 bg-emerald-500 rounded-full"
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 bg-white rounded-3xl shadow-sm border border-slate-100 p-3 flex items-end gap-3">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Kargha AI anything about loans, insurance, schemes..."
          rows={1}
          className="flex-1 resize-none text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none leading-relaxed max-h-32 py-1.5"
          style={{ minHeight: '36px' }}
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSend}
          disabled={!input.trim() || isTyping}
          className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          aria-label="Send message"
        >
          <Send size={18} className="text-white" />
        </motion.button>
      </div>
    </div>
  );
}
