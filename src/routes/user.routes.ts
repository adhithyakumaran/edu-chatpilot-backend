import express from 'express';
import { db } from '../services/firebase';

const router = express.Router();

// POST /api/user/profile
// Saves academic details and creates/updates the user record
router.post('/profile', async (req, res) => {
    const { userId, email, name, photoUrl, academic, provider } = req.body;

    if (!userId || !email) {
        res.status(400).json({ error: 'Missing required fields: userId, email' });
        return;
    }

    try {
        const userRef = db.collection('users').doc(userId);

        // Merge with existing data
        await userRef.set({
            userId,
            email,
            name: name || '',
            photoUrl: photoUrl || '',
            provider: provider || 'unknown',
            academic: academic || {}, // { college, degree, year, branch, cgpa }
            lastLogin: new Date(),
            // Set defaults if not present
            placementScore: 0,
            jobReadiness: { coding: 0, projects: 0, interview: 0 }
        }, { merge: true });

        res.json({ success: true, message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Error saving profile:', error);
        res.status(500).json({ error: 'Failed to save profile' });
    }
});

// GET /api/user/admin/all
router.get('/admin/all', async (req, res) => {
    try {
        const snapshot = await db.collection('users').get();
        const users = snapshot.docs.map(doc => {
            const data = doc.data();
            // Convert Firestore timestamps to dates
            return {
                ...data,
                lastLogin: data.lastLogin?.toDate ? data.lastLogin.toDate() : data.lastLogin
            };
        });
        res.json(users);
    } catch (error) {
        console.error("Error fetching students:", error);
        res.status(500).json({ error: 'Failed to fetch students' });
    }
});

// GET /api/user/:userId
router.get('/:userId', async (req, res) => {
    try {
        const doc = await db.collection('users').doc(req.params.userId).get();
        if (!doc.exists) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        res.json(doc.data());
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

export default router;
