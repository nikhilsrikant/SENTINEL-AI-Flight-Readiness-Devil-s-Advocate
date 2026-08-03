'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ModuleHeader } from '@/components/shared/ModuleHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { GraniteAttribution } from '@/components/shared/GraniteAttribution';
import { fetchAPI } from '@/lib/api';
import { getSeverityFromScore, formatRiskScore } from '@/lib/utils';

interface RiskFactor {
  factor: string;
  severity: string;
  score: number;
  description: string;
}

interface RiskAnalysis {
  program_id: string;
  cumulative_risk_score: number;
  risk_factors: RiskFactor[];
  recommendation: string;
}

interface BiasResult {
  bias_detected: boolean;
  bias_type: string;
  confidence: number;
  explanation: string;
  recommendation: string;
}

export default function DevilsAdvocatePage() {
  const [programId, setProgramId] = useState('starliner-cft');
  const [analysis, setAnalysis] = useState<RiskAnalysis | null>(null);
  const [biasText, setBiasText] = useState('');
  const [biasResult, setBiasResult] = useState<BiasResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [biasLoading, setBiasLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAPI<RiskAnalysis>(
        `/advocate/analyze/${programId}`
      );
      setAnalysis(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analysis');
    } finally {
      setLoading(false);
    }
  };

  const handleBiasCheck = async () => {
    setBiasLoading(true);
    try {
      const data = await fetchAPI<BiasResult>('/advocate/bias-check', {
        method: 'POST',
        body: JSON.stringify({ text: biasText }),
      });
      setBiasResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check bias');
    } finally {
      setBiasLoading(false);
    }
  };

  const riskScore = analysis?.cumulative_risk_score ?? 0;
  const severity = getSeverityFromScore(riskScore);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <ModuleHeader
          icon="⚠️"
          title="Devil's Advocate Engine"
          description="Generate the strongest case AGAINST launching — bias detection, cumulative risk scoring, and go-fever analysis"
          badge="Flagship"
          badgeColor="bg-orange-500/20 text-orange-400"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Risk Analysis Panel */}
          <div className="lg:col-span-2 space-y-4">
            {/* Analysis Form */}
            <div className="bg-card rounded-lg border border-border p-6">
              <h2 className="text-lg font-semibold mb-4">
                Pre-Flight Risk Assessment
              </h2>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={programId}
                  onChange={(e) => setProgramId(e.target.value)}
                  placeholder="Program ID (e.g., starliner-cft)"
                  className="flex-1 px-4 py-2 rounded-md bg-secondary border border-border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-granite/50"
                />
                <button
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="px-6 py-2 rounded-md bg-granite text-white text-sm font-medium hover:bg-granite-dark transition-colors disabled:opacity-50"
                >
                  {loading ? 'Analyzing...' : 'Analyze Risk'}
                </button>
              </div>
              <GraniteAttribution />
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-sm text-red-400">
                {error}
              </div>
            )}

            {/* Risk Factors */}
            {analysis && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-lg border border-border p-6"
              >
                <h2 className="text-lg font-semibold mb-4">
                  Risk Factors Identified
                </h2>
                <div className="space-y-3">
                  {analysis.risk_factors.map((factor, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-md bg-secondary/50 border border-border"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">
                          {factor.factor}
                        </span>
                        <StatusBadge level={factor.severity} />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {factor.description}
                      </p>
                      <div className="mt-2 text-xs font-mono text-muted-foreground">
                        Score: {formatRiskScore(factor.score)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Recommendation */}
                <div className="mt-4 p-4 rounded-md granite-border bg-granite/5">
                  <h3 className="text-sm font-semibold mb-1">
                    AI Recommendation
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {analysis.recommendation}
                  </p>
                  <GraniteAttribution />
                </div>
              </motion.div>
            )}

            {/* Cumulative Risk Timeline Placeholder */}
            <div className="bg-card rounded-lg border border-border p-6">
              <h2 className="text-lg font-semibold mb-4">
                Cumulative Risk Timeline
              </h2>
              <div className="h-48 flex items-center justify-center rounded-md bg-secondary/30 border border-border/50">
                <div className="text-center">
                  <div className="text-2xl mb-2">📈</div>
                  <p className="text-sm text-muted-foreground">
                    Risk accumulation chart
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Submit an analysis to visualize risk over time
                  </p>
                </div>
              </div>
            </div>

            {/* Go-Fever Bias Detection */}
            <div className="bg-card rounded-lg border border-border p-6">
              <h2 className="text-lg font-semibold mb-4">
                Go-Fever Bias Detection
              </h2>
              <textarea
                value={biasText}
                onChange={(e) => setBiasText(e.target.value)}
                placeholder="Paste meeting notes, emails, or decision documents to analyze for go-fever bias..."
                className="w-full h-32 px-4 py-3 rounded-md bg-secondary border border-border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-granite/50"
              />
              <div className="flex items-center justify-between mt-3">
                <GraniteAttribution />
                <button
                  onClick={handleBiasCheck}
                  disabled={biasLoading || !biasText}
                  className="px-4 py-2 rounded-md bg-granite text-white text-sm font-medium hover:bg-granite-dark transition-colors disabled:opacity-50"
                >
                  {biasLoading ? 'Checking...' : 'Detect Bias'}
                </button>
              </div>

              {biasResult && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 p-4 rounded-md granite-border bg-granite/5"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <StatusBadge
                      level={biasResult.bias_detected ? 'warning' : 'nominal'}
                    />
                    <span className="text-sm font-medium">
                      {biasResult.bias_type}
                    </span>
                    <span className="ml-auto text-xs font-mono text-muted-foreground">
                      Confidence: {(biasResult.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {biasResult.explanation}
                  </p>
                  <p className="text-xs text-granite mt-2">
                    {biasResult.recommendation}
                  </p>
                </motion.div>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-4">
            {/* Cumulative Risk Score */}
            <div className="bg-card rounded-lg border border-border p-6">
              <h2 className="text-lg font-semibold mb-4">Cumulative Risk</h2>
              <div className="flex flex-col items-center justify-center py-8">
                <div
                  className={`text-5xl font-mono font-bold text-status-${severity}`}
                >
                  {formatRiskScore(riskScore)}
                </div>
                <div className="mt-2">
                  <StatusBadge level={severity} />
                </div>
                <div className="mt-4 w-full h-2 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-status-nominal via-status-caution to-status-critical transition-all duration-500"
                    style={{ width: `${riskScore * 100}%` }}
                  />
                </div>
                <div className="flex justify-between w-full text-[10px] text-muted-foreground mt-1 font-mono">
                  <span>0.00</span>
                  <span>1.00</span>
                </div>
              </div>
            </div>

            {/* Starliner Case Study Link */}
            <Link
              href="/starliner"
              className="block bg-card rounded-lg border border-border p-6 hover:border-granite/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">🚀</span>
                <div>
                  <h3 className="font-semibold text-sm">
                    Starliner Case Study
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    See what SENTINEL would have detected during Boeing CFT
                  </p>
                </div>
              </div>
            </Link>

            {/* Module Info */}
            <div className="bg-card rounded-lg border border-border p-6">
              <h3 className="text-sm font-semibold mb-3">How It Works</h3>
              <ol className="space-y-2 text-xs text-muted-foreground">
                <li className="flex gap-2">
                  <span className="text-granite font-bold">1.</span>
                  Submit program ID or mission parameters
                </li>
                <li className="flex gap-2">
                  <span className="text-granite font-bold">2.</span>
                  IBM Granite analyzes historical patterns
                </li>
                <li className="flex gap-2">
                  <span className="text-granite font-bold">3.</span>
                  Risk factors scored and aggregated
                </li>
                <li className="flex gap-2">
                  <span className="text-granite font-bold">4.</span>
                  Strongest case against launch generated
                </li>
              </ol>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
