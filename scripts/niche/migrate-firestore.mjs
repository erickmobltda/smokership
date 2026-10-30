// One-time move of Smokership's Firestore data to the collector-core shape (October 2026).
// Owner only: it uses the Admin SDK and bypasses the rules.
//
//   GOOGLE_APPLICATION_CREDENTIALS=~/.secrets/erickmob-migration/firebase-sa.json node scripts/niche/migrate-firestore.mjs            # dry run
//   ... node scripts/niche/migrate-firestore.mjs --apply         # copy to the new paths (old docs stay)
//   ... node scripts/niche/migrate-firestore.mjs --delete-old    # after checking the app: remove the old per-user docs
//
// Old → new (apps/smokership/…):
//   users/{uid}/humidor/{cigarId}   → collections/{uid}/owned/{itemId}
//   users/{uid}/wishlist/{cigarId}  → collections/{uid}/wishlist/{itemId}
//   ratings/{uid}_{cigarId}         → same id, new fields, once the user has a profile (profiles/{uid}).
//     A rating whose author has no profile yet is left as it is; run --apply again after they set one up.
// The demo account is skipped: `npm run reset-demo` reseeds it.
import { readFileSync } from 'node:fs';
import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const niche = JSON.parse(readFileSync(new URL('../../src/niche/niche.json', import.meta.url), 'utf8'));
const APPLY = process.argv.includes('--apply');
const DELETE_OLD = process.argv.includes('--delete-old');

initializeApp({ projectId: process.env.GCLOUD_PROJECT || 'erickmob-apps' });
const auth = getAuth();
const db = getFirestore();
const root = db.doc(`apps/${niche.app}`);
const log = (...a) => console.log(APPLY || DELETE_OLD ? '' : '[dry run]', ...a);

async function isDemo(uid) {
  try {
    return (await auth.getUser(uid)).customClaims?.demo === true;
  } catch {
    return false;
  }
}

const counts = { owned: 0, wishlist: 0, ratings: 0, ratingsWaiting: 0, skipped: 0, deleted: 0 };

for (const user of await root.collection('users').listDocuments()) {
  const uid = user.id;
  if (await isDemo(uid)) {
    log(`skip demo ${uid}`);
    continue;
  }
  for (const [from, to] of [['humidor', 'owned'], ['wishlist', 'wishlist']]) {
    const docs = (await user.collection(from).get()).docs;
    for (const d of docs) {
      const old = d.data();
      const itemId = old.cigarId ?? d.id;
      const target = root.collection('collections').doc(uid).collection(to).doc(itemId);
      if (DELETE_OLD) {
        if ((await target.get()).exists) {
          await d.ref.delete();
          counts.deleted++;
        } else log(`keep ${uid}/${from}/${d.id}: not migrated yet`);
        continue;
      }
      if ((await target.get()).exists) {
        counts.skipped++;
        continue;
      }
      const addedAt = old.addedAt ?? new Date().toISOString();
      const doc =
        to === 'owned'
          ? { niche: niche.niche, uid, itemId, quantity: Math.min(Math.max(1, old.quantity ?? 1), niche.owned.maxQuantity), visible: true, addedAt, updatedAt: addedAt }
          : { niche: niche.niche, uid, itemId, visible: true, addedAt };
      log(`${uid}: ${from}/${d.id} → collections/${uid}/${to}/${itemId}`);
      if (APPLY) await target.set(doc);
      counts[to]++;
    }
  }
  if (DELETE_OLD) {
    for (const d of (await user.collection('profile').get()).docs) {
      await d.ref.delete();
      counts.deleted++;
    }
  }
}

if (!DELETE_OLD) {
  for (const d of (await root.collection('ratings').get()).docs) {
    const old = d.data();
    if (!('cigarId' in old)) continue; // already in the new shape
    const profile = (await root.collection('profiles').doc(old.uid).get()).data();
    if (!profile) {
      log(`rating ${d.id}: waiting for ${old.uid} to set up a profile`);
      counts.ratingsWaiting++;
      continue;
    }
    const rating = {
      niche: niche.niche,
      uid: old.uid,
      handle: profile.handle,
      displayName: profile.displayName,
      itemId: old.cigarId,
      stars: old.stars,
      tags: (old.flavors ?? []).slice(0, 6),
      notes: old.notes ?? '',
      experiencedOn: old.smokedOn,
      likeCount: 0,
      createdAt: old.createdAt,
      updatedAt: old.updatedAt,
    };
    log(`rating ${d.id} → new shape (@${profile.handle})`);
    if (APPLY) await d.ref.set(rating);
    counts.ratings++;
  }
}

console.log(counts);
