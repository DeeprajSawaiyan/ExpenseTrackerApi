# Expense Tracker Frontend

React + TypeScript frontend for the Expense Tracker API (Spring Boot backend in the repository root).

## Prerequisites

- Node.js 18+
- Backend API running at `http://localhost:8080/api/v1`
- MySQL database configured for the backend (see root `README.md`)

## Environment setup

1. Copy the example env file:

```bash
cp .env.example .env
```

Windows:

```powershell
copy .env.example .env
```

2. Default API URL (no change needed for local dev):

```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

## Install

```bash
npm install
```

## Development

Run **both** the backend and frontend for full-stack local development.

### 1. Start backend (from repository root)

Windows:

```powershell
cd ..
.\mvnw.cmd spring-boot:run
```

macOS / Linux:

```bash
cd ..
./mvnw spring-boot:run
```

Wait for: `Started ExpensetrackerapiApplication`

API available at: `http://localhost:8080/api/v1`

### 2. Start frontend (from this folder)

```bash
npm run dev
```

Open: [http://localhost:5173](http://localhost:5173)

### Integration notes

- CORS is enabled on the backend for `http://localhost:5173`
- No Vite proxy is required — the app calls `VITE_API_BASE_URL` directly
- Login response uses `jwtToken` (stored as `expense_tracker_token`)
- Expense delete uses `DELETE /expenses?id={id}` (query param)
- Expense dates are sent as `YYYY-MM-DD`
- Expense amounts are sent as JSON numbers (compatible with backend `BigDecimal`)

### Quick test checklist

- [ ] Register a new user
- [ ] Login and reach dashboard
- [ ] Create an expense
- [ ] Edit an expense
- [ ] Filter expenses by category
- [ ] Delete an expense
- [ ] Update profile
- [ ] Logout

See [TESTING.md](./TESTING.md) for detailed manual test steps.

## Build

```bash
npm run build
```

## Production deployment (GitHub Pages)

Live URL: **https://deeprajsawaiyan.github.io/ExpenseTrackerApi/**

This repo hosts the frontend on GitHub Pages from the `expense-tracker-frontend/` folder.

### One-time GitHub setup

1. Open **Settings → Secrets and variables → Actions**
2. Add repository secret:
   - Name: `VITE_API_BASE_URL`
   - Value: your production API URL (e.g. `https://expense-tracker-api.onrender.com/api/v1`)
3. Open **Settings → Pages**
4. Set **Source** to **GitHub Actions**

### How deployment works

- Workflow: `.github/workflows/deploy.yml`
- Triggers on push to `main` when `expense-tracker-frontend/` changes
- Runs `npm ci && npm run build` with `GITHUB_PAGES=true`
- Deploys `expense-tracker-frontend/dist/` to GitHub Pages
- SPA routing: `public/404.html` + `index.html` redirect script

### Connect to production backend

After deploying the frontend, ensure the backend CORS allows:

`https://deeprajsawaiyan.github.io`

(Run **Prompt 14** / set `FRONTEND_URL` on Render for production CORS.)

## Project structure

```
src/
  api/          # API client and service calls
  components/   # Reusable UI components
  context/      # React context (auth, alerts)
  hooks/        # Custom hooks
  pages/        # Route pages
  types/        # TypeScript types
  utils/        # Helpers
```

## Routes

| Path | Page |
|------|------|
| `/login` | Login |
| `/register` | Register |
| `/dashboard` | Dashboard (expense list + filters) |
| `/profile` | Profile |
| `/expenses/new` | Add expense |
| `/expenses/:id/edit` | Edit expense |
