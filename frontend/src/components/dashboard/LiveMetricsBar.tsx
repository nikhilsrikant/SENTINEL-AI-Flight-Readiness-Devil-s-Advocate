'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface Metric {
  label: string;
  value: string;
  icon: string;
  color: string;
}

const metrics: Metric[] = [
  { label: 'Risk Score', value: 'ADVISORY', icon: '🛡️', color: 'text-blue-400' },
  { label: 'Active Alerts', value: '3', icon: '🔔', color: 'text-yellow-400' },
  { label: 'Tracked Objects', value: '2,847', icon: '🛰️', color: 'text-cyan-400' },
  { label: 'KB Queries Today', value: '1,243', icon: '🧠', color: 'text-purple-400' },
  { label: 'Modules Online', value: '7/7', icon: '✅', color: 'text-green-400' },
  { label: 'Anomalies Detected', value: '12', icon: '📡', color: 'text-orange-400' },
  { label: 'AI Confidence', value: '94.2%', icon: '🤖', color: 'text-purple-300' },
  { label: 'Uptime', value: '99.97%', icon: '⚡', color: 'text-green-300' },
];

export function LiveMetricsBar() {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setOffset((prev) => prev - 0.5);
    }, 30);
    return () => clearInterval(interval);
  }, []);

  // Duplicate metrics for seamless loop
  const displayMetrics = [...metrics, ...metrics, ...metrics];

  return (
    <div className="w-full overflow-hidden border-y border-white/5 bg-white/[0.02] py-3">
      <motion.div
        className="flex items-center gap-8 whitespace-nowrap"
        animate={{ x: offset }}
        transition={{ duration: 0, ease: 'linear' }}
        style={{ width: 'fit-content' }}
      >
        {displayMetrics.map((metric, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-sm">{metric.icon}</span>
            <span className="text-xs text-muted-foreground">{metric.label}:</span>
            <span className={`text-xs font-mono font-bold ${metric.color}`}>
              {metric.value}
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
