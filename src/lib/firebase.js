// Firebase client — redirect-based Google Auth (works reliably on localhost)
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  signOut,
} from "firebase/auth";

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId:     import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const isConfigured = !!firebaseConfig.apiKey && !!firebaseConfig.projectId;

export const firebaseApp    = isConfigured ? initializeApp(firebaseConfig) : null;
export const firebaseAuth   = isConfigured ? getAuth(firebaseApp) : null;
export const googleProvider = new GoogleAuthProvider();

/**
 * Kick off the Google sign-in redirect.
 * After the user signs in, the browser returns to the same page
 * and getRedirectResult() picks up the session.
 */
export function signInWithGoogle() {
  if (!firebaseAuth) {
    throw new Error("Firebase is not configured. Add VITE_FIREBASE_* keys to your .env file.");
  }
  return signInWithRedirect(firebaseAuth, googleProvider);
}

/**
 * Call this on page load to check if the user just came back from a Google redirect.
 * Returns null if no redirect, or the Firebase user object on success.
 */
export async function checkGoogleRedirectResult() {
  if (!firebaseAuth) return null;
  try {
    const result = await getRedirectResult(firebaseAuth);
    return result?.user || null;
  } catch {
    return null;
  }
}

export async function firebaseSignOut() {
  if (firebaseAuth) await signOut(firebaseAuth);
}
