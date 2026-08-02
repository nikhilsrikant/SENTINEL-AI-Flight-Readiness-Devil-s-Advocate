import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import Link from 'next/link';
import './globals.css';

// ---------------------------------------------------------------------------
// Font Configuration
// ---------------------------------------------------------------------------

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export const metadata: Metadata = {
  title: 'SENTINEL | AI Flight Readiness Platform',
  description:
    'AI-powered space mission safety platform leveraging IBM Granite to combat organizational blindness in spaceflight decision-making.',
  keywords: [
    'space safety',
    'flight readiness',
    'IBM Granite',
    'AI',
    'mission planning',
    'anomaly detection',
  ],
};

// ---------------------------------------------------------------------------
// Navigation Configuration
// ---------------------------------------------------------------------------

interface NavItem {
  name: string;
  href: string;
  icon: string;
  shortName: string;
}

const navigation: NavItem[] = [
  {
    name: "Devil's Advocate",
    href: '/advocate',
    icon: '⚠️',
    shortName: 'Advocate',
  },
  {
    name: 'Starliner Case Study',
    href: '/starliner',
    icon: '🚀',
    shortName: 'Starliner',
  },
  {
    name: 'Anomaly Tracker',
    href: '/anomalies',
    icon: '📡',
    shortName: 'Anomalies',
  },
  {
    name: 'Mission Planner',
    href: '/planner',
    icon: '📋',
    shortName: 'Planner',
  },
  {
    name: 'Orbital Monitor',
    href: '/orbital',
    icon: '🛰️',
    shortName: 'Orbital',
  },
  {
    name: 'Telemetry Engine',
    href: '/telemetry',
    icon: '📊',
    shortName: 'Telemetry',
  },
  {
    name: 'Knowledge Graph',
    href: '/knowledge',
    icon: '🧠',
    shortName: 'Knowledge',
  },
  {
    name: 'Space Academy',
    href: '/academy',
    icon: '🎓',
    shortName: 'Academy',
  },
];

// ---------------------------------------------------------------------------
// Root Layout
// ---------------------------------------------------------------------------

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased min-h-screen bg-background text-foreground ops-grid scrollbar-dark`}
      >
        {/* Top Navigation Bar */}
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-14 items-center px-4">
            {/* Platform Branding */}
            <Link href="/" className="flex items-center gap-2 mr-6">
              <div className="w-8 h-8 rounded bg-gradient-to-br from-granite to-granite-dark flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="font-bold text-lg tracking-tight hidden md:block">
                SENTINEL
              </span>
            </Link>

            {/* Module Navigation */}
            <nav className="flex items-center gap-1 overflow-x-auto">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors whitespace-nowrap"
                >
                  <span className="text-base">{item.icon}</span>
                  <span className="hidden lg:inline">{item.name}</span>
                  <span className="lg:hidden">{item.shortName}</span>
                </Link>
              ))}
            </nav>

            {/* Right Side Status */}
            <div className="ml-auto flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-status-nominal animate-pulse-glow" />
                <span className="text-xs text-muted-foreground font-mono hidden sm:block">
                  MOCK MODE
                </span>
              </div>
              <div className="text-xs text-granite font-medium hidden sm:block">
                Powered by IBM Granite
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1">{children}</main>

        {/* Footer */}
        <footer className="border-t border-border/40 py-4 px-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              SENTINEL v1.0.0 • AI Flight Readiness Intelligence & Mission
              Safety Platform
            </span>
            <span className="text-granite">IBM Granite • watsonx</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
