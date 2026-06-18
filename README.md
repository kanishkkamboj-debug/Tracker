# TrackFlow 🚀

> Lean project & task tracker — Kanban board, live dashboard, 3D landing page.
> **Stack**: Java 21 · Spring Boot 3.3 · MySQL 8 · React 18 · Vite · TypeScript · Tailwind CSS · Three.js · Framer Motion · dnd-kit · Recharts

---

## Quick Start

### Prerequisites
- Java 21+
- Node 18+
- MySQL 8 **or** Docker + Docker Compose

---

### Option A — Docker Compose (backend + DB together)

```bash
# 1. Copy env file
cp .env.example .env          # adjust DB_PASSWORD if needed

# 2. Start backend + MySQL
docker-compose up -d

# 3. Start frontend
cd frontend
cp .env.example .env.local    # no changes needed
npm install
npm run dev
```

Frontend: http://localhost:5173  
Backend API: http://localhost:8080

---

### Option B — Local (MySQL already running)

```bash
# Backend
# Ensure MySQL is on port 3306, DB: "trackflow" (auto-created)
# Edit src/main/resources/application.properties if credentials differ

./mvnw spring-boot:run

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

---

## Usage Flow

1. **Register** at `/register` → redirected to Dashboard  
2. **Create a project** on the Projects page  
3. **Open the project** → Kanban board loads  
4. **Create tasks** and drag them between columns — status updates persist on refresh  
5. **Dashboard** shows live counts and charts  

---

## Project Structure

```
TrackFlow/
├── src/main/java/com/example/Tracker/
│   ├── config/          # SecurityConfig (JWT, CORS, BCrypt)
│   ├── controller/      # Auth, Project, Task, Dashboard controllers
│   ├── dto/             # All request/response DTOs
│   ├── entity/          # User, Project, Task + enums
│   ├── exception/       # GlobalExceptionHandler, custom exceptions
│   ├── repository/      # Spring Data JPA repos with @EntityGraph
│   ├── security/        # JwtService, JwtFilter, CustomUserDetailsService
│   └── service/         # AuthService, ProjectService, TaskService, DashboardService
├── frontend/src/
│   ├── api/             # Axios modules per domain
│   ├── components/
│   │   ├── kanban/      # KanbanCard, KanbanColumn
│   │   ├── landing/     # HeroScene (Three.js — lazy loaded)
│   │   ├── layout/      # AppShell, Sidebar, Navbar
│   │   └── ui/          # Button, Card, Badge, Input, Modal, Spinner
│   ├── pages/           # LandingPage, LoginPage, RegisterPage,
│   │                    # DashboardPage, ProjectsPage, ProjectDetailPage
│   ├── router/          # AppRouter with React.lazy code splitting
│   ├── stores/          # authStore (Zustand + localStorage)
│   └── types/           # Full TypeScript interface definitions
├── docker-compose.yml
├── Dockerfile
└── .env.example
```

---

## API Reference

| Method | Endpoint                        | Auth | Description            |
|--------|---------------------------------|------|------------------------|
| POST   | `/api/auth/register`            | No   | Register new user      |
| POST   | `/api/auth/login`               | No   | Login, receive JWT     |
| GET    | `/api/projects`                 | Yes  | List projects (paged)  |
| POST   | `/api/projects`                 | Yes  | Create project         |
| GET    | `/api/projects/{id}`            | Yes  | Get single project     |
| PUT    | `/api/projects/{id}`            | Yes  | Update project         |
| DELETE | `/api/projects/{id}`            | Yes  | Delete project         |
| GET    | `/api/projects/{id}/tasks`      | Yes  | All tasks for project  |
| POST   | `/api/tasks`                    | Yes  | Create task            |
| PUT    | `/api/tasks/{id}`               | Yes  | Update task            |
| PATCH  | `/api/tasks/{id}/status`        | Yes  | Update task status     |
| DELETE | `/api/tasks/{id}`               | Yes  | Delete task            |
| GET    | `/api/dashboard/summary`        | Yes  | Dashboard aggregate    |

All authenticated endpoints require `Authorization: Bearer <token>`.

---

## Architecture Notes

- **Stateless JWT**: No session state on backend. Token stored in localStorage via Zustand.
- **N+1 prevention**: `@EntityGraph` on repository methods that load project+owner together.
- **Optimistic Kanban updates**: Status updated locally on drag-end; API call fires in background; reverts on failure.
- **3D scene**: Isolated to landing page only, lazy-loaded via `React.lazy`. Never affects dashboard bundle.
- **Reduced-motion**: `prefers-reduced-motion` check disables Three.js and uses gradient static hero.
- **Extension points**: `UserRole` enum ready for RBAC; `assigneeName` ready for FK to User in v2.
