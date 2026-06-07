import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NexusIQ — AI-Powered Performance Intelligence Platform",
  description: "The next-generation AI quiz and performance intelligence operating system. Reveal your patterns, master your knowledge.",
  keywords: ["AI quiz", "performance intelligence", "adaptive learning", "JEE", "NEET", "coding assessment"],
  authors: [{ name: "NexusIQ" }],
  openGraph: {
    title: "NexusIQ — AI Performance Intelligence",
    description: "Your intelligence has patterns. We reveal them.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased bg-background text-foreground">
        <div className="fixed inset-0 z-[-1] hero-mesh pointer-events-none opacity-40"></div>
        <div className="fixed inset-0 z-[-1] grid-pattern pointer-events-none opacity-30"></div>
        <main className="min-h-screen flex flex-col relative overflow-x-hidden">
          {/* Global Header */}
          <header className="fixed top-0 w-full h-16 flex items-center justify-between px-6 z-50 bg-black/40 backdrop-blur-[20px] border-b border-white/10">
            <div className="flex items-center gap-2 font-bold text-lg tracking-tight">
              NexusIQ
            </div>
            <nav className="flex items-center gap-6 text-sm font-medium">
              <a href="#features" className="text-slate-400 hover:text-purple-400 transition-colors">Features</a>
              <a href="#analytics" className="text-slate-400 hover:text-purple-400 transition-colors">Analytics</a>
              <a href="/auth/login" className="text-slate-400 hover:text-purple-400 transition-colors">Login</a>
            </nav>
          </header>

          {/* Main Content Area */}
          <div className="flex-1 mt-16 flex flex-col">
            {children}
          </div>

          {/* Global Footer */}
          <footer className="grid grid-cols-1 md:grid-cols-4 gap-12 px-6 py-20 border-t border-white/10 bg-black">
            <div className="flex flex-col gap-4">
              <span className="font-bold tracking-tight text-lg">NexusIQ</span>
              <p className="text-sm leading-relaxed text-slate-400">
                The next-generation AI performance intelligence platform.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <span className="font-semibold text-sm tracking-tight">Platform</span>
              <a href="#" className="text-sm text-slate-400 hover:text-purple-400 transition-colors">Features</a>
              <a href="#" className="text-sm text-slate-400 hover:text-purple-400 transition-colors">Analytics</a>
              <a href="#" className="text-sm text-slate-400 hover:text-purple-400 transition-colors">Pricing</a>
            </div>
            <div className="flex flex-col gap-3">
              <span className="font-semibold text-sm tracking-tight">Company</span>
              <a href="#" className="text-sm text-slate-400 hover:text-purple-400 transition-colors">About Us</a>
              <a href="#" className="text-sm text-slate-400 hover:text-purple-400 transition-colors">Careers</a>
              <a href="#" className="text-sm text-slate-400 hover:text-purple-400 transition-colors">Contact</a>
            </div>
            <div className="flex flex-col gap-3">
              <span className="font-semibold text-sm tracking-tight">Legal</span>
              <a href="#" className="text-sm text-slate-400 hover:text-purple-400 transition-colors">Privacy Policy</a>
              <a href="#" className="text-sm text-slate-400 hover:text-purple-400 transition-colors">Terms of Service</a>
            </div>
          </footer>
        </main>
      </body>
    </html>
  );
}
