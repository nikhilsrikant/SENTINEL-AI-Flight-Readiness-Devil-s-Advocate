'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ModuleHeader } from '@/components/shared/ModuleHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { GraniteAttribution } from '@/components/shared/GraniteAttribution';
import { fetchAPI } from '@/lib/api';
import { getSeverityFromScore, formatRiskScore } from '@/lib/utils';

interface TimelineEvent {
  date: string;
  title: string;
  description: string;
  risk_score: number;
  cumulative_risk: number;
  category: string;
  sentinel_would_flag: boolean;
}

interface CaseStudyData {
  program: string;
  events: TimelineEvent[];
  final_risk_score: number;
  summary: string;
}

const mockTimeline: TimelineEvent[] = [
  {
    date: '2024-05-06',
    title: 'Launch Day - Helium Leak Detected Pre-Flight',
    description:
      'Small helium leak detected in service module. Deemed acceptable by review board.',
    risk_score: 0.15,
    cumulative_risk: 0.15,
    category: 'propulsion',
    sentinel_would_flag: true,
  },
  {
    date: '2024-05-06',
    title: 'Additional Helium Leaks During Ascent',
    description:
      'Two additional helium leaks manifest during powered flight. Total of 3 active leaks.',
    risk_score: 0.25,
    cumulative_risk: 0.35,
    category: 'propulsion',
    sentinel_would_flag: true,
  },
  {
    date: '2024-05-07',
    title: 'RCS Thruster Failures During Docking',
    description:
      '5 of 28 RCS thrusters fail during approach to ISS. Manual override required.',
    risk_score: 0.3,
    cumulative_risk: 0.55,
    category: 'propulsion',
    sentinel_would_flag: true,
  },
  {
    date: '2024-06-15',
    title: 'Extended ISS Stay - Root Cause Unknown',
    description:
      'Mission extended while engineers investigate thruster and helium issues. No root cause found.',
    risk_score: 0.15,
    cumulative_risk: 0.65,
    category: 'operations',
    sentinel_would_flag: true,
  },
  {
    date: '2024-08-24',
    title: 'NASA Decision: Crew Returns on SpaceX Dragon',
    description:
      'NASA determines Starliner too risky for crew return. Butch and Suni reassigned to SpaceX Crew-9.',
    risk_score: 0.1,
    cumulative_risk: 0.72,
    category: 'decision',
    sentinel_would_flag: true,
  },
  {
    date: '2024-09-06',
    title: 'Starliner Undocks Autonomously',
    description:
      'Starliner returns to Earth without crew. Lands successfully at White Sands.',
    risk_score: 0.05,
    cumulative_risk: 0.75,
    category: 'operations',
    sentinel_would_flag: false,
  },
  {
    date: '2025-02-01',
    title: 'Crew Returns After 8+ Months in Space',
    description:
      'Wilmore and Williams return on SpaceX Dragon after extended ISS stay.',
    risk_score: 0.03,
    cumulative_risk: 0.78,
    category: 'operations',
    sentinel_would_flag: false,
  },
];

