/* HabitFlow Centralized Firebase Initialization Module */

import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  updatePassword,
  updateEmail,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider
} from 'https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  collection, 
  getDocs, 
  query, 
  where,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js';
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'https://www.gstatic.com/firebasejs/12.17.1/firebase-storage.js';
import { 
  getDatabase, 
  ref as rtdbRef, 
  set as rtdbSet, 
  get as rtdbGet, 
  child as rtdbChild 
} from 'https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js';

const firebaseConfig = {
  apiKey: "AIzaSyC5pxPm3iUF10KM2IqM23_LVwxYv8ajZmM",
  authDomain: "habitflow-b2eba.firebaseapp.com",
  databaseURL: "https://habitflow-b2eba-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "habitflow-b2eba",
  storageBucket: "habitflow-b2eba.firebasestorage.app",
  messagingSenderId: "87403772138",
  appId: "1:87403772138:web:c24ed5f6765ad3c6f87f93",
  measurementId: "G-VG7KR6DVB6"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const rtdb = getDatabase(app);

// Export Auth methods
export { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  updatePassword,
  updateEmail,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider
};

// Export Firestore methods
export { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  collection, 
  getDocs, 
  query, 
  where,
  serverTimestamp
};

// Export Storage methods
export { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
};

// Export Realtime Database methods
export { 
  rtdbRef, 
  rtdbSet, 
  rtdbGet, 
  rtdbChild 
};
