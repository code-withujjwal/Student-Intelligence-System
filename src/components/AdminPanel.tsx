import { Settings, Plus, BarChart3, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

const AdminPanel = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Settings className="w-6 h-6 text-foreground" />
        <h2 className="text-xl font-semibold text-foreground">Admin Panel</h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="glass-card glass-card-hover rounded-xl p-6 space-y-4">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Plus className="w-6 h-6 text-primary" />
          </div>
          <h3 className="font-semibold text-foreground">Create Quiz</h3>
          <p className="text-sm text-muted-foreground">
            Build new quizzes with custom questions and time limits.
          </p>
          <Button variant="outline" size="sm">
            Get Started
          </Button>
        </div>

        <div className="glass-card glass-card-hover rounded-xl p-6 space-y-4">
          <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-accent" />
          </div>
          <h3 className="font-semibold text-foreground">Analytics</h3>
          <p className="text-sm text-muted-foreground">
            View quiz performance and student statistics.
          </p>
          <Button variant="outline" size="sm">
            View Stats
          </Button>
        </div>

        <div className="glass-card glass-card-hover rounded-xl p-6 space-y-4">
          <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center">
            <Users className="w-6 h-6 text-foreground" />
          </div>
          <h3 className="font-semibold text-foreground">Manage Users</h3>
          <p className="text-sm text-muted-foreground">
            Add, remove, or modify student accounts.
          </p>
          <Button variant="outline" size="sm">
            Manage
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
