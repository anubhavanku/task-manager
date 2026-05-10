# 🚀 SprintFlow — Real-Time Task Management App

> A full-stack collaborative task management application built with **Angular 17**, **Spring Boot 3.5**, **WebSockets**, and **MySQL** — featuring a real-time Kanban board, role-based access control, and team collaboration tools.

![Angular](https://img.shields.io/badge/Angular-17-red?style=for-the-badge&logo=angular)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.5-green?style=for-the-badge&logo=springboot)
![MySQL](https://img.shields.io/badge/MySQL-8.0-blue?style=for-the-badge&logo=mysql)
![WebSocket](https://img.shields.io/badge/WebSocket-STOMP-6c63ff?style=for-the-badge)
![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?style=for-the-badge&logo=docker)
![JWT](https://img.shields.io/badge/JWT-Secured-black?style=for-the-badge&logo=jsonwebtokens)
![CI/CD](https://img.shields.io/badge/CI/CD-GitHub_Actions-2088FF?style=for-the-badge&logo=githubactions)

---

## 📌 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Run with Docker](#run-with-docker-recommended)
  - [Run Locally](#run-locally)
- [API Documentation](#-api-documentation)
- [WebSocket](#-websocket)
- [Project Structure](#-project-structure)
- [CI/CD Pipeline](#-cicd-pipeline)

---

## ✨ Features

### 🔐 Authentication
- JWT-based secure authentication
- Login with email **or** username
- Password encryption with BCrypt
- Profile management — update name, username, email, password
- Auto token refresh on profile update

### 📋 Kanban Board (Key Feature)
- Drag-and-drop tasks across 4 columns — **To Do, In Progress, In Review, Done**
- Tasks reorder within columns
- Visual priority indicators — color-coded bars (Low, Medium, High, Critical)
- Assignee avatar on task cards
- Due date with overdue highlighting
- Real-time updates via WebSockets

### ⚡ Real-Time WebSockets
- STOMP protocol over native WebSocket
- When any user moves a task → all users on the same project see it instantly
- Live activity feed with actor name and action
- Reconnect on disconnect with configurable delay

### 📁 Project Management
- Create, edit, delete projects (Admin only)
- Add and remove project members
- Project status — Active / Archived
- Task count and member count on project cards

### ✅ Task Management
- Full CRUD — create, edit, delete tasks
- Priority levels — Low, Medium, High, Critical
- Status — To Do, In Progress, In Review, Done
- Due dates with overdue detection
- Assign tasks to project members
- Comment on tasks
- Activity log — every change tracked automatically

### 📊 Dashboard
- Personalized greeting with avatar
- Task stats by status — To Do, In Progress, In Review, Done
- Overdue tasks and due-today alerts
- My assigned tasks list
- Task status doughnut chart (Chart.js)
- Active projects overview

### 👤 Profile
- Avatar with initials and random color
- Task completion rate progress bar
- Edit full name, username, email
- Change password with current password verification

### 🎨 UI/UX
- Dark / Light mode toggle (persisted in localStorage)
- Angular Material design system
- Responsive layout
- Confirm dialogs for all destructive actions
- Toast notifications for all actions
- Smooth drag animations with CDK placeholder

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Angular 17, TypeScript, Angular Material, Angular CDK |
| Real-time | WebSockets (STOMP protocol, native WebSocket) |
| Charts | Chart.js + ng2-charts |
| Backend | Spring Boot 3.5, Java 17 |
| Auth | Spring Security + JWT (JJWT 0.11.5) |
| ORM | Spring Data JPA + Hibernate |
| Database | MySQL 8.0 |
| API Docs | Swagger / OpenAPI (SpringDoc 2.3.0) |
| Container | Docker, Docker Compose, Nginx |
| CI/CD | GitHub Actions |
| Build Tools | Maven, npm |

---

## 🏗 Architecture
┌─────────────────────────────────────────────────┐
│                   Client Browser                 │
│              Angular 17 SPA                      │
└──────────────────────┬──────────────────────────┘
│ HTTP / WebSocket
┌──────────────────────▼──────────────────────────┐
│              Nginx (Port 80)                     │
│         Angular SPA + Reverse Proxy              │
│    /api/* → backend:8080                         │
│    /ws/*  → backend:8080 (WebSocket upgrade)     │
└──────────────────────┬──────────────────────────┘
│
┌──────────────────────▼──────────────────────────┐
│         Spring Boot Backend (Port 8080)          │
│  ┌─────────────┐  ┌──────────┐  ┌────────────┐  │
│  │ Controllers │→ │ Services │→ │Repositories│  │
│  └─────────────┘  └──────────┘  └─────┬──────┘  │
│  ┌─────────────────────────────────┐   │         │
│  │   WebSocket (STOMP Broker)      │   │         │
│  │   /topic/project/{id}           │   │         │
│  └─────────────────────────────────┘   │         │
└────────────────────────────────────────┼─────────┘
│ JPA
┌────────────────────────────────────────▼─────────┐
│                MySQL 8.0 Database                 │
│  users │ projects │ project_members │ tasks       │
│  comments │ task_activity                         │
└───────────────────────────────────────────────────┘

---

## 🚀 Getting Started

### Prerequisites

| Tool | Version |
|---|---|
| Java | 17+ |
| Maven | 3.9+ |
| Node.js | 20+ |
| MySQL | 8.0+ |
| Docker | Latest |

---

### Run with Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/anubhavanku/task-manager.git
cd task-manager

# Start all services
docker-compose up --build
```

**Services will be available at:**

| Service | URL |
|---|---|
| Frontend | http://localhost |
| Backend API | http://localhost:8080 |
| Swagger Docs | http://localhost:8080/swagger-ui.html |

---

### Run Locally

#### 1. Database Setup

```sql
CREATE DATABASE task_manager;
```

#### 2. Backend

```bash
cd backend
# Update src/main/resources/application.properties with your MySQL credentials
mvn clean install
mvn spring-boot:run
# Runs on http://localhost:8080
# Tables created automatically by Hibernate (ddl-auto=update)
```

#### 3. Frontend

```bash
cd frontend
npm install --legacy-peer-deps
ng serve
# Runs on http://localhost:4200
```

---

## 📖 API Documentation

Live Swagger documentation: `http://localhost:8080/swagger-ui.html`

### Key Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | ❌ | Register new user |
| POST | `/api/auth/login` | ❌ | Login, returns JWT |
| PUT | `/api/auth/profile` | ✅ | Update profile |
| GET | `/api/projects` | ✅ | Get my projects |
| POST | `/api/projects` | ✅ ADMIN | Create project |
| GET | `/api/projects/{id}` | ✅ | Project detail |
| POST | `/api/projects/{id}/members` | ✅ ADMIN | Add member |
| DELETE | `/api/projects/{id}/members/{userId}` | ✅ ADMIN | Remove member |
| GET | `/api/projects/{id}/tasks` | ✅ | Get project tasks |
| POST | `/api/projects/{id}/tasks` | ✅ | Create task |
| PUT | `/api/tasks/{id}` | ✅ | Update task |
| PATCH | `/api/tasks/{id}/move` | ✅ | Move task (Kanban) |
| DELETE | `/api/tasks/{id}` | ✅ | Delete task |
| GET | `/api/tasks/{id}/activity` | ✅ | Task activity log |
| GET | `/api/tasks/my-tasks` | ✅ | My assigned tasks |
| POST | `/api/tasks/{id}/comments` | ✅ | Add comment |
| DELETE | `/api/comments/{id}` | ✅ | Delete own comment |

---

## ⚡ WebSocket

| Action | Destination | Description |
|---|---|---|
| CONNECT | `/ws/websocket` | Native WebSocket handshake |
| SUBSCRIBE | `/topic/project/{id}` | Listen for project updates |
| SEND | `/app/task.move` | Broadcast task move |

### WebSocket Message Types
- `TASK_CREATED` — new task added to project
- `TASK_MOVED` — task dragged to different column
- `TASK_UPDATED` — task details edited
- `TASK_DELETED` — task removed from board

---

## 📁 Project Structure
task-manager/
├── .github/
│   └── workflows/
│       └── ci.yml                    # GitHub Actions pipeline
├── backend/
│   ├── src/main/java/com/taskmanager/
│   │   ├── config/                   # JWT, Security, WebSocket, CORS
│   │   │   ├── JwtUtil.java
│   │   │   ├── JwtAuthFilter.java
│   │   │   ├── SecurityConfig.java
│   │   │   └── WebSocketConfig.java
│   │   ├── controller/               # REST + WebSocket controllers
│   │   ├── dto/                      # Data Transfer Objects
│   │   ├── model/                    # JPA entities
│   │   │   ├── User.java
│   │   │   ├── Project.java
│   │   │   ├── Task.java
│   │   │   ├── Comment.java
│   │   │   └── TaskActivity.java
│   │   ├── repository/               # Spring Data JPA repositories
│   │   └── service/                  # Business logic + WebSocket broadcasting
│   ├── Dockerfile
│   └── pom.xml
├── frontend/
│   ├── src/app/
│   │   ├── components/
│   │   │   ├── kanban-board/         # Drag & drop board (KEY FEATURE)
│   │   │   ├── task-form/            # Create/edit task dialog
│   │   │   ├── task-detail/          # Task detail with comments & activity
│   │   │   ├── dashboard/            # Stats + charts
│   │   │   ├── project-list/         # Project cards
│   │   │   ├── project-detail/       # Member management
│   │   │   ├── profile/              # User profile
│   │   │   ├── navbar/               # Navigation + theme toggle
│   │   │   └── confirm-dialog/       # Reusable confirm modal
│   │   ├── guards/                   # Auth + Role guards
│   │   ├── interceptors/             # JWT auth interceptor
│   │   ├── models/                   # TypeScript interfaces
│   │   └── services/                 # API + WebSocket services
│   ├── src/environments/             # Dev + prod environment configs
│   ├── Dockerfile
│   └── nginx.conf
├── docker-compose.yml
└── README.md

---

## 🗄 Database Schema
users
├── id, username (unique), email (unique)
├── password (BCrypt), full_name, role (ADMIN/MEMBER)
├── avatar_color, created_at
projects
├── id, name, description
├── status (ACTIVE/ARCHIVED)
├── owner_id (FK → users), created_at
project_members
├── project_id (FK), user_id (FK)
├── role (OWNER/ADMIN/MEMBER), joined_at
tasks
├── id, title, description
├── status (TODO/IN_PROGRESS/IN_REVIEW/DONE)
├── priority (LOW/MEDIUM/HIGH/CRITICAL)
├── due_date, position
├── project_id (FK), assignee_id (FK), created_by (FK)
├── created_at, updated_at
comments
├── id, content, task_id (FK)
├── author_id (FK), created_at
task_activity
├── id, action, old_value, new_value
├── task_id (FK), user_id (FK), created_at

---

## ⚙️ CI/CD Pipeline

Every push to `main` triggers the GitHub Actions pipeline:
Push to main
│
├── Backend Job
│   ├── Setup Java 17 (Temurin)
│   ├── Build with Maven (skip tests)
│   └── Upload JAR artifact
│
├── Frontend Job
│   ├── Setup Node 20
│   ├── npm install --legacy-peer-deps
│   ├── Angular production build
│   └── Upload dist artifact
│
└── Docker Job (after both pass)
├── Build backend Docker image
└── Build frontend Docker image

---

## 🔒 Security

- All API endpoints protected with JWT authentication
- Passwords hashed with BCrypt
- CORS configured for allowed origins only
- Role-based endpoint protection (Admin vs Member)
- Input validation on both frontend and backend
- Global exception handling with proper HTTP status codes
- WebSocket endpoint authentication via JWT

---

## 👨‍💻 Author

**Anubhav Anku**
- GitHub: [@anubhavanku](https://github.com/anubhavanku)
- LinkedIn: [linkedin.com/in/anubhavanku24](https://linkedin.com/in/anubhavanku24)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).