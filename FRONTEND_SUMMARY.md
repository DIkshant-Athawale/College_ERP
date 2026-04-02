# Frontend Summary — Quick Reference Guide

> **Purpose**: Read the relevant section below instead of scanning the full codebase. Each section lists the file path, line count, exports, and what the code does.

---

## Table of Contents

1. [Tech Stack & Config](#1-tech-stack--config)
2. [Entry Point & App Shell](#2-entry-point--app-shell)
3. [Routing](#3-routing)
4. [Context Providers](#4-context-providers)
5. [API Layer](#5-api-layer)
6. [Custom Hooks](#6-custom-hooks)
7. [Types / Interfaces](#7-types--interfaces)
8. [Pages](#8-pages)
9. [Admin Sections](#9-admin-sections)
10. [Components — Common](#10-components--common)
11. [Components — Faculty](#11-components--faculty)
12. [Components — Student](#12-components--student)
13. [Components — UI (shadcn)](#13-components--ui-shadcn)
14. [Utilities](#14-utilities)
15. [Styles](#15-styles)

---

## 1. Tech Stack & Config

| Tool | Detail |
|------|--------|
| Framework | React 18 + TypeScript (Vite) |
| Styling | TailwindCSS + shadcn/ui |
| Routing | react-router-dom v6 |
| HTTP | Axios with interceptors |
| WebSockets | `socket.io-client` for real-time DB change events |
| Toasts | sonner |
| Build | `vite.config.ts` — dev on default Vite port |
| API URL | `VITE_API_URL` env var, fallback `http://localhost:3000` |

**Config files**: `vite.config.ts`, `tailwind.config.js`, `tsconfig.json`, `postcss.config.js`, `components.json` (shadcn), `eslint.config.js`

---

## 2. Entry Point & App Shell

### `src/main.tsx` (22 lines)

- Mounts `<App />` inside `<StrictMode>` to `#root`
- Has global `window.onerror` handler for debugging

### `src/App.tsx` (26 lines)

- Provider hierarchy: `ErrorBoundary → BrowserRouter → ThemeProvider → AuthProvider → SocketProvider → AppRoutes + Toaster`
- Imports `App.css` for global styles

### `src/index.html` (root) — `frontend/app/index.html`

- Single `<div id="root">`, loads `/src/main.tsx`

---

## 3. Routing

### `src/routes.tsx` (53 lines)

- **Export**: `AppRoutes` component (default)
- **Routes**:

| Path | Component | Access |
|------|-----------|--------|
| `/login` | `<Login />` | Public |
| `/unauthorized` | `<Unauthorized />` | Public |
| `/admin` | `<AdminDashboard />` | `ProtectedRoute` — role `admin` |
| `/student/dashboard` | `<StudentDashboard />` | `ProtectedRoute` — role `student` |
| `/teacher/dashboard` | `<FacultyDashboard />` | `ProtectedRoute` — roles `teacher`, `faculty` |
| `/` | Redirects → `/login` | — |
| `*` | `<NotFound />` | — |

### `src/components/ProtectedRoute.tsx` (~30 lines)

- Accepts `allowedRoles` prop, checks `useAuth()`, redirects to `/login` or `/unauthorized`

---

## 4. Context Providers

### `src/context/AuthContext.tsx` (133 lines)

- **Exports**: `AuthProvider`, `useAuth()`
- **State**: `user`, `isAuthenticated`, `isLoading`, `role`
- **Methods**:
  - `login(credentials)` — calls `authApi.login()` → stores token → fetches profile via `authApi.fetchProfile()`
  - `logout()` — calls `authApi.logout()` → clears localStorage → navigate `/login`
  - `checkAuth()` — on mount: tries `authApi.getCurrentUser()` (refresh token + profile)
- **Storage**: `localStorage` keys `token`, `user`

### `src/context/ThemeContext.tsx` (91 lines)

- **Exports**: `ThemeProvider`, `useTheme()`
- **State**: `isDark`, `theme` (ThemeColors object)
- **Colors defined**: `primary`, `secondary`, `success`, `warning`, `danger`, `info`, `background`, `surface`, `text`, `textMuted`, `border`, `gradient`
- Light theme primary: `#6366f1` (indigo), Dark theme primary: `#818cf8`
- Persists to `localStorage` key `theme`, toggles `dark` class on `<html>`

### `src/context/SocketContext.tsx` (55 lines)

- **Exports**: `SocketProvider`, `useSocket()`
- **State**: `socket` (Socket.IO client instance), `isConnected`
- **Behavior**: Auto-connects to `VITE_API_URL` on mount, listens to `connect`, `disconnect`, and global `db_change` events.
- Emits a global document event `db_changed` whenever a socket `db_change` payload is received (triggers UI refresh for active tabs).

---

## 5. API Layer

All API files are in `src/api/` and use `apiClient` from `axios.ts`.

### `src/api/axios.ts` (185 lines)

- Creates Axios instance: base URL from `VITE_API_URL`, `withCredentials: true`, 30s timeout
- **Request interceptor**: attaches `Bearer <token>` from localStorage
- **Response interceptor**: silent token refresh on 401 with queue (avoids duplicate refreshes), error toasts for 403/404/422/500

### `src/api/auth.ts` (73 lines)

- **Export**: `authApi` object
- `login(credentials)` → `POST /login` → returns `{ token, role, userType }`
- `logout()` → `POST /login/logout`
- `fetchProfile()` → `GET /login/me` → returns user object
- `refreshToken()` → `POST /login/refresh` → returns `{ token }`
- `getCurrentUser()` → refresh + fetchProfile combined (used on page load)

### `src/api/courses.ts` (51 lines)

- **Export**: `coursesApi`
- `getAll()` → `GET /admin/courses`
- `getFiltered(filters)` → `GET /admin/filter_courses?department_id=&year=&semester=`
- `create(data[])` → `POST /admin/create_course` (accepts array)
- `edit(id, data)` → `PATCH /admin/courses/edit` (body: `{ courses: [{ course_id, updates }] }`)
- `delete(id)` → `DELETE /admin/courses/:id`

### `src/api/departments.ts` (43 lines)

- **Export**: `departmentsApi`
- `getAll()` → `GET /admin/departments`
- `create(data)` → `POST /admin/create_department`
- `edit(id, data)` → `PATCH /admin/departments/edit` (body: `{ departments: [{ department_id, updates }] }`)
- `delete(id)` → `DELETE /admin/departments/:id`

### `src/api/teachers.ts` (50 lines)

- **Export**: `teachersApi`
- `getAll()` → `GET /admin/filter_teachers`
- `getByDepartment(id)` → `GET /admin/filter_teachers?department_id=`
- `create(data[])` → `POST /admin/create_teacher` (array)
- `edit(id, data)` → `PATCH /admin/teachers/edit` (body: `{ teachers: [{ teacher_id, updates }] }`)
- `delete(id)` → `DELETE /admin/teachers/:id`

### `src/api/students.ts` (80 lines)

- **Export**: `studentsApi`
- `getAll()` → `GET /admin/filter_students`
- `getFiltered(filters)` → `GET /admin/filter_students?department_id=&year=&academic_year=`
- `create(data)` → `POST /admin/create_student`
- `edit(id, data)` → `PATCH /admin/students/edit` (body: `{ students: [{ student_id, updates }] }`)
- `delete(id)` → `DELETE /admin/students/:id`
- `promote(data)` → `POST /admin/promote_students`
- `markDetained(id, data)` → `PUT /admin/students/:id/mark_dc`
- `reEnroll(studentId)` → `PUT /admin/students/:id/enroll` (body: `{ academic_year }`)
- `getDcStudents(dept?, sem?)` → `GET /admin/students/dc?department_id=&semester=`

### `src/api/student.ts` (14 lines)

- **Export**: `studentApi` (student-facing, NOT admin)
- `getDashboard()` → `GET /student/dashboard` → returns `StudentDashboardData`

### `src/api/faculty.ts` (131 lines)

- **Export**: `facultyApi`
- **Dashboard**: `getDashboard()` → `GET /teacher/dashboard`
- **Courses**: `getMyCourses()` → `GET /teacher/attendance/my-courses`
- **Attendance**:
  - `getAttendanceSummary()` → `GET /teacher/courses/attendance-summary`
  - `getCourseAttendance(courseId)` → `GET /teacher/courses/:id/attendance`
  - `createSession(courseId, date)` → `POST /teacher/attendance/session`
  - `getSessionStudents(sessionId)` → `GET /teacher/attendance/session/:id/students`
  - `submitAttendance(data)` → `POST /teacher/attendance/submit`
- **Assignments**:
  - `getAssignments(courseId)` → `GET /teacher/assignments/:courseId`
  - `createAssignment(data)` → `POST /teacher/assignments`
  - `deleteAssignment(id)` → `DELETE /teacher/assignments/:id`
  - `getAssignmentSubmissions(id)` → `GET /teacher/assignments/:id/submissions`
  - `submitAssignmentSubmissions(id, data)` → `POST /teacher/assignments/:id/submissions`
- **Unit Tests**:
  - `getTests(courseId)` → `GET /teacher/tests/:courseId`
  - `createTest(data)` → `POST /teacher/tests`
  - `deleteTest(id)` → `DELETE /teacher/tests/:id`
  - `getTestScores(id)` → `GET /teacher/tests/:id/scores`
  - `submitTestScores(id, data)` → `POST /teacher/tests/:id/scores`
- **Internal Marks**:
  - `calculateInternalMarks(courseId, aw, utw, atw)` → `GET /teacher/internal-marks/calculate/:courseId?aw=&utw=&atw=`

### `src/api/links.ts` (27 lines)

- **Export**: `linksApi`
- `getLinks()` → `GET /admin/essential_links`
- `addLink(data)` → `POST /admin/essential_links`
- `deleteLink(id)` → `DELETE /admin/essential_links/:id`

### `src/api/notices.ts` (35 lines)

- **Export**: `noticesApi`
- `getStudentNotices()` → `GET /student/notices/recent`
- `getFacultyNotices()` → `GET /teacher/notices/recent`
- `getAdminNotices()` → `GET /admin/notices/recent`
- `createAdminNotice(data)` → `POST /admin/notices` (accepts `CreateNoticeRequest` with targeting fields)
- `createFacultyNotice(data)` → `POST /teacher/notices` (accepts `CreateNoticeRequest` with targeting fields)

### `src/api/statistics.ts` (42 lines)

- **Export**: `statisticsApi`
- `getTotalDepartments()` → `GET /admin/departments/total`
- `getTotalTeachers()` → `GET /admin/teachers/total` (maps `total_faculty` → `total_teachers`)
- `getTotalStudents()` → `GET /admin/students/total/enrolled`
- `getTotalCourses()` → `GET /admin/courses/total`
- `getAllStatistics()` → calls all four above in parallel

### `src/api/timetable.ts` (58 lines)

- **Export**: `timetableApi`
- `getFiltered(filters)` → `GET /admin/timetable?department_id=&semester=`
- `create(data)` → `POST /admin/timetable`
- `editSlot(data)` → `PUT /admin/timetable/:timetable_id`
- `delete(id)` → `DELETE /admin/timetable/:id`
- **Time Slots**:
  - `getTimeSlots()` → `GET /admin/time_slots`
  - `createTimeSlot(data)` → `POST /admin/time_slots`
  - `updateTimeSlot(slotId, data)` → `PATCH /admin/time_slots/:slotId`
  - `deleteTimeSlot(slotId)` → `DELETE /admin/time_slots/:slotId`

### `src/api/index.ts` — Re-exports all API modules

---

## 6. Custom Hooks

All hooks are in `src/hooks/` and follow the pattern: state (`data`, `isLoading`, `error`) + fetch/CRUD functions + toast notifications.

### `useDepartments.ts` (74 lines)

- Auto-fetches on mount via `useEffect`
- Returns: `departments`, `isLoading`, `error`, `refetch`, `createDepartment`, `editDepartment`, `deleteDepartment`

### `useTeachers.ts` (85 lines)

- Returns: `teachers`, `isLoading`, `error`, `fetchTeachers`, `fetchTeachersByDepartment`, `createTeachers`, `editTeacher`, `deleteTeacher`

### `useCourses.ts` (85 lines)

- Returns: `courses`, `isLoading`, `error`, `fetchCourses`, `fetchFilteredCourses`, `createCourses`, `editCourse`, `deleteCourse`

### `useStudents.ts` (145 lines)

- Returns: `students`, `dcStudents`, `isLoading`, `error`, `fetchStudents`, `fetchFilteredStudents`, `fetchDcStudents`, `createStudent`, `editStudent`, `deleteStudent`, `promoteStudents`, `markDetained`, `reEnrollStudent`

### `useTimetable.ts` (124 lines)

- Returns: `timetable`, `timeSlots`, `isLoading`, `error`, `fetchTimetable`, `fetchTimeSlots`, `createTimeSlot`, `updateTimeSlot`, `deleteTimeSlot`, `createTimetableSlot`, `editTimetableSlot`, `deleteTimetableSlot`

### `useStatistics.ts` (38 lines)

- Auto-fetches on mount
- Returns: `statistics`, `isLoading`, `error`, `refetch`

### `use-mobile.ts` (20 lines) — returns `isMobile` boolean (breakpoint hook)

---

## 7. Types / Interfaces

**File**: `src/types/index.ts` (497 lines, 77 interfaces)

### Auth

- `User` { id, email, first_name, last_name, role }
- `LoginCredentials` { email, password }
- `AuthResponse` { token, user }

### Department

- `Department` { department_id, department_code, department_name }
- `CreateDepartmentRequest`, `EditDepartmentRequest`

### Teacher

- `Teacher` { teacher_id, first_name, last_name, email, role, primary_phone, alternate_phone, department_id, designation }
- `CreateTeacherRequest`, `EditTeacherRequest`

### Course

- `Course` { course_id, course_code, course_name, department_id, department_name, year, semester, teacher_id, teacher_name, total_sessions? }
- `CreateCourseRequest`, `EditCourseRequest`

### Student

- `Student` { student_id, first_name, middle_name, last_name, DOB, email, primary_phone, alternate_phone, department_id, year, semester, academic_year }
- `CreateStudentRequest`, `EditStudentRequest`
- `PromoteStudentsRequest` { department_id, current_semester, new_academic_year }
- `DetainStudentRequest` { academic_year }

### Timetable

- `TimetableSlot` { timetable_id, day, slot, start_time, end_time, course_code, course_name, slot_id? }
- `TimeSlot` { slot_id, start_time, end_time }
- `CreateTimetableRequest`, `EditTimetableSlotRequest`

### Statistics

- `Statistics` { total_departments, total_teachers, total_students, total_courses }

### Student Dashboard

- `StudentDashboardData` { profile, subjects, attendance_by_subject, overall_attendance, feeRecord, timetablerows, notices, assignments, tests, essential_links }
- Supporting: `StudentProfile`, `DashboardSubject`, `AttendanceRecord`, `OverallAttendance`, `FeeRecord`, `TimetableEntry`, `Notice`, `StudentAssignment`, `StudentTest`, `EssentialLink`

### Faculty Dashboard

- `FacultyDashboardData` { profile, teaches, today_timetable, stats?, total_students, classes_per_week, avg_attendance, essential_links }
- Supporting: `FacultyProfile`, `FacultyStudent`

### Faculty Attendance

- `SubmitAttendanceRequest`, `CreateSessionResponse`, `SessionStudentsResponse`

### Assignments

- `Assignment`, `AssignmentStudent`, `AssignmentSubmissionsResponse`, `CreateAssignmentRequest`, `SubmitAssignmentSubmissionsRequest`

### Unit Tests

- `UnitTest`, `TestStudent`, `TestScoresResponse`, `CreateTestRequest`, `SubmitTestScoresRequest`

### Internal Marks

- `StudentInternalMark` { student_id, first_name, last_name, assignment_score, unit_test_score, attendance_score, total_score }

### Filters

- `TeacherFilters`, `CourseFilters`, `StudentFilters`, `TimetableFilters`

### API Responses

- `ApiResponse<T>`, `DepartmentsResponse`, `TeachersResponse`, `CoursesResponse`, `StudentsResponse`, `TimetableResponse`

### Table

- `Column<T>` { key, header, render?, sortable? }

---

## 8. Pages

All pages are in `src/pages/`.

### `Login.tsx` (17 KB, ~500 lines)

- Full login page with email/password form
- Uses `useAuth().login()`, redirects based on role (`admin` → `/admin`, `student` → `/student/dashboard`, `teacher` → `/teacher/dashboard`)
- Has theme toggle, animated background

### `AdminDashboard.tsx` (11 KB, ~350 lines)

- Tabbed layout with admin sections
- Uses `useStatistics()`, `useDepartments()` hooks
- **Tabs**: Dashboard (stats), Departments, Teachers, Students, Courses, Timetable, Essential Links, Student Status
- Each tab renders a component from `src/sections/`
- Has Navbar, StatCards, NoticeMarquee, NoticeFormModal

### `StudentDashboard.tsx` (10 KB, ~330 lines)

- Uses `studentApi.getDashboard()` directly (no hook)
- Renders student profile, subjects, attendance bars, fee card, timetable, assignments, tests, essential links
- All via components from `src/components/student/`

### `FacultyDashboard.tsx` (38 KB, ~1000 lines)

- Uses `facultyApi` directly
- **Tabs**: Dashboard, Attendance, Assignments, Unit Tests, Internal Marks
- Dashboard tab: profile card, courses card, timetable table, notice marquee
- Attendance tab: course selector → session creation → student attendance marking
- Other tabs render `AssignmentSection`, `UnitTestsSection`, `InternalMarksSection`
- Has notice form modal for faculty notices

### `NotFound.tsx` (4 KB) — 404 page with link back to login

### `Unauthorized.tsx` (4 KB) — 403 page with link back to login

### `src/pages/index.ts` — Re-exports all pages

---

## 9. Admin Sections

All in `src/sections/` — rendered as tabs inside `AdminDashboard`.

### `ManageDepartments.tsx` (6 KB)

- CRUD for departments using `useDepartments()` hook
- DataTable + Modal with form (department_code, department_name)
- ConfirmDialog for delete

### `ManageTeachers.tsx` (16 KB)

- CRUD for teachers using `useTeachers()`, `useDepartments()` hooks
- DataTable + Modal with form
- Filter by department dropdown

### `ManageStudents.tsx` (13 KB)

- CRUD for students using `useStudents()`, `useDepartments()` hooks
- Filter by department/year/academic_year
- DataTable + Modal with student form

### `ManageCourses.tsx` (17 KB)

- CRUD for courses using `useCourses()`, `useDepartments()`, `useTeachers()` hooks
- Filter by department/year/semester
- DataTable + Modal with course form

### `TimetableManagement.tsx` (20 KB)

- Uses `useTimetable()`, `useDepartments()`, `useCourses()` hooks
- Two sub-tabs: **Time Slots** (CRUD for slot definitions) and **Timetable Grid** (assign courses to day/slot)
- Filter by department + semester

### `ManageEssentialLinks.tsx` (8 KB)

- Uses `linksApi` directly
- Add/delete essential links (title + URL)

### `StudentStatusManagement.tsx` (14 KB)

- Uses `useStudents()`, `useDepartments()` hooks
- Three sub-tabs: **Promote** (bulk promote students), **Detain/DC** (mark individual students as detained), **DC Students** (view detained students, re-enroll)

### `src/sections/index.ts` — Re-exports all sections

---

## 10. Components — Common

All in `src/components/common/`.

### `DataTable.tsx` (8 KB)

- Generic table component with sorting, column rendering
- Props: `columns: Column<T>[]`, `data: T[]`, `actions?` (edit/delete callbacks)

### `Modal.tsx` (1 KB)

- Generic modal wrapper with overlay, close button
- Props: `isOpen`, `onClose`, `title`, `children`

### `ConfirmDialog.tsx` (3 KB)

- Confirmation dialog for destructive actions
- Props: `isOpen`, `onConfirm`, `onCancel`, `title`, `message`

### `FormInput.tsx` (1 KB)

- Reusable text input with label and error display
- Props: `label`, `name`, `value`, `onChange`, `error?`, `type?`

### `FormSelect.tsx` (2 KB)

- Reusable select dropdown with label and error display
- Props: `label`, `name`, `value`, `onChange`, `options`, `error?`

### `StatCard.tsx` (3 KB)

- Dashboard stat card with icon, title, value
- Props: `title`, `value`, `icon`, `color?`

### `LoadingSpinner.tsx` (1 KB)

- Centered loading spinner with optional message

### `ErrorComponent.tsx` (1 KB)

- Error display with retry button
- Props: `message`, `onRetry?`

### `NoticeMarquee.tsx` (4 KB)

- Scrolling marquee of recent notices
- Props: `notices: Notice[]`

### `NoticeFormModal.tsx` (4 KB)

- Modal form to create a new targeted notice (title + message + target audience, year, department)
- Props: `isOpen`, `onClose`, `onSubmit`

### `src/components/common/index.ts` — Re-exports all common components

---

## 11. Components — Faculty

All in `src/components/faculty/`.

### `FacultyProfileCard.tsx` (3 KB)

- Displays faculty profile info (name, email, department, designation)

### `FacultyCoursesCard.tsx` (4 KB)

- List of courses the faculty teaches

### `FacultyTimetableTable.tsx` (6 KB)

- Weekly timetable grid for the faculty

### `AssignmentSection.tsx` (32 KB)

- Full assignment management: course selector → list assignments → create/delete assignment → view/grade submissions
- Uses `facultyApi` assignment methods

### `UnitTestsSection.tsx` (26 KB)

- Full unit test management: course selector → list tests → create/delete test → view/grade scores
- Uses `facultyApi` test methods

### `InternalMarksSection.tsx` (20 KB)

- Select course → configure weights (assignment %, unit test %, attendance %) → calculate & display internal marks
- Uses `facultyApi.calculateInternalMarks()`

---

## 12. Components — Student

All in `src/components/student/`.

### `StudentProfileCard.tsx` (3 KB)

- Student info card (name, email, department, year, semester, academic year)

### `SubjectsCard.tsx` (4 KB)

- List of enrolled subjects/courses

### `AttendanceBarSection.tsx` (5 KB)

- Per-subject attendance bars + overall attendance percentage

### `FeeCard.tsx` (3 KB)

- Fee summary: total, paid, remaining

### `TimetableTable.tsx` (5 KB)

- Weekly timetable grid for the student

### `StudentAssignmentsCard.tsx` (10 KB)

- List of assignments with submission status

### `StudentTestsCard.tsx` (10 KB)

- List of unit tests with marks/absent status

### `EssentialLinksSection.tsx` (3 KB)

- List of essential links (title + clickable URL)

---

## 13. Components — UI (shadcn)

**Directory**: `src/components/ui/` (53 files)

These are **shadcn/ui** primitives — generally do NOT modify directly. Key ones used:

- `button.tsx`, `card.tsx`, `dialog.tsx`, `input.tsx`, `label.tsx`, `select.tsx`, `table.tsx`, `tabs.tsx`, `badge.tsx`, `separator.tsx`, `sonner.tsx` (toast), `tooltip.tsx`, `dropdown-menu.tsx`

### Other top-level components

- `src/components/Navbar.tsx` (5 KB) — Top navigation bar with logo, role display, theme toggle, logout
- `src/components/ThemeSwitcher.tsx` (1 KB) — Dark/light mode toggle button
- `src/components/ErrorBoundary.tsx` (1 KB) — React error boundary wrapper
- `src/components/index.ts` — Re-exports ProtectedRoute, Navbar, ThemeSwitcher, ErrorBoundary, and all common components

---

## 14. Utilities

### `src/utils/validation.ts` (228 lines)

- **Validators**: `isValidEmail()`, `isValidPhone()`, `isValidPassword()`, `isRequired()`, `isValidDate()`, `isValidAcademicYear()`
- **Form validators** (return `Record<string, string>` errors):
  - `validateTeacherForm(data, isEdit?)` — validates all teacher fields
  - `validateStudentForm(data, isEdit?)` — validates all student fields
  - `validateCourseForm(data)` — validates all course fields
  - `validateDepartmentForm(data)` — validates dept code + name

### `src/utils/index.ts` — empty/minimal export

### `src/lib/utils.ts` (1 line) — `cn()` helper for Tailwind class merging (clsx + tailwind-merge)

---

## 15. Styles

### `src/index.css` (2 KB)

- Tailwind directives (`@tailwind base/components/utilities`)
- CSS custom properties for shadcn theming (light & dark)

### `src/App.css` (2 KB)

- Custom global styles, animations, transitions

---

## Quick File Size Reference

| File | Size | What it does |
|------|------|-------------|
| `FacultyDashboard.tsx` | 38 KB | Largest page — faculty tabs/attendance/assignments/tests |
| `AssignmentSection.tsx` | 32 KB | Faculty assignment CRUD + grading |
| `UnitTestsSection.tsx` | 26 KB | Faculty test CRUD + scoring |
| `InternalMarksSection.tsx` | 20 KB | Internal marks calculation |
| `TimetableManagement.tsx` | 20 KB | Admin timetable grid + time slots |
| `ManageCourses.tsx` | 17 KB | Admin course CRUD |
| `Login.tsx` | 17 KB | Login page with animations |
| `ManageTeachers.tsx` | 16 KB | Admin teacher CRUD |
| `StudentStatusManagement.tsx` | 14 KB | Promote/detain/re-enroll students |
| `ManageStudents.tsx` | 13 KB | Admin student CRUD |
| `AdminDashboard.tsx` | 11 KB | Admin tabbed dashboard |
| `StudentDashboard.tsx` | 10 KB | Student dashboard |
| `types/index.ts` | 10 KB | All TypeScript interfaces (497 lines) |
