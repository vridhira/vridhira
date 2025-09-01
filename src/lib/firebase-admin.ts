import * as admin from 'firebase-admin';
import path from 'path';

// Load the service account key JSON file
// Ensure this path is correct relative to your project root
const serviceAccountPath = path.resolve(process.cwd(), 'serviceAccountKey.json');

if (!admin.apps.length) {
  try {
    const serviceAccount = require(serviceAccountPath); // Dynamically load the JSON
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      // Other options if needed (e.g., databaseURL for Realtime Database)
    });
  } catch (error) {
    console.error("Failed to initialize Firebase Admin SDK. Make sure 'serviceAccountKey.json' exists and is correctly configured.", error);
    // You might want to throw the error or handle it more gracefully in production
  }
}

export const auth = admin.auth();
export const firestore = admin.firestore();
