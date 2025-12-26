import { db } from './firebase';

export const calculatePlacementScore = async (userId: string) => {
    try {
        const userRef = db.collection('users').doc(userId);
        const progressSnapshot = await userRef.collection('progress').get();
        const submissionsSnapshot = await userRef.collection('submissions').get();
        const interviewsSnapshot = await userRef.collection('interviews').get();

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
        const finalScore = Math.round(
            (codingScore * 0.40) +
            (projectScore * 0.35) +
            (interviewScore * 0.25)
        );

        // Update User Record
        await userRef.update({
            placementScore: finalScore,
            jobReadiness: {
                coding: Math.round(codingScore),
                projects: Math.round(projectScore),
                interview: Math.round(interviewScore)
            },
            lastUpdated: new Date()
        });

        return finalScore;

    } catch (error) {
        console.error('Error calculating placement score:', error);
        return 0; // Fail safe
    }
};
