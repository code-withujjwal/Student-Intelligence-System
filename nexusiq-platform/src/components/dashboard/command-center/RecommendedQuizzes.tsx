"use client";

import { motion } from "framer-motion";
import { QuickActionCard, SkeletonLoader } from "@/components/dashboard/widgets";
import { BookOpen, Zap, Users, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface RecommendedQuizzesProps {
  loading?: boolean;
}

export default function RecommendedQuizzes({ loading = false }: RecommendedQuizzesProps) {
  const [isLoaded, setIsLoaded] = useState(!loading);
  const router = useRouter();

  useEffect(() => {
    if (loading) setIsLoaded(false);
    const timer = setTimeout(() => setIsLoaded(true), 800);
    return () => clearTimeout(timer);
  }, [loading]);

  if (!isLoaded) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <div className="mb-2">
          <h2 className="text-base font-semibold text-white">Quick Actions</h2>
          <p className="text-xs text-white/40 mt-1">Jump right into your next session</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonLoader key={i} variant="card" />
          ))}
        </div>
      </motion.div>
    );
  }

  const recommendations = [
    {
      title: "Quiz Arena",
      description: "Browse and attempt hundreds of JEE/NEET quizzes",
      icon: BookOpen,
      color: "indigo" as const,
      action: { label: "Browse Quizzes", onClick: () => router.push("/quiz") },
    },
    {
      title: "AI Quiz Generator",
      description: "Generate a custom quiz on any topic with Gemini AI",
      icon: Sparkles,
      color: "purple" as const,
      action: { label: "Generate Now", onClick: () => router.push("/quiz/create") },
    },
    {
      title: "Practice Mode",
      description: "Timed practice on your weak topics with AI coaching",
      icon: Zap,
      color: "cyan" as const,
      action: { label: "Coming Soon", onClick: () => {} },
    },
    {
      title: "Study Group",
      description: "Connect with peers studying similar topics",
      icon: Users,
      color: "indigo" as const,
      action: { label: "Coming Soon", onClick: () => {} },
    },
  ];

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-base font-semibold text-white">Quick Actions</h2>
        <p className="text-xs text-white/40 mt-1">Jump right into your next session</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {recommendations.map((rec, idx) => (
          <motion.div
            key={rec.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
          >
            <QuickActionCard
              title={rec.title}
              description={rec.description}
              icon={rec.icon}
              color={rec.color}
              action={rec.action}
              glowColor={rec.color}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
