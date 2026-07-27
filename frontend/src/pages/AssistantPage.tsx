import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import logoKargha from '../assets/logokargha.png';
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
  const { t } = useTranslation();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '0',
      role: 'assistant',
      content: t('assistant.welcomeMessage', aiResponses['default']),
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
        <img src={logoKargha} alt="Logo" className="w-12 h-12 object-contain drop-shadow-md shrink-0" />
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-display tracking-tight">{t('assistant.title', 'Kargha AI Assistant')}</h1>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-2 h-2 bg-success-500 rounded-full animate-pulse" />
            <span className="text-xs text-success-700 font-medium tracking-wide uppercase">{t('assistant.status', 'Online • Ready to help')}</span>
          </div>
        </div>
      </motion.div>

      {/* Suggested Questions */}
      <div className="flex gap-2 overflow-x-auto pb-3 pt-2 flex-shrink-0 scrollbar-hide">
        {suggestedQuestions.map((q) => (
          <motion.button
            key={q.id}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => sendMessage(q.text)}
            className="flex-shrink-0 px-4 py-2 bg-white rounded-xl text-xs font-bold text-slate-600 border border-slate-200 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 transition-all shadow-sm"
          >
            {q.text}
          </motion.button>
        ))}
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto space-y-5 pb-4 pr-1">
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
                <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm mt-1">
                  <Bot size={18} className="text-white" />
                </div>
              )}

              <div
                className={[
                  'max-w-[80%] rounded-3xl px-5 py-3.5 text-sm leading-relaxed shadow-sm',
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-tr-sm'
                    : 'bg-white border border-slate-100 text-slate-700 rounded-tl-sm',
                ].join(' ')}
              >
                <p
                  dangerouslySetInnerHTML={{ __html: formatMessage(msg.content).replace(/\n/g, '<br>') }}
                  className={msg.role === 'user' ? 'text-white' : 'text-slate-700'}
                />
                <p className={`text-[10px] mt-2 font-medium ${msg.role === 'user' ? 'text-white/70' : 'text-slate-400'}`}>
                  {msg.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>

              {msg.role === 'user' && (
                <div className="w-9 h-9 bg-gradient-to-br from-secondary-400 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm mt-1">
                  <User size={18} className="text-white" />
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
              <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
                <Bot size={18} className="text-white" />
              </div>
              <div className="bg-white border border-slate-100 rounded-3xl rounded-tl-sm px-5 py-4 shadow-sm flex items-center gap-1.5">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
                    className="w-2 h-2 bg-primary-500 rounded-full"
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 bg-white rounded-3xl shadow-sm border border-slate-100 p-3 flex items-end gap-3 transition-all focus-within:border-primary-300 focus-within:shadow-md">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('assistant.placeholder', 'Ask Kargha AI anything about loans, insurance, schemes...')}
          rows={1}
          className="flex-1 resize-none text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none leading-relaxed max-h-32 py-2 px-1"
          style={{ minHeight: '40px' }}
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSend}
          disabled={!input.trim() || isTyping}
          className="w-12 h-12 bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl flex items-center justify-center shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 text-white"
          aria-label="Send message"
        >
          <Send size={20} className="text-white" />
        </motion.button>
      </div>
    </div>
  );
}
