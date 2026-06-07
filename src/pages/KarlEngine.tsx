import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, GitBranch, ChevronRight } from 'lucide-react';

const PLATFORM_LIFECYCLE_STAGES = [
  {
    id: 'STAGE_CREATION',
    stageName: '1. Intake & Generation',
    hubDescription: 'How a quiz is born in the system, utilizing admin generation tools.',
    connectedCards: ['Create Quiz [Admin]', 'Manage Questions [Admin]'],
    accentColor: '#6366f1',
    accentBorder: 'rgba(99,102,241,0.40)',
    accentBg: 'rgba(99,102,241,0.09)',
    accentGlow: '0 0 18px rgba(99,102,241,0.18)',
    accentPulse: 'rgba(99,102,241,0.55)',
    technicalProcess: [
      {
        step: 'A',
        title: 'Manual Composition Interface',
        text: 'Teachers input custom questions, set marks, divide topics into custom sections, and add helpful step-by-step hints for students.',
      },
      {
        step: 'B',
        title: 'Web Scraping API Aggregator',
        text: 'Teachers use an integrated search engine tool to automatically scan the web and import syllabus-aligned question matrices instantly.',
      },
      {
        step: 'C',
        title: 'Session Rules Configuration',
        text: 'Admins set strict parameters: countdown timers, untimed practice modes, opening dates, and hard expiration deadlines.',
      },
    ],
  },
  {
    id: 'STAGE_CATEGORIES',
    stageName: '2. Content Categorization',
    hubDescription: 'How saved questions are sorted inside the Quiz Categories component.',
    connectedCards: ['Quiz Categories'],
    accentColor: '#10b981',
    accentBorder: 'rgba(16,185,129,0.40)',
    accentBg: 'rgba(16,185,129,0.09)',
    accentGlow: '0 0 18px rgba(16,185,129,0.18)',
    accentPulse: 'rgba(16,185,129,0.55)',
    technicalProcess: [
      {
        step: 'A',
        title: 'Evaluation Formats',
        text: 'Compiles saved data into standard formats: Mock Quizzes, Single/Multiple Choice questions, and Full-Length semester tests.',
      },
      {
        step: 'B',
        title: 'Advanced Analytical Formats',
        text: 'Generates complex Assertion & Reason problem sets for gate preparation and interactive digital Flashcards for core retention.',
      },
    ],
  },
  {
    id: 'STAGE_DELIVERY',
    stageName: '3. Student Practice Sandbox',
    hubDescription: 'How the active test object loads directly into the user viewport interface.',
    connectedCards: ['Start Quiz', 'Quiz History'],
    accentColor: '#f59e0b',
    accentBorder: 'rgba(245,158,11,0.40)',
    accentBg: 'rgba(245,158,11,0.09)',
    accentGlow: '0 0 18px rgba(245,158,11,0.18)',
    accentPulse: 'rgba(245,158,11,0.55)',
    technicalProcess: [
      {
        step: 'A',
        title: 'Live Handoff Mechanism',
        text: "Once a teacher saves a test, it appears instantly inside the student's Start Quiz card as an active assignment choice.",
      },
      {
        step: 'B',
        title: 'Active Session Sandbox',
        text: 'Tracks live submissions, coordinates sections, enforces timer expirations, and logs individual option click histories seamlessly.',
      },
    ],
  },
  {
    id: 'STAGE_SYNCHRONIZATION',
    stageName: '4. 360° Real-Time Analytics Sync',
    hubDescription: "How clicking 'Submit' automatically triggers multi-file database background updates.",
    connectedCards: ['My Progress', 'Achievements', 'Rewards / XP', 'User Management [Admin]'],
    accentColor: '#22d3ee',
    accentBorder: 'rgba(34,211,238,0.40)',
    accentBg: 'rgba(34,211,238,0.09)',
    accentGlow: '0 0 18px rgba(34,211,238,0.18)',
    accentPulse: 'rgba(34,211,238,0.55)',
    technicalProcess: [
      {
        step: 'A',
        title: 'Student Metrics Update',
        text: 'Instantly adds experience points to your profile, extends your daily study streak, and plots your scores onto LeetCode-style mastery curves.',
      },
      {
        step: 'B',
        title: 'Teacher Insights Portal',
        text: "Pushes raw scores straight to the teacher's administrative portal, showing total test-takers, average campus scores, and individual student weaknesses.",
      },
    ],
  },
];

type LifecycleStage = (typeof PLATFORM_LIFECYCLE_STAGES)[number];

