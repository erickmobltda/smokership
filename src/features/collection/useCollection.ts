import * as React from 'react';
import { deleteDoc, query, setDoc } from 'firebase/firestore';
import { userCollection, userDoc } from '@/lib/firebase';
import { useSnapshot } from '@/lib/useSnapshot';
import { useAuth } from '@/features/auth/useAuth';

export interface HumidorItem {
  cigarId: string;
  quantity: number;
  addedAt: string;
}

export interface WishItem {
  cigarId: string;
  addedAt: string;
}

// Document id = cigar id, so each cigar appears once per list.
export function useHumidor() {
  const { user } = useAuth();
  const q = React.useMemo(() => (user ? query(userCollection('humidor')) : null), [user]);
  return useSnapshot<HumidorItem>(q);
}

export function useWishlist() {
  const { user } = useAuth();
  const q = React.useMemo(() => (user ? query(userCollection('wishlist')) : null), [user]);
  return useSnapshot<WishItem>(q);
}

export async function setHumidorQuantity(cigarId: string, quantity: number, addedAt?: string) {
  if (quantity <= 0) return deleteDoc(userDoc('humidor', cigarId));
  return setDoc(userDoc('humidor', cigarId), { cigarId, quantity, addedAt: addedAt ?? new Date().toISOString() });
}

export async function toggleWish(cigarId: string, on: boolean) {
  if (!on) return deleteDoc(userDoc('wishlist', cigarId));
  return setDoc(userDoc('wishlist', cigarId), { cigarId, addedAt: new Date().toISOString() });
}
