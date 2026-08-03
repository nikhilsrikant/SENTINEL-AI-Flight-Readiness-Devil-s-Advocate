'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ModuleHeader } from '@/components/shared/ModuleHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { GraniteAttribution } from '@/components/shared/GraniteAttribution';
import { fetchAPI } from '@/lib/api';

interface MissionPhase {
  name: string;
  duration_hours: number;
  risk_level: string;
  description: string;
}

interface ChecklistItem {
  id: string;
  item: string;
  status: 'pass' | 'fail' | 'pending';
  subsystem: string;
}

interface ResourceConflict {
  resource: string;
  conflict: string;
  severity: string;
}

const mockPhases: MissionPhase[] = [
  {
    name: 'Pre-Launch',
    duration_hours: 48,
    risk_level: 'advisory',
    description: 'Final vehicle prep, crew ingress, countdown',
  },
  {
    name: 'Launch & Ascent',
    duration_hours: 0.15,
    risk_level: 'caution',
    description: 'Powered flight through MECO and orbit insertion',
  },
  {
    name: 'On-Orbit Transit',
    duration_hours: 24,
    risk_level: 'nominal',
    description: 'Phasing burns and approach to ISS',
  },
  {
    name: 'Rendezvous & Docking',
    duration_hours: 4,
    risk_level: 'caution',
    description: 'Final approach, proximity ops, docking',
  },
  {
    name: 'Docked Operations',
    duration_hours: 192,
    risk_level: 'nominal',
    description: 'ISS crew operations and experiments',
  },
  {
    name: 'Undock & Deorbit',
    duration_hours: 6,
    risk_level: 'caution',
    description: 'Separation, deorbit burn, re-entry',
  },
  {
    name: 'Landing & Recovery',
    duration_hours: 1,
    risk_level: 'advisory',
    description: 'Parachute deploy, landing, crew egress',
  },
];

const mockChecklist: ChecklistItem[] = [
  { id: 'CK-01', item: 'Helium system pressure check', status: 'pass', subsystem: 'Propulsion' },
  { id: 'CK-02', item: 'RCS thruster function test', status: 'pass', subsystem: 'Propulsion' },
  { id: 'CK-03', item: 'Life support redundancy verification', status: 'pass', subsystem: 'ECLSS' },
  { id: 'CK-04', item: 'Communication link margin test', status: 'pass', subsystem: 'Comms' },
  { id: 'CK-05', item: 'Thermal protection inspection', status: 'pending', subsystem: 'Thermal' },
  { id: 'CK-06', item: 'Navigation system alignment', status: 'pass', subsystem: 'GNC' },
  { id: 'CK-07', item: 'Power bus isolation test', status: 'fail', subsystem: 'Power' },
  { id: 'CK-08', item: 'Abort system readiness', status: 'pass', subsystem: 'Safety' },
];

const mockConflicts: ResourceConflict[] = [
  {
    resource: 'Crew Rest Period',
    conflict: 'Overlaps with critical docking approach window',
    severity: 'caution',
  },
  {
    resource: 'Ground Station Coverage',
    conflict: 'Deorbit burn scheduled during TDRS gap (3min)',
    severity: 'advisory',
  },
  {
    resource: 'Power Budget',
    conflict: 'Heater duty cycle exceeds solar array margin during eclipse pass',
    severity: 'warning',
  },
];

export default function PlannerPage() {
  const [missionName, setMissionName] = useState('');
  const [crew, setCrew] = useState('2');
  const [duration, setDuration] = useState('8');
  const [phases] = useState<MissionPhase[]>(mockPhases);
  const [checklist] = useState<ChecklistItem[]>(mockChecklist);
  const [conflicts] = useState<ResourceConflict[]>(mockConflicts);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    setSubmitted(true);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <ModuleHeader
          icon="📋"
          title="Mission Planner"
          description="AI-powered mission timeline planning with risk-aware scheduling and resource budgeting"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Mission Parameters Form */}
          <div className="bg-card rounded-lg border border-border p-6">
            <h2 className="text-lg font-semibold mb-4">Mission Parameters</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground block mb-1">
                  Mission Name
                </label>
                <input
                  type="text"
                  value={missionName}
                  onChange={(e) => setMissionName(e.target.value)}
                  placeholder="e.g., Crew-9 ISS Rotation"
                  className="w-full px-3 py-2 rounded-md bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-granite/50"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">
                  Crew Size
                </label>
                <input
                  type="number"
                  value={crew}
                  onChange={(e) => setCrew(e.target.value)}
                  min="1"
                  max="7"
                  className="w-full px-3 py-2 rounded-md bg-secondary border border-border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-granite/50"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">
                  Duration (days)
                </label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  min="1"
                  className="w-full px-3 py-2 rounded-md bg-secondary border border-border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-granite/50"
                />
              </div>
              <button
                onClick={handleSubmit}
                className="w-full px-4 py-2 rounded-md bg-granite text-white text-sm font-medium hover:bg-granite-dark transition-colors"
              >
                Generate Plan
              </button>
              <GraniteAttribution />
            </div>
          </div>

          {/* Timeline & Checklist */}
          <div className="lg:col-span-2 space-y-4">
            {/* Mission Timeline */}
            <div className="bg-card rounded-lg border border-border p-6">
              <h2 className="text-lg font-semibold mb-4">
                Mission Timeline
              </h2>
              <div className="space-y-2">
                {phases.map((phase, i) => (
                  <motion.div
                    key={phase.name}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3 p-3 rounded-md bg-secondary/30 border border-border/50"
                  >
                    <div className="w-6 text-center text-xs font-mono text-muted-foreground">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {phase.name}
                        </span>
                        <StatusBadge level={phase.risk_level} />
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {phase.description}
                      </p>
                    </div>
                    <div className="text-xs font-mono text-muted-foreground whitespace-nowrap">
                      {phase.duration_hours >= 1
                        ? `${phase.duration_hours}h`
                        : `${(phase.duration_hours * 60).toFixed(0)}m`}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Pre-Flight Checklist */}
            <div className="bg-card rounded-lg border border-border p-6">
              <h2 className="text-lg font-semibold mb-4">
                Pre-Flight Checklist
              </h2>
              <div className="space-y-2">
                {checklist.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-2 rounded-md bg-secondary/20"
                  >
                    <span
                      className={`text-lg ${
                        item.status === 'pass'
                          ? 'text-emerald-400'
                          : item.status === 'fail'
                            ? 'text-red-400'
                            : 'text-yellow-400'
                      }`}
                    >
                      {item.status === 'pass'
                        ? '✓'
                        : item.status === 'fail'
                          ? '✗'
                          : '○'}
                    </span>
                    <div className="flex-1">
                      <span className="text-sm">{item.item}</span>
                      <span className="text-[10px] text-muted-foreground ml-2">
                        [{item.subsystem}]
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      {item.id}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Resource Conflicts */}
            <div className="bg-card rounded-lg border border-border p-6">
              <h2 className="text-lg font-semibold mb-4">
                Resource Conflicts
              </h2>
              <div className="space-y-3">
                {conflicts.map((conflict, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-md bg-secondary/30 border border-border/50"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">
                        {conflict.resource}
                      </span>
                      <StatusBadge level={conflict.severity} />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {conflict.conflict}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-3 granite-border pl-3">
                <p className="text-xs text-muted-foreground">
                  AI recommendation: Adjust deorbit burn timing by +4 minutes to
                  ensure TDRS coverage. Consider pre-conditioning heaters before
                  eclipse entry.
                </p>
                <GraniteAttribution />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
