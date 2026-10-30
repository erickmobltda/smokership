# Changelog

## 2026-10-30 — On the collector core

**Why:** Smokership now runs the shared core of the collector-app-blueprint. It gets every core improvement as a `Core v<N>` PR, the same as Maltship and Watcheship.

- New: public profiles, follows, likes, *Following* feed, find people, and privacy switches for the humidor and the wishlist.
- The catalog is unchanged: the same 9,931 cigars, 4,390 photos and ids.
- **URLs changed:** `/cigar/<id>` → `/item/<id>`, `/humidor` → `/collection`, `/profile` → `/me` and `/settings`. Old links land on Discover.
- **Data:** humidors and wishlists moved to `collections/{uid}/…` (`scripts/niche/migrate-firestore.mjs`). Tastings move once their author creates a profile, since tastings now show the author's handle.
- Hosting moved from the `gh-pages` branch to `actions/deploy-pages`.

## 2026-10-25 — Rewrite

- React + Vite + Firebase rewrite of the 2021 app: catalog, humidor, wishlist, tastings, feed, demo account.