export default function StarlinerPage() {
  const [timeline, setTimeline] = useState<TimelineEvent[]>(mockTimeline);
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(
    null
  );

  useEffect(() => {
    fetchAPI<CaseStudyData>('/advocate/starliner/timeline')
      .then((data) => {
        if (data?.events?.length) setTimeline(data.events);
      })
      .catch(() => {
        // Use mock data on failure
      });
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <ModuleHeader
          icon="🚀"
          title="Starliner Case Study"
          description="What SENTINEL would have detected during the Boeing Starliner CFT mission (2024-2025)"
          badge="Demo"
          badgeColor="bg-purple-500/20 text-purple-400"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Timeline */}
          <div className="lg:col-span-2 space-y-4">
            {/* Hero Visualization - Cumulative Risk */}
            <div className="bg-card rounded-lg border border-border p-6">
              <h2 className="text-lg font-semibold mb-4">
                Cumulative Risk Over Time
              </h2>
              <div className="relative h-32 flex items-end gap-1">
                {timeline.map((event, i) => {
                  const severity = getSeverityFromScore(event.cumulative_risk);
                  const height = `${event.cumulative_risk * 100}%`;
                  return (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height }}
                      transition={{ delay: i * 0.1, duration: 0.5 }}
                      className={`flex-1 rounded-t cursor-pointer transition-opacity hover:opacity-80 ${
                        severity === 'nominal'
                          ? 'bg-emerald-500'
                          : severity === 'advisory'
                            ? 'bg-blue-500'
                            : severity === 'caution'
                              ? 'bg-yellow-500'
                              : severity === 'warning'
                                ? 'bg-orange-500'
                                : 'bg-red-500'
                      }`}
                      onClick={() => setSelectedEvent(event)}
                      title={`${event.title}: ${formatRiskScore(event.cumulative_risk)}`}
                    />
                  );
                })}
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground mt-2 font-mono">
                <span>May 2024</span>
                <span>Feb 2025</span>
              </div>
              <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded bg-orange-500" /> Critical
                  threshold: 0.60
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded bg-red-500" /> Final score:{' '}
                  {formatRiskScore(
                    timeline[timeline.length - 1]?.cumulative_risk ?? 0
                  )}
                </span>
              </div>
            </div>

            {/* Timeline Events */}
            <div className="bg-card rounded-lg border border-border p-6">
              <h2 className="text-lg font-semibold mb-4">Event Timeline</h2>
              <div className="relative space-y-0">
                {/* Vertical line */}
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

                {timeline.map((event, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className={`relative pl-10 pb-6 cursor-pointer ${
                      selectedEvent === event ? 'opacity-100' : 'opacity-80'
                    } hover:opacity-100`}
                    onClick={() => setSelectedEvent(event)}
                  >
                    {/* Timeline dot */}
                    <div
                      className={`absolute left-2.5 top-1 w-3 h-3 rounded-full border-2 border-background ${
                        event.sentinel_would_flag
                          ? 'bg-orange-500'
                          : 'bg-emerald-500'
                      }`}
                    />

                    <div className="bg-secondary/50 rounded-md p-3 border border-border/50">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono text-muted-foreground">
                          {event.date}
                        </span>
                        <StatusBadge
                          level={getSeverityFromScore(event.cumulative_risk)}
                        />
                        {event.sentinel_would_flag && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 font-bold">
                            SENTINEL FLAG
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-medium">{event.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {event.description}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-[10px] font-mono text-muted-foreground">
                        <span>
                          Event Risk: {formatRiskScore(event.risk_score)}
                        </span>
                        <span>
                          Cumulative: {formatRiskScore(event.cumulative_risk)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div className="space-y-4">
            {/* What If Panel */}
            <div className="bg-card rounded-lg border border-border p-6">
              <h2 className="text-lg font-semibold mb-3">
                What If SENTINEL Existed?
              </h2>
              <div className="space-y-3 text-sm">
                <div className="p-3 rounded granite-border bg-granite/5">
                  <p className="text-xs font-semibold text-granite mb-1">
                    Pre-Launch Alert
                  </p>
                  <p className="text-xs text-muted-foreground">
                    SENTINEL would have flagged the initial helium leak as a
                    pattern match to previous propulsion failures, recommending a
                    launch delay.
                  </p>
                </div>
                <div className="p-3 rounded granite-border bg-granite/5">
                  <p className="text-xs font-semibold text-granite mb-1">
                    Docking Phase Alert
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Cumulative risk score would have crossed the CRITICAL
                    threshold during thruster failures, triggering automatic
                    abort recommendation.
                  </p>
                </div>
                <div className="p-3 rounded granite-border bg-granite/5">
                  <p className="text-xs font-semibold text-granite mb-1">
                    Go-Fever Detection
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Bias analysis of pre-flight review documents would have
                    detected schedule-pressure language patterns.
                  </p>
                </div>
              </div>
              <GraniteAttribution />
            </div>

            {/* Selected Event Detail */}
            {selectedEvent && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-card rounded-lg border border-border p-6"
              >
                <h3 className="text-sm font-semibold mb-2">
                  {selectedEvent.title}
                </h3>
                <p className="text-xs text-muted-foreground mb-3">
                  {selectedEvent.description}
                </p>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date</span>
                    <span>{selectedEvent.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Category</span>
                    <span className="capitalize">{selectedEvent.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Event Risk</span>
                    <span>{formatRiskScore(selectedEvent.risk_score)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cumulative</span>
                    <span>{formatRiskScore(selectedEvent.cumulative_risk)}</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Summary */}
            <div className="bg-card rounded-lg border border-border p-6">
              <h3 className="text-sm font-semibold mb-2">Mission Summary</h3>
              <div className="space-y-2 text-xs text-muted-foreground">
                <p>
                  The Boeing Starliner Crew Flight Test launched June 5, 2024
                  with astronauts Butch Wilmore and Suni Williams for what was
                  planned as an 8-day mission.
                </p>
                <p>
                  Multiple helium leaks and thruster failures led NASA to
                  determine crew return on Starliner was too risky. The crew
                  remained on ISS for 8+ months, returning on SpaceX Dragon in
                  February 2025.
                </p>
              </div>
              <GraniteAttribution />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
