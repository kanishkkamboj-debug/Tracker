# Full Stack Project Tracker - Complete Setup Guide

## Project Overview

A **Production-Quality Collaborative Project Management Platform** similar to Jira and Trello.

**Tech Stack:**
- **Backend**: Java 21, Spring Boot 3.3, Spring Web, Spring Data JPA, Spring Security, JWT (JJWT 0.11.5), Lombok, Bean Validation, MySQL
- **Frontend**: React 18, React Router v6, Axios, Tailwind CSS v3, @hello-pangea/dnd (Drag-and-Drop)

---

## Backend Setup

### 1. **Database Configuration**

Update `src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/project_tracker
spring.datasource.username=root
spring.datasource.password=Kk1234@

spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA/Hibernate
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true

# Server
server.port=8080

# JWT
jwt.secret=mysupersecretkeymysupersecretkey
jwt.expiration=86400000
```

### 2. **Database Setup (MySQL)**

```sql
CREATE DATABASE project_tracker;
USE project_tracker;
```

Hibernate will auto-create tables from entities.

### 3. **Run Backend**

```bash
cd Tracker
mvn clean install
mvn spring-boot:run
```

Backend will start at `http://localhost:8080`

---

## Frontend Setup

### 1. **Install Dependencies**

```bash
cd frontend
npm install
```

### 2. **Start Development Server**

```bash
npm start
```

Frontend will run on `http://localhost:3000`

---

## Project Architecture

### Backend Package Structure (com.projecttracker)

```
com.projecttracker/
├── entity/              # JPA entities with Lombok
│   ├── User.java
│   ├── Project.java
│   ├── ProjectMember.java
│   ├── Task.java
│   ├── Milestone.java
│   ├── Comment.java
│   ├── ActivityLog.java
│   └── Enums: UserRole, ProjectStatus, TaskPriority, TaskStatus
├── dto/                 # Request/Response DTOs with validation
│   ├── RegisterRequest.java
│   ├── LoginRequest.java
│   ├── AuthResponse.java
│   ├── UserDto.java
│   ├── ProjectRequest/Response.java
│   ├── TaskRequest/Response.java
│   ├── MilestoneRequest/Response.java
│   ├── CommentRequest/Response.java
│   ├── ActivityLogResponse.java
│   ├── ProjectMemberRequest.java
│   └── ApiResponse.java (Generic wrapper)
├── repository/          # Spring Data JPA repositories
│   ├── UserRepository.java
│   ├── ProjectRepository.java
│   ├── ProjectMemberRepository.java
│   ├── TaskRepository.java
│   ├── MilestoneRepository.java
│   ├── CommentRepository.java
│   └── ActivityLogRepository.java
├── service/             # Business logic (interfaces)
│   ├── AuthService.java
│   ├── UserService.java
│   ├── ProjectService.java
│   ├── TaskService.java
│   ├── MilestoneService.java
│   ├── CommentService.java
│   └── ActivityLogService.java
├── service/impl/        # Service implementations
│   ├── AuthServiceImpl.java
│   ├── UserServiceImpl.java
│   ├── ProjectServiceImpl.java
│   ├── TaskServiceImpl.java
│   ├── MilestoneServiceImpl.java
│   ├── CommentServiceImpl.java
│   └── ActivityLogServiceImpl.java
├── controller/          # REST endpoints (no business logic)
│   ├── AuthController.java
│   ├── ProjectController.java
│   ├── TaskController.java
│   ├── MilestoneController.java
│   ├── CommentController.java
│   └── ActivityLogController.java
├── security/            # JWT and authentication
│   ├── JwtService.java
│   ├── JwtFilter.java
│   └── CustomUserDetailsService.java
├── config/              # App configuration
│   └── SecurityConfig.java
├── exception/           # Exception handling
│   ├── GlobalExceptionHandler.java
│   ├── ResourceNotFoundException.java
│   └── UnauthorizedException.java
└── TrackerApplication.java  # Main Spring Boot application
```

