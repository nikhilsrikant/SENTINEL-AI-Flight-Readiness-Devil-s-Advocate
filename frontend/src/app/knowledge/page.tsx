'use client';

import { motion } from 'framer-motion';

export default function KnowledgeGraphPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Module Header */}
        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl">🧠</span>
          <div>
            <h1 className="text-2xl font-bold">Knowledge Graph</h1>
            <p className="text-sm text-muted-foreground">
              Explore 50+ years of spaceflight incidents through interactive
              force-directed graph visualization
            </p>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Graph Visualization */}
          <div className="lg:col-span-2 rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-semibold mb-4">Incident Graph</h2>
            <div className="h-96 flex items-center justify-center border border-dashed border-border rounded-md bg-secondary/20 relative overflow-hidden">
              <div className="text-center z-10">
                <p className="text-muted-foreground text-sm">
                  D3.js force-directed graph visualization
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  40+ incidents • Max 200 nodes per view • Interactive
                  exploration
                </p>
              </div>
            </div>
          </div>

          {/* Query Panel */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-semibold mb-4">RAG Query</h2>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Ask about spaceflight incidents</label>
                <div className="p-3 rounded-md bg-secondary/50 text-sm text-muted-foreground min-h-[80px]">
                  Type a query to search the incident database using
                  RAG-powered retrieval and IBM Granite generation...
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-xs font-semibold text-muted-foreground">
                  INDEXED INCIDENTS
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-secondary/30 text-sm">
                  <span>Total Incidents</span>
                  <span className="font-mono">40+</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-secondary/30 text-sm">
                  <span>Time Span</span>
                  <span className="font-mono">1960s-Present</span>
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-granite granite-border pl-3">
              <span>ChromaDB embeddings + IBM Granite RAG</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
