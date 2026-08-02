'use client';

import { motion } from 'framer-motion';

export default function OrbitalMonitorPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Module Header */}
        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl">🛰️</span>
          <div>
            <h1 className="text-2xl font-bold">Orbital Monitor</h1>
            <p className="text-sm text-muted-foreground">
              Space debris tracking and collision risk assessment with 3D
              visualization using real TLE data
            </p>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* 3D Viewport */}
          <div className="lg:col-span-2 rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-semibold mb-4">3D Orbital View</h2>
            <div className="h-96 flex items-center justify-center border border-dashed border-border rounded-md bg-secondary/20 relative overflow-hidden">
              <div className="text-center z-10">
                <p className="text-muted-foreground text-sm">
                  React Three Fiber 3D visualization
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Up to 500 tracked objects • 30+ fps render budget
                </p>
              </div>
              {/* Decorative orbital rings */}
              <div className="absolute inset-0 flex items-center justify-center opacity-20">
                <div className="w-48 h-48 rounded-full border border-status-advisory" />
                <div className="absolute w-64 h-64 rounded-full border border-status-nominal rotate-45" />
                <div className="absolute w-80 h-80 rounded-full border border-granite rotate-12" />
              </div>
            </div>
          </div>

          {/* Conjunction Panel */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-semibold mb-4">Conjunctions</h2>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 rounded-md bg-secondary/50">
                <span className="text-sm">Tracked Objects</span>
                <span className="font-mono text-sm">0</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-md bg-secondary/50">
                <span className="text-sm">Active Warnings</span>
                <span className="font-mono text-sm text-status-nominal">0</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-md bg-secondary/50">
                <span className="text-sm">TLE Source</span>
                <span className="text-xs text-muted-foreground">Not loaded</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
