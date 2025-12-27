import express from 'express';
import { db } from '../services/firebase';

const router = express.Router();

// GET /api/courses
// Fetch all available courses
router.get('/', async (req, res) => {
    try {
        const snapshot = await db.collection('courses').get();
        const courses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(courses);
    } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).json({ error: 'Failed to fetch courses' });
    }
});

// POST /api/courses
// Create a new course (Admin only - ideally protected)
router.post('/', async (req, res) => {
    try {
        const { title, description, instructor, duration, image, tags, rating } = req.body;

        const newCourse = {
            title,
            description: description || '',
            instructor: instructor || 'ChatPilot Mentor',
            duration: duration || '0h',
            image: image || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop',
            tags: tags || [],
            rating: rating || 5.0,
            students: 0,
            createdAt: new Date()
        };

        const docRef = await db.collection('courses').add(newCourse);
        res.json({ id: docRef.id, ...newCourse });
    } catch (error) {
        console.error('Error creating course:', error);
        res.status(500).json({ error: 'Failed to create course' });
    }
});

// POST /api/courses/:courseId/enroll
// Enroll a user in a course
router.post('/:courseId/enroll', async (req, res) => {
    const { userId } = req.body;
    const { courseId } = req.params;

    try {
        // Add to user's enrolled courses subcollection
        await db.collection('users').doc(userId).collection('enrolled_courses').doc(courseId).set({
            enrolledAt: new Date(),
            progress: 0,
            completedLessons: 0,
            totalLessons: 0 // Should fetch from course metadata really
        });

        // Increment student count
        await db.collection('courses').doc(courseId).update({
            students: require('firebase-admin').firestore.FieldValue.increment(1)
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Error enrolling in course:', error);
        res.status(500).json({ error: 'Failed to enroll' });
    }
});

// DELETE /api/courses/:id
// Delete a course
router.delete('/:id', async (req, res) => {
    try {
        const result = await db.collection('courses').doc(req.params.id).delete();
        res.json({ success: true, timestamp: result.writeTime });
    } catch (error) {
        console.error('Error deleting course:', error);
        res.status(500).json({ error: 'Failed to delete course' });
    }
});

export default router;
