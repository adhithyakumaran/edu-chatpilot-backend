"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = __importDefault(require("../db"));
const router = (0, express_1.Router)();
// GET Chat History for a User
router.get('/:userId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    try {
        const messages = yield db_1.default.mentorMessage.findMany({
            where: { userId },
            orderBy: { createdAt: 'asc' }
        });
        res.json(messages);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
}));
// POST Send Message
router.post('/send', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, message, sender } = req.body;
    try {
        const newMessage = yield db_1.default.mentorMessage.create({
            data: {
                userId,
                message,
                sender // 'USER' or 'ADMIN'
            }
        });
        res.json(newMessage);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to send message' });
    }
}));
// ADMIN: Get all users who have started a chat
router.get('/admin/inbox', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get distinct userIds from messages
        const chats = yield db_1.default.mentorMessage.findMany({
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
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch inbox' });
    }
}));
exports.default = router;
