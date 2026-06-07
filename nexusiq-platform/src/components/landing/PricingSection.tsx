"use client";

import { motion } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import { Link } from "react-router-dom";
import { Check, Zap, Crown, Building2, ArrowRight, Star } from "lucide-react";

const FONT_DISPLAY = "'Space Grotesk', 'Inter', sans-serif";
const FONT_HEADING = "'Syne', 'Space Grotesk', sans-serif";
const FONT_MONO = "'JetBrains Mono', monospace";

const plans = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    description: "Perfect for individuals getting started",
    icon: Zap,
    iconColor: "text-white/60",
    iconBg: "bg-white/5 border-white/10",
    accentColor: "text-white/60",
    border: "border-white/10",
    glow: "none" as const,
    features: [
      "50 AI-generated questions/month",
      "Basic performance analytics",
      "5 quiz attempts/month",
      "Community leaderboard",
    ],
    cta: "Get Started",
    href: "/auth/signup",
    highlight: false,
    checkColor: "text-white/40",
  },
  {
    name: "Pro",
    price: "₹299",
    period: "/month",
    description: "For serious aspirants and learners",
    icon: Crown,
    iconColor: "text-indigo-400",
    iconBg: "bg-indigo-500/15 border-indigo-500/30",
    accentColor: "text-indigo-400",
    border: "border-indigo-500/35",
    glow: "indigo" as const,
    features: [
      "Unlimited AI-generated questions",
      "Advanced behavioral analytics",
      "AI Performance Coach",
      "Multiplayer battles",
      "Daily AI briefings",
      "Priority support",
    ],
    cta: "Start Pro Trial",
    href: "/auth/signup?plan=pro",
    highlight: true,
    checkColor: "text-indigo-400",
  },
  {
    name: "Institute",
    price: "₹4,999",
    period: "/month",
    description: "For coaching centers and institutions",
    icon: Building2,
    iconColor: "text-cyan-400",
    iconBg: "bg-cyan-500/10 border-cyan-500/20",
    accentColor: "text-cyan-400",
    border: "border-cyan-500/20",
    glow: "cyan" as const,
    features: [
      "Everything in Pro",
      "Unlimited classrooms",
      "Teacher dashboard",
      "Live proctoring",
      "Custom question banks",
      "Export & reporting",
      "Dedicated support",
    ],
    cta: "Contact Sales",
    href: "/contact",
    highlight: false,
    checkColor: "text-cyan-400",
  },
];

export default function PricingSection() {
  return (
    <section id="pricing" className="py-32 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-950/6 to-transparent pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-20"
        >
          <span
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs tracking-wider uppercase mb-6 shadow-glow-sm"
            style={{ fontFamily: FONT_DISPLAY, fontWeight: 600 }}
          >
            <Zap className="w-3 h-3" />
            Transparent Pricing
          </span>
          <h2
            className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4"
            style={{ fontFamily: FONT_HEADING }}
          >
            <span className="gradient-text">Start Free.</span>
            <br />
            <span className="gradient-text-brand">Scale When Ready.</span>
          </h2>
          <p
            className="text-white/45 max-w-xl mx-auto mt-4 leading-relaxed"
            style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300 }}
          >
            No hidden fees. No surprise bills. Cancel anytime.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-5 items-start">
          {plans.map((plan, i) => {
            const Icon = plan.icon;
            return (
              <GlassCard
                key={plan.name}
                delay={i * 0.1}
                magnetic
                className={`p-8 border ${plan.border} relative overflow-hidden transition-all duration-500 ${
                  plan.highlight ? "scale-[1.04] shadow-glow-md" : ""
                }`}
                glowColor={plan.glow}
              >
                {/* Top accent line for highlighted plan */}
                {plan.highlight && (
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
                )}

                {/* Popular badge */}
                {plan.highlight && (
                  <div className="absolute top-4 right-4">
                    <span
                      className="flex items-center gap-1 text-[10px] font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-500 px-2.5 py-1 rounded-full uppercase tracking-wider shadow-glow-sm"
                      style={{ fontFamily: FONT_DISPLAY }}
                    >
                      <Star className="w-2.5 h-2.5" strokeWidth={2.5} fill="currentColor" />
                      Most Popular
                    </span>
                  </div>
                )}

                {/* Icon */}
                <div className={`inline-flex p-2.5 rounded-xl border ${plan.iconBg} mb-4`}>
                  <Icon className={`w-5 h-5 ${plan.iconColor}`} strokeWidth={1.5} />
                </div>

                {/* Plan name */}
                <div className="text-sm text-white/45 font-medium mb-1" style={{ fontFamily: FONT_DISPLAY }}>
                  {plan.name}
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-1.5 mb-2">
                  <span
                    className={`text-4xl font-extrabold tracking-tight ${plan.highlight ? "text-white" : "text-white/90"}`}
                    style={{ fontFamily: FONT_DISPLAY }}
                  >
                    {plan.price}
                  </span>
                  <span className="text-white/35 text-sm" style={{ fontFamily: FONT_MONO }}>{plan.period}</span>
                </div>

                {/* Description */}
                <p
                  className="text-sm text-white/40 mb-7 leading-relaxed"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  {plan.description}
                </p>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <div className={`p-0.5 rounded-full ${plan.highlight ? "bg-indigo-500/20" : "bg-white/5"} shrink-0 mt-0.5`}>
                        <Check className={`w-3 h-3 ${plan.checkColor}`} strokeWidth={2.5} />
                      </div>
                      <span
                        className="text-sm text-white/55 leading-relaxed"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                      >
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link to={plan.href}
                  className={`block w-full py-3.5 rounded-xl text-sm font-semibold text-center transition-all duration-300 flex items-center justify-center gap-2 ${
                    plan.highlight
                      ? "btn-primary text-white shadow-glow-md hover:shadow-glow-lg"
                      : "btn-ghost border border-white/10 text-white/60 hover:text-white"
                  }`}
                  style={{ fontFamily: FONT_DISPLAY }}
                >
                  {plan.cta}
                  {plan.highlight && (
                    <motion.span
                      animate={{ x: [0, 4, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                      <ArrowRight className="w-4 h-4" />
                    </motion.span>
                  )}
                </Link>
              </GlassCard>
            );
          })}
        </div>

        {/* Bottom note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center text-xs text-white/25 mt-8"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          No credit card required · Free forever tier · Cancel anytime · Indian pricing in INR
        </motion.p>
      </div>
    </section>
  );
}
