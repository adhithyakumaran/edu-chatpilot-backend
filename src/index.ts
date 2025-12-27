import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import prisma from './db';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

import dashboardRoutes from './routes/dashboard.routes';
import actionRoutes from './routes/actions.routes';
import userRoutes from './routes/user.routes';
import courseRoutes from './routes/course.routes'; // Import
import aiRoutes from './routes/ai.routes';
import notificationRoutes from './routes/notification.routes';

// Routes
app.use('/api/user', userRoutes);
app.use('/api/actions', actionRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/notifications', notificationRoutes);
import mentorRoutes from './routes/mentor.routes';
app.use('/api/mentor', mentorRoutes);


// Uptime Endpoint
app.get('/ping', (req: Request, res: Response) => {
    res.status(200).send('Pong ðŸ“');
});
// Health Check
app.get('/', (req: Request, res: Response) => {
    res.send('ChatPilot Education API is Running ðŸš€');
});

// Database Check
app.get('/db-check', async (req: Request, res: Response) => {
    try {
        await prisma.$connect();
        res.json({ status: 'Connected to Database' });
    } catch (error) {
        res.status(500).json({ status: 'Database Connection Failed', error });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('Press Ctrl+C to stop');
});

process.on('exit', (code) => {
    console.log(`Process exiting with code: ${code}`);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
