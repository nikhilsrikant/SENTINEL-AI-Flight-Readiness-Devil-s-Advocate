'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { GraniteAttribution } from '@/components/shared/GraniteAttribution';

const modules = [
  {
    name: "Devil's Advocate Engine",
    description:
      'Generate the strongest case AGAINST launching. Bias detection, cumulative risk scoring, and go-fever analysis.',
    href: '/advocate',
    icon: '⚠️',
    status: 'flagship',
    gradient: 'from-orange-500/20 to-red-500/20',
  },
  {
    name: 'Starliner Case Study',
    description:
      'What SENTINEL would have detected during the Boeing Starliner CFT mission (2024-2025). Live timeline demo.',
    href: '/starliner',
    icon: '🚀',
    status: 'demo',
    gradient: 'from-blue-500/20 to-purple-500/20',
  },
  {
    name: 'Anomaly Tracker',
    description:
      'Real-time and historical anomaly detection with cross-mission pattern correlation and escalation alerts.',
    href: '/anomalies',
    icon: '📡',
    status: 'active',
    gradient: 'from-yellow-500/20 to-orange-500/20',
  },
  {
    name: 'Mission Planner',
    description:
      'AI-powered mission timeline planning with risk-aware scheduling and resource budgeting.',
    href: '/planner',
    icon: '📋',
    status: 'active',
    gradient: 'from-green-500/20 to-blue-500/20',
  },
  {
    name: 'Orbital Monitor',
    description:
      'Space debris tracking and collision risk assessment with 3D visualization using real TLE data.',
    href: '/orbital',
    icon: '🛰️',
    status: 'active',
    gradient: 'from-cyan-500/20 to-blue-500/20',
  },
  {
    name: 'Telemetry Engine',
    description:
      'Raw telemetry translated to plain-English summaries with actionable recommendations via WebSocket streaming.',
    href: '/telemetry',
    icon: '📊',
    status: 'active',
    gradient: 'from-purple-500/20 to-pink-500/20',
  },
  {
    name: 'Knowledge Graph',
    description:
      'Explore 50+ years of spaceflight incidents through interactive force-directed graph visualization.',
    href: '/knowledge',
    icon: '🧠',
    status: 'active',
    gradient: 'from-indigo-500/20 to-purple-500/20',
  },
  {
    name: 'Space Academy',
    description:
      'Interactive "What Would You Decide?" simulations and AI-generated quizzes for public education.',
    href: '/academy',
    icon: '🎓',
    status: 'active',
    gradient: 'from-teal-500/20 to-green-500/20',
  },
];

const systemStatuses = [
  { name: "Devil's Advocate", status: 'nominal' },
  { name: 'Anomaly Tracker', status: 'nominal' },
  { name: 'Mission Planner', status: 'nominal' },
  { name: 'Orbital Monitor', status: 'nominal' },
  { name: 'Telemetry Engine', status: 'nominal' },
  { name: 'Knowledge Graph', status: 'nominal' },
  { name: 'Space Academy', status: 'nominal' },
  { name: 'IBM Granite AI', status: 'nominal' },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
          <span className="bg-gradient-to-r from-granite-light to-granite bg-clip-text text-transparent">
            SENTINEL
          </span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          AI Flight Readiness Intelligence & Mission Safety Platform
        </p>
        <p className="text-sm text-muted-foreground mt-2 max-w-2xl mx-auto">
          Combating organizational blindness in spaceflight decision-making.
          Powered by IBM Granite via watsonx.
        </p>

        {/* Status Bar */}
        <div className="flex items-center justify-center gap-4 mt-6 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-status-nominal animate-pulse-glow" />
            <span className="text-muted-foreground">ALL SYSTEMS NOMINAL</span>
          </div>
          <div className="text-border">|</div>
          <div className="text-granite">MOCK MODE ACTIVE</div>
          <div className="text-border">|</div>
          <div className="text-muted-foreground">7 MODULES ONLINE</div>
        </div>
      </motion.div>

      {/* Key Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-3 gap-4 mb-8 max-w-2xl mx-auto"
      >
        <div className="bg-card rounded-lg border border-border p-4 text-center">
          <div className="text-2xl font-mono font-bold text-granite">40+</div>
          <div className="text-xs text-muted-foreground mt-1">Incidents Analyzed</div>
        </div>
        <div className="bg-card rounded-lg border border-border p-4 text-center">
          <div className="text-2xl font-mono font-bold text-granite">50+</div>
          <div className="text-xs text-muted-foreground mt-1">Years of Data</div>
        </div>
        <div className="bg-card rounded-lg border border-border p-4 text-center">
          <div className="text-2xl font-mono font-bold text-granite">7</div>
          <div className="text-xs text-muted-foreground mt-1">Active Modules</div>
        </div>
      </motion.div>

      {/* System Status Indicators */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-card rounded-lg border border-border p-4 mb-8"
      >
        <h2 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
          System Status
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {systemStatuses.map((sys) => (
            <div
              key={sys.name}
              className="flex items-center gap-2 px-3 py-2 rounded bg-secondary/50"
            >
              <div className="w-2 h-2 rounded-full bg-status-nominal" />
              <span className="text-xs font-mono truncate">{sys.name}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Module Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
      >
        {modules.map((module) => (
          <motion.div key={module.href} variants={item}>
            <Link
              href={module.href}
              className={`block p-5 rounded-lg border border-border hover:border-granite/50 bg-gradient-to-br ${module.gradient} backdrop-blur transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-granite/5 h-full`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{module.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-sm truncate">
                      {module.name}
                    </h3>
                    {module.status === 'flagship' && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-orange-500/20 text-orange-400 uppercase">
                        Flagship
                      </span>
                    )}
                    {module.status === 'demo' && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-400 uppercase">
                        Demo
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-3">
                    {module.description}
                  </p>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* Bottom Attribution */}
      <div className="mt-12 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-granite/10 border border-granite/20">
          <GraniteAttribution />
          <span className="text-xs text-muted-foreground">via watsonx</span>
        </div>
      </div>
    </div>
  );
}
