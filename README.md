# 🔗 Shrinkly  — Backend API

The server-side engine behind the URL shortener. Built with **Node.js**, **Express**, and **TypeScript**, it handles creating short links, redirecting users, tracking click counts, and identifying anonymous users via cookies — all backed by a **Prisma ORM** database.

---

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [API Reference](#api-reference)
- [How It Works](#how-it-works)
- [Tech Stack](#tech-stack)

---

## ✅ Prerequisites

| Tool | Minimum Version | Check with |
|------|----------------|------------|
| [Node.js](https://nodejs.org) | v18+ | `node -v` |
| npm | v9+ | `npm -v` |
| A supported database (PostgreSQL, MySQL, SQLite, etc.) | — | See [Prisma docs](https://www.prisma.io/docs) |

---

## 🚀 Getting Started

**1. Clone the repository**
```bash
git clone https://github.com/varun789-mx/shrinkly-backend.git
cd shrinkly-backend
```

**2. Install dependencies**
```bash
npm install
```

**3. Set up your environment variables**
```bash
cp .env.example .env
```
Then open `.env` and fill in your values (see [Environment Variables](#environment-variables) below).

**4. Set up the database**
```bash
npx prisma migrate dev
```
This creates your database tables based on the Prisma schema. Run this any time the schema changes.

**5. Start the development server**
```bash
npm run dev
```

The API will be running at **http://localhost:3000** (or whichever `PORT` you set). You can verify it's alive by visiting **http://localhost:3000/health**.

---

## 📁 Project Structure

```
url-shortener-backend/
│
├── src/
│   ├── index.ts              # Server entry point — wires up Express, middleware & routes
│   └── routes/
│       ├── Create.ts         # POST /api/create — generates a short URL
│       ├── Redirect.ts       # GET /:code — redirects to the original URL
│       └── getlinks.ts       # GET /api/getlinks — lists a user's shortened URLs
│
├── lib/
│   └── db.ts                 # Prisma client instance (shared across the app)
│
├── prisma/
│   └── schema.prisma         # Database schema definition
│
├── .env.example              # Environment variable template (safe to commit)
├── .env                      # Your real config (do NOT commit this)
├── package.json              # Dependencies and scripts
└── tsconfig.json             # TypeScript configuration
```

---

## 🔑 Environment Variables

Copy `.env.example` to `.env` and configure the following:

```env
# The base URL this server is hosted at — used to build short links
MAIN_URL=http://localhost:3000

# The URL of your frontend app — used for CORS whitelisting
FRONTEND_URL=http://localhost:5173

# Your database connection string (format depends on your DB provider)
DATABASE_URL=postgresql://user:password@localhost:5432/urlshortener

# Port the server listens on
PORT=3000
```

> **Heads up:** Never commit your real `.env` file. It's already in `.gitignore`, but double-check before pushing.

---

## 📜 Available Scripts

| Command | What it does |
|---------|-------------|
| `npm run dev` | Starts the server with hot reload for development |
| `npm run build` | Compiles TypeScript to JavaScript in `dist/` |
| `npm start` | Runs the compiled production build |
| `npx prisma migrate dev` | Applies database migrations during development |
| `npx prisma studio` | Opens a visual browser-based database editor |

---

## 📡 API Reference

### `POST /api/create`
Creates a new shortened URL.

**Request body:**
```json
{
  "original_url": "https://some-very-long-website.com/with/a/long/path"
}
```

**Response:**
```json
{
  "short_url": "http://localhost:3000/abc123"
}
```

**Errors:** Returns `400` if `original_url` is missing.

---

### `GET /:code`
Redirects the browser to the original URL associated with the short code.

**Example:** `GET /abc123` → `302` redirect to `https://some-very-long-website.com/with/a/long/path`

Also increments the click counter for that link.

**Errors:** Returns `404` if the code doesn't exist.

---

### `GET /api/getlinks`
Returns the current user's shortened URLs (identified via cookie).

**Response:**
```json
[
  {
    "original_url": "https://some-very-long-website.com/with/a/long/path",
    "short_url": "http://localhost:3000/abc123",
    "clicks": 42,
    "created_at": "2024-01-15T10:30:00.000Z"
  }
]
```

Returns up to **7 links**, most recent first.

---

### `GET /health`
Simple uptime check — returns `200 OK` if the server is running. Useful for deployment health monitors.

---

## ⚙️ How It Works

```
New visitor arrives
        ↓
Server checks for a user ID cookie
  → No cookie? Generate a random ID and set it
  → Has cookie? Read the existing user ID
        ↓
User calls POST /api/create with a long URL
  → nanoid generates a unique 6-character code (e.g. "abc123")
  → Code + original URL + user ID saved to the database
  → Short URL returned to the frontend
        ↓
User shares the short link (e.g. http://yourdomain.com/abc123)
        ↓
Someone clicks it → GET /abc123
  → Server looks up "abc123" in the database
  → Click counter incremented
  → Browser redirected to the original long URL
        ↓
User calls GET /api/getlinks
  → Server reads their user ID from the cookie
  → Returns their last 7 links with click counts
```

---

## 🛠️ Tech Stack

| Technology | Role |
|-----------|------|
| [Node.js](https://nodejs.org) + [Express](https://expressjs.com) | HTTP server and routing |
| [TypeScript](https://www.typescriptlang.org) | Type-safe JavaScript |
| [Prisma ORM](https://www.prisma.io) | Database access and schema management |
| [nanoid](https://github.com/ai/nanoid) | Generating short, unique URL codes |
| [cookie-parser](https://www.npmjs.com/package/cookie-parser) | Reading and writing cookies for user tracking |
| [cors](https://www.npmjs.com/package/cors) | Allowing the frontend to make cross-origin requests |
| [dotenv](https://www.npmjs.com/package/dotenv) | Loading environment variables from `.env` |

---

## 🤝 Contributing

1. Fork the repo and create a new branch: `git checkout -b feature/your-feature`
2. Make your changes and commit them: `git comm
