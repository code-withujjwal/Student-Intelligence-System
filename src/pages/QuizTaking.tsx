import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Clock, ArrowRight, ArrowLeft, CheckCircle2, XCircle, Trophy, RotateCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

const quizData: Record<string, { title: string; duration: number; questions: Question[] }> = {
  "1": {
    title: "HTML & CSS Fundamentals",
    duration: 600,
    questions: [
      { id: 1, question: "What does HTML stand for?", options: ["Hyper Text Markup Language", "High Tech Modern Language", "Hyper Transfer Markup Language", "Home Tool Markup Language"], correctAnswer: 0 },
      { id: 2, question: "Which CSS property is used to change text color?", options: ["text-color", "font-color", "color", "text-style"], correctAnswer: 2 },
      { id: 3, question: "What is the correct HTML element for the largest heading?", options: ["<heading>", "<h6>", "<h1>", "<head>"], correctAnswer: 2 },
      { id: 4, question: "Which property is used to change the background color?", options: ["bgcolor", "background-color", "color-background", "bg-color"], correctAnswer: 1 },
      { id: 5, question: "How do you select an element with id 'demo' in CSS?", options: [".demo", "#demo", "demo", "*demo"], correctAnswer: 1 },
    ],
  },
  "2": {
    title: "JavaScript ES6+ Master Quiz",
    duration: 720,
    questions: [
      { id: 1, question: "Which keyword declares a block-scoped variable?", options: ["var", "let", "const", "Both let and const"], correctAnswer: 3 },
      { id: 2, question: "What is the output of: typeof null?", options: ["null", "undefined", "object", "NaN"], correctAnswer: 2 },
      { id: 3, question: "Which method creates a new array from calling a function on every element?", options: ["forEach()", "filter()", "map()", "reduce()"], correctAnswer: 2 },
      { id: 4, question: "What does the spread operator (...) do?", options: ["Adds elements", "Copies/expands iterables", "Removes elements", "Reverses arrays"], correctAnswer: 1 },
      { id: 5, question: "How do you define an arrow function?", options: ["function => {}", "() => {}", "=> function()", "function()=>"], correctAnswer: 1 },
    ],
  },
  "3": {
    title: "React Essentials",
    duration: 900,
    questions: [
      { id: 1, question: "What hook is used for side effects in React?", options: ["useState", "useEffect", "useContext", "useMemo"], correctAnswer: 1 },
      { id: 2, question: "What is JSX?", options: ["A database", "JavaScript XML", "A styling library", "A testing framework"], correctAnswer: 1 },
      { id: 3, question: "How do you pass data from parent to child components?", options: ["State", "Props", "Context", "Refs"], correctAnswer: 1 },
      { id: 4, question: "Which hook manages local component state?", options: ["useReducer", "useRef", "useState", "useCallback"], correctAnswer: 2 },
      { id: 5, question: "What is the virtual DOM?", options: ["A browser feature", "A lightweight copy of the real DOM", "A CSS framework", "A testing tool"], correctAnswer: 1 },
    ],
  },
  "4": {
    title: "TypeScript Deep Dive",
    duration: 1200,
    questions: [
      { id: 1, question: "What is TypeScript?", options: ["A database", "A superset of JavaScript", "A CSS framework", "A backend language"], correctAnswer: 1 },
      { id: 2, question: "How do you define an interface?", options: ["class Interface", "interface Name {}", "type Interface", "define interface"], correctAnswer: 1 },
      { id: 3, question: "What does 'any' type mean?", options: ["Only numbers", "Only strings", "Any type allowed", "No type"], correctAnswer: 2 },
      { id: 4, question: "How do you make a property optional?", options: ["property!", "property?", "?property", "optional property"], correctAnswer: 1 },
      { id: 5, question: "What is a generic in TypeScript?", options: ["A default value", "A reusable type parameter", "A function", "A class"], correctAnswer: 1 },
    ],
  },
};

