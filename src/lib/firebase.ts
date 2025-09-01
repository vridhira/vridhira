
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCDpxBb2znJI3YBiU49QX-ebYPTYJin4LI",
  authDomain: "vridhira-407d6.firebaseapp.com",
  projectId: "vridhira-407d6",
  storageBucket: "vridhira-407d6.appspot.com",
  messagingSenderId: "557405959180",
  appId: "1:557405959180:web:a06221ae79ce700b39ea29",
  measurementId: "G-40XPG7JTJX"
};


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
