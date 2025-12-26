import express from 'express';
import { db } from '../services/firebase';
import { calculatePlacementScore } from '../services/placementEngine';

const router = express.Router();
const userId = 'demo_student_123'; // Mock ID

// POST /api/actions/complete-unit
router.post('/complete-unit', async (req, res) => {
    const { unitId, type, score } = req.body;

    try {
        // Record Progress
        await db.collection('users').doc(userId).collection('progress').doc(unitId).set({
            unitId,
            type,
            score: score || 100, // Default full score if completion only
            status: 'completed',
            completedAt: new Date()
        });

        // Trigger Engine
        const newScore = await calculatePlacementScore(userId);

        res.json({ success: true, newPlacementScore: newScore });
    } catch (error) {
        res.status(500).json({ error: 'Action failed' });
    }
});

// POST /api/actions/submit-project
router.post('/submit-project', async (req, res) => {
    const { projectId, repoUrl } = req.body;

    try {
        await db.collection('users').doc(userId).collection('submissions').add({
            projectId,
            repoUrl,
            status: 'pending', // Waiting for mentor
            submittedAt: new Date()
        });

        // No score update yet, until mentor reviews

        res.json({ success: true, message: 'Project submitted for review' });
    } catch (error) {
        res.status(500).json({ error: 'Submission failed' });
    }
});

export default router;
