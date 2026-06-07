import React from 'react';
import { motion, type Variants } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Play,
  Library,
  LineChart,
  History,
  Award,
  Gift,
  Bot,
  BrainCircuit,
  Flame,
  Swords,
  Trophy,
  Users,
  User,
  Settings,
  Bell,
  PlusCircle,
  Shield,
  ArrowLeft,
  Cpu,
  Database,
  BarChart,
  FileText,
  CheckSquare,
  Calendar,
  Archive,
  HelpCircle
} from 'lucide-react';
import { useFeaturesStore } from '../store/useFeaturesStore';
import { toast } from 'sonner';

const SECTORS = [
  {
    id: 'SEC_01',
    title: 'CORE SYSTEMS',
    description: 'MAIN DASHBOARD & ANALYTICS',
    glowColor: 'indigo',
    items: [
      { id: 1, title: 'START QUIZ', desc: 'INITIALIZE STANDARD TESTING PROTOCOL.', icon: Play, status: 'SYS_READY' },
      { id: 2, title: 'QUIZ CATEGORIES', desc: 'BROWSE AVAILABLE KNOWLEDGE NODES.', icon: Library, status: 'ONLINE' },
      { id: 3, title: 'MY PROGRESS', desc: 'VIEW MASTERY & ANALYTICS TELEMETRY.', icon: LineChart, status: 'TRACKING' },
      { id: 4, title: 'QUIZ HISTORY', desc: 'ACCESS PAST PERFORMANCE ARCHIVES.', icon: History, status: 'ARCHIVED' },
      { id: 6, title: 'ACHIEVEMENTS', desc: 'REVIEW UNLOCKED TACTICAL BADGES.', icon: Award, status: 'UPDATED' },
      { id: 7, title: 'REWARDS / XP', desc: 'MONITOR RESOURCE ACCUMULATION.', icon: Gift, status: 'ACTIVE' },
    ]
  },
  {
    id: 'SEC_02',
    title: 'NEURAL INTELLIGENCE',
    description: 'AI PROCESSING & GENERATION',
    glowColor: 'purple',
    items: [
      { id: 8, title: 'AI QUIZ GENERATOR', desc: 'SYNTHESIZE NEW CHALLENGES VIA NEURAL LINK.', icon: Bot, status: 'LINK_ACTIVE' },
      { id: 9, title: 'AI PERFORMANCE ANALYSIS', desc: 'DEEP-DIVE TACTICAL FEEDBACK MATRIX.', icon: BrainCircuit, status: 'PROCESSING' },
      { id: 22, title: 'ENGINE CONTROL', desc: 'LIVE ADAPTIVE PIPELINE ARCHITECTURE VIEW.', icon: Cpu, status: 'RUNNING' },
    ]
  },
  {
    id: 'SEC_03',
    title: 'COMBAT & COMBATANTS',
    description: 'GAMIFIED MULTIPLAYER SYSTEMS',
    glowColor: 'cyan',
    items: [
      { id: 10, title: 'DAILY CHALLENGE', desc: 'TIME-SENSITIVE TACTICAL OBJECTIVE.', icon: Flame, status: 'ACTIVE' },
      { id: 11, title: 'MULTIPLAYER BATTLE', desc: 'ENGAGE IN LIVE COMPETITIVE SIMULATION.', icon: Swords, status: 'MATCHMAKING' },
      { id: 12, title: 'LEADERBOARD', desc: 'GLOBAL OPERATIVE RANKING SYSTEM.', icon: Trophy, status: 'LIVE' },
      { id: 14, title: 'FRIENDS & CHALLENGES', desc: 'OPERATIVE NETWORK AND DIRECT COMBAT.', icon: Users, status: 'ONLINE' },
    ]
  },
  {
    id: 'SEC_04',
    title: 'PROTOCOL CONTROL',
    description: 'UTILITIES & ADMINISTRATION',
    glowColor: 'slate',
    items: [
      { id: 16, title: 'PROFILE', desc: 'MANAGE OPERATIVE IDENTITY DATA.', icon: User, status: 'SECURE' },
      { id: 17, title: 'SETTINGS', desc: 'CONFIGURE INTERFACE PARAMETERS.', icon: Settings, status: 'ACCESSIBLE' },
      { id: 18, title: 'NOTIFICATIONS', desc: 'SYSTEM-WIDE ALERT REGISTRY.', icon: Bell, status: '0_NEW' },
      { id: 19, title: 'CREATE QUIZ [ADMIN]', desc: 'CONSTRUCT NEW DATA STRUCTURES.', icon: PlusCircle, status: 'AUTH_REQ' },
      { id: 20, title: 'MANAGE QUESTIONS [ADMIN]', desc: 'MODIFY EXISTING DATABASE NODES.', icon: Database, status: 'AUTH_REQ' },
      { id: 21, title: 'USER MANAGEMENT [ADMIN]', desc: 'OVERSEE OPERATIVE CLEARANCE.', icon: Shield, status: 'RESTRICTED' },
    ]
  }
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.15
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15, scale: 0.97 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: 'spring', stiffness: 260, damping: 20 }
  }
};

