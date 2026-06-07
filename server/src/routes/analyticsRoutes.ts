import { Router } from 'express';
import { protect } from '../middleware/auth';
import { getNeuralReport, getMistakesLog } from '../controllers/analyticsController';

const router = Router();

router.use(protect);

router.get('/neural-report', getNeuralReport);
router.get('/mistakes', getMistakesLog);

export default router;
