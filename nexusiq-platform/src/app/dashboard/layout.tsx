import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardTopbar from "@/components/dashboard/DashboardTopbar";
import { AlertCircle, BrainCircuit } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid h-screen w-full bg-[#050816] grid-rows-[1fr_auto] grid-cols-[auto_1fr] overflow-hidden">
      {/* Fixed Sidebar */}
      <div className="row-span-1 col-span-1 h-full z-30">
        <DashboardSidebar userName="Student" userLevel={1} userXP={850} userRole="STUDENT" />
      </div>
      
      {/* Scrollable Content Area */}
      <div className="row-span-1 col-span-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        <DashboardTopbar />
        <main className="flex-1 overflow-y-auto p-6 pb-12">
          {children}
        </main>
      </div>

      {/* Clean Bottom Status Bar */}
      <div className="col-span-2 row-span-1 h-8 bg-[#070d1f] border-t border-white/[0.06] flex items-center justify-between px-4 z-40">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-[10px] font-mono text-red-400">
            <AlertCircle className="w-3 h-3" />
            <span>1 Issue</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[10px] font-mono text-cyan-300">
          <BrainCircuit className="w-3 h-3" />
          <span>AI Coach Active</span>
        </div>
      </div>
    </div>
  );
}
