import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, User, Mic, Volume2, Keyboard, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AssistantHero } from '../components/hero/AssistantHero';
import logoKargha from '@/assets/logos/logoKargha.png';
import { aiResponses, suggestedQuestions } from '../data/mockUser';
import type { ChatMessage } from '../types';
import { tData } from '../utils/i18nData';

function getAIResponse(question: string): string {
  const q = question.toLowerCase();
  for (const [key, response] of Object.entries(aiResponses)) {
    if (key !== 'default' && q.includes(key.toLowerCase().split(' ')[0])) {
      return response;
    }
  }
  return aiResponses['default'];
}
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export default function AssistantPage() {
  const { t, i18n } = useTranslation();
  const [mode, setMode] = useState<'chat' | 'voice'>('chat');
  const [voiceState, setVoiceState] = useState<'idle' | 'listening' | 'processing' | 'speaking'>('idle');
  const [transcript, setTranscript] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
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
  
  // Refs for speech instances
  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      
      // Map i18n language to BCP 47 tags for better recognition
      const langMap: Record<string, string> = {
        'en': 'en-IN',
        'ta': 'ta-IN',
        'te': 'te-IN',
        'hi': 'hi-IN',
        'kn': 'kn-IN',
        'ml': 'ml-IN'
      };
      recognition.lang = langMap[i18n.language] || 'en-IN';

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        if (event.error === 'not-allowed') {
          setErrorMessage(t('assistant.errorMic', 'Microphone permission denied.'));
        } else if (event.error === 'no-speech') {
          setErrorMessage(t('assistant.errorNoSpeech', 'No speech detected. Please try again.'));
        } else {
          setErrorMessage(t('assistant.errorGeneric', 'Audio capture failed.'));
        }
        setVoiceState('idle');
      };

      recognition.onend = () => {
        // If we are in listening state and recognition ends, process what we heard
        setVoiceState((prev) => {
          if (prev === 'listening') {
            return 'processing';
          }
          return prev;
        });
      };

      recognitionRef.current = recognition;
    }
  }, [i18n.language, t]);

  // Effect to handle transition to processing
  useEffect(() => {
    if (voiceState === 'processing' && transcript.trim()) {
      const processVoice = async () => {
        await sendMessage(transcript.trim(), true);
      };
      processVoice();
    } else if (voiceState === 'processing') {
      // Empty transcript
      setVoiceState('idle');
    }
  }, [voiceState]);

  useEffect(() => {
    if (mode === 'chat') {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    // Cancel any ongoing speech when unmounting or switching to chat
    return () => {
      window.speechSynthesis.cancel();
      if (recognitionRef.current) recognitionRef.current.abort();
    };
  }, [messages, isTyping, mode]);

  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel(); // Stop any ongoing speech

    // Clean markdown before speaking
    const cleanText = text.replace(/\*\*(.*?)\*\*/g, '$1');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    const langMap: Record<string, string> = {
      'en': 'en-IN', 'ta': 'ta-IN', 'te': 'te-IN', 'hi': 'hi-IN', 'kn': 'kn-IN', 'ml': 'ml-IN'
    };
    utterance.lang = langMap[i18n.language] || 'en-IN';

    utterance.onstart = () => setVoiceState('speaking');
    utterance.onend = () => setVoiceState('idle');
    utterance.onerror = () => setVoiceState('idle');
    
    synthesisRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const sendMessage = async (text: string, fromVoice = false) => {
    if (!text.trim()) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: text, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    setErrorMessage('');

    if (mode === 'voice' && !fromVoice) {
      setMode('chat');
    }

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
    
    if (fromVoice && mode === 'voice') {
      speakText(responseText);
    }
  };

  const handleSend = () => sendMessage(input);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleRecording = () => {
    setErrorMessage('');
    if (voiceState === 'idle' || voiceState === 'speaking') {
      window.speechSynthesis.cancel(); // Stop AI speaking if user interrupts
      setTranscript('');
      setVoiceState('listening');
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.error(e);
        }
      } else {
        setErrorMessage(t('assistant.notSupported', 'Voice recognition is not supported in this browser.'));
        setVoiceState('idle');
      }
    } else if (voiceState === 'listening') {
      // Manual stop
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setVoiceState('processing');
    }
  };

  const formatMessage = (text: string) => {
    return text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-800">$1</strong>');
  };

  return (
    <div className="space-y-6 pb-8">
      <AssistantHero />
      
      <div className="h-[600px] flex flex-col bg-slate-50/50 rounded-3xl overflow-hidden shadow-inner relative">
      
      {/* Mode Switcher */}
      <div className="absolute top-4 right-4 z-10 flex bg-white rounded-full p-1 shadow-sm border border-slate-200">
        <button 
          onClick={() => setMode('chat')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${mode === 'chat' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <Keyboard size={14} /> {t('assistant.chat', 'Chat')}
        </button>
        <button 
          onClick={() => setMode('voice')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${mode === 'voice' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <Mic size={14} /> {t('assistant.voice', 'Voice')}
        </button>
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 p-6 pb-2 flex-shrink-0 bg-white/50 backdrop-blur-sm border-b border-slate-100"
      >
        <img src={logoKargha} alt="Logo" className="w-12 h-12 object-contain drop-shadow-md shrink-0" />
        <div>
          <h1 className="text-xl font-black text-slate-900 font-display tracking-tight flex items-center gap-2">
            Kargha AI <Sparkles size={16} className="text-indigo-500"/>
          </h1>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-2 h-2 bg-success-500 rounded-full animate-pulse" />
            <span className="text-xs text-success-700 font-bold tracking-wide uppercase">{t('assistant.online', 'Online')}</span>
          </div>
        </div>
      </motion.div>

      {mode === 'chat' ? (
        <>
          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto space-y-6 p-6 scrollbar-hide">
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
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md mt-1">
                      <Bot size={20} className="text-white" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-3xl px-5 py-4 text-sm leading-relaxed shadow-sm relative group ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-indigo-600 to-indigo-800 text-white rounded-tr-sm'
                        : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm'
                    }`}
                  >
                    <p
                      dangerouslySetInnerHTML={{ __html: formatMessage(msg.content).replace(/\n/g, '<br>') }}
                      className={msg.role === 'user' ? 'text-white' : 'text-slate-700'}
                    />
                    <div className={`flex items-center justify-between mt-3 ${msg.role === 'user' ? 'text-indigo-200' : 'text-slate-400'}`}>
                      <p className="text-[10px] font-bold">
                        {msg.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      {msg.role === 'assistant' && (
                        <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-100 rounded-full text-indigo-500">
                          <Volume2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
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
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl flex items-center justify-center shadow-md">
                    <Bot size={20} className="text-white" />
                  </div>
                  <div className="bg-white border border-slate-200 rounded-3xl rounded-tl-sm px-5 py-4 shadow-sm flex items-center gap-2">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        animate={{ y: [0, -6, 0], opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                        className="w-2 h-2 bg-indigo-500 rounded-full"
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={bottomRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-slate-100 flex flex-col gap-3">
            {/* Suggested Questions */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {suggestedQuestions.map((q) => (
                <motion.button
                  key={q.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => sendMessage(tData(q.text))}
                  className="flex-shrink-0 px-4 py-2 bg-indigo-50/50 rounded-xl text-[11px] font-bold text-indigo-700 border border-indigo-100 hover:bg-indigo-100 transition-colors"
                >
                  {tData(q.text)}
                </motion.button>
              ))}
            </div>
            
            <div className="flex items-end gap-3 bg-slate-50 p-2 rounded-3xl border border-slate-200 focus-within:border-indigo-400 focus-within:bg-white transition-all shadow-inner">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('assistant.askPlaceholder', 'Ask Kargha AI...')}
                rows={1}
                className="flex-1 bg-transparent resize-none text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none max-h-32 py-3 px-4"
                style={{ minHeight: '44px' }}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 text-white"
              >
                <Send size={18} />
              </motion.button>
            </div>
          </div>
        </>
      ) : (
        /* Voice Mode UI */
        <div className="flex-1 flex flex-col items-center justify-between p-8 relative overflow-hidden bg-slate-900 rounded-b-3xl">
          
          {/* Ambient Background Glow based on state */}
          <motion.div 
            animate={{ 
              opacity: voiceState === 'idle' ? 0.2 : 0.6,
              scale: voiceState === 'listening' ? [1, 1.2, 1] : 1,
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className={`absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-[100px] pointer-events-none transition-colors duration-700 ${
              voiceState === 'listening' ? 'bg-cyan-500' :
              voiceState === 'processing' ? 'bg-purple-500' :
              voiceState === 'speaking' ? 'bg-indigo-500' : 'bg-indigo-900'
            }`}
          />

          <div className="w-full flex justify-between items-center z-10 text-slate-300 px-4">
            <span className="text-sm font-bold uppercase tracking-widest text-slate-500">
              {voiceState === 'idle' && t('assistant.tapToSpeak', 'Tap to Speak')}
              {voiceState === 'listening' && <span className="text-cyan-400">{t('assistant.listening', 'Listening...')}</span>}
              {voiceState === 'processing' && <span className="text-purple-400">{t('assistant.processing', 'Processing...')}</span>}
              {voiceState === 'speaking' && <span className="text-indigo-400">{t('assistant.speaking', 'Speaking...')}</span>}
            </span>
            {voiceState !== 'idle' && (
              <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                <div className="w-2 h-2 rounded-full bg-cyan-400" />
              </motion.div>
            )}
          </div>

          {/* Transcript Area */}
          <div className="flex-1 flex flex-col justify-center items-center w-full max-w-lg z-10 text-center space-y-4 my-8">
            <AnimatePresence mode="wait">
              {voiceState === 'idle' ? (
                  <motion.p
                    key="idle"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-2xl font-medium text-slate-400 flex flex-col items-center gap-2"
                  >
                    <span>"{t('assistant.howCanIHelp', 'How can I help you today?')}"</span>
                    {errorMessage && (
                      <span className="text-sm font-bold text-red-400 mt-2 bg-red-500/10 px-4 py-2 rounded-full border border-red-500/20">
                        {errorMessage}
                      </span>
                    )}
                  </motion.p>
              ) : voiceState === 'speaking' ? (
                <motion.div
                  key="speaking"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-4"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-cyan-400 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.5)]">
                    <Bot size={32} className="text-white" />
                  </div>
                  <p className="text-xl font-medium text-indigo-100 max-w-sm line-clamp-3">
                    {messages[messages.length - 1]?.content.replace(/\*\*/g, '') || t('assistant.foundOptions', "I found some great options for you.")}
                  </p>
                </motion.div>
              ) : (
                <motion.p
                  key="active"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-3xl font-bold text-white tracking-tight leading-tight"
                >
                  {transcript || <span className="text-slate-600">...</span>}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Controls */}
          <div className="flex flex-col items-center gap-8 z-10 w-full max-w-sm">
            {/* Sound Wave Indicator */}
            <div className="h-16 flex items-center justify-center gap-1.5 w-full">
              {(voiceState === 'listening' || voiceState === 'speaking') ? (
                [...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ height: [12, 30 + Math.random() * 40, 12] }}
                    transition={{ duration: 0.4 + Math.random() * 0.2, repeat: Infinity, ease: "easeInOut", delay: i * 0.05 }}
                    className={`w-2 rounded-full ${voiceState === 'speaking' ? 'bg-indigo-400' : 'bg-cyan-400'}`}
                  />
                ))
              ) : (
                <div className="w-32 h-1 bg-slate-800 rounded-full" />
              )}
            </div>

            {/* Main Mic Button */}
            <div className="relative">
              <AnimatePresence>
                {voiceState === 'listening' && (
                  <>
                    <motion.div
                      initial={{ scale: 1, opacity: 0.5 }}
                      animate={{ scale: 1.8, opacity: 0 }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                      className="absolute inset-0 bg-cyan-500 rounded-full"
                    />
                    <motion.div
                      initial={{ scale: 1, opacity: 0.5 }}
                      animate={{ scale: 2.5, opacity: 0 }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut", delay: 0.4 }}
                      className="absolute inset-0 bg-cyan-400 rounded-full"
                    />
                  </>
                )}
              </AnimatePresence>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleRecording}
                className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 ${
                  voiceState === 'listening' 
                    ? 'bg-red-500 shadow-[0_0_40px_rgba(239,68,68,0.5)]' 
                    : voiceState === 'processing'
                    ? 'bg-purple-600 shadow-[0_0_40px_rgba(147,51,234,0.5)]'
                    : 'bg-gradient-to-br from-indigo-500 to-cyan-500 shadow-[0_0_30px_rgba(99,102,241,0.3)]'
                }`}
              >
                {voiceState === 'listening' ? (
                  <div className="w-8 h-8 bg-white rounded-sm" />
                ) : voiceState === 'processing' ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
                    <Sparkles size={36} className="text-white" />
                  </motion.div>
                ) : (
                  <Mic size={40} className="text-white" />
                )}
              </motion.button>
            </div>
            
            {/* Suggestions in Voice Mode */}
            {voiceState === 'idle' && (
              <div className="flex flex-col items-center gap-3 w-full">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{t('assistant.tryAsking', 'Try asking')}</p>
                <div className="flex gap-2 overflow-x-auto w-full pb-2 scrollbar-hide justify-center">
                  {suggestedQuestions.slice(0, 2).map((q) => (
                    <button
                      key={q.id}
                      onClick={() => {
                        setTranscript(tData(q.text));
                        setVoiceState('processing');
                        setTimeout(() => {
                          setVoiceState('speaking');
                          sendMessage(tData(q.text));
                          setTimeout(() => setVoiceState('idle'), 3000);
                        }, 1500);
                      }}
                      className="flex-shrink-0 px-4 py-2 bg-slate-800 rounded-xl text-xs font-medium text-slate-300 border border-slate-700 hover:bg-slate-700 transition-colors"
                    >
                      "{tData(q.text)}"
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
