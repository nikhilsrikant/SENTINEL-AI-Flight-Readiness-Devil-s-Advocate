'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, X, Volume2 } from 'lucide-react';

interface VoiceState {
  isListening: boolean;
  transcript: string;
  response: string;
  isSpeaking: boolean;
  isSupported: boolean;
  error: string | null;
}

const VOICE_COMMANDS: Record<string, { response: string; action?: string }> = {
  'starliner timeline': {
    response:
      'Opening the Starliner case study timeline. This shows what SENTINEL would have detected during the Boeing Starliner CFT mission.',
    action: '/starliner',
  },
  'risk score': {
    response:
      'The current composite risk score is at advisory level. The Anomaly Tracker shows 3 active alerts with 2 requiring further analysis.',
  },
  'challenger disaster': {
    response:
      'The Challenger disaster of 1986 was caused by O-ring failure in cold weather. SENTINEL would have flagged the temperature correlation and go-fever bias, elevating the risk to critical.',
  },
  'anomaly tracker': {
    response: 'Navigating to the Anomaly Tracker module for real-time anomaly detection and cross-mission pattern correlation.',
    action: '/anomalies',
  },
  'knowledge graph': {
    response: 'Opening the Knowledge Graph to explore 50+ years of spaceflight incidents through interactive visualization.',
    action: '/knowledge',
  },
  'mission planner': {
    response: 'Navigating to the Mission Planner for AI-powered timeline planning and risk-aware scheduling.',
    action: '/planner',
  },
  orbital: {
    response: 'Opening the Orbital Monitor for space debris tracking and collision risk assessment.',
    action: '/orbital',
  },
  telemetry: {
    response: 'Opening the Telemetry Engine for real-time data translation and actionable recommendations.',
    action: '/telemetry',
  },
  academy: {
    response: 'Opening Space Academy for interactive simulations and AI-generated quizzes.',
    action: '/academy',
  },
};

function matchCommand(transcript: string): { response: string; action?: string } | null {
  const lower = transcript.toLowerCase();
  for (const [key, value] of Object.entries(VOICE_COMMANDS)) {
    if (lower.includes(key)) return value;
  }
  return null;
}

export function VoiceAssistant() {
  const [state, setState] = useState<VoiceState>({
    isListening: false,
    transcript: '',
    response: '',
    isSpeaking: false,
    isSupported: false,
    error: null,
  });
  const [showOverlay, setShowOverlay] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: typeof window.SpeechRecognition }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: typeof window.SpeechRecognition }).webkitSpeechRecognition;
    const supported = !!SpeechRecognition && !!window.speechSynthesis;
    setState((s) => ({ ...s, isSupported: supported }));

    if (supported) {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  const speak = useCallback((text: string) => {
    if (!synthRef.current) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.onstart = () => setState((s) => ({ ...s, isSpeaking: true }));
    utterance.onend = () => setState((s) => ({ ...s, isSpeaking: false }));
    synthRef.current.speak(utterance);
  }, []);

  const startListening = useCallback(() => {
    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: typeof window.SpeechRecognition }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: typeof window.SpeechRecognition }).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setState((s) => ({ ...s, error: 'Speech recognition not supported in this browser.' }));
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = Array.from(event.results)
        .map((r) => r[0].transcript)
        .join('');
      setState((s) => ({ ...s, transcript }));

      if (event.results[0].isFinal) {
        const match = matchCommand(transcript);
        if (match) {
          setState((s) => ({ ...s, response: match.response, isListening: false }));
          speak(match.response);
          if (match.action) {
            setTimeout(() => {
              window.location.href = match.action!;
            }, 2000);
          }
        } else {
          const fallback =
            'I heard: "' +
            transcript +
            '". Try commands like "Show me the Starliner timeline" or "What\'s the current risk score?"';
          setState((s) => ({ ...s, response: fallback, isListening: false }));
          speak(fallback);
        }
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      setState((s) => ({
        ...s,
        isListening: false,
        error: `Recognition error: ${event.error}`,
      }));
    };

    recognition.onend = () => {
      setState((s) => ({ ...s, isListening: false }));
    };

    recognitionRef.current = recognition;
    recognition.start();
    setState((s) => ({
      ...s,
      isListening: true,
      transcript: '',
      response: '',
      error: null,
    }));
    setShowOverlay(true);
  }, [speak]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setState((s) => ({ ...s, isListening: false }));
  }, []);

  const closeOverlay = () => {
    stopListening();
    synthRef.current?.cancel();
    setShowOverlay(false);
    setState((s) => ({ ...s, transcript: '', response: '', isSpeaking: false }));
  };

  if (!state.isSupported) {
    return (
      <button
        disabled
        title="Voice assistant not supported in this browser"
        className="p-2 rounded-md opacity-30 cursor-not-allowed"
      >
        <MicOff className="w-4 h-4 text-muted-foreground" />
      </button>
    );
  }

  return (
    <>
      {/* Mic Button (lives in the navbar) */}
      <button
        onClick={state.isListening ? stopListening : startListening}
        className={`relative p-2 rounded-md transition-colors ${
          state.isListening
            ? 'bg-red-500/20 text-red-400'
            : 'hover:bg-white/10 text-muted-foreground hover:text-foreground'
        }`}
        title="Voice Assistant"
      >
        {state.isListening && (
          <motion.div
            className="absolute inset-0 rounded-md border-2 border-red-500/50"
            animate={{ scale: [1, 1.3, 1], opacity: [1, 0, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
        <Mic className="w-4 h-4" />
      </button>

      {/* Voice Overlay */}
      <AnimatePresence>
        {showOverlay && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-[480px] max-w-[calc(100vw-2rem)] rounded-2xl border border-white/10 bg-background/95 backdrop-blur-xl shadow-2xl p-6"
          >
            <button
              onClick={closeOverlay}
              className="absolute top-3 right-3 p-1.5 rounded-md hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>

            <div className="text-center mb-4">
              <div className="inline-flex items-center gap-2 mb-3">
                {state.isListening ? (
                  <motion.div
                    className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  >
                    <Mic className="w-5 h-5 text-red-400" />
                  </motion.div>
                ) : state.isSpeaking ? (
                  <motion.div
                    className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity }}
                  >
                    <Volume2 className="w-5 h-5 text-purple-400" />
                  </motion.div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                    <Mic className="w-5 h-5 text-muted-foreground" />
                  </div>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {state.isListening
                  ? 'Listening...'
                  : state.isSpeaking
                    ? 'Speaking...'
                    : 'Processing...'}
              </p>
            </div>

            {/* Wave Indicator */}
            {state.isListening && (
              <div className="flex items-center justify-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-1 bg-purple-500 rounded-full"
                    animate={{ height: [8, 24, 8] }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      delay: i * 0.1,
                    }}
                  />
                ))}
              </div>
            )}

            {/* Transcript */}
            {state.transcript && (
              <div className="bg-white/5 rounded-lg p-3 mb-3">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                  You said:
                </p>
                <p className="text-sm">{state.transcript}</p>
              </div>
            )}

            {/* Response */}
            {state.response && (
              <div className="granite-border bg-white/5 rounded-lg p-3">
                <p className="text-xs text-purple-400 uppercase tracking-wide mb-1">
                  SENTINEL AI:
                </p>
                <p className="text-sm leading-relaxed">{state.response}</p>
              </div>
            )}

            {/* Error */}
            {state.error && (
              <p className="text-xs text-red-400 text-center mt-2">{state.error}</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