### Frontend Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Layouts.jsx          # MainLayout, AuthLayout, Navbar, Sidebar
│   │   ├── Cards.jsx            # ProjectCard, TaskCard
│   │   └── Common.jsx           # LoadingSpinner, Modal, StatusBadge, etc.
│   ├── pages/
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── DashboardPage.jsx
│   │   └── TaskBoardPage.jsx    # Kanban board with drag-and-drop
│   ├── services/
│   │   ├── authService.js
│   │   ├── projectService.js
│   │   ├── taskService.js
│   │   ├── milestoneService.js
│   │   └── commentService.js
│   ├── context/
│   │   ├── AuthContext.jsx      # Auth state + login/register/logout
│   │   └── ProjectContext.jsx   # Active project state
│   ├── routes/
│   │   ├── PrivateRoute.jsx     # Protected route wrapper
│   │   └── AppRouter.jsx        # Main router configuration
│   ├── utils/
│   │   ├── axiosInstance.js     # Axios with JWT interceptors
│   │   ├── constants.js         # App constants, status/priority colors
│   │   └── helpers.js           # Utility functions
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── vite.config.js
├── tailwind.config.js
├── package.json
└── README.md
```

---

## REST API Endpoints

### Auth (Public)
```
POST   /api/auth/register      → RegisterRequest → AuthResponse
POST   /api/auth/login         → LoginRequest → AuthResponse
```

### Projects (Protected)
```
GET    /api/projects           → List[ProjectResponse]
POST   /api/projects           → ProjectRequest → ProjectResponse
GET    /api/projects/{id}      → ProjectResponse
PUT    /api/projects/{id}      → ProjectRequest → ProjectResponse
DELETE /api/projects/{id}      → 204 No Content
POST   /api/projects/{id}/members/{userId}  → Add member
```

### Tasks (Protected)
```
GET    /api/tasks              → List (filters: ?projectId=, ?assigneeId=, ?status=)
POST   /api/tasks              → TaskRequest → TaskResponse
GET    /api/tasks/{id}         → TaskResponse
PUT    /api/tasks/{id}         → TaskRequest → TaskResponse
DELETE /api/tasks/{id}         → 204 No Content
PATCH  /api/tasks/{id}/status  → { status: TaskStatus } → TaskResponse
PATCH  /api/tasks/{id}/assign/{userId} → TaskResponse
```

### Milestones (Protected)
```
GET    /api/milestones/project/{projectId} → List
GET    /api/milestones/{id}   → MilestoneResponse
POST   /api/milestones?projectId={id} → MilestoneRequest → MilestoneResponse
PUT    /api/milestones/{id}   → MilestoneRequest → MilestoneResponse
DELETE /api/milestones/{id}   → 204 No Content
```

### Comments (Protected)
```
GET    /api/comments/task/{taskId} → List
GET    /api/comments/{id}     → CommentResponse
POST   /api/comments           → CommentRequest → CommentResponse
DELETE /api/comments/{id}      → 204 No Content
```

### Activity Logs (Protected)
```
GET    /api/activity-logs/project/{projectId} → List
```

---

## Security Implementation

### JWT Flow

1. **Register/Login** → Backend generates JWT token
2. **Frontend** → Stores token in localStorage
3. **Axios Interceptor** → Attaches Bearer token to all requests
4. **JwtFilter** → Validates token and sets SecurityContext
5. **Spring Security** → Checks authorization for protected routes
6. **401 Response** → Interceptor clears token and redirects to /login

### RBAC Roles

- **ADMIN**: Full access to all resources
- **PROJECT_MANAGER**: Can create/edit/delete own projects and tasks
- **TEAM_MEMBER**: Can view projects they belong to, update task status, add comments

---

## Entity Relationships

### User (1) ↔ (Many) ProjectMember
- A user can be member of many projects

### User (1) ↔ (Many) Task
- A user can be assigned to many tasks

### User (1) ↔ (Many) Comment
- A user can write many comments

### User (1) ↔ (Many) ActivityLog
- A user creates many activity logs

### Project (1) ↔ (Many) ProjectMember
- A project has many members

### Project (1) ↔ (Many) Task
- A project has many tasks

### Project (1) ↔ (Many) Milestone
- A project has many milestones

### Project (1) ↔ (Many) ActivityLog
- A project has many activity logs

### Task (1) ↔ (Many) Comment
- A task has many comments

### Task (Many-to-1) Milestone
- Multiple tasks can belong to one milestone

---

## Key Features Implemented

### Backend Features
✅ User authentication with JWT
✅ Role-based access control (RBAC)
✅ Project management with members
✅ Task management with status and priority
✅ Milestones for project planning
✅ Comments on tasks
✅ Activity logging
✅ Global exception handling
✅ Bean validation on all DTOs
✅ Lombok for reduced boilerplate
✅ CORS configured for localhost:3000

### Frontend Features
✅ User authentication (login/register)
✅ Protected routes with PrivateRoute
✅ Project list and detail views
✅ Kanban board with drag-and-drop
✅ Task status filtering
✅ Responsive design with Tailwind CSS
✅ Loading states and error handling
✅ JWT token persistence
✅ Automatic token attachment via Axios interceptor
✅ 401 response handling (auto logout + redirect)

---

## Development Workflow

### Backend Development

1. **Create Entity** → Add @Entity, Lombok annotations
2. **Create Repository** → Extend JpaRepository
3. **Create DTO** → Add @Valid annotations
4. **Create Service Interface** → Define business logic contract
5. **Implement Service** → Add @Service, @Slf4j, @RequiredArgsConstructor
6. **Create Controller** → Add @RestController, call service methods
7. **Add Exception Handling** → Handle in GlobalExceptionHandler

### Frontend Development

1. **Create Service** → Axios API calls in `services/`
2. **Create Component** → Reusable UI in `components/`
3. **Create Page** → Route-level in `pages/`
4. **Add Route** → Register in `AppRouter.jsx`
5. **Style with Tailwind** → Use utility classes only
6. **Handle Loading/Error** → Show spinner, error message

---

## Testing the Application

### Backend Testing (Postman)

1. **Register User**
```
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "PROJECT_MANAGER"
}
```

2. **Login**
```
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "password123"
}
```
Response: `{ "token": "eyJhbGc...", "user": {...} }`

3. **Create Project** (with Authorization header: `Bearer {token}`)
```
POST /api/projects
{
  "title": "E-Commerce Platform",
  "description": "Build a new e-commerce platform",
  "status": "PLANNING",
  "startDate": "2024-06-01",
  "endDate": "2024-12-31"
}
```

### Frontend Testing

1. Register new account at `http://localhost:3000/register`
2. Login at `http://localhost:3000/login`
3. Create projects on dashboard
4. View kanban board at `/projects/{projectId}/board`
5. Drag tasks between columns to update status

