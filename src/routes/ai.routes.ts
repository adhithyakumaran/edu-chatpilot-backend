import express from 'express';
import { analyzeCode, generateContent } from '../controllers/aiController';

const router = express.Router();

router.post('/analyze', analyzeCode);
router.post('/generate', generateContent);

export default router;
