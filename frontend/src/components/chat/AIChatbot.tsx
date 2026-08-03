'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Minimize2 } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const MODULE_KNOWLEDGE: Record<string, string> = {
  advocate:
    "The Devil's Advocate Engine generates the strongest case AGAINST launching. It performs bias detection, cumulative risk scoring, and go-fever analysis to combat organizational blindness.",
  starliner:
    'The Starliner Case Study demonstrates what SENTINEL would have detected during the Boeing Starliner CFT mission (2024-2025). It includes a live timeline demo with real incident data.',
  anomalies:
    'The Anomaly Tracker provides real-time and historical anomaly detection with cross-mission pattern correlation and escalation alerts.',
  planner:
    'The Mission Planner offers AI-powered mission timeline planning with risk-aware scheduling and resource budgeting.',
  orbital:
    'The Orbital Monitor tracks space debris and assesses collision risk with 3D visualization using real TLE data.',
  telemetry:
    'The Telemetry Engine translates raw telemetry to plain-English summaries with actionable recommendations via WebSocket streaming.',
  knowledge:
    'The Knowledge Graph lets you explore 50+ years of spaceflight incidents through interactive force-directed graph visualization.',
  academy:
    'Space Academy provides interactive "What Would You Decide?" simulations and AI-generated quizzes for public education.',
};

const FAQ_RESPONSES: Record<string, string> = {
  sentinel:
    'SENTINEL is an AI Flight Readiness Intelligence & Mission Safety Platform. It uses IBM Granite AI to combat organizational blindness in spaceflight decision-making, analyzing 50+ years of mission data across 7 specialized modules.',
  risk: 'The current composite risk score is calculated by aggregating signals from the Anomaly Tracker, Telemetry Engine, and historical pattern matching from the Knowledge Graph. Risk levels range from nominal (green) to critical (red).',
  challenger:
    'The Challenger disaster (1986) was caused by O-ring failure in cold weather, compounded by organizational pressure to launch. SENTINEL would have flagged the temperature correlation, detected go-fever bias in communications, and elevated the risk score to CRITICAL.',
  columbia:
    'The Columbia disaster (2003) involved foam insulation striking the wing during launch. SENTINEL would have correlated the debris impact telemetry with historical thermal protection concerns and triggered an anomaly escalation.',
  safety:
    'SENTINEL promotes a safety-first culture by providing an impartial AI "devil\'s advocate" that actively looks for reasons NOT to launch, counteracting human optimism bias and organizational pressure.',
  granite:
    'IBM Granite is the AI model powering SENTINEL, accessed via watsonx. It provides natural language understanding for telemetry translation, incident analysis, and risk assessment.',
};

function generateResponse(input: string): string {
  const lower = input.toLowerCase();

  for (const [key, response] of Object.entries(FAQ_RESPONSES)) {
    if (lower.includes(key)) return response;
  }

  for (const [key, response] of Object.entries(MODULE_KNOWLEDGE)) {
    if (lower.includes(key)) return response;
  }

  if (lower.includes('module') || lower.includes('feature')) {
    return 'SENTINEL has 7 active modules: Devil\'s Advocate Engine, Starliner Case Study, Anomaly Tracker, Mission Planner, Orbital Monitor, Telemetry Engine, Knowledge Graph, and Space Academy. Ask me about any specific module for details!';
  }

  if (lower.includes('help') || lower.includes('what can you do')) {
    return 'I can help you navigate SENTINEL, explain modules, answer questions about spaceflight safety, and provide insights from our knowledge base. Try asking about specific modules, incidents, or risk analysis!';
  }

  return 'I can help with questions about SENTINEL modules, spaceflight safety, historical incidents, and risk analysis. Try asking about a specific module or topic like "Tell me about the Challenger disaster" or "What does the Anomaly Tracker do?"';
}

export function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content:
        'Hello! I\'m SENTINEL AI. I can help you navigate the platform, explain modules, and answer questions about spaceflight safety. What would you like to know?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 700));

    const response = generateResponse(userMessage.content);
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response,
      timestamp: new Date(),
    };

    setIsTyping(false);
    setMessages((prev) => [...prev, assistantMessage]);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-shadow"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-sm">Ask SENTINEL</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              height: isMinimized ? 56 : 600,
            }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed bottom-6 right-6 z-50 w-[400px] max-w-[calc(100vw-3rem)] rounded-2xl border border-white/10 bg-background/95 backdrop-blur-xl shadow-2xl shadow-purple-500/10 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-gradient-to-r from-purple-600/10 to-blue-600/10 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm font-semibold">SENTINEL AI</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 font-mono">
                  GRANITE
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1.5 rounded-md hover:bg-white/10 transition-colors"
                >
                  <Minimize2 className="w-4 h-4 text-muted-foreground" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-md hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Messages */}
            {!isMinimized && (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-dark">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${
                          msg.role === 'user'
                            ? 'bg-purple-600/20 text-foreground'
                            : 'granite-border bg-white/5 text-foreground'
                        }`}
                      >
                        {msg.content}
                        {msg.role === 'assistant' && (
                          <div className="flex items-center gap-1 mt-1.5 text-[10px] text-purple-400/60">
                            <span>IBM Granite</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Typing Indicator */}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="granite-border bg-white/5 rounded-xl px-3.5 py-2.5">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce [animation-delay:0ms]" />
                          <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce [animation-delay:150ms]" />
                          <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce [animation-delay:300ms]" />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-3 border-t border-white/10 shrink-0">
                  <div className="flex items-center gap-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Ask about modules, safety, incidents..."
                      className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:border-purple-500/50 transition-colors"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!input.trim()}
                      className="p-2 rounded-lg bg-purple-600/80 hover:bg-purple-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <Send className="w-4 h-4 text-white" />
                    </button>
                  </div>
                  <p className="text-[10px] text-muted-foreground/50 mt-1 text-center">
                    Press Enter to send
                  </p>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
