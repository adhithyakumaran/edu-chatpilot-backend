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
// GET /api/courses
// Fetch all available courses
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const snapshot = yield firebase_1.db.collection('courses').get();
        const courses = snapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
        res.json(courses);
    }
    catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).json({ error: 'Failed to fetch courses' });
    }
}));
// POST /api/courses
// Create a new course (Admin only - ideally protected)
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const docRef = yield firebase_1.db.collection('courses').add(newCourse);
        res.json(Object.assign({ id: docRef.id }, newCourse));
    }
    catch (error) {
        console.error('Error creating course:', error);
        res.status(500).json({ error: 'Failed to create course' });
    }
}));
// POST /api/courses/:courseId/enroll
// Enroll a user in a course
router.post('/:courseId/enroll', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.body;
    const { courseId } = req.params;
    try {
        // Add to user's enrolled courses subcollection
        yield firebase_1.db.collection('users').doc(userId).collection('enrolled_courses').doc(courseId).set({
            enrolledAt: new Date(),
            progress: 0,
            completedLessons: 0,
            totalLessons: 0 // Should fetch from course metadata really
        });
        // Increment student count
        yield firebase_1.db.collection('courses').doc(courseId).update({
            students: require('firebase-admin').firestore.FieldValue.increment(1)
        });
        res.json({ success: true });
    }
    catch (error) {
        console.error('Error enrolling in course:', error);
        res.status(500).json({ error: 'Failed to enroll' });
    }
}));
exports.default = router;
