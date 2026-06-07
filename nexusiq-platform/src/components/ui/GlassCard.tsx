"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: "indigo" | "purple" | "cyan" | "none";
  magnetic?: boolean;
  animate?: boolean;
  delay?: number;
  onClick?: () => void;
}

export default function GlassCard({
  children,
  className,
  glowColor = "indigo",
  magnetic = false,
  animate = true,
  delay = 0,
  onClick,
}: GlassCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [4, -4]);
  const rotateY = useTransform(x, [-100, 100], [-4, 4]);

  const springConfig = { stiffness: 400, damping: 30 };
  const springX = useSpring(rotateX, springConfig);
  const springY = useSpring(rotateY, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!magnetic || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set(e.clientX - rect.left - rect.width / 2);
    y.set(e.clientY - rect.top - rect.height / 2);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const glowShadow = {
    indigo: "hover:shadow-[0_0_40px_rgba(99,102,241,0.2)]",
    purple: "hover:shadow-[0_0_40px_rgba(139,92,246,0.2)]",
    cyan: "hover:shadow-[0_0_40px_rgba(6,182,212,0.2)]",
    none: "",
  };

  return (
    <motion.div
      ref={ref}
      initial={animate ? { opacity: 0, y: 20 } : undefined}
      whileInView={animate ? { opacity: 1, y: 0 } : undefined}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      style={magnetic ? { rotateX: springX, rotateY: springY, transformPerspective: 800 } : undefined}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "glass-card rounded-2xl transition-all duration-300",
        glowShadow[glowColor],
        className
      )}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}
