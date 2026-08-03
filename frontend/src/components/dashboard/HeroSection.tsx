'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { AnimatedCounter } from '../shared/AnimatedCounter';

const taglines = [
  'Combating organizational blindness in spaceflight.',
  'AI-powered safety for humanity\'s boldest missions.',
  'Because every launch decision deserves a devil\'s advocate.',
  '50+ years of wisdom. 7 modules. One mission: safety.',
];

export function HeroSection() {
  const [currentTagline, setCurrentTagline] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const target = taglines[currentTagline];
    let timeout: NodeJS.Timeout;

    if (!isDeleting && displayText.length < target.length) {
      timeout = setTimeout(() => {
        setDisplayText(target.slice(0, displayText.length + 1));
      }, 40);
    } else if (!isDeleting && displayText.length === target.length) {
      timeout = setTimeout(() => setIsDeleting(true), 2500);
    } else if (isDeleting && displayText.length > 0) {
      timeout = setTimeout(() => {
        setDisplayText(displayText.slice(0, -1));
      }, 25);
    } else if (isDeleting && displayText.length === 0) {
      setIsDeleting(false);
      setCurrentTagline((prev) => (prev + 1) % taglines.length);
    }

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, currentTagline]);

  return (
    <section className="relative w-full overflow-hidden py-20 md:py-28">
      {/* Animated Particle Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="particle-field" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 mb-8"
          >
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-medium text-purple-300">All Systems Nominal</span>
            <span className="text-xs text-muted-foreground">|</span>
            <span className="text-xs text-muted-foreground">Powered by IBM Granite</span>
          </motion.div>

          {/* Title */}
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            <span className="bg-gradient-to-r from-purple-400 via-purple-300 to-blue-400 bg-clip-text text-transparent">
              SENTINEL
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-4 max-w-2xl mx-auto">
            AI Flight Readiness Intelligence & Mission Safety Platform
          </p>

          {/* Typing Effect */}
          <div className="h-8 flex items-center justify-center mb-10">
            <p className="text-sm md:text-base text-purple-300/80 font-mono">
              {displayText}
              <span className="animate-typing-cursor">|</span>
            </p>
          </div>

          {/* Counter */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mb-10"
          >
            <p className="text-muted-foreground text-sm mb-2">Protecting missions with AI intelligence</p>
            <div className="flex items-center justify-center gap-1 text-4xl md:text-5xl font-bold font-mono">
              <AnimatedCounter target={40} duration={2000} />
              <span className="text-purple-400">+</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">missions analyzed</p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex items-center justify-center gap-4 flex-wrap"
          >
            <Link
              href="/starliner"
              className="relative group inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium transition-all hover:shadow-lg hover:shadow-purple-500/25"
            >
              <span className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 blur-lg transition-opacity" />
              <span className="relative">Explore Starliner Case Study</span>
              <span className="relative">→</span>
            </Link>
            <Link
              href="/advocate"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-white/10 text-foreground font-medium hover:bg-white/5 transition-colors"
            >
              Run Devil&apos;s Advocate
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
