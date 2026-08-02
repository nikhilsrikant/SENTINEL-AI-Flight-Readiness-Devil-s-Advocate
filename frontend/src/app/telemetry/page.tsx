'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ModuleHeader } from '@/components/shared/ModuleHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { GraniteAttribution } from '@/components/shared/GraniteAttribution';

interface TelemetryParameter {
  id: string;
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  status: string;
  subsystem: string;
  plain_english: string;
}

const mockTelemetry: TelemetryParameter[] = [
  {
    id: 'TLM-01',
    name: 'Cabin Pressure',
    value: 14.7,
    unit: 'psi',
    trend: 'stable',
    status: 'nominal',
    subsystem: 'ECLSS',
    plain_english: 'Cabin pressure is at normal sea-level equivalent. All seals holding.',
  },
  {
    id: 'TLM-02',
    name: 'O2 Partial Pressure',
    value: 3.08,
    unit: 'psi',
    trend: 'stable',
    status: 'nominal',
    subsystem: 'ECLSS',
    plain_english: 'Oxygen levels are normal and comfortable for the crew.',
  },
  {
    id: 'TLM-03',
    name: 'Coolant Loop 1 Temp',
    value: 42.3,
    unit: '°F',
    trend: 'up',
    status: 'advisory',
    subsystem: 'Thermal',
    plain_english: 'Primary cooling loop temperature is rising slowly. Monitor for next 30 minutes.',
  },
  {
    id: 'TLM-04',
    name: 'Battery Bus Voltage',
    value: 28.4,
    unit: 'V',
    trend: 'down',
    status: 'nominal',
    subsystem: 'Power',
    plain_english: 'Battery voltage within normal discharge curve. Eclipse entry in 12 minutes.',
  },
  {
    id: 'TLM-05',
    name: 'Helium Tank A',
    value: 3842,
    unit: 'psi',
    trend: 'down',
    status: 'caution',
    subsystem: 'Propulsion',
    plain_english: 'Helium pressure declining faster than expected. Rate: 2.1 psi/hour. Investigate for leak.',
  },
  {
    id: 'TLM-06',
    name: 'RCS Thruster B4 Temp',
    value: 187,
    unit: '°F',
    trend: 'up',
    status: 'caution',
    subsystem: 'Propulsion',
    plain_english: 'Thruster B4 running hot. Temperature 12°F above fleet average. May indicate catalyst bed degradation.',
  },
  {
    id: 'TLM-07',
    name: 'Solar Array Current',
    value: 12.8,
    unit: 'A',
    trend: 'stable',
    status: 'nominal',
    subsystem: 'Power',
    plain_english: 'Solar arrays producing expected power for current sun angle.',
  },
  {
    id: 'TLM-08',
    name: 'IMU Drift Rate',
    value: 0.003,
    unit: '°/hr',
    trend: 'stable',
    status: 'nominal',
    subsystem: 'GNC',
    plain_english: 'Inertial measurement unit performing within specification. Navigation accuracy nominal.',
  },
  {
    id: 'TLM-09',
    name: 'CO2 Level',
    value: 4.2,
    unit: 'mmHg',
    trend: 'up',
    status: 'advisory',
    subsystem: 'ECLSS',
    plain_english: 'CO2 rising above preferred level. Scrubber efficiency check recommended.',
  },
];

const trendIcons: Record<string, string> = {
  up: '↑',
  down: '↓',
  stable: '→',
};

const trendColors: Record<string, string> = {
  up: 'text-red-400',
  down: 'text-blue-400',
  stable: 'text-emerald-400',
};

export default function TelemetryPage() {
  const [telemetry, setTelemetry] = useState<TelemetryParameter[]>(mockTelemetry);
  const [selectedParam, setSelectedParam] = useState<TelemetryParameter | null>(null);
  const [showTranslations, setShowTranslations] = useState(true);

  // Simulate live data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry((prev) =>
        prev.map((param) => ({
          ...param,
          value: param.value + (Math.random() - 0.5) * 0.1 * param.value * 0.01,
        }))
      );
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const subsystems = [...new Set(telemetry.map((t) => t.subsystem))];
  const subsystemStatus = subsystems.map((name) => {
    const params = telemetry.filter((t) => t.subsystem === name);
    const worstStatus = params.reduce((worst, p) => {
      const order = ['nominal', 'advisory', 'caution', 'warning', 'critical'];
      return order.indexOf(p.status) > order.indexOf(worst) ? p.status : worst;
    }, 'nominal');
    return { name, status: worstStatus, count: params.length };
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <ModuleHeader
          icon="📊"
          title="Telemetry Insight Engine"
          description="Raw telemetry translated to plain-English summaries with actionable recommendations"
        />

        {/* Subsystem Status Overview */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          {subsystemStatus.map((sys) => (
            <div
              key={sys.name}
              className="bg-card rounded-lg border border-border p-3 text-center"
            >
              <StatusBadge level={sys.status} />
              <div className="text-sm font-medium mt-2">{sys.name}</div>
              <div className="text-xs text-muted-foreground font-mono">
                {sys.count} params
              </div>
            </div>
          ))}
        </div>

        {/* Toggle */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Live Parameters</h2>
          <button
            onClick={() => setShowTranslations(!showTranslations)}
            className="px-3 py-1 rounded text-xs font-medium bg-granite/20 text-granite hover:bg-granite/30 transition-colors"
          >
            {showTranslations ? 'Hide' : 'Show'} Plain English
          </button>
        </div>

        {/* Telemetry Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {telemetry.map((param, i) => (
            <motion.div
              key={param.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => setSelectedParam(param)}
              className={`bg-card rounded-lg border p-4 cursor-pointer transition-colors hover:border-granite/50 ${
                selectedParam?.id === param.id
                  ? 'border-granite'
                  : 'border-border'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">
                  {param.subsystem}
                </span>
                <StatusBadge level={param.status} />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-mono font-bold">
                  {param.value.toFixed(param.value < 1 ? 4 : 1)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {param.unit}
                </span>
                <span className={`text-sm ml-auto ${trendColors[param.trend]}`}>
                  {trendIcons[param.trend]}
                </span>
              </div>
              <div className="text-sm font-medium mt-1">{param.name}</div>
              {showTranslations && (
                <div className="mt-2 granite-border pl-2">
                  <p className="text-[11px] text-muted-foreground">
                    {param.plain_english}
                  </p>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Attribution */}
        <div className="mt-4 granite-border pl-3">
          <p className="text-xs text-muted-foreground">
            Plain-English translations generated by IBM Granite. Telemetry data
            simulated for demonstration purposes.
          </p>
          <GraniteAttribution />
        </div>
      </motion.div>
    </div>
  );
}
