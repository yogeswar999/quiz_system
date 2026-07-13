# Online Quiz Management System

A full-stack quiz platform with a Spring Boot backend and a React (Vite) frontend.

- **Admin** creates quizzes and questions, and reviews results.
- **Users** register with an email + password, take timed quizzes with basic exam-security
  measures, and see their result immediately after submitting.

---

## 1. Tech Stack

| Layer     | Tech |
|-----------|------|
| Backend   | Java 25, Spring Boot 4.1.0, Spring Security, Spring Data JPA (Hibernate), MySQL, Maven, JWT |
| Frontend  | React 18 (Vite), React Router, Axios, Bootstrap 5, Bootstrap Icons, React-Toastify |
| Database  | MySQL 8 |

No Docker is required — everything runs locally with `mvn spring-boot:run` and `npm run dev`.

---

## 2. Prerequisites

- **JDK 25** (you already have this ✅) — Spring Boot 4.1.0 has first-class Java 25 support.
- **Maven** (or use IntelliJ's bundled Maven — no separate install needed)
- **Node.js 18+** and npm
- **MySQL 8** running locally, with a user that can create databases (default config below uses `root` / `root`)
- **IntelliJ IDEA** (Community or Ultimate both work — Ultimate has nicer Spring Boot tooling)

---

## 3. Backend Setup

1. Open `backend/` as a Maven project in IntelliJ (`File → Open`, select the `backend` folder — IntelliJ
   will detect `pom.xml` automatically and download dependencies).
2. Make sure IntelliJ's Project SDK is set to JDK 25 (`File → Project Structure → Project`).
3. Create the database (the app will actually auto-create it for you, but MySQL needs to be running):
   ```sql
   CREATE DATABASE IF NOT EXISTS quiz_db;
   ```
4. Edit `backend/src/main/resources/application.properties`:
   - Update `spring.datasource.username` / `spring.datasource.password` to match your local MySQL.
5. Run the app:
   - In IntelliJ: right-click `QuizApplication.java` → **Run**, or
   - From terminal: `cd backend && mvn spring-boot:run`
6. On first run, the app auto-seeds a default admin account and prints it to the console:
   ```
   username: admin
   password: admin123
   ```
7. Backend runs at `http://localhost:8080`.

Hibernate automatically creates/updates all tables on startup (`spring.jpa.hibernate.ddl-auto=update`),
so you don't need to run any SQL by hand. Reference files `backend/sql/schema.sql` and
`backend/sql/data.sql` are included for documentation and optional manual seeding of demo quizzes.

---

## 4. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173` and is pre-configured to call the backend at
`http://localhost:8080/api` (see `frontend/src/services/api.js`).

---

## 5. Default Credentials

| Role  | Username / Email | Password |
|-------|-------------------|----------|
| Admin | `admin`            | `admin123` |
| User  | any email address  | set your own password when you register |

---

## 6. How to Use

1. Go to `http://localhost:5173/admin/login`, log in as admin, create a quiz, then add questions to it
   (Manage Quiz → Questions button).
2. Go to `http://localhost:5173/register`, create an account with any email + password.
3. Log in as the user, pick a quiz, read the instructions, start the test, answer questions, and submit
   (or let the timer run out) to see the result page immediately.
4. Back in the admin panel, check **View Results** to see that attempt.

---

## 7. Project Structure

```
quiz-app/
├── backend/
│   ├── pom.xml
│   ├── sql/                       # reference schema.sql + data.sql (optional, not auto-run)
│   └── src/main/
│       ├── java/com/quizapp/
│       │   ├── config/            # SecurityConfig, DataSeeder
│       │   ├── controller/        # REST controllers
│       │   ├── service/           # business logic
│       │   ├── repository/        # Spring Data JPA repositories
│       │   ├── entity/            # JPA entities
│       │   ├── dto/               # request/response DTOs
│       │   ├── security/          # JWT util + filter
│       │   ├── exception/         # global exception handler
│       │   └── util/              # helper utilities
│       └── resources/application.properties
└── frontend/
    └── src/
        ├── components/            # Navbar, Sidebar, Footer, ProtectedRoute, etc.
        ├── pages/                 # one file per screen
        ├── services/              # Axios API calls
        ├── context/, hooks/       # AuthContext / useAuth
        └── assets/theme.css       # blue-and-white theme
```

---

## 8. API Documentation

Base URL: `http://localhost:8080/api`

All responses are wrapped as: `{ "success": bool, "message": string, "data": ... }`

### Auth

| Method | Path | Auth | Body | Response |
|--------|------|------|------|----------|
| POST | `/auth/admin/login` | none | `{ username, password }` | `{ token, role, username }` |
| POST | `/auth/register` | none | `{ email, password }` | `{ token, role, username }` |
| POST | `/auth/login` | none | `{ email, password }` | `{ token, role, username }` |

### Quizzes

| Method | Path | Auth | Body | Response |
|--------|------|------|------|----------|
| GET | `/quizzes?search=&page=&size=` | public | — | paged list of quizzes |
| GET | `/quizzes/{id}` | public | — | quiz details |
| GET | `/quizzes/{id}/questions-for-user` | USER | — | questions **without** correct answers (blocked with 423 if locked) |
| GET | `/quizzes/{id}/access-status` | USER | — | `{ locked: boolean }` for the current user |
| POST | `/quizzes` | ADMIN | `{ subject, duration, totalMarks, numberOfQuestions, description }` | created quiz |
| PUT | `/quizzes/{id}` | ADMIN | same as above | updated quiz |
| DELETE | `/quizzes/{id}` | ADMIN | — | — |

### Quiz Access (attempt locking)

| Method | Path | Auth | Body | Response |
|--------|------|------|------|----------|
| POST | `/quiz-access/{lockId}/unlock` | ADMIN | — | allows that user to retake the quiz once more |

### Questions

| Method | Path | Auth | Body | Response |
|--------|------|------|------|----------|
| GET | `/questions/quiz/{quizId}?search=` | ADMIN | — | list of questions (with correct answers) |
| POST | `/questions` | ADMIN | `{ questionText, optionA..D, correctAnswer, marks, quizId }` | created question |
| POST | `/questions/bulk` | ADMIN | `{ quizId, questions: [{ questionText, optionA..D, correctAnswer, marks }] }` | all created questions (all-or-nothing) |
| PUT | `/questions/{id}` | ADMIN | same as above | updated question |
| DELETE | `/questions/{id}` | ADMIN | — | — |

### Results

| Method | Path | Auth | Body | Response |
|--------|------|------|------|----------|
| POST | `/results/submit` | USER | `{ email, quizId, answers: [{questionId, selectedOption}], timeTakenSeconds }` | result — score hidden until published, locks the quiz for that user afterward |
| GET | `/results/my` | USER | — | the current user's own results (score fields null until published) |
| GET | `/results/{id}` | USER (own) / ADMIN (any) | — | result details — score hidden from the user until admin publishes it |
| GET | `/results?search=&page=&size=` | ADMIN | — | paged list of results (always full detail) |
| POST | `/results/{id}/publish` | ADMIN | — | reveals the score to the user who took it |
| POST | `/results/{id}/unpublish` | ADMIN | — | hides the score again |
| DELETE | `/results/{id}` | ADMIN | — | — |

All authenticated requests must include: `Authorization: Bearer <jwt-token>`

---

## 9. Deploying to Railway

The project is already set up for this — `server.port` reads Railway's dynamic `PORT` variable,
CORS accepts a comma-separated origin list, and the frontend's API URL is configurable via
`VITE_API_URL` instead of being hardcoded to localhost.

**Prerequisite:** push this project to a GitHub repository (Railway deploys from GitHub). You can
keep `backend/` and `frontend/` in one repo — Railway lets you set a "Root Directory" per service.

### Step 1 — Create the project and database
1. Go to [railway.com](https://railway.com) and log in with GitHub.
2. **New Project** → **Deploy MySQL** (from the database options, or the template marketplace).
   Railway provisions a MySQL instance and exposes connection variables you'll reference below.

### Step 2 — Deploy the backend
1. In the same project: **New** → **GitHub Repo** → select your repo.
2. Open the new service's **Settings** → set **Root Directory** to `backend`.
   Railway auto-detects it's a Maven/Java project via Nixpacks.
3. Go to **Variables** and add:
   ```
   SPRING_DATASOURCE_URL=jdbc:mysql://${{MySQL.MYSQLHOST}}:${{MySQL.MYSQLPORT}}/${{MySQL.MYSQLDATABASE}}?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
   SPRING_DATASOURCE_USERNAME=${{MySQL.MYSQLUSER}}
   SPRING_DATASOURCE_PASSWORD=${{MySQL.MYSQLPASSWORD}}
   JWT_SECRET=<a long random string, at least 32 characters>
   APP_DEFAULT_ADMIN_USERNAME=admin
   APP_DEFAULT_ADMIN_PASSWORD=<pick something other than admin123 for a real deployment>
   ```
   The `${{MySQL.XXX}}` syntax references the MySQL service's own variables — Railway autocompletes
   these for you when typing in the Variables tab.
4. Under **Settings** → **Networking**, click **Generate Domain**. Copy the resulting URL
   (e.g. `https://your-backend.up.railway.app`) — you'll need it in Step 3.
5. Deploy. Check the logs for `Started QuizApplication` to confirm it's up.

### Step 3 — Deploy the frontend
1. **New** → **GitHub Repo** → same repo again.
2. Set **Root Directory** to `frontend`.
3. Go to **Variables** and add, using the backend URL from Step 2:
   ```
   VITE_API_URL=https://your-backend.up.railway.app/api
   ```
   Important: Vite bakes this into the build at build time, so it must be set *before* the first
   deploy (or you need to trigger a redeploy after adding it).
4. Under **Settings**, confirm the build/start commands picked up `npm run build` and `npm start`
   (already wired up in `package.json` — `start` serves the `dist/` folder). If Railway doesn't
   auto-detect them, set them explicitly in Settings → Build/Deploy.
5. Under **Networking**, **Generate Domain**. This is your live app URL.

### Step 4 — Connect the two
1. Go back to the **backend** service → **Variables**, and update:
   ```
   APP_CORS_ALLOWED_ORIGIN=https://your-frontend.up.railway.app,http://localhost:5173
   ```
   (comma-separated — keeps local dev working alongside the deployed frontend)
2. Redeploy the backend so the new CORS setting takes effect.

### Step 5 — Verify
Visit your frontend's Railway URL, register a user, log in as admin
(`admin` / whatever you set `APP_DEFAULT_ADMIN_PASSWORD` to), create a quiz, and confirm the whole
flow works end-to-end in production.

**Notes:**
- Hibernate (`ddl-auto=update`) creates all tables automatically on first startup — no manual SQL needed.
- If you later change an entity in a way that needs a fresh schema (like we did locally with
  `DROP DATABASE`), you'd instead clear the tables via Railway's MySQL data tab, since you don't have
  shell access to run `DROP DATABASE` directly the way you do locally.
- Local development is unaffected — `application.properties` still has your localhost defaults, and
  Railway's environment variables only apply to the deployed services, not your machine.

---

## 10. Non-negotiables Checklist

- ✅ Compiles and runs with no missing files or placeholder logic
- ✅ Email + password registration and login for users, JWT-based auth for both roles
- ✅ Full CRUD for quizzes and questions, search + pagination
- ✅ Timed quiz-taking experience with tab-switch detection, right-click/copy/paste disabling, and
  auto-submit on timeout or 3 warnings
- ✅ Immediate results page + admin results table with search/delete
- ✅ One-attempt-per-quiz lock for users, with an admin-controlled unlock to allow a retake
- ✅ Bulk-paste multiple questions at once in Manage Questions, instead of one-by-one
- ✅ Results stay hidden from the user until an admin publishes them; a "My Results" page lets users check status
