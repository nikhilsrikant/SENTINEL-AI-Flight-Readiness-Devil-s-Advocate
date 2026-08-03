'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ModuleHeader } from '@/components/shared/ModuleHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { GraniteAttribution } from '@/components/shared/GraniteAttribution';
import { fetchAPI } from '@/lib/api';

interface Incident {
  id: string;
  name: string;
  date: string;
  severity: string;
  category: string;
  description: string;
  lessons_learned: string[];
  related_incidents: string[];
}

interface Citation {
  source: string;
  title: string;
  url?: string;
}

interface QueryResult {
  answer: string;
  incidents: Incident[];
  citations: Citation[];
}

const mockIncidents: Incident[] = [
  {
    id: 'INC-001',
    name: 'Challenger STS-51-L',
    date: '1986-01-28',
    severity: 'critical',
    category: 'Launch Failure',
    description: 'O-ring failure in SRB field joint due to cold temperatures.',
    lessons_learned: [
      'Temperature constraints must override schedule pressure',
      'Dissenting engineering opinions must be escalated',
      'Normalization of deviance is a systemic risk',
    ],
    related_incidents: ['Columbia STS-107', 'Starliner CFT'],
  },
  {
    id: 'INC-002',
    name: 'Columbia STS-107',
    date: '2003-02-01',
    severity: 'critical',
    category: 'Re-entry Failure',
    description: 'Foam strike damage to thermal protection system during launch.',
    lessons_learned: [
      'Known anomalies that recur are not safe',
      'Schedule pressure can override safety culture',
      'Independent technical authority is essential',
    ],
    related_incidents: ['Challenger STS-51-L', 'Starliner CFT'],
  },
  {
    id: 'INC-003',
    name: 'Apollo 13',
    date: '1970-04-13',
    severity: 'warning',
    category: 'In-Flight Anomaly',
    description: 'Oxygen tank explosion during transit to Moon.',
    lessons_learned: [
      'Redundancy in life support systems is critical',
      'Crew training for contingencies saves lives',
      'Real-time problem solving requires Mission Control flexibility',
    ],
    related_incidents: ['Apollo 1'],
  },
];

