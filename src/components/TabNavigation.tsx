import { ListChecks, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TabNavigationProps {
  activeTab: "quizzes" | "admin";
  onTabChange: (tab: "quizzes" | "admin") => void;
}

const TabNavigation = ({ activeTab, onTabChange }: TabNavigationProps) => {
  return (
    <div className="inline-flex items-center gap-2 p-1.5 bg-secondary/50 rounded-xl backdrop-blur-sm">
      <Button
        variant="tab"
        data-active={activeTab === "quizzes"}
        onClick={() => onTabChange("quizzes")}
        className="gap-2"
      >
        <ListChecks className="w-4 h-4" />
        Quizzes
      </Button>
      <Button
        variant="tab"
        data-active={activeTab === "admin"}
        onClick={() => onTabChange("admin")}
        className="gap-2"
      >
        <Users className="w-4 h-4" />
        Admin Panel
      </Button>
    </div>
  );
};

export default TabNavigation;