const getGlowStyles = (color: string) => {
  switch(color) {
    case 'indigo': return 'hover:border-indigo-500/30 hover:shadow-[0_0_25px_rgba(99,102,241,0.15)] hover:bg-[#12192c]/40';
    case 'purple': return 'hover:border-purple-500/30 hover:shadow-[0_0_25px_rgba(168,85,247,0.15)] hover:bg-[#12192c]/40';
    case 'cyan': return 'hover:border-cyan-500/30 hover:shadow-[0_0_25px_rgba(34,211,238,0.15)] hover:bg-[#12192c]/40';
    default: return 'hover:border-slate-500/30 hover:shadow-[0_0_25px_rgba(148,163,184,0.15)] hover:bg-[#12192c]/40';
  }
};

const getGridClasses = (sectorId: string) => {
  switch (sectorId) {
    case 'SEC_01': return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5';
    case 'SEC_02': return 'grid grid-cols-1 md:grid-cols-2 gap-5';
    case 'SEC_03': return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5';
    case 'SEC_04': return 'grid grid-cols-1 md:grid-cols-3 gap-5';
    default: return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5';
  }
};

const getBadgeColor = (color: string) => {
  switch(color) {
    case 'indigo': return 'text-indigo-400 border-indigo-500/20';
    case 'purple': return 'text-purple-400 border-purple-500/20';
    case 'cyan': return 'text-cyan-400 border-cyan-500/20';
    default: return 'text-slate-400 border-slate-500/20';
  }
};