---

## Production Deployment

### Backend
- Build: `mvn clean package`
- Run: `java -jar target/Tracker-0.0.1-SNAPSHOT.jar`
- Use environment variables for secrets
- Set `spring.jpa.hibernate.ddl-auto=validate`

### Frontend
- Build: `npm run build`
- Serve: Use a static server (nginx, Apache)
- Set API_BASE_URL to production backend URL
- Enable HTTPS

---

## Next Steps for Enhancement

1. **Add real-time updates** with WebSockets
2. **Implement notifications** for task assignments
3. **Add file attachments** to tasks
4. **Build advanced search/filtering**
5. **Add team messaging/chat**
6. **Implement time tracking**
7. **Add reporting and analytics**
8. **Implement audit logging**
9. **Add unit and integration tests**
10. **Setup CI/CD pipeline**

---

## Troubleshooting

### Backend won't start
- Check MySQL is running
- Verify database credentials
- Check port 8080 is not in use

### Frontend shows 401 errors
- Verify backend is running on :8080
- Check token is being saved to localStorage
- Verify JWT secret matches in backend

### CORS errors
- Ensure frontend URL is in SecurityConfig corsConfigurationSource()
- Check request headers are correct

---

## Support

For issues or questions, refer to the architecture specification at the top of this project.
