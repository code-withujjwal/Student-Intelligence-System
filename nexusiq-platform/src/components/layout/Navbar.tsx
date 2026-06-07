"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import MagneticButton from "@/components/ui/MagneticButton";
import { Menu, X, Zap, Activity } from "lucide-react";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Analytics", href: "#analytics" },
  { label: "Pricing", href: "#pricing" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          scrolled
            ? "py-3 backdrop-blur-2xl border-b border-white/[0.06] bg-[#050816]/85 shadow-[0_1px_40px_rgba(0,0,0,0.4)]"
            : "py-5"
        )}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group relative z-[60]">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 flex items-center justify-center shadow-glow-sm group-hover:shadow-glow-md transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <Zap className="w-4.5 h-4.5 text-white relative z-10" strokeWidth={2.5} />
            </motion.div>
            <span
              className="text-[1.15rem] font-bold tracking-tight text-white"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Nexus<span className="gradient-text-brand">IQ</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link key={link.label}
                to={link.href}
                onClick={() => setActiveLink(link.label)}
                className={cn(
                  "relative px-4 py-2 text-sm rounded-lg transition-all duration-200 font-medium",
                  activeLink === link.label
                    ? "text-white"
                    : "text-white/55 hover:text-white hover:bg-white/[0.05]"
                )}
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {link.label}
                {activeLink === link.label && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute inset-0 rounded-lg bg-white/[0.07] border border-white/10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* Live Status Pill */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#34d399]" />
              <span className="text-[10px] font-semibold text-emerald-400 tracking-wider" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                LIVE
              </span>
            </div>

            <Link to="/auth/login"
              className="px-4 py-2 text-sm text-white/65 hover:text-white font-medium transition-colors duration-200"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Sign In
            </Link>
            <MagneticButton variant="primary" size="sm">
              <Link to="/auth/signup"
                className="flex items-center gap-1.5"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Get Started Free
              </Link>
            </MagneticButton>
          </div>

          {/* Mobile Menu Toggle */}
          <motion.button
            whileTap={{ scale: 0.93 }}
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-all relative z-[60]"
          >
            <AnimatePresence mode="wait" initial={false}>
              {mobileOpen ? (
                <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                  <X className="w-5 h-5" />
                </motion.div>
              ) : (
                <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                  <Menu className="w-5 h-5" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-40 pt-20 bg-[#050816]/97 backdrop-blur-3xl md:hidden"
          >
            {/* Ambient gradient */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="px-6 py-8 flex flex-col gap-2">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Link to={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-between py-4 text-lg text-white/70 hover:text-white font-medium border-b border-white/[0.05] transition-colors group"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    {link.label}
                    <span className="text-white/20 group-hover:text-indigo-400 transition-colors text-sm">→</span>
                  </Link>
                </motion.div>
              ))}

              <motion.div
                className="mt-8 flex flex-col gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Link to="/auth/login"
                  className="py-3.5 text-center text-white/70 hover:text-white border border-white/10 hover:border-white/20 rounded-2xl transition-all font-medium"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  Sign In
                </Link>
                <Link to="/auth/signup"
                  className="py-3.5 text-center text-white font-semibold btn-primary rounded-2xl"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  Get Started Free
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
