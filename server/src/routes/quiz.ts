import { Router } from 'express';
import {
  generateQuiz,
  getQuizByToken,
  submitQuiz,
  getFlashcards,
} from '../controllers/quizController';
import { protect } from '../middleware/auth';

const router = Router();

router.post('/generate', protect, generateQuiz);
router.get('/share/:token', getQuizByToken);
router.post('/submit', protect, submitQuiz);
router.get('/flashcards', protect, getFlashcards);

export default router;
