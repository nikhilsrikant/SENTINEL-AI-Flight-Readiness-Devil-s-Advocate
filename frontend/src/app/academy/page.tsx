'use client';

import { motion } from 'framer-motion';

export default function SpaceAcademyPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Module Header */}
        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl">🎓</span>
          <div>
            <h1 className="text-2xl font-bold">Space Academy</h1>
            <p className="text-sm text-muted-foreground">
              Interactive &quot;What Would You Decide?&quot; simulations and
              AI-generated quizzes for public space education
            </p>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Decision Simulations */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-semibold mb-3">
              Decision Simulations
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Face the same decisions as historical flight directors. Time
              pressure. Limited data. Conflicting advice.
            </p>
            <div className="p-3 rounded-md bg-secondary/50 text-center">
              <span className="text-sm text-muted-foreground">
                3+ case studies available
              </span>
            </div>
          </div>

          {/* Quiz Generation */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-semibold mb-3">AI Quizzes</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Multiple-choice questions generated from incident data. Adaptive
              difficulty across 3 levels.
            </p>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 rounded bg-secondary/30 text-sm">
                <span>Difficulty</span>
                <span className="font-mono text-status-advisory">Beginner</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-secondary/30 text-sm">
                <span>Questions/Session</span>
                <span className="font-mono">5-10</span>
              </div>
            </div>
          </div>

          {/* Learning Progress */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-semibold mb-3">Progress</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Personalized learning recommendations based on your performance.
            </p>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 rounded bg-secondary/30 text-sm">
                <span>Score</span>
                <span className="font-mono">—%</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-secondary/30 text-sm">
                <span>Level</span>
                <span className="font-mono text-muted-foreground">Not started</span>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-granite granite-border pl-3">
              <span>Adaptive learning via IBM Granite</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
