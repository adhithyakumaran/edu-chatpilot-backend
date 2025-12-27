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
// GET /api/dashboard
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    // Get userId from query param, fallback to demo if missing (or handle error)
    const userId = req.query.userId || 'demo_student_123';
    try {
        const userDoc = yield firebase_1.db.collection('users').doc(userId).get();
        let userData = userDoc.data();
        // If user doesn't exist, create with clean slate
        if (!userDoc.exists) {
            userData = {
                name: 'Student',
                track: 'Full Stack Development',
                placementScore: 0,
                jobReadiness: { coding: 0, projects: 0, interview: 0 },
            };
            yield firebase_1.db.collection('users').doc(userId).set(userData);
        }
        else {
            // DATA CLEANUP: If user has the old "Demo" score of 42 (and hasn't done real work), reset it.
            // This fixes the issue for users created during the prototype phase.
            if ((userData === null || userData === void 0 ? void 0 : userData.placementScore) === 42) {
                userData.placementScore = 0;
                userData.jobReadiness = { coding: 0, projects: 0, interview: 0 };
                // Persist the fix
                yield firebase_1.db.collection('users').doc(userId).update({
                    placementScore: 0,
                    jobReadiness: { coding: 0, projects: 0, interview: 0 }
                });
            }
        }
        // Real Data Aggregation
        const userRef = firebase_1.db.collection('users').doc(userId);
        // 1. Projects
        const submissionsSnap = yield userRef.collection('submissions').get();
        const projectsCompleted = submissionsSnap.docs.filter(d => d.data().status === 'approved').length;
        // 2. Interviews
        const interviewsSnap = yield userRef.collection('interviews').get();
        const mockInterviews = interviewsSnap.size;
        // 3. Tasks (Simplified: Checks incomplete items in a 'tasks' collection, OR assumes generic tasks based on profile)
        // For now, let's look for a subcollection 'tasks' where completed is false
        const tasksSnap = yield userRef.collection('tasks').where('completed', '==', false).get();
        let tasksPending = tasksSnap.size;
        // Add static tasks if essential data missing
        if (!((_a = userData === null || userData === void 0 ? void 0 : userData.academic) === null || _a === void 0 ? void 0 : _a.college))
            tasksPending++; // Profile task
        // 4. Timeline (Recent activity)
        const timeline = [];
        // Add pending profile task if needed
        if (!((_b = userData === null || userData === void 0 ? void 0 : userData.academic) === null || _b === void 0 ? void 0 : _b.college)) {
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
            timeline.push({ title: 'Welcome to ChatPilot', time: new Date(((_d = (_c = userData === null || userData === void 0 ? void 0 : userData.created) === null || _c === void 0 ? void 0 : _c.toDate) === null || _d === void 0 ? void 0 : _d.call(_c)) || Date.now()).toLocaleDateString(), type: 'system', completed: true });
        }
        // Sort by time (hacky string sort or assume simple append)
        // ideally real Date sort
        const stats = {
            profile: userData,
            projectsCompleted,
            tasksPending,
            mockInterviews,
            placementScore: (userData === null || userData === void 0 ? void 0 : userData.placementScore) || 0,
            jobReadiness: (userData === null || userData === void 0 ? void 0 : userData.jobReadiness) || { coding: 0, projects: 0, interview: 0 },
            timeline: timeline.slice(0, 5) // Limit to 5
        };
        res.json(stats);
    }
    catch (error) {
        console.error('Dashboard Error:', error);
        res.status(500).json({ error: 'Failed to load dashboard' });
    }
}));
exports.default = router;
