"use client";

import { motion } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import MagneticButton from "@/components/ui/MagneticButton";
import { Sparkles, ArrowRight } from "lucide-react";

interface AICoachBannerProps {
  userName?: string;
}

export default function AICoachBanner({ userName = "Student" }: AICoachBannerProps) {
  return (
    <div>
      <GlassCard glowColor="cyan" animate className="relative overflow-hidden p-6 md:p-8">
        {/* Animated background elements */}
        <motion.div
          className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 rounded-full blur-3xl -z-10"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 180],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />

        <motion.div
          className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-indigo-500/10 to-cyan-500/10 rounded-full blur-3xl -z-10"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [180, 90, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex-1">
            <motion.div
              className="flex items-center gap-2 mb-3"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <motion.div
                className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-indigo-500 flex items-center justify-center"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <Sparkles className="w-4 h-4 text-white" strokeWidth={2} />
              </motion.div>
              <span className="text-xs font-semibold uppercase tracking-widest text-cyan-300">
                AI Coach
              </span>
            </motion.div>

            <motion.h3
              className="text-lg md:text-2xl font-bold text-white mb-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              Ready for personalized coaching, {userName}?
            </motion.h3>

            <motion.p
              className="text-sm text-white/70 max-w-md"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              Your AI Coach has analyzed your recent performance and identified 3 critical weak points. Get instant, personalized coaching tailored to your learning style.
            </motion.p>

            <motion.div
              className="flex items-center gap-2 mt-3 text-xs text-cyan-300 font-medium"
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span>New insights available</span>
              <ArrowRight className="w-3 h-3" />
            </motion.div>
          </div>

          <motion.div
            className="flex-shrink-0"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7 }}
          >
            <MagneticButton
              variant="primary"
              size="lg"
              className="whitespace-nowrap"
              onClick={() => {}}
            >
              <Sparkles className="w-4 h-4" strokeWidth={2} />
              Launch Coach
            </MagneticButton>
          </motion.div>
        </div>

        {/* Animated border accent */}
        <motion.div
          className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-500 to-transparent"
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 1.5, delay: 0.8 }}
        />
      </GlassCard>
    </div>
  );
}
