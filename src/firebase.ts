import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  orderBy,
  deleteDoc,
} from 'firebase/firestore';
import type { SavedInteraction, UserProfile } from './types';

// Import the auto-provisioned configuration safely
import firebaseConfigJson from '../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: firebaseConfigJson.apiKey,
  authDomain: firebaseConfigJson.authDomain,
  projectId: firebaseConfigJson.projectId,
  storageBucket: firebaseConfigJson.storageBucket,
  messagingSenderId: firebaseConfigJson.messagingSenderId,
  appId: firebaseConfigJson.appId,
};

// Initialize Firebase safely
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Initialize Firestore with the dedicated database ID if provisioned
const databaseId = firebaseConfigJson.firestoreDatabaseId || '(default)';
export const db = getFirestore(app, databaseId);

/**
 * Strict Undefined-Stripping (Zero-Crash Payload Hygiene)
 * Conforming to Production Directives: Never allow `undefined` properties to reach Firestore.
 */
export function sanitizeForFirestore<T>(data: T): T {
  return JSON.parse(
    JSON.stringify(data, (_, value) => (value === undefined ? null : value))
  );
}

/**
 * Sign in using Google Federated Authentication
 */
export async function signInWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

/**
 * Sign out current authenticated user
 */
export async function signOutUser(): Promise<void> {
  await firebaseSignOut(auth);
}

/**
 * Subscribe to auth state changes
 */
export function onAuthUserChanged(callback: (user: UserProfile | null) => void) {
  return onAuthStateChanged(auth, (firebaseUser) => {
    if (firebaseUser) {
      callback({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
      });
    } else {
      callback(null);
    }
  });
}

/**
 * Save an interaction securely isolated to the authenticated user's subcollection:
 * Path: /users/{userId}/interactions/{interactionId}
 */
export async function saveUserInteraction(
  userId: string,
  interaction: SavedInteraction
): Promise<void> {
  if (!userId) {
    throw new Error('User must be authenticated to save interaction');
  }

  const sanitized = sanitizeForFirestore({
    ...interaction,
    userId,
    updatedAt: new Date().toISOString(),
  });

  const interactionDocRef = doc(db, 'users', userId, 'interactions', interaction.id);
  await setDoc(interactionDocRef, sanitized);
}

/**
 * Fetch all past saved scrapbook interactions for the specific user
 */
export async function fetchUserInteractions(userId: string): Promise<SavedInteraction[]> {
  if (!userId) {
    return [];
  }

  const interactionsRef = collection(db, 'users', userId, 'interactions');
  const q = query(interactionsRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);

  const results: SavedInteraction[] = [];
  snapshot.forEach((docSnapshot) => {
    results.push(docSnapshot.data() as SavedInteraction);
  });

  return results;
}

/**
 * Delete a specific interaction for the user
 */
export async function deleteUserInteraction(
  userId: string,
  interactionId: string
): Promise<void> {
  if (!userId || !interactionId) return;
  const docRef = doc(db, 'users', userId, 'interactions', interactionId);
  await deleteDoc(docRef);
}
