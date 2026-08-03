'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight } from 'lucide-react';

interface TooltipStep {
  title: string;
  description: string;
  icon: string;
}

const TOOLTIP_STEPS: TooltipStep[] = [
  {
    title: 'Welcome to SENTINEL',
    description:
      'Your AI-powered flight readiness platform with 7 specialized modules for mission safety analysis.',
    icon: '🚀',
  },
  {
    title: 'Try the AI Assistant',
    description:
      'Click "Ask SENTINEL" in the bottom-right corner to chat with our AI about spaceflight safety.',
    icon: '💬',
  },
  {
    title: 'Quick Navigation',
    description:
      'Press Cmd+K (or Ctrl+K) to open the command palette for instant access to any module or action.',
    icon: '⌨️',
  },
  {
    title: 'Voice Commands',
    description:
      'Click the microphone icon in the navbar to use voice commands like "Show me the Starliner timeline".',
    icon: '🎤',
  },
];

const STORAGE_KEY = 'sentinel-onboarding-complete';

export function TooltipGuide() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem(STORAGE_KEY);
    if (!completed) {
      // Delay showing for better UX
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < TOOLTIP_STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleDismiss();
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem(STORAGE_KEY, 'true');
  };

  const step = TOOLTIP_STEPS[currentStep];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="fixed bottom-24 left-6 z-40 w-[320px] rounded-xl border border-white/10 bg-background/95 backdrop-blur-xl shadow-2xl p-4"
        >
          {/* Close Button */}
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 p-1 rounded-md hover:bg-white/10 transition-colors"
          >
            <X className="w-3.5 h-3.5 text-muted-foreground" />
          </button>

          {/* Step Content */}
          <div className="flex items-start gap-3">
            <span className="text-2xl">{step.icon}</span>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold mb-1">{step.title}</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </div>
          </div>

          {/* Progress & Navigation */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-1">
              {TOOLTIP_STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    i === currentStep ? 'bg-purple-500' : 'bg-white/20'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={handleNext}
              className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-purple-600/80 hover:bg-purple-600 text-xs font-medium transition-colors"
            >
              {currentStep < TOOLTIP_STEPS.length - 1 ? 'Next' : 'Got it'}
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
