# Binary Book

A social book-ranking app where users build a personal ranked list of books using a **binary search algorithm**. Instead of assigning arbitrary scores, you rank each new book by comparing it head-to-head against books you've already ranked — the app finds its correct position in O(log n) comparisons, then assigns it a normalized score between 1–10.

## Features

- **Binary search ranking** — add a book and compare it pairwise against your existing list to find exactly where it fits
- **Tier-based lists** — books are ranked within three tiers (low / mid / high), each scored on a 1–10 scale
- **Skip comparisons** — if you can't decide between two books, skip and the algorithm tries a different comparison
- **Bookmarks** — save books to a read-later list
- **Social feed** — follow other users and browse their ranked lists
- **Friend recommendations** — discover users with similar taste
- **Taste similarity score** — see a compatibility score between your rankings and another user's
- **Book search** — search the Google Books catalog to add any book
- **Profile photos** — upload a profile picture via Cloudinary

## Tech Stack

| Layer | Technology |
|---|---|
| Mobile client | React Native (Expo), Expo Router, NativeWind / Tailwind |
| API server | Node.js, Express, TypeScript |
| Database | PostgreSQL via Prisma ORM |
| Auth | JWT (bcrypt password hashing) |
| Book data | Google Books API (with server-side search cache) |
| Media storage | Cloudinary |
| State / data fetching | TanStack Query (React Query) |

## Project Structure

```
binary-book/
├── client/          # Expo React Native app
│   ├── app/         # Expo Router file-based routes
│   │   ├── signin/  # Login and signup screens
│   │   └── (app)/   # Authenticated screens
│   │       └── (content)/(tabs)/
│   │           ├── index.tsx     # Home
│   │           ├── list.tsx      # Your ranked book list
│   │           ├── community.tsx # Search users & friend recommendations
│   │           └── profile/      # Your profile
│   ├── components/  # Reusable UI components
│   └── lib/api/     # API hooks (TanStack Query)
│
└── server/          # Express API server
    ├── prisma/      # Schema, migrations, seed data
    └── src/
        ├── routes/      # books, rankings, users, auth, follows
        ├── services/    # Business logic
        │   ├── books/       # Google Books integration & caching
        │   └── rankings/    # Ranking algorithm
        └── utils/
```

## How the Ranking Algorithm Works

When you add a new book:

1. The server runs a binary search over your existing ranked list at the chosen tier
2. At each step it picks the book at the midpoint and asks you: *"Is the new book better or worse than this one?"*
3. Based on your answer the search range halves — just like binary search
4. If you skip a comparison, the algorithm probes nearby offsets using a zigzag pattern until it finds a book you can compare against
5. When the search range collapses to a single position, the book is inserted there and assigned a `rawScore` based on the scores of its neighbors (midpoint, or extrapolated from the gap at the edges)
6. Raw scores are normalized to a 1–10 display score within each tier, rescaling as the list grows

The state of each in-progress ranking is persisted (`RankingSession` → `RankingStep[]`) so the session survives app restarts.

## Getting Started

### Prerequisites

- Node.js 18+
- A PostgreSQL database (e.g. [Prisma Postgres](https://www.prisma.io/postgres), Supabase, Neon, or local)
- A [Google Books API key](https://console.cloud.google.com/)
- A [Cloudinary](https://cloudinary.com/) account (free tier is fine)
- [Expo Go](https://expo.dev/go) or a simulator for the mobile client

### Server setup

```bash
cd server
npm install

# Copy env template and fill in your values
cp .env.example .env

# Generate the Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# (Optional) Seed with sample data
npx tsx prisma/seed.ts

# Start the dev server
npm run dev
```

### Client setup

```bash
cd client
yarn install

# Copy env template and fill in your values
cp .env.example .env

# Start Expo
yarn start
```

Then scan the QR code with Expo Go or press `i`/`a` to open in a simulator.

### Environment variables

**`server/.env`** — see [`server/.env.example`](server/.env.example)

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret key for signing JWTs |
| `PORT` | Server port (default `3000`) |
| `GOOGLE_BOOKS_API_KEY` | Google Books API key |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |

**`client/.env`** — see [`client/.env.example`](client/.env.example)

| Variable | Description |
|---|---|
| `EXPO_PUBLIC_API_URL` | URL of the running server (e.g. `http://localhost:3000`) |
| `EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | Unsigned upload preset for profile photos |

## API Routes

| Method | Path | Description |
|---|---|---|
| `POST` | `/auth/register` | Create account |
| `POST` | `/auth/login` | Login, receive JWT |
| `GET` | `/users/me` | Current user profile |
| `PATCH` | `/users/me` | Update profile |
| `GET` | `/users/search` | Search users by username |
| `GET` | `/users/:id` | View another user's profile |
| `POST` | `/follows` | Follow a user |
| `DELETE` | `/follows/:id` | Unfollow |
| `GET` | `/follows/recommendations` | Friend recommendations |
| `GET` | `/books` | Your ranked book list (paginated) |
| `GET` | `/books/search` | Search Google Books |
| `GET` | `/books/:bookId` | Book detail + your ranking |
| `POST` | `/rankings/start` | Start ranking a new book |
| `POST` | `/rankings/continue` | Submit a comparison answer |
| `POST` | `/rankings/quit` | Abandon a ranking session |
| `GET` | `/bookmarks` | Your bookmarked books |
| `POST` | `/bookmarks` | Bookmark a book |
| `DELETE` | `/bookmarks/:id` | Remove a bookmark |
