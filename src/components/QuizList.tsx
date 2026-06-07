import { BookOpen } from "lucide-react";
import QuizCard from "./QuizCard";

const quizzes = [
  {
    id: 1,
    title: "HTML & CSS Fundamentals",
    description: "Test your basics of HTML tags, CSS selectors, layout, and styling.",
    duration: "10 mins",
  },
  {
    id: 2,
    title: "JavaScript ES6+ Master Quiz",
    description: "Covers Arrow Functions, Promises, async/await, classes, and modern syntax.",
    duration: "12 mins",
  },
  {
    id: 3,
    title: "React Essentials",
    description: "Components, hooks, state management, and React best practices.",
    duration: "15 mins",
  },
  {
    id: 4,
    title: "TypeScript Deep Dive",
    description: "Types, interfaces, generics, and advanced TypeScript patterns.",
    duration: "20 mins",
  },
];

const QuizList = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <BookOpen className="w-6 h-6 text-foreground" />
        <h2 className="text-xl font-semibold text-foreground">Quiz List</h2>
      </div>
      
      <div>
        <h3 className="text-lg font-medium text-foreground mb-4">Select a Quiz</h3>
        <div className="space-y-4">
          {quizzes.map((quiz, index) => (
            <QuizCard
              key={quiz.id}
              id={quiz.id}
              title={quiz.title}
              description={quiz.description}
              duration={quiz.duration}
              delay={index * 100}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuizList;