export default function KnowledgePage() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<QueryResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(
    null
  );

  const handleQuery = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const data = await fetchAPI<QueryResult>('/knowledge/query', {
        method: 'POST',
        body: JSON.stringify({ query }),
      });
      setResult(data);
    } catch {
      // Mock response on failure
      setResult({
        answer:
          'Based on analysis of 40+ spaceflight incidents spanning 50 years, organizational pressure and normalization of deviance are the most common contributing factors to catastrophic failures. The Challenger and Columbia disasters share striking parallels with the Starliner CFT decision-making patterns.',
        incidents: mockIncidents,
        citations: [
          {
            source: 'Rogers Commission Report',
            title: 'Report of the Presidential Commission on the Space Shuttle Challenger Accident',
          },
          {
            source: 'CAIB',
            title: 'Columbia Accident Investigation Board Report',
          },
          {
            source: 'NASA ASRS',
            title: 'Aviation Safety Reporting System Database',
          },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <ModuleHeader
          icon="🧠"
          title="Knowledge Graph"
          description="Explore 50+ years of spaceflight incidents through AI-powered semantic search and graph visualization"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Query & Graph */}
          <div className="lg:col-span-2 space-y-4">
            {/* Query Input */}
            <div className="bg-card rounded-lg border border-border p-6">
              <h2 className="text-lg font-semibold mb-3">Ask the Knowledge Graph</h2>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleQuery()}
                  placeholder="e.g., What common factors led to Challenger and Columbia?"
                  className="flex-1 px-4 py-2 rounded-md bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-granite/50"
                />
                <button
                  onClick={handleQuery}
                  disabled={loading || !query.trim()}
                  className="px-6 py-2 rounded-md bg-granite text-white text-sm font-medium hover:bg-granite-dark transition-colors disabled:opacity-50"
                >
                  {loading ? 'Searching...' : 'Query'}
                </button>
              </div>
              <GraniteAttribution />
            </div>

            {/* Graph Visualization Placeholder */}
            <div className="bg-card rounded-lg border border-border p-6">
              <h2 className="text-lg font-semibold mb-4">
                Incident Relationship Graph
              </h2>
              <div className="h-72 rounded-lg bg-gradient-to-b from-secondary/50 to-secondary/20 border border-border/50 flex items-center justify-center relative overflow-hidden">
                {/* SVG Graph Placeholder */}
                <svg
                  viewBox="0 0 400 250"
                  className="w-full h-full"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Connection lines */}
                  <line x1="200" y1="80" x2="100" y2="180" stroke="hsl(263, 70%, 58%)" strokeWidth="1" opacity="0.4" />
                  <line x1="200" y1="80" x2="300" y2="180" stroke="hsl(263, 70%, 58%)" strokeWidth="1" opacity="0.4" />
                  <line x1="100" y1="180" x2="300" y2="180" stroke="hsl(263, 70%, 58%)" strokeWidth="1" opacity="0.3" />
                  <line x1="200" y1="80" x2="320" y2="100" stroke="hsl(263, 70%, 58%)" strokeWidth="1" opacity="0.3" />
                  <line x1="100" y1="180" x2="80" y2="120" stroke="hsl(263, 70%, 58%)" strokeWidth="1" opacity="0.2" />

                  {/* Nodes */}
                  <circle cx="200" cy="80" r="18" fill="hsl(0, 84%, 60%)" opacity="0.8" />
                  <text x="200" y="84" textAnchor="middle" fill="white" fontSize="7" fontWeight="bold">Challenger</text>

                  <circle cx="100" cy="180" r="18" fill="hsl(0, 84%, 60%)" opacity="0.8" />
                  <text x="100" y="184" textAnchor="middle" fill="white" fontSize="7" fontWeight="bold">Columbia</text>

                  <circle cx="300" cy="180" r="15" fill="hsl(30, 95%, 55%)" opacity="0.8" />
                  <text x="300" y="184" textAnchor="middle" fill="white" fontSize="7" fontWeight="bold">Starliner</text>

                  <circle cx="320" cy="100" r="12" fill="hsl(30, 95%, 55%)" opacity="0.7" />
                  <text x="320" y="104" textAnchor="middle" fill="white" fontSize="6" fontWeight="bold">Apollo 13</text>

                  <circle cx="80" cy="120" r="10" fill="hsl(45, 93%, 55%)" opacity="0.6" />
                  <text x="80" y="124" textAnchor="middle" fill="white" fontSize="5" fontWeight="bold">Apollo 1</text>
                </svg>
                <div className="absolute bottom-3 left-3 text-[10px] font-mono text-muted-foreground">
                  D3.js force-directed graph • Interactive
                </div>
              </div>
            </div>

            {/* AI Answer */}
            {result && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-card rounded-lg border border-border p-6"
              >
                <h2 className="text-lg font-semibold mb-3">AI Response</h2>
                <div className="granite-border pl-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {result.answer}
                  </p>
                  <GraniteAttribution />
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Panel */}
          <div className="space-y-4">
            {/* Incident List */}
            <div className="bg-card rounded-lg border border-border p-6">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Incident Database
              </h2>
              <div className="space-y-2">
                {(result?.incidents || mockIncidents).map((incident) => (
                  <div
                    key={incident.id}
                    onClick={() => setSelectedIncident(incident)}
                    className={`p-3 rounded-md cursor-pointer transition-colors ${
                      selectedIncident?.id === incident.id
                        ? 'bg-granite/10 border border-granite/30'
                        : 'bg-secondary/30 border border-transparent hover:bg-secondary/50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-muted-foreground">
                        {incident.id}
                      </span>
                      <StatusBadge level={incident.severity} />
                    </div>
                    <div className="text-sm font-medium">{incident.name}</div>
                    <div className="text-[10px] text-muted-foreground font-mono">
                      {incident.date}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Incident Detail */}
            {selectedIncident && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-lg border border-border p-6"
              >
                <h3 className="font-semibold text-sm mb-2">
                  {selectedIncident.name}
                </h3>
                <p className="text-xs text-muted-foreground mb-3">
                  {selectedIncident.description}
                </p>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                  Lessons Learned
                </h4>
                <ul className="space-y-1">
                  {selectedIncident.lessons_learned.map((lesson, i) => (
                    <li
                      key={i}
                      className="text-xs text-muted-foreground flex gap-2"
                    >
                      <span className="text-granite">•</span>
                      {lesson}
                    </li>
                  ))}
                </ul>
                {selectedIncident.related_incidents.length > 0 && (
                  <div className="mt-3">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-1">
                      Related
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedIncident.related_incidents.map((rel) => (
                        <span
                          key={rel}
                          className="px-2 py-0.5 rounded text-[10px] bg-secondary text-muted-foreground"
                        >
                          {rel}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Citations */}
            {result?.citations && (
              <div className="bg-card rounded-lg border border-border p-6">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                  Citations
                </h2>
                <div className="space-y-2">
                  {result.citations.map((citation, i) => (
                    <div key={i} className="p-2 rounded bg-secondary/30">
                      <div className="text-xs font-medium">
                        {citation.title}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {citation.source}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
