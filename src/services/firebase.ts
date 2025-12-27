import admin from 'firebase-admin';
import dotenv from 'dotenv';
import { ServiceAccount } from 'firebase-admin';

dotenv.config();

let serviceAccount: ServiceAccount | undefined;

try {
    // 1. Try FIREBASE_SERVICE_ACCOUNT (JSON String) - Best for Render/Vercel
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        try {
            let jsonString = process.env.FIREBASE_SERVICE_ACCOUNT.trim();
            // Remove wrapping quotes if present (common copy-paste error)
            if (jsonString.startsWith("'") && jsonString.endsWith("'")) {
                jsonString = jsonString.slice(1, -1);
            } else if (jsonString.startsWith('"') && jsonString.endsWith('"')) {
                jsonString = jsonString.slice(1, -1);
            }

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const parsed = JSON.parse(jsonString) as any;

            if (parsed.privateKey) {
                parsed.privateKey = parsed.privateKey.replace(/\\n/g, '\n');
            }
            // Handle snake_case which is common in raw serviceAccountKey.json
            if (parsed.private_key) {
                parsed.private_key = parsed.private_key.replace(/\\n/g, '\n');
            }

            serviceAccount = parsed;
            console.log('🔥 Loading Firebase config from FIREBASE_SERVICE_ACCOUNT env var');
        } catch (error) {
            console.error('❌ Failed to parse FIREBASE_SERVICE_ACCOUNT JSON:', error);
            console.log('Raw Env Var (first 20 chars):', process.env.FIREBASE_SERVICE_ACCOUNT?.substring(0, 20)); // Debug log
        }
    }
    // 2. Try Individual Variables
    else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
        const pKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
        serviceAccount = {
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: pKey,
        } as ServiceAccount;
        console.log('🔥 Loading Firebase config from individual env vars');
    } else {
        try {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const serviceAccountPath = require('path').resolve(process.cwd(), 'serviceAccountKey.json');
            serviceAccount = require(serviceAccountPath);
            console.log('Loading Firebase config from local serviceAccountKey.json');
        } catch (err) {
            console.log('No serviceAccountKey.json found locally.');
        }
    }
} catch (e) {
    console.error('âŒ Failed to parse Firebase credentials:', e);
}

if (!admin.apps.length) {
    if (serviceAccount) {
        try {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
            console.log('âœ… Firebase Admin Initialized successfully');
        } catch (error) {
            console.error('âŒ Firebase Admin Initialization failed:', error);
            // Don't exit process, let it fail on first DB call so we see logs
        }
    } else {
        console.error('âŒ No valid Firebase credentials found in environment variables (FIREBASE_SERVICE_ACCOUNT or FIREBASE_PROJECT_ID/EMAIL/KEY).');
    }
}

export const db = admin.firestore();
export default admin;
