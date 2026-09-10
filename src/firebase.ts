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

// Import the auto-provisioned configuration safely as default fallback
import firebaseConfigJson from '../firebase-applet-config.json';

// Support runtime environment variables (e.g. VITE_FIREBASE_API_KEY) with safe fallback to configuration file.
// Note: Firebase Web API keys are public client identifiers used by client-side SDKs,
// protected via API restrictions in Google Cloud Console and owner-bound Firestore security rules.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || firebaseConfigJson.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfigJson.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || firebaseConfigJson.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfigJson.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfigJson.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || firebaseConfigJson.appId,
};

// Initialize Firebase safely
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Initialize Firestore with resilient database ID fallback:
// If a custom database ID is provided (e.g., ai-studio-personalgeminijo-...), use it.
// Bare UUID strings (e.g. "9eec64d4-92d0-45ef-b2b6-321a4f230ec7") indicate a missing prefix and should fallback to (default).
function resolveDatabaseId(): string {
  const customId =
    import.meta.env.VITE_FIRESTORE_DATABASE_ID ||
    firebaseConfigJson.firestoreDatabaseId ||
    '';

  const trimmed = String(customId).trim();
  // Valid named databases follow a naming convention or are '(default)'
  // Bare UUIDs without a prefix are invalid database instance names in GCP.
  const isBareUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trimmed);

  if (!trimmed || isBareUuid) {
    return '(default)';
  }
  return trimmed;
}

// Initialize Firestore with resilient database fallback
const primaryDatabaseId = resolveDatabaseId();
export const db = getFirestore(app, primaryDatabaseId);

// Fallback to default instance if primary is not found
let defaultDbInstance: ReturnType<typeof getFirestore> | null = null;
function getDefaultDb() {
  if (!defaultDbInstance) {
    defaultDbInstance = getFirestore(app, '(default)');
  }
  return defaultDbInstance;
}

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
 * Helper to execute a Firestore operation with automatic fallback to (default) database if not found
 */
async function executeWithDbFallback<T>(
  operation: (database: ReturnType<typeof getFirestore>) => Promise<T>
): Promise<T> {
  try {
    return await operation(db);
  } catch (err: any) {
    const errorMsg = String(err?.message || err || '');
    if (
      (errorMsg.includes('not found') || errorMsg.includes('NOT_FOUND') || errorMsg.includes('Database')) &&
      primaryDatabaseId !== '(default)'
    ) {
      console.warn(`Firestore database '${primaryDatabaseId}' not found. Falling back to '(default)' database.`);
      return await operation(getDefaultDb());
    }
    throw err;
  }
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

  await executeWithDbFallback(async (targetDb) => {
    const interactionDocRef = doc(targetDb, 'users', userId, 'interactions', interaction.id);
    await setDoc(interactionDocRef, sanitized);
  });
}

/**
 * Fetch all past saved scrapbook interactions for the specific user
 */
export async function fetchUserInteractions(userId: string): Promise<SavedInteraction[]> {
  if (!userId) {
    return [];
  }

  return await executeWithDbFallback(async (targetDb) => {
    const interactionsRef = collection(targetDb, 'users', userId, 'interactions');
    const q = query(interactionsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    const results: SavedInteraction[] = [];
    snapshot.forEach((docSnapshot) => {
      results.push(docSnapshot.data() as SavedInteraction);
    });

    return results;
  });
}

/**
 * Delete a specific interaction for the user
 */
export async function deleteUserInteraction(
  userId: string,
  interactionId: string
): Promise<void> {
  if (!userId || !interactionId) return;

  await executeWithDbFallback(async (targetDb) => {
    const docRef = doc(targetDb, 'users', userId, 'interactions', interactionId);
    await deleteDoc(docRef);
  });
}
