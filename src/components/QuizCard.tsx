import { useNavigate } from "react-router-dom";
import { Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuizCardProps {
  id: number;
  title: string;
  description: string;
  duration: string;
  delay?: number;
}

const QuizCard = ({ id, title, description, duration, delay = 0 }: QuizCardProps) => {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate('/start');
  };

  return (
    <div 
      className="glass-card glass-card-hover rounded-xl p-6 animate-slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1 space-y-2">
          <h3 className="text-lg font-semibold text-primary hover:text-primary/80 transition-colors cursor-pointer">
            {title}
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {description}
          </p>
          <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
            <Clock className="w-4 h-4" />
            <span>{duration}</span>
          </div>
        </div>
        <Button 
          variant="accent" 
          size="lg"
          onClick={handleStart}
          className="group shrink-0"
        >
          Start Quiz
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </div>
    </div>
  );
};

export default QuizCard;
