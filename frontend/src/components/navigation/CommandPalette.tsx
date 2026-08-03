'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowRight, Clock, Command } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  category: 'Modules' | 'Incidents' | 'Actions' | 'Settings';
  action: () => void;
  icon: string;
}

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const router = useRouter();

  const commands: CommandItem[] = [
    // Modules
    { id: 'advocate', label: "Devil's Advocate Engine", description: 'Generate the strongest case against launching', category: 'Modules', action: () => router.push('/advocate'), icon: '⚠️' },
    { id: 'starliner', label: 'Starliner Case Study', description: 'Boeing Starliner CFT live timeline demo', category: 'Modules', action: () => router.push('/starliner'), icon: '🚀' },
    { id: 'anomalies', label: 'Anomaly Tracker', description: 'Real-time anomaly detection', category: 'Modules', action: () => router.push('/anomalies'), icon: '📡' },
    { id: 'planner', label: 'Mission Planner', description: 'AI-powered mission timeline planning', category: 'Modules', action: () => router.push('/planner'), icon: '📋' },
    { id: 'orbital', label: 'Orbital Monitor', description: 'Space debris tracking and collision risk', category: 'Modules', action: () => router.push('/orbital'), icon: '🛰️' },
    { id: 'telemetry', label: 'Telemetry Engine', description: 'Raw telemetry to plain-English', category: 'Modules', action: () => router.push('/telemetry'), icon: '📊' },
    { id: 'knowledge', label: 'Knowledge Graph', description: 'Explore 50+ years of incidents', category: 'Modules', action: () => router.push('/knowledge'), icon: '🧠' },
    { id: 'academy', label: 'Space Academy', description: 'Interactive simulations & quizzes', category: 'Modules', action: () => router.push('/academy'), icon: '🎓' },
    // Incidents
    { id: 'challenger', label: 'Challenger Disaster (1986)', description: 'O-ring failure analysis', category: 'Incidents', action: () => router.push('/knowledge?incident=challenger'), icon: '💥' },
    { id: 'columbia', label: 'Columbia Disaster (2003)', description: 'Foam impact analysis', category: 'Incidents', action: () => router.push('/knowledge?incident=columbia'), icon: '💥' },
    { id: 'starliner-cft', label: 'Starliner CFT (2024)', description: 'Thruster anomaly timeline', category: 'Incidents', action: () => router.push('/starliner'), icon: '🔍' },
    // Actions
    { id: 'risk-analysis', label: 'Run Risk Analysis', description: 'Generate comprehensive risk assessment', category: 'Actions', action: () => router.push('/advocate'), icon: '⚡' },
    { id: 'view-demo', label: 'View Starliner Demo', description: 'Launch the interactive case study', category: 'Actions', action: () => router.push('/starliner'), icon: '▶️' },
    { id: 'start-quiz', label: 'Start Academy Quiz', description: 'Test your spaceflight knowledge', category: 'Actions', action: () => router.push('/academy'), icon: '🎯' },
    { id: 'view-telemetry', label: 'View Live Telemetry', description: 'Open WebSocket telemetry stream', category: 'Actions', action: () => router.push('/telemetry'), icon: '📶' },
    // Settings
    { id: 'home', label: 'Command Center', description: 'Return to dashboard', category: 'Settings', action: () => router.push('/'), icon: '🏠' },
  ];

  const filteredCommands = query
    ? commands.filter(
        (cmd) =>
          cmd.label.toLowerCase().includes(query.toLowerCase()) ||
          cmd.description?.toLowerCase().includes(query.toLowerCase()) ||
          cmd.category.toLowerCase().includes(query.toLowerCase())
      )
    : commands;

  const groupedCommands = filteredCommands.reduce(
    (acc, cmd) => {
      if (!acc[cmd.category]) acc[cmd.category] = [];
      acc[cmd.category].push(cmd);
      return acc;
    },
    {} as Record<string, CommandItem[]>
  );

  const flatList = filteredCommands;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
        setQuery('');
        setSelectedIndex(0);
      }

      if (!isOpen) return;

      if (e.key === 'Escape') {
        setIsOpen(false);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, flatList.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (flatList[selectedIndex]) {
          executeCommand(flatList[selectedIndex]);
        }
      }
    },
    [isOpen, flatList, selectedIndex]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    const stored = localStorage.getItem('sentinel-recent-searches');
    if (stored) setRecentSearches(JSON.parse(stored));
  }, []);

  const executeCommand = (cmd: CommandItem) => {
    cmd.action();
    setIsOpen(false);
    setQuery('');
    const updated = [cmd.label, ...recentSearches.filter((s) => s !== cmd.label)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('sentinel-recent-searches', JSON.stringify(updated));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] bg-black/60 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="w-[560px] max-w-[calc(100vw-2rem)] rounded-xl border border-white/10 bg-background/98 backdrop-blur-xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
              <Search className="w-5 h-5 text-muted-foreground shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                placeholder="Search modules, incidents, actions..."
                className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground/60 focus:outline-none"
                autoFocus
              />
              <kbd className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] text-muted-foreground font-mono">
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div className="max-h-[400px] overflow-y-auto p-2 scrollbar-dark">
              {/* Recent Searches */}
              {!query && recentSearches.length > 0 && (
                <div className="mb-2">
                  <p className="px-3 py-1 text-[10px] uppercase tracking-wider text-muted-foreground/60 font-semibold">
                    Recent
                  </p>
                  {recentSearches.map((search, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-white/5 cursor-pointer"
                      onClick={() => setQuery(search)}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>{search}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Grouped Results */}
              {Object.entries(groupedCommands).map(([category, items]) => (
                <div key={category} className="mb-2">
                  <p className="px-3 py-1 text-[10px] uppercase tracking-wider text-muted-foreground/60 font-semibold">
                    {category}
                  </p>
                  {items.map((cmd) => {
                    const globalIndex = flatList.indexOf(cmd);
                    return (
                      <div
                        key={cmd.id}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                          globalIndex === selectedIndex
                            ? 'bg-purple-500/10 border border-purple-500/20'
                            : 'hover:bg-white/5 border border-transparent'
                        }`}
                        onClick={() => executeCommand(cmd)}
                        onMouseEnter={() => setSelectedIndex(globalIndex)}
                      >
                        <span className="text-lg shrink-0">{cmd.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{cmd.label}</p>
                          {cmd.description && (
                            <p className="text-xs text-muted-foreground truncate">
                              {cmd.description}
                            </p>
                          )}
                        </div>
                        {globalIndex === selectedIndex && (
                          <ArrowRight className="w-4 h-4 text-purple-400 shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}

              {filteredCommands.length === 0 && (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  No results for &ldquo;{query}&rdquo;
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-4 py-2.5 border-t border-white/10 text-[10px] text-muted-foreground/60">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 rounded bg-white/5 border border-white/10 font-mono">↑↓</kbd>
                  Navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 rounded bg-white/5 border border-white/10 font-mono">↵</kbd>
                  Select
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Command className="w-3 h-3" />
                <span>+ K to toggle</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
