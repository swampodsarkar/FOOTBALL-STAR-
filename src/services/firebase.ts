import { initializeApp, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  linkWithCredential,
  EmailAuthProvider,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth';
import { getDatabase, ref, set, get, child } from 'firebase/database';

const firebaseConfig = {
  apiKey: 'AIzaSyAeoScw5UK53ElBnNdhtJVAETb3_isOEKs',
  authDomain: 'fram-and-go.firebaseapp.com',
  databaseURL:
    'https://fram-and-go-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'fram-and-go',
  storageBucket: 'fram-and-go.firebasestorage.app',
  messagingSenderId: '781295119002',
  appId: '1:781295119002:web:4be2d54934395b491c0d23',
  measurementId: 'G-TKPPF986Z0',
};

let app: FirebaseApp | null = null;

function getApp(): FirebaseApp {
  if (!app) {
    app = initializeApp(firebaseConfig, 'football-star-pro');
  }
  return app;
}

export const auth = getAuth(getApp());
export const db = getDatabase(getApp());

export function getUid(): string | null {
  return auth.currentUser?.uid ?? null;
}

export function getEmail(): string | null {
  return auth.currentUser?.email ?? null;
}

export function isAnonymous(): boolean {
  return auth.currentUser?.isAnonymous ?? false;
}

export async function ensureAnon(): Promise<string> {
  if (auth.currentUser) return auth.currentUser.uid;
  const cred = await signInAnonymously(auth);
  return cred.user.uid;
}

export async function saveCloud(data: unknown): Promise<void> {
  const uid = getUid();
  if (!uid) return;
  try {
    await set(ref(db, `users/${uid}/save`), data);
  } catch {
    // silently fail – cloud is optional
  }
}

export async function loadCloud(): Promise<unknown | null> {
  const uid = getUid();
  if (!uid) return null;
  try {
    const snap = await get(child(ref(db), `users/${uid}/save`));
    return snap.exists() ? snap.val() : null;
  } catch {
    return null;
  }
}

export async function connectWithEmail(
  email: string,
  password: string,
  mode: 'create' | 'login',
): Promise<{ ok: boolean; error?: string }> {
  try {
    const cur = auth.currentUser;

    if (mode === 'create') {
      if (cur && cur.isAnonymous) {
        try {
          await linkWithCredential(
            cur,
            EmailAuthProvider.credential(email, password),
          );
          return { ok: true };
        } catch (e: any) {
          if (e.code === 'auth/email-already-in-use') {
            return connectWithEmail(email, password, 'login');
          }
          throw e;
        }
      } else if (!cur) {
        await signInAnonymously(auth);
        return connectWithEmail(email, password, 'create');
      } else {
        return { ok: true };
      }
    } else {
      const guestUid = cur?.uid;
      const guestData = guestUid ? await loadCloud() : null;
      await signInWithEmailAndPassword(auth, email, password);
      if (guestData) {
        await saveCloud(guestData);
      }
      return { ok: true };
    }
  } catch (e: any) {
    return { ok: false, error: e.code || e.message || 'Unknown error' };
  }
}

export async function disconnectCloud(): Promise<void> {
  await signOut(auth);
  await signInAnonymously(auth);
}

export function onAuthChange(cb: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, cb);
}
