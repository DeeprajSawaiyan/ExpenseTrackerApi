# Expense Tracker API

A Spring Boot REST API for personal expense management. Users can register, authenticate with JWT, and manage their own expenses (CRUD, filter by category, name, and date).

**Base URL:** `http://localhost:8080/api/v1`

## Tech Stack

- Java 17 · Spring Boot 2.5 · Spring Data JPA · MySQL
- Spring Security · JWT · Maven

## Prerequisites

- JDK 17
- MySQL (database: `expensetracker`)

## Setup

1. Clone the repository.

2. Update `src/main/resources/application.properties`:

```properties
spring.datasource.username=root
spring.datasource.password=YOUR_MYSQL_PASSWORD
jwt.secret=your-secret-key
```

3. Create the database:

```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS expensetracker;"
```

## Run

### Quick start (no MySQL needed)

The `local` profile uses an embedded H2 database stored in `./data/` (data survives restarts):

```bash
export JAVA_HOME="/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home"  # macOS (if needed)

./mvnw spring-boot:run -Dspring-boot.run.profiles=local
```

### With MySQL

```bash
export JAVA_HOME="/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home"  # macOS (if needed)

./mvnw spring-boot:run
```

Wait for `Started ExpensetrackerapiApplication`, then use the API at `http://localhost:8080/api/v1`.

## API Overview

| Method | Endpoint | Auth |
|--------|----------|------|
| POST | `/register` | No |
| POST | `/login` | No |
| GET / PUT / DELETE | `/profile`, `/deactivate` | JWT |
| GET / POST / PUT / DELETE | `/expenses`, `/expenses/{id}` | JWT |

Protected routes require header: `Authorization: Bearer <token>`

## Password reset by email

Users can request a reset link from **Forgot password?** on the login page.

| Method | Endpoint | Auth | Body |
|--------|----------|------|------|
| POST | `/forgot-password` | No | `{ "email": "..." }` — always returns the same message |
| POST | `/reset-password` | No | `{ "token": "...", "newPassword": "..." }` |

- Links are single-use, expire after 30 minutes, and only a SHA-256 hash of the token is stored.
- Requesting again within 60 seconds does not send another email.
- A successful reset **signs the user out on all devices**: each JWT carries the account's token version
  (`ver` claim), and the reset increments it, so every previously issued token is rejected with 401.

### Email settings

Email is sent via the **Brevo HTTP API** when `BREVO_API_KEY` is set, otherwise via **SMTP**.

| Variable | Example |
|----------|---------|
| `BREVO_API_KEY` | Brevo API key (Brevo → SMTP & API → API keys). Use this on Render's free plan. |
| `MAIL_HOST` | `smtp.gmail.com` |
| `MAIL_PORT` | `587` |
| `MAIL_USERNAME` | `you@gmail.com` |
| `MAIL_PASSWORD` | Gmail **app password** (Google Account → Security → App passwords) |
| `MAIL_FROM` | sender address; with Brevo it must be a verified sender. Defaults to `MAIL_USERNAME` |
| `FRONTEND_BASE_URL` | where the link points, e.g. `https://deeprajsawaiyan.github.io/ExpenseTrackerApi` (default `http://localhost:5173`) |

**Local development without SMTP:** leave `MAIL_HOST` unset. No email is sent; the reset link is printed
in the backend console (`Reset link for ...`) so you can open it directly. Links are only ever printed with
`app.mail.log-links=true`, which only the `local` profile sets — never in production. The startup log says
`Email delivery: ENABLED` or `DISABLED` so you can tell which mode you're in.

**Real emails locally (local profile):** copy `local-mail.properties.example` to `local-mail.properties`
(git-ignored), fill in your SMTP details (e.g. a Gmail App Password), and restart the backend.

Emails are case-insensitive: they're stored lower-case, and login, registration and password reset all
match regardless of capitalisation.

## Frontend (React)

The React app lives in `expense-tracker-frontend/`.

```bash
cd expense-tracker-frontend
cp .env.example .env   # Windows: copy .env.example .env
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). See `expense-tracker-frontend/README.md` for details.

**Live frontend:** https://deeprajsawaiyan.github.io/ExpenseTrackerApi/

## CORS / Production frontend

The API allows these origins by default:

- `http://localhost:5173` (local Vite dev server)
- `http://localhost:3000` (alternate local port)
- Value of `FRONTEND_URL` when set (production)

### Environment variable

```properties
FRONTEND_URL=https://deeprajsawaiyan.github.io
```

Mapped in `application.properties` as `frontend.url=${FRONTEND_URL:}`.

## Deployment checklist

The **frontend** deploys to GitHub Pages via `.github/workflows/deploy.yml` (on push to `main` touching
`expense-tracker-frontend/**`). The **backend + PostgreSQL** deploy to Render via `render.yaml` (Docker).

### 1. Backend on Render (do this first — the frontend needs its URL)

1. Render dashboard → **New → Blueprint** → select this repository (it reads `render.yaml`).
2. When prompted for the `sync: false` variables:
   - **Email on the free plan:** Render's free instances **block outbound SMTP** (ports 25/465/587), so Gmail
     SMTP won't work there. Create a free [Brevo](https://www.brevo.com) account, verify your sender email,
     create an API key, and set `BREVO_API_KEY` + `MAIL_FROM` (the verified sender). Leave the `MAIL_*` SMTP
     values empty. (On a paid instance, SMTP via `MAIL_HOST`/`MAIL_USERNAME`/`MAIL_PASSWORD` also works.)
3. `JWT_SECRET` is generated automatically. The `render` profile **refuses to start without it** (no insecure default).
4. After deploy, note the service URL, e.g. `https://expense-tracker-api-xxxx.onrender.com`. Check the logs for
   `Email delivery: ENABLED`.

`FRONTEND_URL` (CORS origin) and `FRONTEND_BASE_URL` (links in emails) are already set in `render.yaml` for
`https://deeprajsawaiyan.github.io/ExpenseTrackerApi`. Update them if the repo name or owner changes.

### 2. Frontend on GitHub Pages

1. Repo **Settings → Pages → Source: GitHub Actions**.
2. Repo **Settings → Secrets and variables → Actions → New repository secret**:
   `VITE_API_BASE_URL` = `https://<your-render-service>.onrender.com/api/v1`.
   The workflow **fails with a clear error** if this secret is missing.
3. Push to `main`. The site is published at https://deeprajsawaiyan.github.io/ExpenseTrackerApi/.

### Notes

- Render free web services sleep after inactivity; the first request after a while can take ~1 minute.
- Render's free PostgreSQL databases expire after a limited period — check Render's current free-tier terms.
- Never commit `local-mail.properties`, `.env`, or the `data/` folder (all git-ignored).

## License

This project is for educational purposes.
