# Backend Summary — Quick Reference Guide

> **Purpose**: Read the relevant section before making changes. Jump to the section you need instead of reading the entire codebase.

---

## Table of Contents

1. [Tech Stack & Config](#1-tech-stack--config)
2. [Entry Point — index.js](#2-entry-point--indexjs)
3. [Database — config/connect_db.js](#3-database--configconnect_dbjs)
4. [Middleware](#4-middleware)
5. [Routes — Auth (routes/auth.js)](#5-routes--auth)
6. [Routes — Student (routes/student.js)](#6-routes--student)
7. [Routes — Admin (routes/admin.js)](#7-routes--admin)
8. [Routes — Teacher (routes/teacher.js)](#8-routes--teacher)
9. [Database Tables Referenced](#9-database-tables-referenced)
10. [Known Gaps / Notes](#10-known-gaps--notes)

---

## 1. Tech Stack & Config

| Tool | Detail |
|------|--------|
| Runtime | Node.js (ES Modules — `"type": "module"`) |
| Framework | Express 5 |
| Database | MySQL via `mysql2/promise` (connection pool) |
| Auth | JWT (access + refresh tokens), bcrypt for passwords |
| WebSockets | `socket.io` (for real-time updates) |
| Dev | nodemon (`npm run start`) |
| Port | `process.env.PORT` or `3000` |

**Dependencies**: express, mysql2, jsonwebtoken, bcrypt, cookie-parser, cors, dotenv, socket.io

### `.env` (2 lines)

```
JWT_SECRET=accesskey
REFRESH_SECRET=refreshkey
```

### `package.json` — scripts

- `start` → `nodemon index.js`

---

## 2. Entry Point — index.js

**File**: `backend/index.js` (83 lines)

- Loads `.env`, creates Express app + HTTP Server + `Socket.io` instance
- `Socket.io` configured with CORS for frontend origin
- Emits `db_change` event automatically to connected clients on successful `POST`, `PUT`, `PATCH`, `DELETE` HTTP responses
- Middleware: `express.json()`, `cookieParser()`, `cors({ origin: true, credentials: true })`
- **Route mounting**:

| Prefix | Router File | Description |
|--------|-------------|-------------|
| `/login` | `routes/auth.js` | Login, logout, refresh, profile |
| `/student` | `routes/student.js` | Student dashboard & notices |
| `/admin` | `routes/admin.js` | Admin CRUD for all entities |
| `/teacher` | `routes/teacher.js` | Faculty dashboard, attendance, assignments, tests |

- Root `GET /` returns `"Server is ready"`

---

## 3. Database — config/connect_db.js

**File**: `backend/config/connect_db.js` (14 lines)

- Creates `mysql2/promise` connection pool
- **Config**: host=`localhost`, user=`root`, password=`1234`, database=`clg_db`
- Pool: `connectionLimit=10`, `waitForConnections=true`
- **Export**: `pool` (default)

---

## 4. Middleware

### `middleware/auth.js` (35 lines)  — `authenticate`

- Extracts `Bearer <token>` from `Authorization` header
- Verifies with `jwt.verify(token, JWT_SECRET)`
- Sets `req.user = decoded` (contains `userId`, `role`, `userType`)
- Returns 401 if missing/invalid

### `middleware/authorize.js` (15 lines) — `authorize(...allowedRoles)`

- Checks `req.user.role` against allowed roles
- Returns 403 `"Access denied"` if not authorized
- **Usage**: `authorize("admin")`, `authorize("faculty", "admin")`, etc.

---

## 5. Routes — Auth

**File**: `backend/routes/auth.js` (272 lines)  
**Prefix**: `/login`

### `POST /login` (L12–L162) — Login

- Accepts `{ email, password }`
- First checks `teachers` table, then `students` table
- Compares password with bcrypt
- Generates:
  - **Access token** (JWT, 30min): `{ userId, role, userType }`
  - **Refresh token** (JWT, 7d): `{ userId, userType }`
- Stores refresh token in DB (`refresh_tokens` table)
- Sends refresh token as **httpOnly cookie** (`sameSite: lax`, `secure: false`)
- Returns `{ accessToken, role, userType }`
- Teacher `userType = "faculty"`, Student `userType = "student"`

### `POST /login/refresh` (L168–L213) — Silent Token Refresh

- Reads `refreshToken` from cookie
- Verifies with `REFRESH_SECRET`
- Checks against `refresh_tokens` table (valid + not expired)
- Returns new `{ accessToken }` (30min)

### `POST /login/logout` (L216–L231) — Logout

- Deletes refresh token from DB
- Clears `refreshToken` cookie
- Returns `{ message: "Logged out successfully" }`

### `GET /login/me` (L237–L270) — Get Current User Profile

- **Middleware**: `authenticate`
- If `userType === "student"` → queries `students` table
- Else → queries `teachers` table
- Returns `{ user: { id, first_name, last_name, email, role, ... } }`

---

## 6. Routes — Student

**File**: `backend/routes/student.js` (242 lines)  
**Prefix**: `/student`  
**All routes**: `authenticate` + `authorize("student")`

### `GET /student/dashboard` (L10–L192) — Student Dashboard

- Uses `req.user.userId` (student_id from JWT)
- **Queries** (all in one response):
  1. **Profile** → `students` table (student_id, name, email, year, semester, department_id, academic_year)
  2. **Subjects** → `enrollments` JOIN `courses`
  3. **Attendance by subject** → `enrollments` + `attendance_sessions` + `attendance_records` (course_name, total_classes, present_classes)
  4. **Fee record** → `student_fees` (total_fee, paid_amount, remaining_fee)
  5. **Overall attendance** → `attendance_records` (total, present, percentage)
  6. **Timetable** → `timetable` + `time_slots` + `courses` + `teachers` (filtered by dept + semester, ordered by day + time)
  7. **Assignments** → `enrollments` + `assignments` + `assignment_submissions` (with submitted status)
  8. **Tests** → `enrollments` + `unit_tests` + `test_scores` (with marks_obtained, is_absent)
  9. **Notices** → `notices` + `teachers` (last 7 days, global + department-specific, limit 10)
- **Response**: `{ profile, subjects, attendance_by_subject, overall_attendance, feeRecord, timetablerows, notices, assignments, tests }`

### `GET /student/notices/recent` (L194–L240) — Recent Notices

- Gets student's `department_id`, then fetches notices (admin broadcasts + faculty notices for that dept)
- Returns `{ notices: [...] }`

---

## 7. Routes — Admin

**File**: `backend/routes/admin.js` (1932 lines)  
**Prefix**: `/admin`  
**All routes**: `authenticate` + `authorize("admin")` unless noted

### Notices (L9–L69)

| Method | Endpoint | Lines | Description |
|--------|----------|-------|-------------|
| `POST` | `/admin/notices` | L9–L45 | Create notice (`title`, `message`, `department_id`, `year`, `target_audience`). Sets `posted_by='admin'`. Supports targeted audiences (`students`, `teachers`) or broadcast (`all`). |
| `GET` | `/admin/notices/recent` | L47–L69 | Get all notices from last 7 days (admin sees all). Includes targeting fields like `year`, `target_audience`. |

### Statistics (L70–L158)

| Method | Endpoint | Lines | Description |
|--------|----------|-------|-------------|
| `GET` | `/admin/departments/total` | L72–L96 | Count from `department` table |
| `GET` | `/admin/teachers/total` | L98–L112 | Count from `teachers` WHERE `role != 'admin'` → returns `{ total_faculty }` |
| `GET` | `/admin/students/total/enrolled` | L114–L143 | Count from `students` WHERE `status = 'active'` → returns `{ total_students }` |
| `GET` | `/admin/courses/total` | L146–L158 | Count from `courses` |

### Essential Links (L1947–L1983)

| Method | Endpoint | Lines | Description |
|--------|----------|-------|-------------|
| `GET` | `/admin/essential_links` | L1947–L1957 | Get all essential links |
| `POST` | `/admin/essential_links` | L1959–L1976 | Create a new essential link (`title`, `url`) |
| `DELETE` | `/admin/essential_links/:id` | L1978–L1983 | Delete an essential link |

### Departments (L159–L1601)

| Method | Endpoint | Lines | Description |
|--------|----------|-------|-------------|
| `GET` | `/admin/departments` | L160–L186 | Get all departments (id, code, name), ordered by name |
| `POST` | `/admin/create_department` | L1458–L1525 | Create dept(s). Accepts single or array. Transaction. Validates code+name. |
| `PATCH` | `/admin/departments/edit` | L1527–L1601 | Bulk edit. Body: `{ departments: [{ department_id, updates }] }`. Allowed fields: `department_code`, `department_name`. |

### Teachers (L187–L1161)

| Method | Endpoint | Lines | Description |
|--------|----------|-------|-------------|
| `GET` | `/admin/teachers` | L187–L221 | Get teachers (id, name, designation). Optional filter: `?department_id=`. |
| `GET` | `/admin/filter_teachers` | L902–L945 | Full teacher details (id, name, email, role, phones, dept, designation). Optional filter: `?department_id=`. |
| `POST` | `/admin/create_teacher` | L1066–L1161 | Create teacher(s). Accepts single/array. Hashes password. Transaction. |
| `PATCH` | `/admin/teachers/edit` | L947–L1020 | Bulk edit. Body: `{ teachers: [{ teacher_id, updates }] }`. Allowed fields: first_name, last_name, email, primary_phone, alternate_phone, designation, department_id. |
| `DELETE` | `/admin/teachers/:id` | L1022–L1064 | Delete single teacher. Transaction. Checks FK constraints. |

### Students (L574–L897)

| Method | Endpoint | Lines | Description |
|--------|----------|-------|-------------|
| `GET` | `/admin/filter_students` | L574–L635 | Get students with full details. Optional filters: `?department_id=&year=&semester=&academic_year=`. |
| `POST` | `/admin/create_student` | L744–L897 | Create student(s). Hashes password. Validates semester for year. Auto-enrolls in courses for dept+semester. Creates fee record. Transaction. |
| `PATCH` | `/admin/students/edit` | L637–L713 | Bulk edit. Body: `{ students: [{ student_id, updates }] }`. Allowed fields: first_name, middle_name, last_name, DOB, email, primary_phone, alternate_phone. **NOT** year/semester/academic_year. |
| `DELETE` | `/admin/students/:id` | L715–L742 | Delete student + related records. Transaction. |

### Student Status Management (L1607–L1923)

| Method | Endpoint | Lines | Description |
|--------|----------|-------|-------------|
| `POST` | `/admin/promote_students` | L1608–L1734 | Bulk promote by dept+semester. Body: `{ department_id, current_semester, new_academic_year }`. If sem=8 → graduates. Else → increments semester+year, creates new enrollments + fee record (₹85,000). Transaction. |
| `PUT` | `/admin/students/:id/mark_dc` | L1739–L1799 | Mark student as detained/DC. Body: `{ academic_year }`. Sets `status='dc'`, removes enrollments for that year. |
| `GET` | `/admin/students/dc` | L1801–L1854 | Get DC students. Optional filters: `?department_id=&semester=`. |
| `PUT` | `/admin/students/:id/enroll` | L1856–L1923 | Re-enroll a DC student. Body: `{ academic_year }`. Sets `status='active'`, auto-enrolls in courses, creates fee record. |

### Courses (L222–L1451)

| Method | Endpoint | Lines | Description |
|--------|----------|-------|-------------|
| `GET` | `/admin/courses` | L222–L260 | Get courses (id, code, name, semester). Optional filter: `?department_id=&semester=`. Auth: admin OR faculty. |
| `GET` | `/admin/filter_courses` | L1167–L1224 | Full course details with teacher name + dept name. Filters: `?department_id=&year=&semester=`. |
| `POST` | `/admin/create_course` | L1339–L1451 | Create course(s). Validates fields, normalizes course_code to uppercase. Transaction. |
| `PATCH` | `/admin/courses/edit` | L1226–L1301 | Bulk edit. Body: `{ courses: [{ course_id, updates }] }`. Allowed: course_code, course_name, department_id, year, semester, teacher_id. |
| `DELETE` | `/admin/courses/:id` | L1302–L1338 | Delete course. Transaction. Checks FK constraints. |

### Time Slots (L262–L441)

| Method | Endpoint | Lines | Description |
|--------|----------|-------|-------------|
| `GET` | `/admin/time_slots` | L262–L295 | Get all time slots ordered by `start_time` |
| `POST` | `/admin/time_slots` | L297–L362 | Create time slot(s). Body: `{ start_time, end_time }` or array. Transaction. |
| `PATCH` | `/admin/time_slots/:id` | L364–L406 | Update a time slot |
| `DELETE` | `/admin/time_slots/:id` | L408–L441 | Delete a time slot (checks timetable FK) |

### Timetable (L443–L572)

| Method | Endpoint | Lines | Description |
|--------|----------|-------|-------------|
| `GET` | `/admin/timetable` | L443–L483 | Get timetable grid. **Required**: `?department_id=&semester=`. Returns slots with day, time, course info. |
| `POST` | `/admin/timetable` | L498–L533 | Create timetable entry. Body: `{ department_id, semester, day, slot_id, course_id }`. |
| `PUT` | `/admin/timetable/:id` | L535–L572 | Update timetable entry. Body: `{ day, slot_id, course_id }`. |
| `DELETE` | `/admin/timetable/:id` | L485–L497 | Delete timetable entry. |

---

## 8. Routes — Teacher

**File**: `backend/routes/teacher.js` (1305 lines)  
**Prefix**: `/teacher`  
**All routes**: `authenticate` + `authorize("faculty")` or `authorize("faculty", "admin")`

### Notices (L12–L104)

| Method | Endpoint | Lines | Auth | Description |
|--------|----------|-------|------|-------------|
| `POST` | `/teacher/notices` | L12–L56 | faculty | Create targeted notice (`title`, `message`, `department_id`, `year`, `target_audience`). Sets `posted_by='faculty'`, falls back to teacher's dept if none specified. |
| `GET` | `/teacher/notices/recent` | L58–L104 | faculty | Get last 7 days notices (admin broadcasts + own dept) based on `target_audience` (sees `all` and `teachers`). |

### Dashboard (L106–L226)

| Method | Endpoint | Lines | Auth | Description |
|--------|----------|-------|------|-------------|
| `GET` | `/teacher/dashboard` | L106–L226 | faculty | Full teacher dashboard data |

**Dashboard queries**:

1. **Profile** → `teachers` + `department` (name, email, dept, designation)
2. **Teaches** → `courses` assigned to this teacher (with dept name)
3. **Today's timetable** → `timetable` + `time_slots` + `courses` for today's day-of-week
4. **Stats** → `total_students` (from enrollments), `classes_per_week` (from timetable), `avg_attendance` (computed)
5. **Essential links** → `essential_links` table (all rows)

**Response**: `{ profile, teaches, today_timetable, total_students, classes_per_week, avg_attendance, essential_links }`

### Attendance (L227–L591)

| Method | Endpoint | Lines | Auth | Description |
|--------|----------|-------|------|-------------|
| `GET` | `/teacher/courses/attendance-summary` | L231–L270 | faculty, admin | Total sessions per course (current academic batch) |
| `GET` | `/teacher/courses/:course_id/attendance` | L272–L376 | faculty, admin | Student-wise attendance for a course. Verifies teacher owns course. Returns students with percentage. |
| `GET` | `/teacher/attendance/my-courses` | L383–L413 | faculty | All courses this teacher teaches. |
| `POST` | `/teacher/attendance/session` | L415–L482 | faculty, admin | Create attendance session. Body: `{ course_id, session_date }`. Auto-detects academic_year from enrollments. |
| `GET` | `/teacher/attendance/session/:session_id/students` | L484–L534 | faculty, admin | Get enrolled students for a session (for marking attendance). |
| `POST` | `/teacher/attendance/submit` | L536–L591 | faculty, admin | Submit attendance. Body: `{ session_id, attendance: [{ student_id, status }] }`. Uses UPSERT. Transaction. |

### Entire Timetable (L593–L646)

| Method | Endpoint | Lines | Auth | Description |
|--------|----------|-------|------|-------------|
| `GET` | `/teacher/entire_timetable` | L593–L646 | faculty | Gets full weekly timetable across all semesters this teacher has courses in. |

### Assignment Management (L648–L905)

| Method | Endpoint | Lines | Auth | Description |
|--------|----------|-------|------|-------------|
| `POST` | `/teacher/assignments` | L652–L695 | faculty, admin | Create assignment. Body: `{ course_id, title, deadline? }`. Verifies teacher owns course. |
| `GET` | `/teacher/assignments/:course_id` | L697–L743 | faculty, admin | List assignments for a course. Includes `total_submissions` count. |
| `DELETE` | `/teacher/assignments/:assignment_id` | L745–L783 | faculty, admin | Delete assignment. Cascades to submissions. |
| `POST` | `/teacher/assignments/:assignment_id/submissions` | L785–L845 | faculty, admin | Batch mark submissions. Body: `{ submissions: [{ student_id, submitted }] }`. UPSERT. Transaction. |
| `GET` | `/teacher/assignments/:assignment_id/submissions` | L849–L905 | faculty, admin | Get submission status for all enrolled students. Returns assignment info + students with `submitted`, `submitted_at`. |

### Unit Test Management (L908–L1163)

| Method | Endpoint | Lines | Auth | Description |
|--------|----------|-------|------|-------------|
| `POST` | `/teacher/tests` | L913–L955 | faculty, admin | Create test. Body: `{ course_id, title, test_date?, max_marks }`. |
| `GET` | `/teacher/tests/:course_id` | L957–L1002 | faculty, admin | List tests for a course. Includes `total_scored` count. |
| `DELETE` | `/teacher/tests/:test_id` | L1004–L1041 | faculty, admin | Delete test. Cascades to scores. |
| `POST` | `/teacher/tests/:test_id/scores` | L1043–L1103 | faculty, admin | Batch update scores. Body: `{ scores: [{ student_id, marks_obtained?, is_absent }] }`. UPSERT. Transaction. |
| `GET` | `/teacher/tests/:test_id/scores` | L1107–L1163 | faculty, admin | Get scores for all enrolled students. Returns test info + students with marks. |

### Internal Marks Calculation (L1169–L1305)

| Method | Endpoint | Lines | Auth | Description |
|--------|----------|-------|------|-------------|
| `GET` | `/teacher/internal-marks/calculate/:course_id` | L1170–L1305 | faculty, admin | **Stateless calculation** — does NOT store results. |

**Query params**: `?aw=5&utw=10&atw=5` (assignment weight, unit test weight, attendance weight)

**Calculation logic**:

1. Gets all enrolled students for the course
2. Gets assignment submission counts per student
3. Gets total test marks earned per student
4. Gets attendance counts per student
5. Calculates per-student:
   - `assignment_score` = (submitted / total_assignments) × `aw`
   - `unit_test_score` = (marks_obtained / total_test_marks) × `utw`
   - `attendance_score` = bucket(attendance %) × `atw` / 5
     - Buckets: ≥90%=5, ≥75%=4, ≥60%=3, ≥50%=2, <50%=1
   - `total_score` = assignment + unit_test + attendance

**Response**: Array of `{ student_id, first_name, last_name, assignment_score, unit_test_score, attendance_score, total_score }`

---

## 9. Database Tables Referenced

| Table | Used In | Key Columns |
|-------|---------|-------------|
| `students` | admin, student, auth | student_id (PK), email (unique), password, department_id (FK), year, semester, academic_year, status |
| `teachers` | admin, teacher, auth | teacher_id (PK), email (unique), password, role, department_id (FK), designation |
| `department` | admin | department_id (PK), department_code (unique), department_name |
| `courses` | admin, teacher, student | course_id (PK), course_code (unique), course_name, department_id (FK), year, semester, teacher_id (FK) |
| `enrollments` | admin, teacher, student | student_id (FK), course_id (FK), academic_year |
| `timetable` | admin, teacher, student | timetable_id (PK), department_id (FK), semester, day, slot_id (FK), course_id (FK) |
| `time_slots` | admin, teacher, student | slot_id (PK), start_time, end_time |
| `attendance_sessions` | teacher, student | session_id (PK), course_id (FK), session_date, teacher_id (FK), academic_year |
| `attendance_records` | teacher, student | record_id (PK), session_id (FK), student_id (FK), status ('present'/'absent') |
| `student_fees` | admin, student | student_id (FK), academic_year, total_fee, paid_amount |
| `refresh_tokens` | auth | user_id, user_type, role, token, expires_at |
| `notices` | admin, teacher, student | notice_id (PK), title, message, posted_by, posted_by_id (FK), department_id (nullable), year, target_audience, posted_at |
| `assignments` | teacher, student | assignment_id (PK), course_id (FK), title, deadline, created_at |
| `assignment_submissions` | teacher, student | assignment_id (FK), student_id (FK), submitted, submitted_at |
| `unit_tests` | teacher, student | test_id (PK), course_id (FK), title, test_date, max_marks, created_at |
| `test_scores` | teacher, student | test_id (FK), student_id (FK), marks_obtained, is_absent |
| `essential_links` | teacher | link_id (PK), title, url |

---

## 10. Known Gaps / Notes

> [!NOTE]
>
> - **Department delete** — Frontend calls `DELETE /admin/departments/:id` but this route does NOT exist in admin.js. Will return 404.
> - **Refresh token cookie** — `secure: false` and `sameSite: 'lax'`. Needs `secure: true` in production (HTTPS).
> - **Default fee** — Promote auto-creates fee record with hardcoded `₹85,000`.
> - **Student edit restrictions** — Admin cannot change `year`, `semester`, `academic_year` via edit. These only change via promote/detain/re-enroll flows.
> - **Admin role** — Admin users are stored in the `teachers` table with `role='admin'`.
