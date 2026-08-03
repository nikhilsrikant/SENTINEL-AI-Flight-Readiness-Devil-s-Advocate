'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

const MODULE_NAMES: Record<string, string> = {
  advocate: "Devil's Advocate",
  starliner: 'Starliner Case Study',
  anomalies: 'Anomaly Tracker',
  planner: 'Mission Planner',
  orbital: 'Orbital Monitor',
  telemetry: 'Telemetry Engine',
  knowledge: 'Knowledge Graph',
  academy: 'Space Academy',
};

export function Breadcrumb() {
  const pathname = usePathname();

  if (pathname === '/') return null;

  const segments = pathname.split('/').filter(Boolean);

  const crumbs = segments.map((segment, index) => {
    const href = '/' + segments.slice(0, index + 1).join('/');
    const label = MODULE_NAMES[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
    const isLast = index === segments.length - 1;

    return { href, label, isLast };
  });

  return (
    <nav className="w-full border-b border-border/30 bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-2 flex items-center gap-1.5 text-xs">
        <Link
          href="/"
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Command Center</span>
        </Link>
        {crumbs.map((crumb) => (
          <span key={crumb.href} className="flex items-center gap-1.5">
            <ChevronRight className="w-3 h-3 text-muted-foreground/50" />
            {crumb.isLast ? (
              <span className="text-foreground font-medium">{crumb.label}</span>
            ) : (
              <Link
                href={crumb.href}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {crumb.label}
              </Link>
            )}
          </span>
        ))}
      </div>
    </nav>
  );
}
