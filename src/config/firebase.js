// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// TODO: Replace with your Firebase config
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDj_Tvc9zSBd16wQAvVBdx8ln3fXLjLu-Y",
  authDomain: "moviematch-695e5.firebaseapp.com",
  projectId: "moviematch-695e5",
  storageBucket: "moviematch-695e5.firebasestorage.app",
  messagingSenderId: "536135758732",
  appId: "1:536135758732:web:029efdf386e8db9439dca9",
  measurementId: "G-XRET7XQLBR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;