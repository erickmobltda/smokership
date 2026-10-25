import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { collection, doc, getFirestore } from 'firebase/firestore';

const app = initializeApp({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string,
});

export const auth = getAuth(app);
export const db = getFirestore(app);

export function currentUid(): string {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Not authenticated');
  return uid;
}

export type UserCollection = 'profile' | 'humidor' | 'wishlist';

// Private data lives under apps/smokership/users/{uid}. Ratings are shared
// (apps/smokership/ratings/{uid}_{cigarId}) so the feed and the cigar page can
// show everyone's tastings. The catalog is a static file (public/catalog.json).
export const userCollection = (name: UserCollection) =>
  collection(db, 'apps', 'smokership', 'users', currentUid(), name);

export const userDoc = (name: UserCollection, id: string) =>
  doc(db, 'apps', 'smokership', 'users', currentUid(), name, id);

export const ratingsCollection = () => collection(db, 'apps', 'smokership', 'ratings');

export const ratingDoc = (cigarId: string) => doc(db, 'apps', 'smokership', 'ratings', `${currentUid()}_${cigarId}`);
