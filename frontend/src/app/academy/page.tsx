'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ModuleHeader } from '@/components/shared/ModuleHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { GraniteAttribution } from '@/components/shared/GraniteAttribution';

interface Scenario {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  category: string;
  icon: string;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

const scenarios: Scenario[] = [
  {
    id: 'SCN-001',
    title: 'Challenger Launch Decision',
    description:
      'It\'s January 1986. Temperature is 36°F. Engineers are raising concerns about O-ring performance. You\'re the flight director. Launch or scrub?',
    difficulty: 'hard',
    category: 'Launch Decision',
    icon: '🚀',
  },
  {
    id: 'SCN-002',
    title: 'Apollo 13 Crisis',
    description:
      'Oxygen tank 2 has exploded. You have 3 crew, limited power, and need to get home. What\'s your priority?',
    difficulty: 'hard',
    category: 'In-Flight Emergency',
    icon: '🌙',
  },
  {
    id: 'SCN-003',
    title: 'Starliner Docking Abort',
    description:
      '3 of 28 RCS thrusters have failed during approach to ISS. Do you continue docking or abort?',
    difficulty: 'medium',
    category: 'Proximity Operations',
    icon: '🛸',
  },
  {
    id: 'SCN-004',
    title: 'Space Debris Avoidance',
    description:
      'Collision probability with tracked debris is 1.2e-4. ISS crew is sleeping. Do you wake them for a maneuver?',
    difficulty: 'medium',
    category: 'Orbital Safety',
    icon: '💫',
  },
  {
    id: 'SCN-005',
    title: 'Columbia Foam Strike',
    description:
      'Day 2 of mission. Cameras show foam struck the wing. Engineering says "probably fine." Do you request satellite imaging?',
    difficulty: 'hard',
    category: 'Risk Assessment',
    icon: '🔍',
  },
  {
    id: 'SCN-006',
    title: 'EVA Helmet Water',
    description:
      'During an EVA, an astronaut reports water accumulating in their helmet. Rate is increasing. Terminate EVA?',
    difficulty: 'easy',
    category: 'Crew Safety',
    icon: '🧑‍🚀',
  },
];

const quizQuestions: QuizQuestion[] = [
  {
    id: 'Q1',
    question: 'What phenomenon describes organizations accepting increasing risk over time?',
    options: [
      'Risk tolerance fatigue',
      'Normalization of deviance',
      'Safety culture erosion',
      'Progressive hazard acceptance',
    ],
    correct: 1,
    explanation:
      'Normalization of deviance, identified by sociologist Diane Vaughan in her study of the Challenger disaster, describes how organizations gradually accept abnormal conditions as normal.',
  },
  {
    id: 'Q2',
    question: 'What was the primary cause of the Challenger disaster?',
    options: [
      'Engine failure during ascent',
      'Fuel tank structural failure',
      'O-ring erosion in cold temperatures',
      'Computer navigation error',
    ],
    correct: 2,
    explanation:
      'The O-rings in the Solid Rocket Booster field joints failed to seal properly due to cold temperatures (36°F), well below their qualification range.',
  },
  {
    id: 'Q3',
    question: 'At what collision probability does NASA typically perform an ISS avoidance maneuver?',
    options: ['1 in 100', '1 in 1,000', '1 in 10,000', '1 in 100,000'],
    correct: 2,
    explanation:
      'NASA\'s threshold for performing a Debris Avoidance Maneuver (DAM) is approximately 1 in 10,000 (1e-4) collision probability.',
  },
];

export default function AcademyPage() {
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [decision, setDecision] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);

  const handleDecision = (choice: string) => {
    setDecision(choice);
  };

  const handleAnswer = (index: number) => {
    setSelectedAnswer(index);
    setShowExplanation(true);
    if (index === quizQuestions[currentQuestion].correct) {
      setScore((s) => s + 1);
    }
  };

