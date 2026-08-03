'use client';

import { motion } from 'framer-motion';
import { HeroSection } from '@/components/dashboard/HeroSection';
import { LiveMetricsBar } from '@/components/dashboard/LiveMetricsBar';
import { InteractiveCard } from '@/components/shared/InteractiveCard';
import { AnimatedCounter } from '@/components/shared/AnimatedCounter';
import { GraniteAttribution } from '@/components/shared/GraniteAttribution';

const modules = [
  {
    name: "Devil's Advocate Engine",
    description:
      'Generate the strongest case AGAINST launching. Bias detection, cumulative risk scoring, and go-fever analysis.',
    href: '/advocate',
    icon: '⚠️',
    status: 'live' as const,
    badge: 'Flagship',
    gradient: 'from-orange-500/20 to-red-500/20',
  },
  {
    name: 'Starliner Case Study',
    description:
      'What SENTINEL would have detected during the Boeing Starliner CFT mission (2024-2025). Live timeline demo.',
    href: '/starliner',
    icon: '🚀',
    status: 'new' as const,
    badge: 'Demo',
    gradient: 'from-blue-500/20 to-purple-500/20',
  },
  {
    name: 'Anomaly Tracker',
    description:
      'Real-time and historical anomaly detection with cross-mission pattern correlation and escalation alerts.',
    href: '/anomalies',
    icon: '📡',
    status: 'nominal' as const,
    gradient: 'from-yellow-500/20 to-orange-500/20',
  },
  {
    name: 'Mission Planner',
    description:
      'AI-powered mission timeline planning with risk-aware scheduling and resource budgeting.',
    href: '/planner',
    icon: '📋',
    status: 'nominal' as const,
    gradient: 'from-green-500/20 to-blue-500/20',
  },
  {
    name: 'Orbital Monitor',
    description:
      'Space debris tracking and collision risk assessment with 3D visualization using real TLE data.',
    href: '/orbital',
    icon: '🛰️',
    status: 'nominal' as const,
    gradient: 'from-cyan-500/20 to-blue-500/20',
  },
  {
    name: 'Telemetry Engine',
    description:
      'Raw telemetry translated to plain-English summaries with actionable recommendations via WebSocket streaming.',
    href: '/telemetry',
    icon: '📊',
    status: 'nominal' as const,
    gradient: 'from-purple-500/20 to-pink-500/20',
  },
  {
    name: 'Knowledge Graph',
    description:
      'Explore 50+ years of spaceflight incidents through interactive force-directed graph visualization.',
    href: '/knowledge',
    icon: '🧠',
    status: 'nominal' as const,
    gradient: 'from-indigo-500/20 to-purple-500/20',
  },
  {
    name: 'Space Academy',
    description:
      'Interactive "What Would You Decide?" simulations and AI-generated quizzes for public education.',
    href: '/academy',
    icon: '🎓',
    status: 'nominal' as const,
    gradient: 'from-teal-500/20 to-green-500/20',
  },
];

const aiInsights = [
  {
    id: 1,
    title: 'Thruster degradation pattern detected',
    description: 'Cross-referencing with Starliner CFT data suggests monitoring interval reduction.',
    severity: 'advisory',
    time: '2 min ago',
  },
  {
    id: 2,
    title: 'Historical correlation: O-ring temperature sensitivity',
    description: 'Knowledge graph flagged similarity to pre-Challenger conditions at 3 launch sites.',
    severity: 'caution',
    time: '15 min ago',
  },
  {
    id: 3,
    title: 'Go-fever bias indicator elevated',
    description: 'Communication analysis shows 23% increase in schedule-pressure language.',
    severity: 'advisory',
    time: '1 hr ago',
  },
];

const severityColors: Record<string, string> = {
  advisory: 'border-blue-500/30 bg-blue-500/5',
  caution: 'border-yellow-500/30 bg-yellow-500/5',
  warning: 'border-orange-500/30 bg-orange-500/5',
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 20 } },
};

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section with animated background */}
      <HeroSection />

      {/* Live Metrics Ticker Bar */}
      <LiveMetricsBar />

      {/* Module Grid */}
      <section className="container mx-auto px-4 py-12 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h2 className="text-2xl font-bold">Mission Modules</h2>
            <p className="text-sm text-muted-foreground mt-1">
              7 specialized AI-powered modules for comprehensive mission safety
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            All systems operational
          </div>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          {modules.map((module) => (
            <motion.div key={module.href} variants={item}>
              <InteractiveCard
                title={module.name}
                description={module.description}
                href={module.href}
                icon={module.icon}
                gradient={module.gradient}
                status={module.status}
                badge={module.badge}
              />
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* AI Insights Section */}
      <section className="container mx-auto px-4 py-12 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-2xl font-bold">AI Insights</h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 uppercase animate-pulse">
              Live
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Latest findings from IBM Granite analysis engine
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="space-y-3"
        >
          {aiInsights.map((insight) => (
            <motion.div
              key={insight.id}
              variants={item}
              className={`granite-border rounded-lg p-4 border ${severityColors[insight.severity]} backdrop-blur-sm`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h4 className="text-sm font-medium mb-1">{insight.title}</h4>
                  <p className="text-xs text-muted-foreground">{insight.description}</p>
                </div>
                <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                  {insight.time}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Orbital Visualization Preview */}
      <section className="container mx-auto px-4 py-12 max-w-7xl">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="relative rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm p-8 overflow-hidden"
        >
          {/* Mini orbital animation */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="orbital-ring w-48 h-48 md:w-64 md:h-64">
              <div className="orbital-dot orbital-dot-1" />
              <div className="orbital-dot orbital-dot-2" />
              <div className="orbital-dot orbital-dot-3" />
            </div>
          </div>

          <div className="relative z-10 text-center">
            <h3 className="text-xl font-bold mb-2">Real-time Orbital Monitoring</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
              Tracking {' '}
              <span className="font-mono text-cyan-400">
                <AnimatedCounter target={2847} duration={2500} />
              </span>
              {' '} objects in Low Earth Orbit with collision risk assessment
            </p>
            <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span>Active satellites</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-yellow-500" />
                <span>Debris fragments</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span>Collision risks</span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Bottom Attribution */}
      <div className="py-12 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-granite/10 border border-granite/20">
          <GraniteAttribution />
          <span className="text-xs text-muted-foreground">via watsonx</span>
        </div>
      </div>
    </div>
  );
}
