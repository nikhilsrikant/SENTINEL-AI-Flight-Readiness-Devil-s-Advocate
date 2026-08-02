'use client';

import { motion } from 'framer-motion';

export default function DevilsAdvocatePage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Module Header */}
        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl">⚠️</span>
          <div>
            <h1 className="text-2xl font-bold">Devil&apos;s Advocate Engine</h1>
            <p className="text-sm text-muted-foreground">
              Generate the strongest case AGAINST launching — bias detection,
              cumulative risk scoring, and go-fever analysis
            </p>
          </div>
          <span className="ml-auto px-2 py-1 rounded text-xs font-bold bg-orange-500/20 text-orange-400 uppercase">
            Flagship Module
          </span>
        </div>

        {/* Content Placeholder */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Risk Analysis Panel */}
          <div className="lg:col-span-2 rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-semibold mb-4">Pre-Flight Risk Assessment</h2>
            <div className="space-y-3">
              <div className="p-4 rounded-md bg-secondary/50 border border-border">
                <p className="text-sm text-muted-foreground">
                  Submit mission parameters to generate a comprehensive risk analysis.
                  The engine will identify risk factors, detect organizational biases,
                  and compute a cumulative risk score.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-granite granite-border pl-3">
                <span>AI analysis powered by IBM Granite</span>
              </div>
            </div>
          </div>

          {/* Risk Score Panel */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-semibold mb-4">Cumulative Risk</h2>
            <div className="flex flex-col items-center justify-center py-8">
              <div className="text-5xl font-mono font-bold text-status-nominal">
                0.00
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                No mission loaded
              </div>
              <div className="mt-4 w-full h-2 rounded-full bg-secondary overflow-hidden">
                <div className="h-full w-0 rounded-full bg-gradient-to-r from-status-nominal to-status-advisory transition-all" />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
