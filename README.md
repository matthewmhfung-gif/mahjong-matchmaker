# 🀄 Mahjong Matchmaker

A full-stack web app for finding Mahjong players, forming groups of 4, and scheduling game sessions — all without needing to create an account.

## Features

- **Player Profiles** — create a profile with name, skill level, preferred variant, weekly availability, and optional bio
- **Auto-Matchmaking** — algorithm groups players into tables of 4 by shared variant, compatible skill levels, and overlapping availability, scored out of 100
- **Game Sessions** — create or join open sessions with a date/time, variant, and skill requirement; see seat fill progress in real time
- **Player Directory** — browse all players with filters by skill, variant, and day of availability
- **No login required** — profiles are identified by a local browser ID (stored in `localStorage`)

## Tech Stack

| Layer     | Technology                   |
|-----------|------------------------------|
| Backend   | Node.js + Express            |
| Database  | SQLite via `node:sqlite` (built-in) |
| Frontend  | React 18 + Vite              |
| Styling   | Tailwind CSS v3              |
| Routing   | React Router v6              |

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- npm v9 or later

### 1. Clone / download the project

```bash
cd mahjong-matchmaker
```

### 2. Install all dependencies

```bash
npm run install-all
```

This installs dependencies for the root, `server/`, and `client/` in one step.

### 3. Start the app

```bash
npm start
```

This runs both the API server and the React dev server concurrently:

| Service  | URL                        |
|----------|----------------------------|
| Frontend | http://localhost:5173      |
| API      | http://localhost:3001/api  |

The database (`server/mahjong.db`) is created automatically on first run, and seeded with **12 demo players** and **3 sample sessions**.

## Deploying to the Web (Railway — recommended)

Railway is the easiest way to host this app for free.

### 1. Push your code to GitHub

```bash
cd "mahjong-matchmaker"
git init
git add .
git commit -m "Initial commit"
# Create a repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/mahjong-matchmaker.git
git push -u origin main
```

### 2. Deploy on Railway

1. Go to [railway.app](https://railway.app) and sign up (free)
2. Click **New Project → Deploy from GitHub repo**
3. Select your `mahjong-matchmaker` repo
4. Railway will auto-detect Node.js

### 3. Configure Railway settings

In your Railway project dashboard, set:

| Setting | Value |
|---|---|
| **Build Command** | `npm run build` |
| **Start Command** | `npm start` |

Then add these **Environment Variables**:

| Key | Value |
|---|---|
| `NODE_ENV` | `production` |
| `CLIENT_URL` | your Railway public URL (e.g. `https://mahjong-matchmaker.up.railway.app`) |

### 4. Add a persistent volume (important for SQLite)

In Railway: **New → Volume** → mount it at `/data`, then add:

| Key | Value |
|---|---|
| `DB_PATH` | `/data/mahjong.db` |

This ensures your database survives server restarts.

### 5. Done!

Railway gives you a public URL like `https://mahjong-matchmaker.up.railway.app`. Share that link with players.

---

### Alternative hosting options

| Platform | Notes |
|---|---|
| **Render** | Similar to Railway, free tier spins down after inactivity |
| **Fly.io** | More control, generous free tier |
| **DigitalOcean** | ~$6/mo VPS, full control |
| **Vercel + separate API** | Split frontend (Vercel) from backend (Railway) — more complex |

## Project Structure

```
mahjong-matchmaker/
├── package.json            # Root — runs both server & client
├── README.md
│
├── server/
│   ├── index.js            # Express app entry point
│   ├── db.js               # SQLite setup & schema
│   ├── seed.js             # Demo data (auto-runs on first start)
│   └── routes/
│       ├── players.js      # CRUD for player profiles
│       ├── sessions.js     # Game session management
│       └── matchmaking.js  # Matching algorithm
│
└── client/
    ├── index.html
    ├── vite.config.js      # Proxies /api → localhost:3001
    ├── tailwind.config.js
    └── src/
        ├── App.jsx
        ├── main.jsx
        ├── index.css
        ├── pages/
        │   ├── Home.jsx           # Landing page with open sessions
        │   ├── Profile.jsx        # Create / edit player profile
        │   ├── Matchmaking.jsx    # Suggested groups of 4
        │   ├── Sessions.jsx       # Browse & join game sessions
        │   └── PlayerDirectory.jsx# Browse all players
        └── components/
            └── Navbar.jsx
```

## API Reference

### Players

| Method | Endpoint             | Description             |
|--------|----------------------|-------------------------|
| GET    | `/api/players`       | List all players (supports `?variant=`, `?skill_level=`, `?search=`) |
| POST   | `/api/players`       | Create a new player     |
| GET    | `/api/players/:id`   | Get a player by ID      |
| PUT    | `/api/players/:id`   | Update a player         |
| DELETE | `/api/players/:id`   | Delete a player         |

### Sessions

| Method | Endpoint                     | Description                  |
|--------|------------------------------|------------------------------|
| GET    | `/api/sessions`              | List all sessions            |
| POST   | `/api/sessions`              | Create a new session         |
| GET    | `/api/sessions/:id`          | Get session + player list    |
| POST   | `/api/sessions/:id/join`     | Join a session               |
| DELETE | `/api/sessions/:id/leave`    | Leave a session              |
| DELETE | `/api/sessions/:id`          | Delete a session             |

### Matchmaking

| Method | Endpoint                          | Description                                 |
|--------|-----------------------------------|---------------------------------------------|
| GET    | `/api/matchmaking`                | Get all suggested groups (supports `?variant=`, `?limit=`) |
| GET    | `/api/matchmaking/for/:playerId`  | Get groups tailored for a specific player   |

## Matchmaking Algorithm

Groups are built by:

1. **Variant filter** — players must share the same Mahjong variant
2. **Combinations** — all possible groups of 4 are evaluated
3. **Scoring** (out of 100):
   - **Skill score (0–40):** Full 40 pts for all-same level; deducted 15 pts per level of range
   - **Availability score (0–60):** 8 pts per overlapping hour across all 4 players' schedules
4. Groups are sorted by total score descending

## Supported Variants

| Variant           | Description                                 |
|-------------------|---------------------------------------------|
| American          | NMJL card, jokers, Charleston pass          |
| Japanese Riichi   | Yaku-based scoring, riichi declarations     |
| Hong Kong         | Old Style, bonus tiles, fast play           |
| Chinese Classical | Traditional scoring with flower tiles       |

## Resetting the Database

To start fresh (removes all players and sessions):

```bash
rm server/mahjong.db
npm start   # re-seeds automatically
```

## Development Tips

- Edit seed data in `server/seed.js` to change the demo players
- The server uses `--watch` mode, so backend changes hot-reload automatically
- The client uses Vite HMR for instant frontend updates
- All `/api` requests from the client are proxied to port 3001 via `vite.config.js`
