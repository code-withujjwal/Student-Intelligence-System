import { Toaster } from './components/ui/toaster';
import { Toaster as Sonner } from './components/ui/sonner';
import { TooltipProvider } from './components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { QuizProvider } from './contexts/QuizContext';
import KarlDashboard from './pages/KarlDashboard';
import ExamInterface from './components/ExamInterface';
import TeacherDashboard from './components/TeacherDashboard';
import Auth from './pages/Auth';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import StudentPortal from './pages/StudentPortal';
import NotFound from './pages/NotFound';
import Landing from './pages/Landing';
import MyProgress from './pages/MyProgress';
import KarlLog from './pages/KarlLog';
import FeaturesHub from './pages/FeaturesHub';
import AegisQuizEngine from './pages/AegisQuizEngine';
import SyllabusCommandCenter from './pages/SyllabusCommandCenter';
import AegisAchievements from './pages/AegisAchievements';
import AegisNeuralCockpit from './pages/AegisNeuralCockpit';
import DailyChallenge from './pages/DailyChallenge';
import AegisProfile from './pages/AegisProfile';
import AegisSettings from './pages/AegisSettings';
import AegisUserManagement from './pages/AegisUserManagement';
import KarlEngine from './pages/KarlEngine';
import KarlSystem from './pages/KarlSystem';
import KarlCategories from './pages/KarlCategories';
import StartQuiz from './pages/StartQuiz';
import QuizCreator from './pages/QuizCreator';
import QuizAttempt from './pages/QuizAttempt';
import ResultDetail from './pages/ResultDetail';
import ManageQuestions from './pages/ManageQuestions';
import ProtectedRoute from './components/ProtectedRoute';
import SystemStatus from './components/SystemStatus';
import GlobalBackButton from './components/GlobalBackButton';
import { Toaster as HotToaster } from 'react-hot-toast';
import LiveQuizRoom from './pages/LiveQuizRoom';
import Friends from './pages/Friends';
import Notifications from './pages/Notifications';
import Leaderboard from './pages/Leaderboard';

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <HotToaster position="top-right" toastOptions={{ style: { background: '#333', color: '#fff' } }} />
          <SystemStatus />
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <QuizProvider totalTime={10800}>
              <GlobalBackButton />
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/features" element={<FeaturesHub />} />
                <Route path="/auth" element={<Auth />} />

                {/* Global Protected Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/dashboard" element={<KarlDashboard />} />
                  <Route path="/exam" element={<ExamInterface />} />
                  <Route path="/analytics" element={<AnalyticsDashboard />} />
                  <Route path="/my-progress" element={<MyProgress />} />
                  <Route path="/karl-log" element={<KarlLog />} />
                  <Route path="/quiz/share/:token" element={<StudentPortal />} />
                  <Route path="/quiz-engine" element={<AegisQuizEngine />} />
                  <Route path="/syllabus" element={<SyllabusCommandCenter />} />
                  <Route path="/achievements" element={<AegisAchievements />} />
                  <Route path="/neural-cockpit" element={<AegisNeuralCockpit />} />
                  <Route path="/daily-challenge" element={<DailyChallenge />} />
                  <Route path="/profile" element={<AegisProfile />} />
                  <Route path="/settings" element={<AegisSettings />} />
                  <Route path="/system" element={<KarlSystem />} />
                  <Route path="/categories" element={<KarlCategories />} />
                  <Route path="/start" element={<StartQuiz />} />
                  <Route path="/quiz/:id/attempt" element={<QuizAttempt />} />
                  <Route path="/quiz/:id/result" element={<ResultDetail />} />
                  <Route path="/multiplayer" element={<LiveQuizRoom />} />
                  <Route path="/multiplayer/:sessionId" element={<LiveQuizRoom />} />
                  <Route path="/battle" element={<LiveQuizRoom />} />
                  <Route path="/battle/:sessionId" element={<LiveQuizRoom />} />
                  <Route path="/friends" element={<Friends />} />
                  <Route path="/notifications" element={<Notifications />} />
                  <Route path="/leaderboard" element={<Leaderboard />} />
                </Route>

                {/* Teacher-only Protected Routes */}
                <Route element={<ProtectedRoute allowedRoles={['TEACHER', 'ADMIN']} />}>
                  <Route path="/teach" element={<TeacherDashboard />} />
                  <Route path="/quiz-creator" element={<QuizCreator />} />
                  <Route path="/manage-questions" element={<ManageQuestions />} />
                  <Route path="/karl-engine" element={<KarlEngine />} />
                  <Route path="/user-management" element={<AegisUserManagement />} />
                </Route>

                <Route path="/engine" element={<Navigate to="/quiz-engine" replace />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </QuizProvider>
          </BrowserRouter>
        </TooltipProvider>
          </AuthProvider>
        </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;