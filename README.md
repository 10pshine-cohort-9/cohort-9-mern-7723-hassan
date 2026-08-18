# cohort-9-mern-7723-hassan

Cohort 9 — MERN (Node.js + React.js) assignment for Hassan Ahmed. A full-stack Notes application with per-user authentication, rich-text CRUD notes, real-time sync, and CI code-quality checks.

## Tech Stack

- **Frontend:** React.js (Vite + Tailwind CSS)
- **Backend:** Node.js + Express
- **Database:** MongoDB
- **Auth:** JWT
- **Real-time:** Socket.IO
- **Logging:** Pino (HTTP requests, errors, user activity)
- **Testing:** Mocha/Chai (backend), Jest (frontend)
- **Code Quality:** SonarCloud (via GitHub Actions)

## Features

- Sign up / log in / log out with JWT, notes scoped per user
- Full CRUD note management with a rich text editor
- Real-time updates across sessions via Socket.IO (`note:created`, `note:updated`, `note:deleted`)
- Search/filter notes (client-side, with clear button + empty state)
- Import notes from `.txt` files on the local filesystem
- Global exception-handling middleware
- Optional User Profile screen (details + logout)

## Screens

| Screen | Description |
|---|---|
| Sign Up / Log In | User authentication |
| Dashboard | Notes list + create |
| Note Editor | Rich text editing, save/cancel |
| User Profile *(optional)* | Account details + logout |

## Project Structure

```
cohort-9-mern-7723-hassan/
├── backend/       # Express API, JWT auth, MongoDB models, Socket.IO server, Pino logging
├── frontend/      # React (Vite) app, Tailwind UI, Socket.IO client
└── sonar-project.properties
```

## Getting Started

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

Set required environment variables (Mongo URI, JWT secret, port, etc.) in `.env` files for both `backend/` and `frontend/`.

## Testing

```bash
# Backend (Mocha/Chai)
cd backend && npm test

# Frontend (Jest)
cd frontend && npm test
```

## Code Quality — SonarCloud

This repo runs static analysis via **SonarCloud** on every push/PR through GitHub Actions (no local Docker/Java setup required).

Setup summary:
1. `SONAR_TOKEN` added under **Settings → Secrets and variables → Actions** (on the fork, not upstream).
2. `sonar-project.properties` at repo root, scoped to the split `backend/` + `frontend/` structure.
3. GitHub Actions workflow runs the Sonar scan on push/PR and publishes results to the SonarCloud dashboard.

## Stretch Goals

- [x] Real-time updates (Socket.IO)
- [x] Note import (filesystem)
- [x] Search/filter notes
- [ ] Note export
- [ ] Additional profile page features

## Branching

Active development branch: `ProfilePageAndAdditionalFeatures`

## Author

**Hassan Ahmed** ([HassanAhmed270](https://github.com/HassanAhmed270))