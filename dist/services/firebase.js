"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
let serviceAccount;
try {
    // 1. Try FIREBASE_SERVICE_ACCOUNT (JSON String) - Best for Render/Vercel
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        console.log('ðŸ”¥ Loading Firebase config from FIREBASE_SERVICE_ACCOUNT env var');
    }
    // 2. Try Individual Variables
    else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
        serviceAccount = {
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        };
        console.log('ðŸ”¥ Loading Firebase config from individual env vars');
    }
    else {
        try {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const serviceAccountPath = require('path').resolve(process.cwd(), 'serviceAccountKey.json');
            serviceAccount = require(serviceAccountPath);
            console.log('Loading Firebase config from local serviceAccountKey.json');
        }
        catch (err) {
            console.log('No serviceAccountKey.json found locally.');
        }
    }
}
catch (e) {
    console.error('âŒ Failed to parse Firebase credentials:', e);
}
if (!firebase_admin_1.default.apps.length) {
    if (serviceAccount) {
        try {
            firebase_admin_1.default.initializeApp({
                credential: firebase_admin_1.default.credential.cert(serviceAccount),
            });
            console.log('âœ… Firebase Admin Initialized successfully');
        }
        catch (error) {
            console.error('âŒ Firebase Admin Initialization failed:', error);
            // Don't exit process, let it fail on first DB call so we see logs
        }
    }
    else {
        console.error('âŒ No valid Firebase credentials found in environment variables (FIREBASE_SERVICE_ACCOUNT or FIREBASE_PROJECT_ID/EMAIL/KEY).');
    }
}
exports.db = firebase_admin_1.default.firestore();
exports.default = firebase_admin_1.default;
