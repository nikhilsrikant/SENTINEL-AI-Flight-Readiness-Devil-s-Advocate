'use client';

import { cn } from '@/lib/utils';

const levelStyles: Record<string, string> = {
  nominal: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  advisory: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  caution: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  warning: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  critical: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export function StatusBadge({ level }: { level: string }) {
  const style = levelStyles[level] || levelStyles.nominal;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold uppercase border',
        style
      )}
    >
      <span
        className={cn('w-1.5 h-1.5 rounded-full', {
          'bg-emerald-400': level === 'nominal',
          'bg-blue-400': level === 'advisory',
          'bg-yellow-400': level === 'caution',
          'bg-orange-400': level === 'warning',
          'bg-red-400': level === 'critical',
        })}
      />
      {level}
    </span>
  );
}
