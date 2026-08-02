'use client';

import { motion } from 'framer-motion';

export default function AnomalyTrackerPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Module Header */}
        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl">📡</span>
          <div>
            <h1 className="text-2xl font-bold">Anomaly Tracker</h1>
            <p className="text-sm text-muted-foreground">
              Real-time and historical anomaly detection with cross-mission
              pattern correlation and escalation alerts
            </p>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Detection Panel */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-semibold mb-4">Real-Time Detection</h2>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 rounded-md bg-secondary/50">
                <span className="text-sm">Active Monitors</span>
                <span className="font-mono text-sm text-status-nominal">0</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-md bg-secondary/50">
                <span className="text-sm">Anomalies Detected</span>
                <span className="font-mono text-sm text-status-nominal">0</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-md bg-secondary/50">
                <span className="text-sm">Escalation Alerts</span>
                <span className="font-mono text-sm text-status-nominal">0</span>
              </div>
            </div>
          </div>

          {/* Pattern Analysis Panel */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-semibold mb-4">Pattern Analysis</h2>
            <p className="text-sm text-muted-foreground">
              Cross-mission correlation identifies systemic failure modes by
              matching anomaly categories across multiple missions within a
              program.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-granite granite-border pl-3">
              <span>ML-powered pattern detection via IBM Granite</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
