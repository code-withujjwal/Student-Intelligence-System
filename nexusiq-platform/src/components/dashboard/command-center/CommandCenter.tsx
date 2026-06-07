"use client";

import { motion, Variants } from "framer-motion";
import PerformanceSummary from "./PerformanceSummary";
import AICoachBanner from "./AICoachBanner";
import RecommendedQuizzes from "./RecommendedQuizzes";

interface CommandCenterProps {
  userName?: string;
  loading?: boolean;
}

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

export default function CommandCenter({
  userName = "Student",
  loading = false,
}: CommandCenterProps) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* Greeting and time-based messaging */}
      <motion.div variants={item} className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold font-heading text-white tracking-tight">
          Welcome back, <span className="gradient-text-brand">{userName}</span>
        </h1>
        <p className="text-sm md:text-base text-white/60 mt-2 max-w-2xl">
          You're on a 7-day streak! Keep the momentum. Here's your intelligence dashboard.
        </p>
      </motion.div>

      {/* Performance Summary Section */}
      <motion.section variants={item}>
        <PerformanceSummary loading={loading} />
      </motion.section>

      {/* AI Coach Banner */}
      <motion.section variants={item}>
        <AICoachBanner userName={userName} />
      </motion.section>

      {/* Recommended Quizzes Section */}
      <motion.section variants={item}>
        <RecommendedQuizzes loading={loading} />
      </motion.section>
    </motion.div>
  );
}
