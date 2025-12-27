
import { Router } from 'express';
import prisma from '../db';

const router = Router();

// GET Chat History for a User
router.get('/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const messages = await prisma.mentorMessage.findMany({
            where: { userId },
            orderBy: { createdAt: 'asc' }
        });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

// POST Send Message
router.post('/send', async (req, res) => {
    const { userId, message, sender } = req.body;
    try {
        // UPSERT User first to ensure they exist in SQL DB (sync with Firebase)
        await prisma.user.upsert({
            where: { id: userId },
            update: {},
            create: {
                id: userId,
                email: 'sync_pending@chatpilot.com', // Placeholder if we don't have it here
                name: 'Student'
            }
        });

        const newMessage = await prisma.mentorMessage.create({
            data: {
                userId,
                message,
                sender // 'USER' or 'ADMIN'
            }
        });
        res.json(newMessage);
    } catch (error) {
        res.status(500).json({ error: 'Failed to send message' });
    }
});

// ADMIN: Get all users who have started a chat
router.get('/admin/inbox', async (req, res) => {
    try {
        // Get distinct userIds from messages
        const chats = await prisma.mentorMessage.findMany({
            distinct: ['userId'],
            select: {
                userId: true,
                user: {
                    select: { name: true, email: true }
                },
                message: true, // Just to get the last one if we ordered, but distinct takes first found.
                createdAt: true
            },
            orderBy: { createdAt: 'desc' }
        });

        // Improve: In a real app we'd aggregate to get the *latest* message per user. 
        // For now, listing users who have chatted is sufficient for the "Admin Card".
        res.json(chats);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch inbox' });
    }
});

// DELETE Message
router.delete('/:messageId', async (req, res) => {
    const { messageId } = req.params;
    try {
        await prisma.mentorMessage.delete({
            where: { id: messageId }
        });
        res.json({ success: true });
    } catch (error) {
        console.error("Delete Error", error);
        res.status(500).json({ error: 'Failed to delete message' });
    }
});

export default router;