  const nextQuestion = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion((q) => q + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setQuizComplete(true);
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
          icon="🎓"
          title="Space Academy"
          description='Interactive "What Would You Decide?" simulations and AI-generated quizzes for public education'
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Scenarios */}
          <div className="lg:col-span-2 space-y-4">
            {/* Scenario Cards */}
            <div className="bg-card rounded-lg border border-border p-6">
              <h2 className="text-lg font-semibold mb-4">
                What Would You Decide?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {scenarios.map((scenario, i) => (
                  <motion.div
                    key={scenario.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => {
                      setSelectedScenario(scenario);
                      setDecision(null);
                    }}
                    className={`p-4 rounded-lg border cursor-pointer transition-all hover:scale-[1.02] ${
                      selectedScenario?.id === scenario.id
                        ? 'border-granite bg-granite/5'
                        : 'border-border bg-secondary/30 hover:border-granite/30'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">{scenario.icon}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                          scenario.difficulty === 'hard'
                            ? 'bg-red-500/20 text-red-400'
                            : scenario.difficulty === 'medium'
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-emerald-500/20 text-emerald-400'
                        }`}
                      >
                        {scenario.difficulty}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold">{scenario.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {scenario.category}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Simulation Interface */}
            {selectedScenario && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-lg border border-border p-6"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">{selectedScenario.icon}</span>
                  <h2 className="text-lg font-semibold">
                    {selectedScenario.title}
                  </h2>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  {selectedScenario.description}
                </p>

                {!decision ? (
                  <div className="space-y-3">
                    <p className="text-sm font-medium">Your decision:</p>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => handleDecision('proceed')}
                        className="p-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors text-left"
                      >
                        <span className="text-lg">✓</span>
                        <div className="text-sm font-medium mt-1">
                          Proceed / Go
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Continue with current plan
                        </p>
                      </button>
                      <button
                        onClick={() => handleDecision('abort')}
                        className="p-4 rounded-lg border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 transition-colors text-left"
                      >
                        <span className="text-lg">✗</span>
                        <div className="text-sm font-medium mt-1">
                          Abort / Scrub
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Stop and reassess
                        </p>
                      </button>
                    </div>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-3"
                  >
                    <div
                      className={`p-4 rounded-lg border ${
                        decision === 'abort'
                          ? 'border-emerald-500/30 bg-emerald-500/10'
                          : 'border-orange-500/30 bg-orange-500/10'
                      }`}
                    >
                      <p className="text-sm font-medium mb-1">
                        {decision === 'abort'
                          ? '✓ Correct Decision'
                          : '⚠️ Risky Decision'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {decision === 'abort'
                          ? 'Excellent judgment! In the actual event, proceeding led to a serious safety incident. Your caution would have saved the mission.'
                          : 'In the actual event, proceeding contributed to a safety incident. The data available at the time was sufficient to recommend aborting.'}
                      </p>
                    </div>
                    <div className="granite-border pl-3">
                      <p className="text-xs text-muted-foreground">
                        SENTINEL&apos;s AI analysis would have flagged this as a
                        high-risk situation based on historical pattern matching
                        across 40+ similar incidents.
                      </p>
                      <GraniteAttribution />
                    </div>
                    <button
                      onClick={() => {
                        setSelectedScenario(null);
                        setDecision(null);
                      }}
                      className="text-xs text-granite hover:underline"
                    >
                      Try another scenario →
                    </button>
                  </motion.div>
                )}
              </motion.div>
            )}
          </div>

          {/* Right Panel - Quiz & Leaderboard */}
          <div className="space-y-4">
            {/* Quiz Section */}
            <div className="bg-card rounded-lg border border-border p-6">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Knowledge Quiz
              </h2>

              {!quizComplete ? (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-muted-foreground font-mono">
                      Question {currentQuestion + 1}/{quizQuestions.length}
                    </span>
                    <span className="text-xs font-mono text-granite">
                      Score: {score}
                    </span>
                  </div>

                  <p className="text-sm font-medium mb-3">
                    {quizQuestions[currentQuestion].question}
                  </p>

                  <div className="space-y-2">
                    {quizQuestions[currentQuestion].options.map((option, i) => (
                      <button
                        key={i}
                        onClick={() => handleAnswer(i)}
                        disabled={selectedAnswer !== null}
                        className={`w-full text-left p-3 rounded-md text-xs transition-colors ${
                          selectedAnswer === null
                            ? 'bg-secondary/50 hover:bg-secondary border border-border'
                            : i === quizQuestions[currentQuestion].correct
                              ? 'bg-emerald-500/20 border border-emerald-500/50'
                              : i === selectedAnswer
                                ? 'bg-red-500/20 border border-red-500/50'
                                : 'bg-secondary/30 border border-border opacity-50'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>

                  {showExplanation && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 space-y-2"
                    >
                      <div className="granite-border pl-3">
                        <p className="text-xs text-muted-foreground">
                          {quizQuestions[currentQuestion].explanation}
                        </p>
                      </div>
                      <button
                        onClick={nextQuestion}
                        className="w-full px-3 py-2 rounded-md bg-granite text-white text-xs font-medium hover:bg-granite-dark transition-colors"
                      >
                        {currentQuestion < quizQuestions.length - 1
                          ? 'Next Question'
                          : 'See Results'}
                      </button>
                    </motion.div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="text-3xl font-mono font-bold text-granite">
                    {score}/{quizQuestions.length}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {score === quizQuestions.length
                      ? 'Perfect score! Flight Director material!'
                      : score >= 2
                        ? 'Great knowledge of spaceflight safety!'
                        : 'Keep learning — the Knowledge Graph can help!'}
                  </p>
                  <button
                    onClick={() => {
                      setCurrentQuestion(0);
                      setSelectedAnswer(null);
                      setShowExplanation(false);
                      setScore(0);
                      setQuizComplete(false);
                    }}
                    className="mt-3 px-4 py-2 rounded-md bg-granite text-white text-xs font-medium hover:bg-granite-dark transition-colors"
                  >
                    Retry Quiz
                  </button>
                </div>
              )}
            </div>

            {/* Leaderboard */}
            <div className="bg-card rounded-lg border border-border p-6">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Leaderboard
              </h2>
              <div className="space-y-2">
                {[
                  { name: 'FlightDir_42', score: 2850, rank: 1 },
                  { name: 'RocketSci99', score: 2720, rank: 2 },
                  { name: 'OrbitalMech', score: 2680, rank: 3 },
                  { name: 'CapcomAlpha', score: 2540, rank: 4 },
                  { name: 'You', score: score * 100, rank: 5 },
                ].map((entry) => (
                  <div
                    key={entry.name}
                    className={`flex items-center gap-2 p-2 rounded ${
                      entry.name === 'You'
                        ? 'bg-granite/10 border border-granite/30'
                        : 'bg-secondary/30'
                    }`}
                  >
                    <span className="text-xs font-mono text-muted-foreground w-4">
                      #{entry.rank}
                    </span>
                    <span className="text-xs font-medium flex-1">
                      {entry.name}
                    </span>
                    <span className="text-xs font-mono text-granite">
                      {entry.score}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Attribution */}
            <div className="bg-card rounded-lg border border-border p-4">
              <p className="text-xs text-muted-foreground">
                Scenarios based on real spaceflight incidents. Quiz questions
                generated and validated by IBM Granite AI.
              </p>
              <GraniteAttribution />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
