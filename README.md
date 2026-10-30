# Smokership

> Discover, rate and keep track of your cigars. A revival of the 2021 Smokership app ([cigarsDb](https://github.com/erickmobltda/cigarsDb) + [cigarsDbBackEnd](https://github.com/erickmobltda/cigarsDbBackEnd)), now one of the [collector-app-blueprint](https://github.com/erickmobltda/collector-app-blueprint) products.

**Live:** <https://smokership.erickmob.dev> · **Core:** shared with [Maltship](https://github.com/erickmobltda/maltship), [Watcheship](https://github.com/erickmobltda/watcheship) and every other [product](https://github.com/erickmobltda/collector-app-blueprint/blob/main/PRODUCTS.md); version in `CORE_VERSION`

**New here?** Read [START_HERE.md](START_HERE.md) (português) or [START_HERE.en.md](START_HERE.en.md) (English). AI agents: [CLAUDE.md](CLAUDE.md).

## Features

- **Discover:** 9,931 cigars with accent-insensitive search, filters by strength, country, size and Cigar Aficionado score (85+, 90+, 93+). Filters live in the URL. Works without login.
- **Cigar page:** band photo, specs, every CA score, community average and everyone's tastings. Actions:
  - **Own it** puts it in your *Humidor*, with a quantity;
  - **Wish it** adds it to your wishlist.
- **Tastings:** half stars, up to 6 flavours, notes and a "smoked on" date. Tastings are public and can be liked.
- **Social:** profiles at `/u/<handle>`, follows, *Following* and *Everyone* feeds, find people.
- **Privacy:** your humidor and wishlist are hidden from others until you turn them on.
- **Languages and access:** PT-BR and EN, chosen by the user. An 18+ age gate. Invite-only accounts, plus the shared demo (no social features).

## Stack

- **Front:** the collector core (React 18, Vite 5, TS, Tailwind, TanStack Query, i18next).
- **Catalog:** `scripts/niche/build_items.py` turns the legacy SQL loads in `data/legacy/` into `data/items.json`, keeping the ids (`ca<row>`, `br<n>`). `npm run catalog` then builds `public/catalog.json`. Search runs in the browser.
- **Images:** 4,390 band photos in WebP in the private bucket `erickmob-files/smokership/catalog/`, served by `GET https://api.erickmob.dev/smokership/images/{id}.webp` (erickmob-api, cached for 1 year). `scripts/niche/convert_images.py` made them from the 2021 backup.
- **Auth + DB:** Firebase in `erickmob-apps`, under `apps/smokership/`. The rules are the collector block in erickmob-api.
- **Hosting:** GitHub Pages via `.github/workflows/pages.yml`.

### Firestore paths (`apps/smokership/…`)

| Path | What |
|---|---|
| `users/{uid}/settings/main` | language (private) |
| `users/{uid}/ratings/{itemId}` | the demo account's tastings (private) |
| `profiles/{uid}`, `handles/{handle}` | public profile and its unique handle |
| `collections/{uid}/owned/{itemId}` | humidor: `quantity`, `visible` |
| `collections/{uid}/wishlist/{itemId}` | wishlist: `visible` |
| `ratings/{uid}_{itemId}` (+ `likes/{uid}`) | shared tastings and likes |
| `follows/{follower}_{followee}` | follows |

## Develop

```bash
npm install
npm run dev     # needs .env.local (values from Erick; template: .env.example)
npm run typecheck && npm run lint && npm test && npm run i18n:check && node scripts/check-core.mjs && npm run build
python3 scripts/niche/build_items.py && npm run catalog   # after changing the legacy data or the importer
```

## Owner only

- **Repo secrets:** `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_APP_ID` (web app `smokership`, `1:935188120758:web:5393e9b63b5c23565f5217`). Collaborators get the same values from Erick as `.env.local`.
- **Demo account:** `GOOGLE_APPLICATION_CREDENTIALS=~/.secrets/erickmob-migration/firebase-sa.json npm run reset-demo`.
- **Data migration** (October 2026, from the pre-core shape): `scripts/niche/migrate-firestore.mjs`; dry run by default, `--apply`, then `--delete-old`.
- **Renaming:** the brand lives in `src/locales/*/niche.json`, `index.html` and `package.json`. The Firestore id `smokership` stays.
