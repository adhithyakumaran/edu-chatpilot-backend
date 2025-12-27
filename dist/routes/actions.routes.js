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
const placementEngine_1 = require("../services/placementEngine");
const router = express_1.default.Router();
const userId = 'demo_student_123'; // Mock ID
// POST /api/actions/complete-unit
router.post('/complete-unit', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { unitId, type, score } = req.body;
    try {
        // Record Progress
        yield firebase_1.db.collection('users').doc(userId).collection('progress').doc(unitId).set({
            unitId,
            type,
            score: score || 100, // Default full score if completion only
            status: 'completed',
            completedAt: new Date()
        });
        // Trigger Engine
        const newScore = yield (0, placementEngine_1.calculatePlacementScore)(userId);
        res.json({ success: true, newPlacementScore: newScore });
    }
    catch (error) {
        res.status(500).json({ error: 'Action failed' });
    }
}));
// POST /api/actions/submit-project
router.post('/submit-project', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { projectId, repoUrl } = req.body;
    try {
        yield firebase_1.db.collection('users').doc(userId).collection('submissions').add({
            projectId,
            repoUrl,
            status: 'pending', // Waiting for mentor
            submittedAt: new Date()
        });
        // No score update yet, until mentor reviews
        res.json({ success: true, message: 'Project submitted for review' });
    }
    catch (error) {
        res.status(500).json({ error: 'Submission failed' });
    }
}));
exports.default = router;
