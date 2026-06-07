"use client";

import { motion } from "framer-motion";
import { StatCard, ChartCard, SkeletonLoader } from "@/components/dashboard/widgets";
import { Brain, Flame, Trophy, Target } from "lucide-react";
import { useState, useEffect } from "react";

interface PerformanceSummaryProps {
  loading?: boolean;
}

export default function PerformanceSummary({ loading = false }: PerformanceSummaryProps) {
  const [isLoaded, setIsLoaded] = useState(!loading);

  useEffect(() => {
    if (loading) setIsLoaded(false);
    const timer = setTimeout(() => setIsLoaded(true), 800);
    return () => clearTimeout(timer);
  }, [loading]);

  if (!isLoaded) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonLoader key={i} variant="stat" />
        ))}
      </motion.div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Intelligence Score"
          value="8,420"
          subtitle="Your cumulative performance"
          icon={Brain}
          trend={{ value: 12, isPositive: true }}
          glowColor="indigo"
        />
        <StatCard
          title="Current Streak"
          value="7 Days"
          subtitle="Keep the momentum alive"
          icon={Flame}
          trend={{ value: 3, isPositive: true }}
          glowColor="purple"
        />
        <StatCard
          title="Quiz Mastery"
          value="340/500"
          subtitle="Quizzes completed this month"
          icon={Target}
          trend={{ value: 8, isPositive: true }}
          glowColor="cyan"
        />
        <StatCard
          title="Global Rank"
          value="#247"
          subtitle="Percentile 94th"
          icon={Trophy}
          trend={{ value: 5, isPositive: true }}
          glowColor="indigo"
        />
      </div>

      <motion.div
        className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      >
        <ChartCard
          title="Subject Mastery"
          subtitle="Performance across your target subjects"
          icon={Brain}
          bars={[
            { label: "Mathematics", value: 92 },
            { label: "Physics", value: 85 },
            { label: "Chemistry", value: 88 },
            { label: "Biology", value: 80 },
          ]}
          glowColor="purple"
        />

        <ChartCard
          title="Weekly Activity"
          subtitle="Quizzes taken & AI insights generated"
          icon={Target}
          bars={[
            { label: "Monday", value: 12 },
            { label: "Tuesday", value: 15 },
            { label: "Wednesday", value: 18 },
            { label: "Thursday", value: 14 },
            { label: "Friday", value: 20 },
          ]}
          glowColor="cyan"
          action={{ label: "View Details", onClick: () => {} }}
        />
      </motion.div>
    </div>
  );
}