export default function FeaturesHub() {
  const navigate = useNavigate();
  const store = useFeaturesStore();

  const handleCardClick = (id: number) => {
    switch (id) {
      case 1:
        navigate('/start'); // Changed from /start-quiz to /start as per App.tsx
        break;
      case 2:
        navigate('/categories');
        break;
      case 3:
      case 4:
        navigate('/my-progress');
        break;
      case 6:
      case 7:
        navigate('/achievements');
        break;
      case 8:
      case 9:
        navigate('/neural-cockpit');
        break;
      case 10:
        navigate('/daily-challenge');
        break;
      case 11:
        navigate('/multiplayer');
        break;
      case 12:
        navigate('/leaderboard');
        break;
      case 14:
        navigate('/friends');
        break;
      case 16:
        navigate('/profile');
        break;
      case 17:
        navigate('/settings');
        break;
      case 18:
        navigate('/notifications');
        break;
      case 19:
        navigate('/quiz-creator');
        break;
      case 20:
        navigate('/manage-questions');
        break;
      case 21:
        navigate('/user-management');
        break;
      case 22:
        navigate('/karl-engine'); // Changed from /engine to /karl-engine as per App.tsx
        break;
      default:
        // Do nothing or handle unrecognized IDs gracefully without locking
        break;
    }
  };

  return (
    <div
      className="min-h-screen relative overflow-x-hidden text-slate-300 select-none p-6 lg:p-8"
      style={{
        background: '#060912',
        fontFamily: '"Space Mono", "JetBrains Mono", "Fira Code", monospace',
        letterSpacing: '0.05em'
      }}
    >
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.06) 1px, transparent 0)',
          backgroundSize: '20px 20px',
          opacity: 0.02
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto">
        <header className="flex items-center justify-between mb-10 border-b border-white/5 pb-5">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/5 transition-all text-slate-400 hover:text-white border border-white/5 mr-1 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <p className="tracking-widest font-extrabold uppercase text-[0.6rem] text-indigo-400 flex items-center gap-1.5 animate-pulse">
                TELEMETRY ACTIVE // SYSTEM_NOMINAL
              </p>
              <h1 className="text-sm font-bold text-white tracking-wider mt-0.5 uppercase">
                OPERATIVE FEATURES COCKPIT
              </h1>
            </div>
          </div>

          <div className="hidden sm:flex flex-col items-end text-right">
            <div className="font-mono text-xs text-slate-400 flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_#22c55e]" />
              SYSTEM_SECURE
            </div>
            <div className="font-mono text-[9px] text-slate-600 mt-0.5">V2.4.1_OMEGA</div>
          </div>
        </header>

        <motion.div
          className="flex flex-col gap-10 pb-16"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Quiz Builder Dashboard Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: 'Total Quizzes', value: '24', icon: BarChart, color: 'text-indigo-400' },
              { label: 'Draft Quizzes', value: '5', icon: FileText, color: 'text-slate-400' },
              { label: 'Published', value: '16', icon: CheckSquare, color: 'text-green-400' },
              { label: 'Scheduled', value: '2', icon: Calendar, color: 'text-amber-400' },
              { label: 'Archived', value: '1', icon: Archive, color: 'text-purple-400' },
              { label: 'Questions Used', value: '1.2k', icon: HelpCircle, color: 'text-cyan-400' }
            ].map((stat, i) => (
              <motion.div key={i} variants={itemVariants} className="bg-[#0e1322]/40 border border-white/5 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
                <p className="text-2xl font-black text-white tracking-wider">{stat.value}</p>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {SECTORS.map((sector) => (
            <div key={sector.id} className="flex flex-col gap-5 text-left">
              <div className="flex items-end gap-3 border-b border-white/5 pb-1.5">
                <h2 className="text-sm font-extrabold text-white tracking-widest uppercase">
                  {sector.title}
                </h2>
                <span className="font-mono text-[10px] text-slate-500 mb-0.5">[{sector.id}]</span>
                <span className="font-mono text-[9px] text-slate-600 mb-0.5 tracking-wider hidden md:inline ml-2 uppercase">
                  · {sector.description}
                </span>
                <div className="flex-1 border-t border-dashed border-white/5 mb-1.5 ml-4"></div>
              </div>

              <div className={getGridClasses(sector.id)}>
                {sector.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={item.id}
                      variants={itemVariants}
                      whileHover={{ scale: 1.015 }}
                      onClick={() => handleCardClick(item.id)}
                      className={`group relative bg-[#0e1322]/30 backdrop-blur-md border border-white/5 rounded-xl p-6 cursor-pointer overflow-hidden transition-all duration-300 ease-out ${getGlowStyles(sector.glowColor)}`}
                    >
                      <div className="relative z-10 flex flex-col h-full pb-6 text-left">
                        <div className="flex justify-between items-start mb-4">
                          <div className="w-10 h-10 border border-white/10 rounded-lg flex items-center justify-center bg-slate-950/40">
                            <Icon className="w-5 h-5 text-slate-300 group-hover:text-white transition-colors" />
                          </div>
                          <span className={`absolute top-5 right-5 font-mono text-[10px] px-2 py-0.5 border bg-black/40 font-bold rounded uppercase tracking-wider ${getBadgeColor(sector.glowColor)}`}>
                            {item.status}
                          </span>
                        </div>

                        <h3 className="text-base font-extrabold text-white tracking-wider uppercase">
                          {item.title}
                        </h3>
                        <p className="text-slate-400 text-xs tracking-wide leading-relaxed mt-2 uppercase">
                          {item.desc}
                        </p>

                        <div className="absolute bottom-4 left-6 font-mono text-[10px] text-slate-600 uppercase tracking-widest">
                          ID: {item.id.toString().padStart(4, '0')}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
