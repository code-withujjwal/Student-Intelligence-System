import { Link } from "react-router-dom";
import { 
  Trophy, 
  Target, 
  Flame, 
  Clock, 
  TrendingUp, 
  BookOpen,
  ChevronRight,
  Award,
  Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Progress } from "@/components/ui/progress";

const stats = [
  { label: "Quizzes Completed", value: "24", icon: BookOpen, color: "text-primary", bg: "bg-primary/10" },
  { label: "Average Score", value: "87%", icon: Target, color: "text-accent", bg: "bg-accent/10" },
  { label: "Current Streak", value: "7 days", icon: Flame, color: "text-orange-500", bg: "bg-orange-500/10" },
  { label: "Total Time", value: "4.5 hrs", icon: Clock, color: "text-blue-500", bg: "bg-blue-500/10" },
];

const recentQuizzes = [
  { id: 1, title: "JavaScript ES6+ Master Quiz", score: 92, total: 100, date: "Today", status: "completed" },
  { id: 2, title: "React Essentials", score: 85, total: 100, date: "Yesterday", status: "completed" },
  { id: 3, title: "TypeScript Deep Dive", score: 78, total: 100, date: "2 days ago", status: "completed" },
  { id: 4, title: "CSS Flexbox & Grid", score: null, total: 100, date: "In Progress", status: "in-progress" },
];

const achievements = [
  { id: 1, title: "Quick Learner", description: "Complete 5 quizzes", icon: "🚀", unlocked: true },
  { id: 2, title: "Perfect Score", description: "Get 100% on a quiz", icon: "🎯", unlocked: true },
  { id: 3, title: "Streak Master", description: "7-day streak", icon: "🔥", unlocked: true },
  { id: 4, title: "Knowledge Guru", description: "Complete 50 quizzes", icon: "🧠", unlocked: false },
];

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen pt-24 pb-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Welcome Section */}
        <div className="glass-card rounded-2xl p-6 sm:p-8 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center text-accent-foreground font-bold text-2xl">
                {user?.avatar}
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                  Welcome back, {user?.name?.split(' ')[0]}!
                </h1>
                <p className="text-muted-foreground">Ready to continue your learning journey?</p>
              </div>
            </div>
            <Link to="/">
              <Button variant="accent" size="lg" className="gap-2">
                <BookOpen className="w-4 h-4" />
                Browse Quizzes
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div 
              key={stat.label} 
              className="glass-card glass-card-hover rounded-xl p-5 animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2 glass-card rounded-2xl p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
              </div>
              <Button variant="ghost" size="sm" className="text-muted-foreground gap-1">
                View All <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-4">
              {recentQuizzes.map((quiz) => (
                <div 
                  key={quiz.id} 
                  className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground truncate">{quiz.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="w-3 h-3 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{quiz.date}</span>
                    </div>
                  </div>
                  {quiz.status === "completed" ? (
                    <div className="text-right">
                      <span className={`text-lg font-bold ${quiz.score! >= 90 ? 'text-accent' : quiz.score! >= 70 ? 'text-primary' : 'text-orange-500'}`}>
                        {quiz.score}%
                      </span>
                      <div className="w-24 mt-1">
                        <Progress value={quiz.score!} className="h-1.5" />
                      </div>
                    </div>
                  ) : (
                    <span className="px-3 py-1 rounded-full bg-orange-500/10 text-orange-500 text-sm font-medium">
                      In Progress
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Achievements */}
          <div className="glass-card rounded-2xl p-6 animate-fade-in">
            <div className="flex items-center gap-2 mb-6">
              <Award className="w-5 h-5 text-accent" />
              <h2 className="text-lg font-semibold text-foreground">Achievements</h2>
            </div>
            <div className="space-y-3">
              {achievements.map((achievement) => (
                <div 
                  key={achievement.id} 
                  className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                    achievement.unlocked 
                      ? 'bg-accent/10' 
                      : 'bg-secondary/30 opacity-50'
                  }`}
                >
                  <span className="text-2xl">{achievement.icon}</span>
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-medium truncate ${achievement.unlocked ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {achievement.title}
                    </h4>
                    <p className="text-xs text-muted-foreground">{achievement.description}</p>
                  </div>
                  {achievement.unlocked && (
                    <Trophy className="w-4 h-4 text-accent shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Weekly Progress */}
        <div className="glass-card rounded-2xl p-6 animate-fade-in">
          <div className="flex items-center gap-2 mb-6">
            <Target className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Weekly Progress</h2>
          </div>
          <div className="flex items-end justify-between gap-2 h-40">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
              const heights = [60, 80, 45, 90, 70, 30, 85];
              const isToday = i === 6;
              return (
                <div key={day} className="flex-1 flex flex-col items-center gap-2">
                  <div 
                    className={`w-full rounded-t-lg transition-all ${isToday ? 'bg-accent' : 'bg-primary/30'}`}
                    style={{ height: `${heights[i]}%` }}
                  />
                  <span className={`text-xs ${isToday ? 'text-accent font-medium' : 'text-muted-foreground'}`}>
                    {day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
