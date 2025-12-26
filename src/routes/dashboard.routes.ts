import express from 'express';
import { db } from '../services/firebase';
import { calculatePlacementScore } from '../services/placementEngine';

const router = express.Router();

// GET /api/dashboard
router.get('/', async (req, res) => {
    // Get userId from query param, fallback to demo if missing (or handle error)
    const userId = (req.query.userId as string) || 'demo_student_123';

    try {
        const userDoc = await db.collection('users').doc(userId).get();

        let userData = userDoc.data();

        // If user doesn't exist, create with clean slate
        if (!userDoc.exists) {
            userData = {
                name: 'Student',
                track: 'Full Stack Development',
                placementScore: 0,
                jobReadiness: { coding: 0, projects: 0, interview: 0 },
            };
            await db.collection('users').doc(userId).set(userData);
        } else {
            // DATA CLEANUP: If user has the old "Demo" score of 42 (and hasn't done real work), reset it.
            // This fixes the issue for users created during the prototype phase.
            if (userData?.placementScore === 42) {
                userData.placementScore = 0;
                userData.jobReadiness = { coding: 0, projects: 0, interview: 0 };
                // Persist the fix
                await db.collection('users').doc(userId).update({
                    placementScore: 0,
                    jobReadiness: { coding: 0, projects: 0, interview: 0 }
                });
            }
        }

        // Real Data Aggregation
        const userRef = db.collection('users').doc(userId);

        // 1. Projects
        const submissionsSnap = await userRef.collection('submissions').get();
        const projectsCompleted = submissionsSnap.docs.filter(d => d.data().status === 'approved').length;

        // 2. Interviews
        const interviewsSnap = await userRef.collection('interviews').get();
        const mockInterviews = interviewsSnap.size;

        // 3. Tasks (Simplified: Checks incomplete items in a 'tasks' collection, OR assumes generic tasks based on profile)
        // For now, let's look for a subcollection 'tasks' where completed is false
        const tasksSnap = await userRef.collection('tasks').where('completed', '==', false).get();
        let tasksPending = tasksSnap.size;

        // Add static tasks if essential data missing
        if (!userData?.academic?.college) tasksPending++; // Profile task

        // 4. Timeline (Recent activity)
        const timeline = [];

        // Add pending profile task if needed
        if (!userData?.academic?.college) {
            timeline.push({
                title: 'Complete Profile',
                time: 'Pending',
                type: 'task',
                completed: false
            });
        }

        // Add recent interviews
        interviewsSnap.docs.forEach(doc => {
            const data = doc.data();
            // rudimentary check for recent
            timeline.push({
                title: `Mock Interview: ${data.topic || 'General'}`,
                time: data.date ? new Date(data.date.toDate()).toLocaleDateString() : 'Recent',
                type: 'interview',
                completed: true
            });
        });

        // Add recent submissions
        submissionsSnap.docs.forEach(doc => {
            const data = doc.data();
            timeline.push({
                title: `Project: ${data.title || 'Untitled'}`,
                time: data.submittedAt ? new Date(data.submittedAt.toDate()).toLocaleDateString() : 'Recent',
                type: 'project',
                completed: data.status === 'approved'
            });
        });

        // Add system welcome if timeline is empty
        if (timeline.length === 0) {
            timeline.push({ title: 'Welcome to ChatPilot', time: new Date(userData?.created?.toDate?.() || Date.now()).toLocaleDateString(), type: 'system', completed: true });
        }

        // Sort by time (hacky string sort or assume simple append)
        // ideally real Date sort

        const stats = {
            profile: userData,
            projectsCompleted,
            tasksPending,
            mockInterviews,
            placementScore: userData?.placementScore || 0,
            jobReadiness: userData?.jobReadiness || { coding: 0, projects: 0, interview: 0 },
            timeline: timeline.slice(0, 5) // Limit to 5
        };

        res.json(stats);
    } catch (error) {
        console.error('Dashboard Error:', error);
        res.status(500).json({ error: 'Failed to load dashboard' });
    }
});

export default router;
