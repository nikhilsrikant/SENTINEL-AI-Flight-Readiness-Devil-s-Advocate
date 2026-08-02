'use client';

import { motion } from 'framer-motion';

export default function TelemetryEnginePage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Module Header */}
        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl">📊</span>
          <div>
            <h1 className="text-2xl font-bold">Telemetry Engine</h1>
            <p className="text-sm text-muted-foreground">
              Raw telemetry translated to plain-English summaries with actionable
              recommendations via WebSocket streaming
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-status-advisory animate-pulse-glow" />
            <span className="text-xs font-mono text-muted-foreground">
              WS: DISCONNECTED
            </span>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Live Stream */}
          <div className="lg:col-span-2 rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-semibold mb-4">Live Telemetry Stream</h2>
            <div className="h-48 flex items-center justify-center border border-dashed border-border rounded-md bg-secondary/20">
              <div className="text-center">
                <p className="text-muted-foreground text-sm">
                  WebSocket stream will display real-time telemetry
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  1s update interval • 50 max connections • auto-reconnect
                </p>
              </div>
            </div>
          </div>

          {/* Parameter Status */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-semibold mb-4">Parameters</h2>
            <div className="space-y-2 font-mono text-sm">
              <div className="flex items-center justify-between p-2 rounded bg-secondary/30">
                <span className="text-muted-foreground">CABIN_TEMP</span>
                <span className="text-status-nominal">—</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-secondary/30">
                <span className="text-muted-foreground">CABIN_PSI</span>
                <span className="text-status-nominal">—</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-secondary/30">
                <span className="text-muted-foreground">O2_LEVEL</span>
                <span className="text-status-nominal">—</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-secondary/30">
                <span className="text-muted-foreground">PWR_DRAW</span>
                <span className="text-status-nominal">—</span>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-granite granite-border pl-3">
              <span>AI-powered interpretation via IBM Granite</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
