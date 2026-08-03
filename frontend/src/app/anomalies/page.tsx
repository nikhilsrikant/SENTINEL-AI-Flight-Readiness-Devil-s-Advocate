'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ModuleHeader } from '@/components/shared/ModuleHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { GraniteAttribution } from '@/components/shared/GraniteAttribution';
import { fetchAPI } from '@/lib/api';

interface Anomaly {
  id: string;
  timestamp: string;
  subsystem: string;
  description: string;
  severity: string;
  pattern_match: string | null;
  escalated: boolean;
}

interface SubsystemHealth {
  name: string;
  status: string;
  anomaly_count: number;
}

const mockAnomalies: Anomaly[] = [
  {
    id: 'ANM-001',
    timestamp: '2024-03-15T14:32:00Z',
    subsystem: 'Propulsion',
    description: 'Helium pressure drop detected in service module manifold',
    severity: 'warning',
    pattern_match: 'Similar to Starliner CFT helium leak pattern',
    escalated: true,
  },
  {
    id: 'ANM-002',
    timestamp: '2024-03-15T14:28:00Z',
    subsystem: 'Thermal',
    description: 'Temperature exceedance in radiator panel 3',
    severity: 'caution',
    pattern_match: null,
    escalated: false,
  },
  {
    id: 'ANM-003',
    timestamp: '2024-03-15T14:15:00Z',
    subsystem: 'ECLSS',
    description: 'CO2 scrubber efficiency below nominal threshold',
    severity: 'advisory',
    pattern_match: 'Pattern seen in ISS Expedition 42',
    escalated: false,
  },
  {
    id: 'ANM-004',
    timestamp: '2024-03-15T13:58:00Z',
    subsystem: 'Power',
    description: 'Solar array 2 output variance +/- 3.2%',
    severity: 'nominal',
    pattern_match: null,
    escalated: false,
  },
  {
    id: 'ANM-005',
    timestamp: '2024-03-15T13:45:00Z',
    subsystem: 'GNC',
    description: 'Star tracker momentary signal loss (0.3s)',
    severity: 'advisory',
    pattern_match: null,
    escalated: false,
  },
  {
    id: 'ANM-006',
    timestamp: '2024-03-15T13:30:00Z',
    subsystem: 'Propulsion',
    description: 'RCS thruster B4 response time 12ms above nominal',
    severity: 'caution',
    pattern_match: 'Early indicator pattern for thruster degradation',
    escalated: true,
  },
];

const mockSubsystems: SubsystemHealth[] = [
  { name: 'Propulsion', status: 'warning', anomaly_count: 3 },
  { name: 'Thermal', status: 'caution', anomaly_count: 1 },
  { name: 'ECLSS', status: 'advisory', anomaly_count: 1 },
  { name: 'Power', status: 'nominal', anomaly_count: 0 },
  { name: 'GNC', status: 'nominal', anomaly_count: 1 },
  { name: 'Comms', status: 'nominal', anomaly_count: 0 },
];

export default function AnomaliesPage() {
  const [anomalies, setAnomalies] = useState<Anomaly[]>(mockAnomalies);
  const [subsystems, setSubsystems] =
    useState<SubsystemHealth[]>(mockSubsystems);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchAPI<{ anomalies: Anomaly[]; subsystems: SubsystemHealth[] }>(
      '/anomalies'
    )
      .then((data) => {
        if (data?.anomalies) setAnomalies(data.anomalies);
        if (data?.subsystems) setSubsystems(data.subsystems);
      })
      .catch(() => {
        // Use mock data
      });
  }, []);

  const filteredAnomalies =
    filter === 'all'
      ? anomalies
      : anomalies.filter((a) => a.severity === filter);

  const escalatedCount = anomalies.filter((a) => a.escalated).length;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <ModuleHeader
          icon="📡"
          title="Anomaly Tracker"
          description="Real-time and historical anomaly detection with cross-mission pattern correlation and escalation alerts"
        />

        {/* Escalation Alert Banner */}
        {escalatedCount > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center gap-3"
          >
            <div className="w-3 h-3 rounded-full bg-orange-500 animate-pulse" />
            <div>
              <span className="text-sm font-semibold text-orange-400">
                {escalatedCount} Escalated Alert
                {escalatedCount > 1 ? 's' : ''}
              </span>
              <p className="text-xs text-muted-foreground">
                Anomalies with pattern matches to historical failures require
                immediate review
              </p>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Subsystem Health Cards */}
          <div className="lg:col-span-1 space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Subsystem Health
            </h2>
            {subsystems.map((sys) => (
              <div
                key={sys.name}
                className="bg-card rounded-lg border border-border p-4"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{sys.name}</span>
                  <StatusBadge level={sys.status} />
                </div>
                <div className="text-xs font-mono text-muted-foreground">
                  {sys.anomaly_count} active anomal
                  {sys.anomaly_count === 1 ? 'y' : 'ies'}
                </div>
              </div>
            ))}
          </div>

          {/* Anomaly Feed */}
          <div className="lg:col-span-3">
            {/* Filter Bar */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm text-muted-foreground">Filter:</span>
              {['all', 'critical', 'warning', 'caution', 'advisory', 'nominal'].map(
                (level) => (
                  <button
                    key={level}
                    onClick={() => setFilter(level)}
                    className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                      filter === level
                        ? 'bg-granite text-white'
                        : 'bg-secondary text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </button>
                )
              )}
            </div>

            {/* Pattern Analysis */}
            <div className="bg-card rounded-lg border border-border p-4 mb-4">
              <h2 className="text-sm font-semibold mb-2">Pattern Analysis</h2>
              <div className="granite-border pl-3">
                <p className="text-xs text-muted-foreground">
                  IBM Granite has identified correlations between current
                  propulsion anomalies and the Starliner CFT helium leak cascade.
                  Recommend increased monitoring of service module pressure
                  telemetry.
                </p>
                <GraniteAttribution />
              </div>
            </div>

            {/* Anomaly List */}
            <div className="space-y-3">
              {filteredAnomalies.map((anomaly, i) => (
                <motion.div
                  key={anomaly.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`bg-card rounded-lg border p-4 ${
                    anomaly.escalated
                      ? 'border-orange-500/50'
                      : 'border-border'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-mono text-muted-foreground">
                      {anomaly.id}
                    </span>
                    <StatusBadge level={anomaly.severity} />
                    <span className="text-xs text-muted-foreground">
                      {anomaly.subsystem}
                    </span>
                    {anomaly.escalated && (
                      <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 font-bold">
                        ESCALATED
                      </span>
                    )}
                  </div>
                  <p className="text-sm">{anomaly.description}</p>
                  {anomaly.pattern_match && (
                    <div className="mt-2 granite-border pl-3">
                      <p className="text-xs text-granite">
                        Pattern Match: {anomaly.pattern_match}
                      </p>
                    </div>
                  )}
                  <div className="mt-2 text-[10px] font-mono text-muted-foreground">
                    {new Date(anomaly.timestamp).toLocaleString()}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
