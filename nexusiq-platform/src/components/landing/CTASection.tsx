"use client";

import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Zap, Play, Sparkles } from "lucide-react";

const FONT_DISPLAY = "'Space Grotesk', 'Inter', sans-serif";
const FONT_HEADING = "'Syne', 'Space Grotesk', sans-serif";
const FONT_MONO = "'JetBrains Mono', monospace";

export default function CTASection() {
  return (
    <section className="py-32 relative overflow-hidden">
      {/* Backgrounds */}
      <div className="absolute inset-0 hero-mesh opacity-60" />
      <div className="absolute inset-0 grid-pattern opacity-25" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-indigo-600/12 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute inset-0 noise-overlay" />

      <div className="max-w-5xl mx-auto px-6 text-center relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Badge */}
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs tracking-wider uppercase mb-10 shadow-glow-sm"
            style={{ fontFamily: FONT_DISPLAY, fontWeight: 600 }}
          >
            <motion.span
              animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 3 }}
            >
              <Sparkles className="w-3 h-3" />
            </motion.span>
            Start your journey today
          </motion.span>

          {/* Heading */}
          <h2
            className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-[1.05]"
            style={{ fontFamily: FONT_HEADING }}
          >
            <span className="gradient-text">The Intelligence</span>
            <br />
            <motion.span
              className="glow-text-indigo inline-block"
              style={{
                backgroundImage: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 40%, #06B6D4 80%, #6366F1 100%)",
                backgroundSize: "200% auto",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
              animate={{ backgroundPosition: ["0% center", "200% center"] }}
              transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            >
              You Deserve.
            </motion.span>
          </h2>

          {/* Subtext */}
          <p
            className="text-white/45 text-lg mb-12 max-w-xl mx-auto leading-relaxed"
            style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300 }}
          >
            Join 98,000+ students and professionals who have unlocked their
            true potential with NexusIQ.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/auth/signup"
              className="btn-primary px-10 py-4 rounded-xl text-white font-semibold text-base flex items-center gap-3 group shadow-glow-lg hover:shadow-glow-lg transition-all duration-300"
              style={{ fontFamily: FONT_DISPLAY }}
            >
              Get Started Free
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <ArrowRight className="w-5 h-5" />
              </motion.div>
            </Link>

            <Link to="/demo"
              className="btn-ghost border border-white/12 px-10 py-4 rounded-xl text-white/65 hover:text-white font-medium text-base flex items-center gap-2.5 group transition-all duration-300"
              style={{ fontFamily: FONT_DISPLAY }}
            >
              <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-indigo-500/20 group-hover:border-indigo-500/30 transition-all duration-300">
                <Play className="w-3 h-3 ml-0.5" fill="currentColor" />
              </div>
              Watch Demo
            </Link>
          </div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <p className="text-xs text-white/25" style={{ fontFamily: "'Inter', sans-serif" }}>
              No credit card required · Free forever tier · Cancel anytime
            </p>
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-white/20" />
              <div className="flex items-center gap-1.5 text-xs text-white/30" style={{ fontFamily: FONT_MONO }}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#34d399]" />
                98,431 active now
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
