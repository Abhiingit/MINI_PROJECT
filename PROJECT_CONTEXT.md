# Attendance SaaS Project Context

## Overview
This project is a full-stack MERN (MongoDB, Express, React, Node.js) application designed as a simple and scalable Software-as-a-Service (SaaS) attendance management system. It supports role-based access, having core functionalities separated for administrators and students/employees.

## Project Structure
The project is built using a monorepo-style structure, split into two main directories in the root:
- `/attendance-frontend` - React User Interface
- `/attendance-saas` - Express Backend API

---

## 1. Backend (`/attendance-saas`)
**Core Technologies:** Node.js, Express.js, MongoDB (Mongoose), JSON Web Tokens (JWT), bcryptjs.

### Directories and Organization
- `/Models` - Mongoose database schemas.
  - `User.js` - Stores user credentials and role (`admin` or `student`).
  - `Attendance.js` - Tracks daily sign-in/sign-out times.
  - `Leave.js` - Manages leave requests and their statuses.
  - `Company.js` - Potential multi-tenant setup modeling.
- `/controllers` - Houses the business logic.
  - `authController.js` - Login and authentication workflows.
  - `attendanceController.js` - Core check-in/check-out functionality.
  - `leaveController.js` - Submitting and fetching leave requests.
  - `adminController.js` - Admin privilege actions (approving leaves, viewing broad attendance metrics).
- `/routes` - Express router mappings routing to the controllers.
  - `/api/auth`, `/api/attendance`, `/api/leave`, `/api/admin`
- `/middleware` - Contains `requireAuth` logic for verifying JWTs and validating roles (admin/user).
- `/config` - Database connection settings (`db.js`).

### Entry Point
- `server.js` initializes the Express application, sets up CORS and JSON payloads, and attaches all routes.

### Utility Scripts
In the root of the backend are numerous administration scripts helpful for diagnostics and development:
- `seed.js`, `add_user.js`, `reset_admin.js`, `reset_users.js`, `diagnose.js`, `check_passwords.js`.

---

## 2. Frontend (`/attendance-frontend`)
**Core Technologies:** React 19, React Router DOM v7, Vite, pre-built custom CSS schemas (`index.css`), Axios, `lucide-react` (icons), `react-hot-toast` (notifications).

### Directories and Organization
- `/src/pages` - Main views.
  - `Login.jsx` - The auth portal handling credential validation and storing JWTs. Routes users to different dashboards gracefully based on role.
  - `Dashboard.jsx` - The standard user view (shows active attendance session, leave application forms, history).
  - `AdminDashboard.jsx` - The master view for admins managing all accounts securely, overriding records, or approving leaves.
- `/src/components` - Reusable UI widgets.
- `/src/context` - React Context APIs designed for global state distribution (e.g. `AuthContext`).
- `/src/api.js` - Likely hosts standard Axios interceptor utilities to simplify request handling.
- `App.jsx` handles global routing declarations and provider wrapping.

### Start Scripts
- standard Vite dev lifecycle (`npm run dev`).

## Common Developer Workflows
1. **Adding a route:** Define logic in the respective backend controller, expose through the router, register in `server.js`. Access via a newly constructed frontend Axios query.
2. **Environment handling:** Make sure `.env` contains `PORT`, database strings, and standard `JWT_SECRET` when resetting environments locally.
3. **Roles context:** All authorization starts at `authController.js` logic and manifests functionally across frontend routing restrictions. Ensure any edits to UI visibility carefully respect the backend constraints.

## Critical Considerations for LLM Operations
- Always map database dependencies through Mongoose inside `attendance-saas/Models/`.
- For UI additions, append to `attendance-frontend/src/pages/` or `components/` employing functional React paradigms and `Lucide React` imports.
- Make all backend endpoint adjustments visible in `server.js` route declarations to avoid routing misconfiguration.
- Avoid modifying dependencies in `package.json` arrays implicitly unless implementing new libraries directly supported by Vite or Express.
