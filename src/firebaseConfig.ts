import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, PhoneAuthProvider } from "firebase/auth";
// 1. IMPORT THESE for the fix
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID,
  measurementId: import.meta.env.VITE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

// 2. USE initializeFirestore INSTEAD OF getFirestore
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
  experimentalForceLongPolling: true, // <--- THIS LINE STOPS THE HANGING
});

export const googleProvider = new GoogleAuthProvider();
export const phoneProvider = new PhoneAuthProvider(auth);
export const storage = getStorage(app);