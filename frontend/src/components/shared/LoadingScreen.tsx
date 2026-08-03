'use client';

import { motion } from 'framer-motion';

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6">
        {/* Animated Logo */}
        <motion.div
          className="relative w-20 h-20"
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        >
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 opacity-20 blur-xl" />
          <motion.div
            className="relative w-full h-full rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <span className="text-white font-bold text-2xl">S</span>
          </motion.div>
        </motion.div>

        {/* Loading Text */}
        <div className="text-center">
          <h2 className="text-lg font-semibold mb-2">SENTINEL</h2>
          <p className="text-sm text-muted-foreground">Initializing AI systems...</p>
        </div>

        {/* Shimmer Bar */}
        <div className="w-48 h-1 rounded-full bg-white/5 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-transparent via-purple-500 to-transparent"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            style={{ width: '50%' }}
          />
        </div>
      </div>
    </div>
  );
}
