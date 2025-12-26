import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

// Check if credentials are provided via environment variables
const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

if (!admin.apps.length) {
    if (serviceAccount.projectId && serviceAccount.clientEmail && serviceAccount.privateKey) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
        console.log('🔥 Firebase Admin Initialized from Env');
    } else {
        try {
            // Fallback to serviceAccountKey.json
            const serviceAccountKey = require('../../serviceAccountKey.json');
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccountKey),
            });
            console.log('🔥 Firebase Admin Initialized from File');
        } catch (error) {
            console.warn('⚠️ Firebase credentials missing (Env & File). Realtime features will not work.');
        }
    }
}

export const db = admin.firestore();
export default admin;
