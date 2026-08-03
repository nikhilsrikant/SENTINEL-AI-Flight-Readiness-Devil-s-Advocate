'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ModuleHeader } from '@/components/shared/ModuleHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { GraniteAttribution } from '@/components/shared/GraniteAttribution';
import { fetchAPI } from '@/lib/api';

interface ConjunctionAlert {
  id: string;
  primary_object: string;
  secondary_object: string;
  tca: string;
  miss_distance_km: number;
  collision_probability: number;
  severity: string;
}

interface OrbitalStats {
  tracked_objects: number;
  active_satellites: number;
  debris_pieces: number;
  active_alerts: number;
}

const mockAlerts: ConjunctionAlert[] = [
  {
    id: 'CJN-001',
    primary_object: 'ISS (ZARYA)',
    secondary_object: 'COSMOS 2251 DEB',
    tca: '2024-03-16T08:42:00Z',
    miss_distance_km: 0.85,
    collision_probability: 0.00012,
    severity: 'caution',
  },
  {
    id: 'CJN-002',
    primary_object: 'CREW DRAGON C206',
    secondary_object: 'FENGYUN 1C DEB',
    tca: '2024-03-16T14:18:00Z',
    miss_distance_km: 2.3,
    collision_probability: 0.000045,
    severity: 'advisory',
  },
  {
    id: 'CJN-003',
    primary_object: 'ISS (ZARYA)',
    secondary_object: 'SL-16 R/B',
    tca: '2024-03-17T02:55:00Z',
    miss_distance_km: 4.1,
    collision_probability: 0.000008,
    severity: 'nominal',
  },
  {
    id: 'CJN-004',
    primary_object: 'STARLINER OFT-2',
    secondary_object: 'IRIDIUM 33 DEB',
    tca: '2024-03-17T19:30:00Z',
    miss_distance_km: 1.2,
    collision_probability: 0.00008,
    severity: 'advisory',
  },
];

const mockStats: OrbitalStats = {
  tracked_objects: 34521,
  active_satellites: 8432,
  debris_pieces: 26089,
  active_alerts: 4,
};

export default function OrbitalPage() {
  const [alerts, setAlerts] = useState<ConjunctionAlert[]>(mockAlerts);
  const [stats, setStats] = useState<OrbitalStats>(mockStats);

  useEffect(() => {
    fetchAPI<{ alerts: ConjunctionAlert[]; stats: OrbitalStats }>('/orbital')
      .then((data) => {
        if (data?.alerts) setAlerts(data.alerts);
        if (data?.stats) setStats(data.stats);
      })
      .catch(() => {
        // Use mock data
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
          icon="🛰️"
          title="Orbital Hazard Monitor"
          description="Space debris tracking and collision risk assessment with 3D visualization"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* 3D Visualization Placeholder */}
          <div className="lg:col-span-2 bg-card rounded-lg border border-border p-6">
            <h2 className="text-lg font-semibold mb-4">
              Orbital Visualization
            </h2>
            <div className="h-80 rounded-lg bg-gradient-to-b from-[#0a0a2e] to-[#1a1a3e] border border-border/50 flex items-center justify-center relative overflow-hidden">
              {/* Earth Sphere Placeholder */}
              <div className="relative">
                <div className="w-40 h-40 rounded-full bg-gradient-to-br from-blue-600 via-blue-500 to-emerald-600 shadow-2xl shadow-blue-500/20">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                </div>
                {/* Orbit rings */}
                <div className="absolute inset-[-20px] border border-cyan-500/20 rounded-full animate-spin" style={{ animationDuration: '20s' }} />
                <div className="absolute inset-[-40px] border border-cyan-500/10 rounded-full animate-spin" style={{ animationDuration: '30s', animationDirection: 'reverse' }} />
                <div className="absolute inset-[-60px] border border-cyan-500/5 rounded-full animate-spin" style={{ animationDuration: '40s' }} />
                {/* Debris dots */}
                <div className="absolute top-[-30px] left-[50%] w-1 h-1 rounded-full bg-yellow-400 animate-pulse" />
                <div className="absolute top-[20px] right-[-50px] w-1 h-1 rounded-full bg-red-400 animate-pulse" />
                <div className="absolute bottom-[-20px] left-[-40px] w-1 h-1 rounded-full bg-cyan-400 animate-pulse" />
              </div>
              <div className="absolute bottom-3 left-3 text-[10px] font-mono text-muted-foreground">
                3D view requires WebGL • React Three Fiber
              </div>
              <div className="absolute top-3 right-3 text-[10px] font-mono text-cyan-400">
                LIVE TRACKING
              </div>
            </div>
          </div>

          {/* Stats Panel */}
          <div className="space-y-4">
            <div className="bg-card rounded-lg border border-border p-6">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Tracked Objects
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">
                    Total Tracked
                  </span>
                  <span className="text-lg font-mono font-bold">
                    {stats.tracked_objects.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">
                    Active Satellites
                  </span>
                  <span className="text-sm font-mono text-emerald-400">
                    {stats.active_satellites.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">
                    Debris Pieces
                  </span>
                  <span className="text-sm font-mono text-orange-400">
                    {stats.debris_pieces.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">
                    Active Alerts
                  </span>
                  <span className="text-sm font-mono text-yellow-400">
                    {stats.active_alerts}
                  </span>
                </div>
              </div>
            </div>

            {/* Collision Risk Panel */}
            <div className="bg-card rounded-lg border border-border p-6">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Collision Risk Assessment
              </h2>
              <div className="granite-border pl-3 space-y-2">
                <p className="text-xs text-muted-foreground">
                  Current highest-priority conjunction involves ISS and COSMOS
                  2251 debris. Miss distance: 0.85 km. Probability of collision:
                  1.2e-4.
                </p>
                <p className="text-xs text-muted-foreground">
                  Recommend monitoring through TCA. No avoidance maneuver needed
                  at current probability level.
                </p>
                <GraniteAttribution />
              </div>
            </div>
          </div>
        </div>

        {/* Conjunction Alerts Table */}
        <div className="mt-6 bg-card rounded-lg border border-border p-6">
          <h2 className="text-lg font-semibold mb-4">Conjunction Alerts</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground">
                  <th className="text-left py-2 px-3">ID</th>
                  <th className="text-left py-2 px-3">Primary</th>
                  <th className="text-left py-2 px-3">Secondary</th>
                  <th className="text-left py-2 px-3">TCA</th>
                  <th className="text-right py-2 px-3">Miss Dist (km)</th>
                  <th className="text-right py-2 px-3">Probability</th>
                  <th className="text-center py-2 px-3">Severity</th>
                </tr>
              </thead>
              <tbody>
                {alerts.map((alert, i) => (
                  <motion.tr
                    key={alert.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b border-border/50 hover:bg-secondary/30"
                  >
                    <td className="py-2 px-3 font-mono text-xs">
                      {alert.id}
                    </td>
                    <td className="py-2 px-3 text-xs">{alert.primary_object}</td>
                    <td className="py-2 px-3 text-xs">
                      {alert.secondary_object}
                    </td>
                    <td className="py-2 px-3 font-mono text-xs text-muted-foreground">
                      {new Date(alert.tca).toLocaleString()}
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-xs">
                      {alert.miss_distance_km.toFixed(2)}
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-xs">
                      {alert.collision_probability.toExponential(2)}
                    </td>
                    <td className="py-2 px-3 text-center">
                      <StatusBadge level={alert.severity} />
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
