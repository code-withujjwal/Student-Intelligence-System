import { useState } from "react";
import { ListChecks } from "lucide-react";
import TabNavigation from "@/components/TabNavigation";
import QuizList from "@/components/QuizList";
import AdminPanel from "@/components/AdminPanel";

const Index = () => {
  const [activeTab, setActiveTab] = useState<"quizzes" | "admin">("quizzes");

  return (
    <div className="min-h-screen pt-24 pb-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Main Container */}
        <div className="glass-card rounded-2xl p-6 sm:p-8 lg:p-10 animate-scale-in">
          {/* Header */}
          <header className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-6">
              <ListChecks className="w-10 h-10 text-primary" strokeWidth={2.5} />
              <h1 className="text-3xl sm:text-4xl font-bold">
                <span className="gradient-text">Available</span>{" "}
                <span className="text-foreground">Quizzes</span>
              </h1>
            </div>
            
            {/* Tab Navigation */}
            <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
          </header>

          {/* Divider */}
          <div className="h-px bg-border mb-8" />

          {/* Content */}
          <main>
            {activeTab === "quizzes" ? <QuizList /> : <AdminPanel />}
          </main>
        </div>

        {/* Footer */}
        <footer className="text-center mt-6 text-sm text-muted-foreground">
          <p>Built with React & Tailwind CSS</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
