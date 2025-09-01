import * as admin from 'firebase-admin';

const serviceAccount: admin.ServiceAccount = {
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: `https://${process.env.FIREBASE_ADMIN_PROJECT_ID}.firebaseio.com`
    });
  } catch (error: any) {
    console.error('Firebase admin initialization error', error.stack);
  }
}

export default admin;
