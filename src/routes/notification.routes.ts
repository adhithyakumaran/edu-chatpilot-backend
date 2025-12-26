import express from 'express';
import prisma from '../db'; // Using Prisma client

const router = express.Router();

// GET /api/notifications
// Fetch all notifications (for now, fetching all indiscriminately)
router.get('/', async (req, res) => {
    try {
        const notifications = await prisma.notification.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});

// POST /api/notifications
// Create a new notification (Admin only - ideally protected)
router.post('/', async (req, res) => {
    try {
        const { title, message, courseId } = req.body;

        if (!title || !message) {
            return res.status(400).json({ error: 'Title and message are required' });
        }

        const newNotification = await prisma.notification.create({
            data: {
                title,
                message,
                courseId: courseId || null,
            }
        });

        res.json(newNotification);
    } catch (error) {
        console.error('Error creating notification:', error);
        res.status(500).json({ error: 'Failed to create notification' });
    }
});

export default router;