const QuizTaking = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const quiz = quizData[id || "1"];

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>(
    new Array(quiz?.questions.length || 0).fill(null)
  );
  const [timeLeft, setTimeLeft] = useState(quiz?.duration || 600);
  const [isFinished, setIsFinished] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const calculateScore = useCallback(() => {
    if (!quiz) return 0;
    let correct = 0;
    quiz.questions.forEach((q, i) => {
      if (selectedAnswers[i] === q.correctAnswer) correct++;
    });
    return Math.round((correct / quiz.questions.length) * 100);
  }, [quiz, selectedAnswers]);

  useEffect(() => {
    if (isFinished || !quiz) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsFinished(true);
          setShowResults(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isFinished, quiz]);

  if (!quiz) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Quiz not found</h1>
          <Button onClick={() => navigate("/")}>Go Home</Button>
        </div>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSelectAnswer = (optionIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = optionIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  const handleFinish = () => {
    setIsFinished(true);
    setShowResults(true);
    toast({
      title: "Quiz Completed!",
      description: "Your answers have been submitted.",
    });
  };

  const handleRetry = () => {
    setCurrentQuestion(0);
    setSelectedAnswers(new Array(quiz.questions.length).fill(null));
    setTimeLeft(quiz.duration);
    setIsFinished(false);
    setShowResults(false);
  };

  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;
  const score = calculateScore();
  const question = quiz.questions[currentQuestion];

  if (showResults) {
    const correctCount = quiz.questions.filter(
      (q, i) => selectedAnswers[i] === q.correctAnswer
    ).length;

    return (
      <div className="min-h-screen pt-24 pb-8 px-4 flex items-center justify-center">
        <div className="w-full max-w-2xl glass-card rounded-2xl p-8 animate-scale-in text-center space-y-6">
          <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center ${score >= 70 ? 'bg-accent/20' : 'bg-orange-500/20'}`}>
            {score >= 70 ? (
              <Trophy className="w-12 h-12 text-accent" />
            ) : (
              <RotateCcw className="w-12 h-12 text-orange-500" />
            )}
          </div>

          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {score >= 90 ? "Outstanding!" : score >= 70 ? "Great Job!" : "Keep Practicing!"}
            </h1>
            <p className="text-muted-foreground">You completed {quiz.title}</p>
          </div>

          <div className="py-6 border-y border-border">
            <div className="text-6xl font-bold gradient-text mb-2">{score}%</div>
            <p className="text-muted-foreground">
              {correctCount} of {quiz.questions.length} questions correct
            </p>
          </div>

          {/* Answer Review */}
          <div className="text-left space-y-3">
            <h3 className="font-semibold text-foreground">Answer Review</h3>
            {quiz.questions.map((q, i) => {
              const isCorrect = selectedAnswers[i] === q.correctAnswer;
              return (
                <div key={q.id} className={`p-4 rounded-xl ${isCorrect ? 'bg-accent/10' : 'bg-destructive/10'}`}>
                  <div className="flex items-start gap-3">
                    {isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{q.question}</p>
                      {!isCorrect && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Correct: {q.options[q.correctAnswer]}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={handleRetry} className="flex-1 gap-2">
              <RotateCcw className="w-4 h-4" />
              Try Again
            </Button>
            <Button variant="accent" onClick={() => navigate("/")} className="flex-1 gap-2">
              <Home className="w-4 h-4" />
              Back to Quizzes
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="glass-card rounded-2xl p-4 sm:p-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-foreground">{quiz.title}</h1>
              <p className="text-sm text-muted-foreground">
                Question {currentQuestion + 1} of {quiz.questions.length}
              </p>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${timeLeft < 60 ? 'bg-destructive/10 text-destructive' : 'bg-secondary'}`}>
              <Clock className="w-5 h-5" />
              <span className="font-mono font-bold text-lg">{formatTime(timeLeft)}</span>
            </div>
          </div>
          <Progress value={progress} className="mt-4 h-2" />
        </div>

        {/* Question */}
        <div className="glass-card rounded-2xl p-6 sm:p-8 animate-slide-up">
          <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-6">
            {question.question}
          </h2>

          <div className="space-y-3">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleSelectAnswer(index)}
                className={`w-full p-4 rounded-xl text-left transition-all border-2 ${
                  selectedAnswers[currentQuestion] === index
                    ? "border-primary bg-primary/10"
                    : "border-transparent bg-secondary/50 hover:bg-secondary"
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-semibold text-sm ${
                    selectedAnswers[currentQuestion] === index
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="text-foreground">{option}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between gap-4">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={currentQuestion === 0}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </Button>

          {currentQuestion === quiz.questions.length - 1 ? (
            <Button variant="accent" onClick={handleFinish} className="gap-2">
              Finish Quiz
              <CheckCircle2 className="w-4 h-4" />
            </Button>
          ) : (
            <Button variant="accent" onClick={handleNext} className="gap-2">
              Next
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Question Navigator */}
        <div className="glass-card rounded-2xl p-4">
          <p className="text-sm text-muted-foreground mb-3">Question Navigator</p>
          <div className="flex flex-wrap gap-2">
            {quiz.questions.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentQuestion(i)}
                className={`w-10 h-10 rounded-lg font-medium text-sm transition-all ${
                  i === currentQuestion
                    ? "bg-primary text-primary-foreground"
                    : selectedAnswers[i] !== null
                    ? "bg-accent/20 text-accent"
                    : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizTaking;
