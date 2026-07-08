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

### Render deployment

`render.yaml` sets `FRONTEND_URL` to `https://deeprajsawaiyan.github.io` for the deployed GitHub Pages site. After changing the frontend URL, update this value in the Render dashboard and redeploy the backend.

## License

This project is for educational purposes.
