'use client';

import { motion } from 'framer-motion';

export default function StarlinerCaseStudyPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Module Header */}
        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl">🚀</span>
          <div>
            <h1 className="text-2xl font-bold">Starliner CFT Case Study</h1>
            <p className="text-sm text-muted-foreground">
              What SENTINEL would have detected during the Boeing Starliner CFT
              mission (2024-2025)
            </p>
          </div>
          <span className="ml-auto px-2 py-1 rounded text-xs font-bold bg-purple-500/20 text-purple-400 uppercase">
            Live Demo
          </span>
        </div>

        {/* Timeline Visualization Placeholder */}
        <div className="rounded-lg border border-border bg-card p-6 mb-4">
          <h2 className="text-lg font-semibold mb-4">
            Cumulative Risk Timeline
          </h2>
          <div className="h-64 flex items-center justify-center border border-dashed border-border rounded-md bg-secondary/20">
            <div className="text-center">
              <p className="text-muted-foreground text-sm">
                Risk timeline chart will render here
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Y-axis: Cumulative Risk Score (0.0-1.0) • X-axis: Mission
                Events
              </p>
            </div>
          </div>
        </div>

        {/* Event Grid Placeholder */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="text-lg font-semibold mb-4">Mission Timeline Events</h2>
          <p className="text-sm text-muted-foreground">
            8+ chronological events from the Starliner CFT mission will be
            displayed here with risk annotations, severity levels, and
            SENTINEL&apos;s analysis of what could have been detected.
          </p>
          <div className="mt-4 flex items-center gap-2 text-xs text-granite granite-border pl-3">
            <span>Pre-generated mock data ensures demo reliability</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
