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
const express_1 = __importDefault(require("express"));
const firebase_1 = require("../services/firebase");
const router = express_1.default.Router();
// POST /api/user/profile
// Saves academic details and creates/updates the user record
router.post('/profile', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, email, name, photoUrl, academic } = req.body;
    if (!userId || !email) {
        res.status(400).json({ error: 'Missing required fields: userId, email' });
        return;
    }
    try {
        const userRef = firebase_1.db.collection('users').doc(userId);
        // Merge with existing data
        yield userRef.set({
            userId,
            email,
            name: name || '',
            photoUrl: photoUrl || '',
            academic: academic || {}, // { college, degree, year, branch, cgpa }
            lastLogin: new Date(),
            // Set defaults if not present
            placementScore: 0,
            jobReadiness: { coding: 0, projects: 0, interview: 0 }
        }, { merge: true });
        res.json({ success: true, message: 'Profile updated successfully' });
    }
    catch (error) {
        console.error('Error saving profile:', error);
        res.status(500).json({ error: 'Failed to save profile' });
    }
}));
// GET /api/user/:userId
router.get('/:userId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const doc = yield firebase_1.db.collection('users').doc(req.params.userId).get();
        if (!doc.exists) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        res.json(doc.data());
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch user' });
    }
}));
exports.default = router;
