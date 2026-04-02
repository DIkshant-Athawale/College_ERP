# College ERP — Backend Tech Stack

> **Last Updated:** February 2026  
> **Repository:** `DIkshant-Athawale/College_ERP`  
> **Module:** `backend/`

---

## 1. Runtime & Language

| Item | Detail |
|---|---|
| **Language** | JavaScript (ES2020+) |
| **Module System** | ES Modules (`"type": "module"` in `package.json`) |
| **Runtime** | Node.js |
| **Entry Point** | [`index.js`](file:///c:/Desktop/gitclone/College_ERP/backend/index.js) |

---

## 2. Core Framework

| Package | Version | Purpose |
|---|---|---|
| **Express** | `^5.2.1` | HTTP server & REST API framework (Express 5 — latest major release) |
| **Nodemon** | `^3.1.11` *(dev)* | Auto-restart server on file changes during development |

**Express 5 notable behavior used:** The codebase includes an explicit safety check for `req.headers` in the auth middleware, accounting for Express 5's stricter request object handling.

---

## 3. Database Layer

| Package | Version | Purpose |
|---|---|---|
| **mysql2** | `^3.16.1` | MySQL client with **Promise/async-await** support |

### Connection Config ([`config/connect_db.js`](file:///c:/Desktop/gitclone/College_ERP/backend/config/connect_db.js))

- **Driver:** `mysql2/promise` (async connection pool)
- **Host:** `localhost`
- **Database:** `clg_db`
- **Connection Pooling:** Enabled (`connectionLimit: 10`, `waitForConnections: true`)
- **Transactions:** Used extensively via `pool.getConnection()` + `conn.beginTransaction()` / `conn.commit()` / `conn.rollback()` pattern

### Inferred Database Schema

Based on the SQL queries throughout the codebase, the database contains the following tables:

| Table | Description | Key Columns |
|---|---|---|
| `students` | Student profiles | `student_id`, `first_name`, `last_name`, `email`, `password`, `year`, `semester`, `department_id`, `academic_year`, `status`, `DOB`, phones |
| `teachers` | Faculty profiles | `teacher_id`, `first_name`, `last_name`, `email`, `password`, `role`, `department_id`, `designation`, phones |
| `courses` | Academic courses | `course_id`, `course_code`, `course_name`, `department_id`, `year`, `semester`, `teacher_id` |
| `department` | Departments | `department_id`, `department_code`, `department_name` |
| `enrollments` | Student-course mappings | `student_id`, `course_id`, `academic_year` |
| `attendance_sessions` | Per-course sessions | `session_id`, `course_id`, `session_date`, `created_by`, `academic_year` |
| `attendance_records` | Per-student attendance | `record_id`, `session_id`, `student_id`, `status` (`present`/`absent`) |
| `timetable` | Weekly class schedule | `timetable_id`, `department_id`, `semester`, `day`, `slot_id`, `course_id` |
| `time_slots` | Reusable time windows | `slot_id`, `start_time`, `end_time` |
| `student_fees` | Fee tracking | `student_id`, `academic_year`, `total_fee`, `paid_amount` |
| `refresh_tokens` | JWT session store | `user_id`, `user_type`, `role`, `token`, `expires_at` |

---

## 4. Authentication & Authorization

| Package | Version | Purpose |
|---|---|---|
| **jsonwebtoken** | `^9.0.3` | JWT token generation & verification |
| **bcrypt** | `^6.0.0` | Password hashing (salt rounds = 10) |
| **cookie-parser** | `^1.4.7` | Parse HTTP cookies (refresh tokens) |

### Auth Architecture

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────┐
│  Client      │───▶│  POST /login │───▶│  JWT Access   │───▶│  Route   │
│  (Frontend)  │    │              │    │  + Refresh    │    │  Handler │
│              │◀───│              │◀───│  Token Pair   │    │          │
└─────────────┘     └──────────────┘     └──────────────┘     └──────────┘
                           │                     │
                    ┌──────▼──────┐        ┌──────▼──────┐
                    │  Teachers   │        │  Students   │
                    │  Table      │        │  Table      │
                    └─────────────┘        └─────────────┘
```

#### Dual-Token Strategy
| Token | Expiry | Storage | Secret |
|---|---|---|---|
| **Access Token** | 30 minutes | Client-side (header `Authorization: Bearer <token>`) | `JWT_SECRET` |
| **Refresh Token** | 7 days | HTTP-only cookie (`refreshToken`) + `refresh_tokens` DB table | `REFRESH_SECRET` |

#### Token Payload
```json
{
  "userId": "<student_id or teacher_id>",
  "role": "student | faculty | admin",
  "userType": "student | faculty"
}
```

#### Login Flow
1. Check email against `teachers` table first, then `students`
2. Compare password with bcrypt hash
3. Delete old refresh tokens for the user
4. Generate access + refresh token pair
5. Store refresh token in DB + HTTP-only cookie
6. Return access token + role + userType in JSON

### Middleware Stack ([`middleware/`](file:///c:/Desktop/gitclone/College_ERP/backend/middleware/))

| Middleware | File | Purpose |
|---|---|---|
| **authenticate** | [`auth.js`](file:///c:/Desktop/gitclone/College_ERP/backend/middleware/auth.js) | Verifies JWT from `Authorization: Bearer <token>` header, attaches `req.user` |
| **authorize** | [`authorize.js`](file:///c:/Desktop/gitclone/College_ERP/backend/middleware/authorize.js) | Role-based access control — accepts allowed roles via spread operator (`...allowedroles`) |

---

## 5. API & Networking

| Package | Version | Purpose |
|---|---|---|
| **cors** | `^2.8.6` | Cross-Origin Resource Sharing |
| **dotenv** | `^17.2.4` | Environment variable loading from `.env` |

### CORS Configuration
- **Origin:** `true` (reflects request origin — allows all origins)
- **Credentials:** `true` (allows cookies to be sent cross-origin)

### Environment Variables
| Variable | Purpose |
|---|---|
| `JWT_SECRET` | Signing key for access tokens |
| `REFRESH_SECRET` | Signing key for refresh tokens |
| `PORT` | Server port (default: `3000`) |

---

## 6. API Routes & Endpoints

### Route Mounting ([`index.js`](file:///c:/Desktop/gitclone/College_ERP/backend/index.js))

| Prefix | Router | File | Auth |
|---|---|---|---|
| `/login` | `loginRouter` | [`routes/auth.js`](file:///c:/Desktop/gitclone/College_ERP/backend/routes/auth.js) | Public |
| `/student` | `studentRouter` | [`routes/student.js`](file:///c:/Desktop/gitclone/College_ERP/backend/routes/student.js) | `student` role |
| `/admin` | `adminRouter` | [`routes/admin.js`](file:///c:/Desktop/gitclone/College_ERP/backend/routes/admin.js) | `admin` role |
| `/teacher` | `teacherRouter` | [`routes/teacher.js`](file:///c:/Desktop/gitclone/College_ERP/backend/routes/teacher.js) | `faculty` role |

---

### Auth Routes — [`routes/auth.js`](file:///c:/Desktop/gitclone/College_ERP/backend/routes/auth.js) *(240 lines)*

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/login/` | Login (email + password) → returns access + refresh tokens |
| `POST` | `/login/refresh` | Refresh access token using cookie-based refresh token |
| `POST` | `/login/logout` | Logout — clears refresh token from DB + cookie |

---

### Student Routes — [`routes/student.js`](file:///c:/Desktop/gitclone/College_ERP/backend/routes/student.js) *(133 lines)*

| Method | Endpoint | Role | Description |
|---|---|---|---|
| `GET` | `/student/dashboard` | `student` | Full dashboard: profile, subjects, attendance (per-subject + overall), fees, timetable |

---

### Teacher Routes — [`routes/teacher.js`](file:///c:/Desktop/gitclone/College_ERP/backend/routes/teacher.js) *(561 lines)*

| Method | Endpoint | Role | Description |
|---|---|---|---|
| `GET` | `/teacher/dashboard` | `faculty` | Profile, assigned courses, today's schedule, stats |
| `GET` | `/teacher/courses/attendance-summary` | `faculty`, `admin` | Total sessions per course |
| `GET` | `/teacher/courses/:course_id/attendance` | `faculty`, `admin` | Student-wise attendance for a course |
| `GET` | `/teacher/attendance/my-courses` | `faculty` | List teacher's courses |
| `POST` | `/teacher/attendance/session` | `faculty`, `admin` | Create an attendance session |
| `GET` | `/teacher/attendance/session/:session_id/students` | `faculty`, `admin` | Get eligible students for a session |
| `POST` | `/teacher/attendance/submit` | `faculty`, `admin` | Submit attendance records (batch) |
| `GET` | `/teacher/entire_timetable` | `faculty` | Full timetable for teacher's semesters |

---

### Admin Routes — [`routes/admin.js`](file:///c:/Desktop/gitclone/College_ERP/backend/routes/admin.js) *(1836 lines)*

#### Dashboard Stats
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/admin/faculty/total` | Total faculty count |
| `GET` | `/admin/students/total/enrolled` | Total enrolled students (optional `academic_year` filter) |
| `GET` | `/admin/courses/total` | Total courses count |

#### Department Management
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/admin/departments` | List all departments |
| `POST` | `/admin/create_department` | Create department(s) — bulk support |
| `PATCH` | `/admin/departments/edit` | Edit department(s) — bulk support |

#### Teacher Management
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/admin/teachers` | List teachers (optional `department_id` filter) |
| `GET` | `/admin/filter_teachers` | Filtered teacher list |
| `POST` | `/admin/create_teacher` | Create teacher(s) — bulk support, bcrypt hashing |
| `PATCH` | `/admin/teachers/edit` | Edit teacher(s) — field-level updates |
| `DELETE` | `/admin/teachers/:id` | Delete teacher (blocked if assigned to courses) |

#### Student Management
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/admin/filter_students` | Filtered student list (department, year, semester, academic_year) |
| `POST` | `/admin/create_student` | Create student(s) — bulk, auto-enrolls in courses, bcrypt |
| `PATCH` | `/admin/students/edit` | Edit student(s) — restricted fields |
| `DELETE` | `/admin/students/:id` | Delete student + related records |
| `PUT` | `/admin/students/:id/mark_dc` | Mark student as Discontinued |
| `GET` | `/admin/students/dc` | List DC students |
| `PUT` | `/admin/students/:id/enroll` | Re-enroll a DC student |
| `POST` | `/admin/promote_students` | Promote students by semester — handles graduation (sem 8), new enrollments, fee records |

#### Course Management
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/admin/courses` | List courses (optional `department_id`, `semester` filter) |
| `GET` | `/admin/filter_courses` | Filtered course list with teacher name |
| `POST` | `/admin/create_course` | Create course(s) — bulk support |
| `PATCH` | `/admin/courses/edit` | Edit course(s) — field-level updates |
| `DELETE` | `/admin/courses/:id` | Delete course |

#### Timetable Management
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/admin/time_slots` | List all time slots |
| `POST` | `/admin/time_slots` | Create time slot(s) — bulk support |
| `PATCH` | `/admin/time_slots/:id` | Update a time slot |
| `DELETE` | `/admin/time_slots/:id` | Delete a time slot (blocked if in use) |
| `GET` | `/admin/timetable` | Get timetable by department + semester |
| `POST` | `/admin/timetable` | Create/update timetable entry |
| `DELETE` | `/admin/timetable/:id` | Delete timetable entry |

---

## 7. Project Structure

```
backend/
├── .env                         # Environment variables (JWT secrets)
├── package.json                 # Dependencies & scripts
├── index.js                     # Server entry point (47 lines)
├── config/
│   └── connect_db.js            # MySQL2 connection pool (14 lines)
├── middleware/
│   ├── auth.js                  # JWT authentication middleware (35 lines)
│   └── authorize.js             # Role-based authorization middleware (15 lines)
└── routes/
    ├── auth.js                  # Login, refresh, logout (240 lines)
    ├── student.js               # Student dashboard (133 lines)
    ├── teacher.js               # Teacher dashboard & attendance (561 lines)
    └── admin.js                 # Full CRUD admin panel (1836 lines)
```

**Total backend source:** ~2,880 lines of JavaScript across 8 files.

---

## 8. Architecture Patterns

| Pattern | Implementation |
|---|---|
| **Connection Pooling** | `mysql2/promise` pool with 10-connection limit |
| **Database Transactions** | `getConnection()` → `beginTransaction()` → `commit()`/`rollback()` → `release()` for multi-step operations |
| **Bulk Operations** | All create/edit endpoints accept both single objects and arrays via `Array.isArray()` normalization |
| **Field-Level Updates** | PATCH endpoints use dynamic SQL with whitelisted `allowedFields` arrays to prevent mass assignment |
| **Cascade Deletes** | Student deletion removes related enrollment and attendance records within a transaction |
| **FK Constraint Handling** | Delete endpoints catch `ER_NO_REFERENCED_ROW_2` and `ER_ROW_IS_REFERENCED_2` errors for user-friendly messages |
| **Duplicate Handling** | All create endpoints catch `ER_DUP_ENTRY` with HTTP 409 responses |
| **Academic Year Scoping** | Attendance and enrollment queries filter by `academic_year` to separate batch data |

---

## 9. Dependencies Summary

### Production Dependencies

| Package | Version | Category |
|---|---|---|
| `express` | `^5.2.1` | Web Framework |
| `mysql2` | `^3.16.1` | Database |
| `jsonwebtoken` | `^9.0.3` | Authentication |
| `bcrypt` | `^6.0.0` | Password Hashing |
| `cookie-parser` | `^1.4.7` | Cookie Parsing |
| `cors` | `^2.8.6` | CORS Middleware |
| `dotenv` | `^17.2.4` | Env Config |

> ⚠️ **Note:** `package.json` also lists `bcrpyt` (v2.0.0), which appears to be a typo/unused duplicate of `bcrypt`.

### Dev Dependencies

| Package | Version | Category |
|---|---|---|
| `nodemon` | `^3.1.11` | Development Server |

---

## 10. Scripts

| Script | Command | Description |
|---|---|---|
| `start` | `nodemon index.js` | Start dev server with auto-reload |

---

## 11. Known Observations & Notes

- **No test framework** is installed or configured
- **No input validation library** (e.g., Joi, Zod) — validation is done manually in route handlers
- **No logging library** (e.g., Winston, Pino) — uses `console.error()` / `console.log()`
- **No rate limiting** configured on auth endpoints
- **DB credentials are hardcoded** in `connect_db.js` rather than using env variables
- **CORS allows all origins** (`origin: true`) — should be restricted in production
- **Refresh token cookie** has `secure: false` — noted with a comment to set `true` for HTTPS
- **Express 5** is in use, which is the latest major version with improved async error handling
