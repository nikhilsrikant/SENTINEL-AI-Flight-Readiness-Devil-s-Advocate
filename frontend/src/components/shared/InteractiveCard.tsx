'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface InteractiveCardProps {
  title: string;
  description: string;
  href: string;
  icon: string;
  gradient: string;
  status?: 'nominal' | 'advisory' | 'caution' | 'new' | 'live';
  badge?: string;
}

const statusColors: Record<string, string> = {
  nominal: 'bg-green-500',
  advisory: 'bg-blue-500',
  caution: 'bg-yellow-500',
  new: 'bg-purple-500',
  live: 'bg-red-500',
};

export function InteractiveCard({
  title,
  description,
  href,
  icon,
  gradient,
  status = 'nominal',
  badge,
}: InteractiveCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <Link
        href={href}
        className={`group relative block p-5 rounded-xl border border-white/10 hover:border-purple-500/30 bg-gradient-to-br ${gradient} backdrop-blur-sm transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/5 h-full overflow-hidden`}
      >
        {/* Gradient border glow on hover */}
        <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-purple-500/5 to-blue-500/5" />

        <div className="relative z-10">
          {/* Header with icon and status */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{icon}</span>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${statusColors[status]} animate-pulse`} />
                {badge && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 uppercase">
                    {badge}
                  </span>
                )}
              </div>
            </div>
            <motion.div
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              initial={{ x: -5 }}
              whileHover={{ x: 0 }}
            >
              <ArrowRight className="w-4 h-4 text-purple-400" />
            </motion.div>
          </div>

          {/* Content */}
          <h3 className="font-semibold text-sm mb-1.5 group-hover:text-purple-200 transition-colors">
            {title}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {description}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}
