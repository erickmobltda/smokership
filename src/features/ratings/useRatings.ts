import * as React from 'react';
import { deleteDoc, getDoc, limit, orderBy, query, setDoc, where } from 'firebase/firestore';
import { ratingDoc, ratingsCollection, userDoc } from '@/lib/firebase';
import { useSnapshot } from '@/lib/useSnapshot';
import { useAuth } from '@/features/auth/useAuth';

export const FLAVORS = [
  'earth', 'wood', 'leather', 'spice', 'pepper', 'cedar', 'coffee', 'cocoa',
  'nuts', 'cream', 'sweet', 'fruit', 'floral', 'grass', 'toast', 'honey',
] as const;
export type Flavor = (typeof FLAVORS)[number];

export interface Rating {
  uid: string;
  displayName: string;
  cigarId: string;
  stars: number;
  flavors: Flavor[];
  notes: string;
  smokedOn: string;
  createdAt: string;
  updatedAt: string;
}

export function useCigarRatings(cigarId: string) {
  const { user } = useAuth();
  const q = React.useMemo(() => (user ? query(ratingsCollection(), where('cigarId', '==', cigarId)) : null), [user, cigarId]);
  const res = useSnapshot<Rating>(q);
  const data = React.useMemo(() => [...res.data].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)), [res.data]);
  return { ...res, data };
}

export function useMyRatings() {
  const { user } = useAuth();
  const q = React.useMemo(() => (user ? query(ratingsCollection(), where('uid', '==', user.uid)) : null), [user]);
  const res = useSnapshot<Rating>(q);
  const data = React.useMemo(() => [...res.data].sort((a, b) => b.smokedOn.localeCompare(a.smokedOn)), [res.data]);
  return { ...res, data };
}

export function useFeed(size = 40) {
  const { user } = useAuth();
  const q = React.useMemo(
    () => (user ? query(ratingsCollection(), orderBy('updatedAt', 'desc'), limit(size)) : null),
    [user, size],
  );
  return useSnapshot<Rating>(q);
}

export async function myDisplayName(fallback: string): Promise<string> {
  const snap = await getDoc(userDoc('profile', 'main'));
  return (snap.data()?.displayName as string | undefined) || fallback;
}

export async function saveRating(input: { cigarId: string; stars: number; flavors: Flavor[]; notes: string; smokedOn: string }, uid: string, displayName: string, createdAt?: string) {
  const now = new Date().toISOString();
  const rating: Rating = { ...input, uid, displayName, createdAt: createdAt ?? now, updatedAt: now };
  await setDoc(ratingDoc(input.cigarId), rating);
}

export const deleteRating = (cigarId: string) => deleteDoc(ratingDoc(cigarId));
