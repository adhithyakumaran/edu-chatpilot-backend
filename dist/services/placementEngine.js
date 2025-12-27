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
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculatePlacementScore = void 0;
const firebase_1 = require("./firebase");
const calculatePlacementScore = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userRef = firebase_1.db.collection('users').doc(userId);
        const progressSnapshot = yield userRef.collection('progress').get();
        const submissionsSnapshot = yield userRef.collection('submissions').get();
        const interviewsSnapshot = yield userRef.collection('interviews').get();
        // 1. Coding Score (40%) - Based on Tests/Learning Units
        let totalCodingScore = 0;
        let codingCount = 0;
        progressSnapshot.forEach(doc => {
            const data = doc.data();
            if (data.type === 'test' || data.type === 'coding') {
                totalCodingScore += (data.score || 0);
                codingCount++;
            }
        });
        // Default to some baseline if no tests taken yet
        const codingScore = codingCount > 0 ? (totalCodingScore / codingCount) : 0;
        // 2. Project Score (35%)
        let totalProjectScore = 0;
        let projectCount = 0;
        submissionsSnapshot.forEach(doc => {
            const data = doc.data();
            if (data.status === 'approved') {
                totalProjectScore += (data.score || 0);
                projectCount++;
            }
        });
        const projectScore = projectCount > 0 ? (totalProjectScore / projectCount) : 0;
        // 3. Interview Score (25%)
        let totalInterviewScore = 0;
        let interviewCount = 0;
        interviewsSnapshot.forEach(doc => {
            const data = doc.data();
            totalInterviewScore += (data.score || 0);
            interviewCount++;
        });
        const interviewScore = interviewCount > 0 ? (totalInterviewScore / interviewCount) : 0;
        // Final Weighted Score
        const finalScore = Math.round((codingScore * 0.40) +
            (projectScore * 0.35) +
            (interviewScore * 0.25));
        // Update User Record
        yield userRef.update({
            placementScore: finalScore,
            jobReadiness: {
                coding: Math.round(codingScore),
                projects: Math.round(projectScore),
                interview: Math.round(interviewScore)
            },
            lastUpdated: new Date()
        });
        return finalScore;
    }
    catch (error) {
        console.error('Error calculating placement score:', error);
        return 0; // Fail safe
    }
});
exports.calculatePlacementScore = calculatePlacementScore;