export default function KarlEngine() {
  const navigate = useNavigate();
  const [selectedStage, setSelectedStage] = useState<LifecycleStage>(PLATFORM_LIFECYCLE_STAGES[0]);

  return (
    <div
      className="min-h-screen relative overflow-x-hidden text-slate-100"
      style={{ background: '#060912', fontFamily: 'Inter, sans-serif' }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 68% 52% at 12% 0%, rgba(99,102,241,0.07) 0%, transparent 60%), radial-gradient(ellipse 55% 48% at 88% 100%, rgba(34,211,238,0.05) 0%, transparent 55%)',
        }}
      />

      <div
        className="absolute inset-0 pointer-events-none opacity-[0.016]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.9) 1px, transparent 0)',
          backgroundSize: '22px 22px',
        }}
      />

      <header
        className="sticky top-0 z-40 border-b border-white/5"
        style={{ background: 'rgba(6,9,18,0.92)', backdropFilter: 'blur(18px)' }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              id="engine-back-btn"
              onClick={() => navigate('/features')}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/5 transition-all text-slate-400 hover:text-white border border-white/5 mr-1"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <p className="tracking-widest font-extrabold uppercase text-[0.58rem] text-blue-400 flex items-center gap-1.5 font-mono">
                <GitBranch className="w-3 h-3" />
                PLATFORM_DATA_FLOW_ENGINE
              </p>
              <h1 className="text-sm font-bold text-white tracking-wide mt-0.5 font-mono uppercase">
                Ecosystem Interactive Blueprint
              </h1>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-3">
            <div className="flex items-center gap-2 font-mono text-[0.58rem] font-bold">
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{
                  background: selectedStage.accentColor,
                  boxShadow: `0 0 6px ${selectedStage.accentColor}`,
                }}
              />
              <span className="tracking-widest" style={{ color: selectedStage.accentColor }}>
                STAGE {PLATFORM_LIFECYCLE_STAGES.findIndex((s) => s.id === selectedStage.id) + 1} ACTIVE
              </span>
            </div>
            <div className="font-mono text-[0.55rem] text-slate-600 px-2 py-1 rounded border border-white/5 bg-white/[0.02] tracking-widest uppercase">
              {PLATFORM_LIFECYCLE_STAGES.length} Lifecycle Stages
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-2 relative z-10"
        >
          <section className="lg:col-span-6 flex flex-col gap-6 relative">
            <svg
              className="absolute inset-0 pointer-events-none w-full h-full z-0"
              style={{ overflow: 'visible' }}
            >
              <defs>
                <linearGradient id="spine-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={selectedStage.accentColor} stopOpacity="0" />
                  <stop offset="40%" stopColor={selectedStage.accentColor} stopOpacity="0.25" />
                  <stop offset="100%" stopColor={selectedStage.accentColor} stopOpacity="0" />
                </linearGradient>
                <linearGradient id="pulse-line" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={selectedStage.accentColor} stopOpacity="0" />
                  <stop offset="50%" stopColor={selectedStage.accentColor} stopOpacity="0.7" />
                  <stop offset="100%" stopColor={selectedStage.accentColor} stopOpacity="0" />
                </linearGradient>
              </defs>
              <line
                x1="24"
                y1="80"
                x2="24"
                y2="95%"
                stroke="url(#spine-grad)"
                strokeWidth="1.5"
              />
              <line
                x1="24"
                y1="80"
                x2="24"
                y2="95%"
                stroke="url(#pulse-line)"
                strokeWidth="1.5"
                strokeDasharray="12 60"
              >
                <animate
                  attributeName="stroke-dashoffset"
                  from="0"
                  to="-72"
                  dur="1.6s"
                  repeatCount="indefinite"
                />
              </line>
            </svg>

            <div className="relative z-10">
              <p className="font-mono text-[0.58rem] font-extrabold uppercase tracking-widest text-slate-500">
                [ PLATFORM_DATA_FLOW_ENGINE ]
              </p>
              <h2 className="text-2xl font-bold text-white tracking-tight mt-1.5">
                Ecosystem Interactive Blueprint
              </h2>
              <p className="text-slate-500 text-[0.72rem] font-mono mt-1.5 leading-relaxed">
                Click any processing stage block to trace exactly how data moves across the system.
              </p>
            </div>

            <div className="flex flex-col gap-3 relative z-10">
              {PLATFORM_LIFECYCLE_STAGES.map((stage, stageIdx) => {
                const isActive = selectedStage.id === stage.id;
                return (
                  <motion.button
                    key={stage.id}
                    id={`stage-node-${stage.id}`}
                    onClick={() => setSelectedStage(stage)}
                    whileHover={{ scale: isActive ? 1.015 : 1.008 }}
                    animate={{ scale: isActive ? 1.015 : 1 }}
                    transition={{ duration: 0.18, ease: 'easeInOut' }}
                    className="w-full text-left rounded-xl border p-5 transition-all duration-250 relative overflow-hidden"
                    style={
                      isActive
                        ? {
                            background: stage.accentBg,
                            border: `1px solid ${stage.accentBorder}`,
                            boxShadow: stage.accentGlow,
                          }
                        : {
                            background: 'rgba(14,19,34,0.10)',
                            border: '1px solid rgba(255,255,255,0.05)',
                            opacity: 0.65,
                          }
                    }
                  >
                    {isActive && (
                      <div
                        className="absolute top-0 left-0 w-full h-[2px] rounded-t-xl"
                        style={{
                          background: `linear-gradient(90deg, transparent 0%, ${stage.accentColor} 50%, transparent 100%)`,
                        }}
                      />
                    )}

                    <div className="flex items-start gap-4">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 border font-mono text-[0.65rem] font-extrabold transition-all duration-200"
                        style={
                          isActive
                            ? {
                                background: stage.accentBg,
                                border: `1px solid ${stage.accentBorder}`,
                                color: stage.accentColor,
                                boxShadow: `0 0 10px ${stage.accentColor}30`,
                              }
                            : {
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.07)',
                                color: '#1e293b',
                              }
                        }
                      >
                        {String(stageIdx + 1).padStart(2, '0')}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h3
                            className="text-sm font-bold tracking-wide font-mono transition-colors duration-200"
                            style={{ color: isActive ? '#f1f5f9' : '#475569' }}
                          >
                            {stage.stageName}
                          </h3>
                          <ChevronRight
                            className="w-3.5 h-3.5 shrink-0 transition-all duration-200"
                            style={{
                              color: isActive ? stage.accentColor : '#1e293b',
                              transform: isActive ? 'translateX(2px)' : 'none',
                            }}
                          />
                        </div>

                        <p
                          className="text-[0.65rem] font-mono leading-relaxed transition-colors duration-200 mb-2"
                          style={{ color: isActive ? '#94a3b8' : '#334155' }}
                        >
                          {stage.hubDescription}
                        </p>

                        <div className="flex flex-wrap gap-1.5">
                          {stage.connectedCards.map((cardName) => (
                            <span
                              key={cardName}
                              className="font-mono text-[0.48rem] font-extrabold uppercase tracking-widest px-1.5 py-0.5 rounded border transition-all duration-200"
                              style={
                                isActive
                                  ? {
                                      color: stage.accentColor,
                                      background: stage.accentBg,
                                      border: `1px solid ${stage.accentBorder}`,
                                    }
                                  : {
                                      color: '#334155',
                                      background: 'transparent',
                                      border: '1px solid rgba(255,255,255,0.05)',
                                    }
                              }
                            >
                              {cardName}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            <div
              className="rounded-xl border border-white/5 p-4 flex items-center gap-3 relative z-10"
              style={{ background: 'rgba(14,19,34,0.25)' }}
            >
              <div className="flex items-center gap-2 flex-1">
                {PLATFORM_LIFECYCLE_STAGES.map((stage) => (
                  <button
                    key={stage.id}
                    id={`stage-dot-${stage.id}`}
                    onClick={() => setSelectedStage(stage)}
                    className="flex-1 h-1 rounded-full transition-all duration-300"
                    style={{
                      background:
                        selectedStage.id === stage.id
                          ? stage.accentColor
                          : 'rgba(255,255,255,0.06)',
                      boxShadow:
                        selectedStage.id === stage.id ? `0 0 6px ${stage.accentColor}` : 'none',
                    }}
                  />
                ))}
              </div>
              <span className="font-mono text-[0.52rem] text-slate-600 tracking-widest uppercase shrink-0">
                {PLATFORM_LIFECYCLE_STAGES.findIndex((s) => s.id === selectedStage.id) + 1} /{' '}
                {PLATFORM_LIFECYCLE_STAGES.length}
              </span>
            </div>
          </section>

          <section className="lg:col-span-6 flex flex-col gap-5">
            <div>
              <p className="font-mono text-[0.58rem] font-extrabold uppercase tracking-widest text-slate-500">
                [ DISSOLVED FUNCTIONAL BREAKDOWN ]
              </p>
              <AnimatePresence mode="wait">
                <motion.h2
                  key={`title-${selectedStage.id}`}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                  className="text-2xl font-bold text-white tracking-tight mt-1.5"
                >
                  {selectedStage.stageName}
                </motion.h2>
              </AnimatePresence>
              <p className="text-slate-500 text-[0.72rem] font-mono mt-1.5 leading-relaxed">
                {selectedStage.hubDescription}
              </p>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={selectedStage.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="flex flex-col gap-5"
              >
                <div
                  className="rounded-xl border p-5 flex items-center gap-3"
                  style={{
                    background: selectedStage.accentBg,
                    border: `1px solid ${selectedStage.accentBorder}`,
                    boxShadow: selectedStage.accentGlow,
                  }}
                >
                  <div
                    className="w-2 h-2 rounded-full animate-pulse shrink-0"
                    style={{
                      background: selectedStage.accentColor,
                      boxShadow: `0 0 7px ${selectedStage.accentColor}`,
                    }}
                  />
                  <p
                    className="font-mono text-[0.6rem] font-extrabold uppercase tracking-widest"
                    style={{ color: selectedStage.accentColor }}
                  >
                    Connected App Cards
                  </p>
                  <div className="flex flex-wrap gap-1.5 ml-auto">
                    {selectedStage.connectedCards.map((cardName) => (
                      <span
                        key={cardName}
                        className="font-mono text-[0.5rem] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded border"
                        style={{
                          color: selectedStage.accentColor,
                          background: 'rgba(0,0,0,0.20)',
                          border: `1px solid ${selectedStage.accentBorder}`,
                        }}
                      >
                        {cardName}
                      </span>
                    ))}
                  </div>
                </div>

                <div
                  className="rounded-xl border border-white/5 p-6 relative"
                  style={{ background: 'rgba(14,19,34,0.40)', backdropFilter: 'blur(12px)' }}
                >
                  <div
                    className="absolute top-0 left-0 w-full h-[2px] rounded-t-xl"
                    style={{
                      background: `linear-gradient(90deg, transparent 5%, ${selectedStage.accentColor}55, transparent 95%)`,
                    }}
                  />

                  <p className="font-mono text-[0.56rem] font-extrabold uppercase tracking-widest text-slate-500 mb-5">
                    Technical Process Steps
                  </p>

                  <div className="relative">
                    <div
                      className="absolute left-[1.375rem] top-3 bottom-3 w-[2px] rounded-full z-0"
                      style={{ background: 'rgba(255,255,255,0.05)' }}
                    />

                    <div className="flex flex-col gap-5 relative z-10">
                      {selectedStage.technicalProcess.map((processStep, processIdx) => (
                        <motion.div
                          key={`${selectedStage.id}-${processStep.step}`}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            duration: 0.22,
                            ease: 'easeOut',
                            delay: processIdx * 0.07,
                          }}
                          className="flex items-start gap-4"
                          id={`process-step-${selectedStage.id}-${processStep.step}`}
                        >
                          <div className="shrink-0 flex flex-col items-center z-10">
                            <div
                              className="w-[1.75rem] h-[1.75rem] rounded-full flex items-center justify-center font-mono text-[0.6rem] font-extrabold border transition-all duration-300"
                              style={{
                                background: `${selectedStage.accentColor}18`,
                                border: `1px solid ${selectedStage.accentBorder}`,
                                color: selectedStage.accentColor,
                                boxShadow: `0 0 10px ${selectedStage.accentColor}28`,
                              }}
                            >
                              {processStep.step}
                            </div>
                          </div>

                          <div
                            className="flex-1 min-w-0 rounded-xl border p-4 transition-all duration-200 hover:scale-[1.005]"
                            style={{
                              background: 'rgba(14,19,34,0.50)',
                              border: '1px solid rgba(255,255,255,0.05)',
                            }}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <div
                                className="w-1 h-3.5 rounded-full shrink-0"
                                style={{ background: selectedStage.accentColor }}
                              />
                              <h4 className="text-[0.78rem] font-bold text-white tracking-wide font-mono leading-snug">
                                {processStep.title}
                              </h4>
                            </div>
                            <p className="text-[0.7rem] text-slate-400 leading-relaxed font-medium">
                              {processStep.text}
                            </p>
                            <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center gap-2">
                              <span
                                className="w-1 h-1 rounded-full"
                                style={{ background: selectedStage.accentColor }}
                              />
                              <span className="font-mono text-[0.5rem] text-slate-600 uppercase tracking-widest font-bold">
                                Step {processIdx + 1} of {selectedStage.technicalProcess.length}
                              </span>
                              {processIdx < selectedStage.technicalProcess.length - 1 && (
                                <span className="font-mono text-[0.5rem] text-slate-700 uppercase tracking-widest ml-auto">
                                  → {selectedStage.technicalProcess[processIdx + 1].title}
                                </span>
                              )}
                              {processIdx === selectedStage.technicalProcess.length - 1 && (
                                <span
                                  className="font-mono text-[0.5rem] font-extrabold uppercase tracking-widest ml-auto px-1.5 py-0.5 rounded"
                                  style={{
                                    color: selectedStage.accentColor,
                                    background: selectedStage.accentBg,
                                  }}
                                >
                                  Stage Complete
                                </span>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div
                    className="rounded-xl border border-white/5 p-4 text-center"
                    style={{ background: 'rgba(14,19,34,0.30)' }}
                  >
                    <p
                      className="text-2xl font-extrabold font-mono"
                      style={{ color: selectedStage.accentColor }}
                    >
                      {selectedStage.technicalProcess.length}
                    </p>
                    <p className="font-mono text-[0.5rem] text-slate-600 uppercase tracking-widest mt-1 font-bold">
                      Process Steps
                    </p>
                  </div>
                  <div
                    className="rounded-xl border border-white/5 p-4 text-center"
                    style={{ background: 'rgba(14,19,34,0.30)' }}
                  >
                    <p
                      className="text-2xl font-extrabold font-mono"
                      style={{ color: selectedStage.accentColor }}
                    >
                      {selectedStage.connectedCards.length}
                    </p>
                    <p className="font-mono text-[0.5rem] text-slate-600 uppercase tracking-widest mt-1 font-bold">
                      App Cards Linked
                    </p>
                  </div>
                  <div
                    className="rounded-xl border border-white/5 p-4 text-center"
                    style={{ background: 'rgba(14,19,34,0.30)' }}
                  >
                    <p
                      className="text-2xl font-extrabold font-mono"
                      style={{ color: selectedStage.accentColor }}
                    >
                      {PLATFORM_LIFECYCLE_STAGES.findIndex((s) => s.id === selectedStage.id) + 1}
                    </p>
                    <p className="font-mono text-[0.5rem] text-slate-600 uppercase tracking-widest mt-1 font-bold">
                      Stage Index
                    </p>
                  </div>
                </div>

                <div
                  className="rounded-xl border border-white/5 p-4"
                  style={{ background: 'rgba(14,19,34,0.25)' }}
                >
                  <p className="font-mono text-[0.52rem] font-extrabold uppercase tracking-widest text-slate-600 mb-3">
                    All Lifecycle Stages
                  </p>
                  <div className="flex flex-col gap-2">
                    {PLATFORM_LIFECYCLE_STAGES.map((stage, stageIdx) => (
                      <button
                        key={stage.id}
                        id={`bottom-nav-${stage.id}`}
                        onClick={() => setSelectedStage(stage)}
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-left transition-all duration-200"
                        style={
                          selectedStage.id === stage.id
                            ? {
                                background: stage.accentBg,
                                border: `1px solid ${stage.accentBorder}`,
                              }
                            : {
                                background: 'transparent',
                                border: '1px solid transparent',
                              }
                        }
                      >
                        <span
                          className="font-mono text-[0.52rem] font-extrabold w-5 shrink-0"
                          style={{
                            color:
                              selectedStage.id === stage.id ? stage.accentColor : '#334155',
                          }}
                        >
                          {String(stageIdx + 1).padStart(2, '0')}
                        </span>
                        <span
                          className="font-mono text-[0.62rem] font-bold tracking-wide flex-1 transition-colors duration-200"
                          style={{
                            color:
                              selectedStage.id === stage.id ? '#f1f5f9' : '#475569',
                          }}
                        >
                          {stage.stageName}
                        </span>
                        <span
                          className="font-mono text-[0.48rem] font-bold tracking-widest shrink-0"
                          style={{
                            color:
                              selectedStage.id === stage.id ? stage.accentColor : '#1e293b',
                          }}
                        >
                          {stage.connectedCards.length} cards
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </section>
        </motion.div>
      </main>
    </div>
  );
}
