'use client';

import { motion } from 'framer-motion';

interface ModuleHeaderProps {
  icon: string;
  title: string;
  description: string;
  badge?: string;
  badgeColor?: string;
}

export function ModuleHeader({
  icon,
  title,
  description,
  badge,
  badgeColor = 'bg-granite/20 text-granite',
}: ModuleHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-center gap-3 mb-6"
    >
      <span className="text-3xl">{icon}</span>
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {badge && (
        <span
          className={`ml-auto px-2 py-1 rounded text-xs font-bold uppercase ${badgeColor}`}
        >
          {badge}
        </span>
      )}
    </motion.div>
  );
}
