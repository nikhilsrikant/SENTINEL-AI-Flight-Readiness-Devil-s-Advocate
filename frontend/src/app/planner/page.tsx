'use client';

import { motion } from 'framer-motion';

export default function MissionPlannerPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Module Header */}
        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl">📋</span>
          <div>
            <h1 className="text-2xl font-bold">Mission Planner</h1>
            <p className="text-sm text-muted-foreground">
              AI-powered mission timeline planning with risk-aware scheduling
              and resource budgeting
            </p>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Mission Parameters */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-semibold mb-4">Mission Parameters</h2>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Vehicle Type</label>
                <div className="p-2 rounded-md bg-secondary/50 text-sm text-muted-foreground">
                  Not configured
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Mission Duration</label>
                <div className="p-2 rounded-md bg-secondary/50 text-sm text-muted-foreground">
                  —
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Crew Size</label>
                <div className="p-2 rounded-md bg-secondary/50 text-sm text-muted-foreground">
                  —
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Destination</label>
                <div className="p-2 rounded-md bg-secondary/50 text-sm text-muted-foreground">
                  —
                </div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="lg:col-span-2 rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-semibold mb-4">Mission Timeline</h2>
            <div className="h-48 flex items-center justify-center border border-dashed border-border rounded-md bg-secondary/20">
              <p className="text-sm text-muted-foreground">
                Generate a mission plan to view the timeline with phases,
                milestones, and safety margins
              </p>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-granite granite-border pl-3">
              <span>Risk-aware scheduling powered by IBM Granite</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
