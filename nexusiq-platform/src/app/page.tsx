import Navbar from "@/components/layout/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import AnalyticsSection from "@/components/landing/AnalyticsSection";
import PricingSection from "@/components/landing/PricingSection";
import CTASection from "@/components/landing/CTASection";
import { Zap, GitBranch, MessageSquare, Globe2 } from "lucide-react";
import { Link } from "react-router-dom";

const FONT_DISPLAY = "'Space Grotesk', 'Inter', sans-serif";
const FONT_MONO = "'JetBrains Mono', monospace";

export default function LandingPage() {
  return (
    <main className="relative bg-[#050816] min-h-screen overflow-x-hidden">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <AnalyticsSection />
      <PricingSection />
      <CTASection />

      {/* Premium Footer */}
      <footer className="border-t border-white/[0.05] py-14 relative overflow-hidden">
        {/* Footer ambient glow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-indigo-600/6 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative">
          {/* Top row */}
          <div className="flex flex-col md:flex-row items-start justify-between gap-10 mb-12">
            {/* Brand */}
            <div className="flex flex-col gap-4 max-w-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 flex items-center justify-center shadow-glow-sm">
                  <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
                </div>
                <span className="text-base font-bold text-white" style={{ fontFamily: FONT_DISPLAY }}>
                  Nexus<span className="text-indigo-400">IQ</span>
                </span>
              </div>
              <p className="text-sm text-white/35 leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>
                The next-generation AI performance intelligence platform. Built for the curious, the ambitious, and the elite.
              </p>
              <div className="flex items-center gap-3">
                {[
                  { icon: GitBranch, href: "#" },
                  { icon: MessageSquare, href: "#" },
                  { icon: Globe2, href: "#" },
                ].map(({ icon: Icon, href }, i) => (
                  <Link key={i}
                    to={href}
                    className="w-8 h-8 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 hover:border-white/15 transition-all duration-200"
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Links grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
              {[
                {
                  title: "Platform",
                  links: ["Features", "Analytics", "Pricing", "API"],
                },
                {
                  title: "Company",
                  links: ["About", "Blog", "Careers", "Contact"],
                },
                {
                  title: "Legal",
                  links: ["Privacy", "Terms", "Security", "Status"],
                },
              ].map((col) => (
                <div key={col.title}>
                  <div
                    className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-4"
                    style={{ fontFamily: FONT_DISPLAY }}
                  >
                    {col.title}
                  </div>
                  <ul className="space-y-2.5">
                    {col.links.map((label) => (
                      <li key={label}>
                        <Link to="#"
                          className="text-sm text-white/40 hover:text-white/80 transition-colors duration-200"
                          style={{ fontFamily: "'Inter', sans-serif" }}
                        >
                          {label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-white/[0.04]">
            <p
              className="text-xs text-white/25"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              © 2025 NexusIQ. All rights reserved. Built with precision for the curious.
            </p>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#34d399]" />
              <span className="text-[10px] text-white/25" style={{ fontFamily: FONT_MONO }}>
                All systems operational
              </span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
