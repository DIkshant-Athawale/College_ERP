# System Requirements Specification — Client (End-User)

## College ERP — Academic Management System

**Document Version:** 1.0  
**Date:** April 2, 2026  
**Project:** College ERP (Enterprise Resource Planning for Academic Institutions)

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [System Overview](#2-system-overview)
3. [Hardware Requirements](#3-hardware-requirements)
4. [Software Requirements](#4-software-requirements)
5. [Network Requirements](#5-network-requirements)
6. [Browser Compatibility](#6-browser-compatibility)
7. [User Roles & Access Requirements](#7-user-roles--access-requirements)
8. [Functional Requirements — Student](#8-functional-requirements--student)
9. [Functional Requirements — Faculty](#9-functional-requirements--faculty)
10. [Functional Requirements — Admin](#10-functional-requirements--admin)
11. [Non-Functional Requirements](#11-non-functional-requirements)
12. [Security Requirements](#12-security-requirements)
13. [User Interface Requirements](#13-user-interface-requirements)
14. [Data Requirements](#14-data-requirements)
15. [External Interface Requirements](#15-external-interface-requirements)
16. [Assumptions & Dependencies](#16-assumptions--dependencies)

---

## 1. Introduction

### 1.1 Purpose

This document specifies the system requirements from the **client (end-user) perspective** for the College ERP system. It outlines the hardware, software, network, and functional prerequisites that each type of user — **Student**, **Faculty**, and **Admin** — must satisfy to effectively use the application.

### 1.2 Scope

The College ERP is a full-stack, web-based Academic Management System that provides:

- **Students** — Dashboard with academic profile, subjects, attendance, assignments, tests, fee records, timetable, notices, and essential links.
- **Faculty** — Dashboard with courses, attendance marking, assignment and unit test management, internal marks calculation, and notice publishing.
- **Admin** — Full CRUD management of departments, teachers, students, courses, timetable, notices, essential links, and student status (promotion, detention, re-enrollment).

### 1.3 Definitions & Abbreviations

| Term | Definition |
|------|-----------|
| **ERP** | Enterprise Resource Planning |
| **SPA** | Single Page Application |
| **JWT** | JSON Web Token (used for authentication) |
| **CAPTCHA** | Completely Automated Public Turing test to tell Computers and Humans Apart |
| **CRUD** | Create, Read, Update, Delete |
| **DC** | Detained / Year-back student status |
| **WebSocket** | Full-duplex communication protocol for real-time updates |

---

## 2. System Overview

### 2.1 Architecture

The College ERP follows a **client-server architecture**:

```
┌───────────────────────────┐      HTTP / WebSocket       ┌────────────────────────┐
│     CLIENT (Browser)      │  ◄──────────────────────►   │     BACKEND SERVER     │
│  React 18 + TypeScript    │         REST API            │   Node.js + Express 5  │
│  Vite + TailwindCSS       │       + Socket.IO           │   MySQL Database       │
│  SPA (SIngle Page App)    │                             │   JWT Authentication   │
└───────────────────────────┘                             └────────────────────────┘
```

### 2.2 Technology Stack (Client-Side)

| Component | Technology | Version |
|-----------|-----------|---------|
| UI Framework | React | 19.x |
| Language | TypeScript | 5.9.x |
| Build Tool | Vite | 7.x |
| Styling | TailwindCSS + shadcn/ui | 3.4.x |
| Routing | React Router DOM | v7.x |
| HTTP Client | Axios | 1.13.x |
| Real-Time | Socket.IO Client | 4.8.x |
| Animations | Framer Motion | 12.x |
| Icons | Lucide React | 0.562.x |
| Notifications | Sonner (Toast) | 2.x |

---

## 3. Hardware Requirements

### 3.1 Minimum Hardware Requirements

| Component | Specification |
|-----------|--------------|
| **Processor** | Dual-core CPU @ 1.6 GHz or higher (Intel i3 / AMD Ryzen 3 / ARM equivalent) |
| **RAM** | 2 GB minimum |
| **Storage** | 500 MB free disk space (for browser cache and temporary files) |
| **Display** | 1280 × 720 resolution (HD) minimum |
| **Input Devices** | Keyboard and mouse/trackpad (touch-screen optional) |

### 3.2 Recommended Hardware Requirements

| Component | Specification |
|-----------|--------------|
| **Processor** | Quad-core CPU @ 2.0 GHz or higher (Intel i5 / AMD Ryzen 5 or better) |
| **RAM** | 4 GB or more |
| **Storage** | 1 GB free disk space |
| **Display** | 1920 × 1080 resolution (Full HD) or higher |
| **Input Devices** | Keyboard and mouse/trackpad; touch-screen for mobile/tablet |

### 3.3 Mobile/Tablet Devices

| Component | Specification |
|-----------|--------------|
| **Smartphone** | Android 10+ or iOS 14+ with a modern browser |
| **Tablet** | iPad (iPadOS 14+) or Android tablet (10"+) with 2 GB+ RAM |
| **Display** | Minimum 5" screen (smartphones), 8"+ screen (tablets) |

> **Note:** The application uses responsive design and adapts layout based on screen size. The mobile breakpoint detection (`use-mobile` hook) adjusts the UI for smaller devices.

---

## 4. Software Requirements

### 4.1 Operating System

| OS | Minimum Version |
|----|----------------|
| **Windows** | Windows 10 (version 1903) or later |
| **macOS** | macOS 11.0 (Big Sur) or later |
| **Linux** | Ubuntu 20.04 LTS / Fedora 34 / or equivalent with a modern desktop environment |
| **Android** | Android 10 (API level 29) or later |
| **iOS** | iOS 14.0 or later |
| **ChromeOS** | Version 90 or later |

### 4.2 Web Browser (Required)

A modern, standards-compliant web browser with **JavaScript enabled** is the only required software on the client machine. No additional software installation is needed.

| Browser | Minimum Version |
|---------|----------------|
| **Google Chrome** | 90+ (Recommended) |
| **Mozilla Firefox** | 88+ |
| **Microsoft Edge** | 90+ (Chromium-based) |
| **Apple Safari** | 14+ |
| **Opera** | 76+ |
| **Samsung Internet** | 14+ |

### 4.3 Browser Feature Requirements

The following browser features **must be enabled** for the application to function correctly:

| Feature | Required | Purpose |
|---------|----------|---------|
| **JavaScript** | ✅ Yes | Core application logic (React SPA) |
| **Cookies** | ✅ Yes | Refresh token storage (`httpOnly` cookie for session persistence) |
| **LocalStorage** | ✅ Yes | Storing access token, user data, and theme preferences |
| **WebSocket** | ✅ Yes | Real-time database change notifications via Socket.IO |
| **CSS3 / Flexbox / Grid** | ✅ Yes | Modern layout and responsive design |
| **CSS Animations** | ✅ Yes | Framer Motion animations and UI micro-interactions |

> **Note:** Browsers with JavaScript or cookies disabled will not be able to use the application.

---

## 5. Network Requirements

### 5.1 Internet Connectivity

| Requirement | Specification |
|-------------|--------------|
| **Connection Type** | Broadband, Wi-Fi, or mobile data (3G / 4G / 5G) |
| **Minimum Bandwidth** | 1 Mbps download / 512 Kbps upload |
| **Recommended Bandwidth** | 5 Mbps download / 2 Mbps upload |
| **Latency** | < 200ms round-trip to server (recommended < 100ms) |

### 5.2 Required Ports & Protocols

| Protocol | Port | Purpose |
|----------|------|---------|
| **HTTP/HTTPS** | 80 / 443 | Web application access |
| **WebSocket (ws/wss)** | 80 / 443 (upgrade) | Real-time notifications via Socket.IO |

### 5.3 Firewall & Proxy Considerations

- The client browser must be able to establish standard HTTP/HTTPS connections to the server.
- WebSocket connections (used for real-time `db_change` events) must not be blocked by the user's network firewall or proxy.
- If the institution uses a corporate proxy, the proxy must support WebSocket upgrade headers.

---

## 6. Browser Compatibility

### 6.1 Compatibility Matrix

| Feature | Chrome 90+ | Firefox 88+ | Edge 90+ | Safari 14+ | Mobile Chrome | Mobile Safari |
|---------|:----------:|:-----------:|:--------:|:----------:|:-------------:|:-------------:|
| Login (CAPTCHA) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Dashboard Rendering | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Animations (Framer Motion) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| WebSocket (Real-time) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Dark/Light Theme Toggle | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Responsive Layout | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Data Tables (Sorting) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

### 6.2 Known Limitations

- **Internet Explorer:** Not supported (no ES module or modern CSS support).
- **Legacy Edge (EdgeHTML):** Not supported. Requires Chromium-based Edge 90+.
- **Browsers with js disabled:** Application will not render — blank page shown.

---

## 7. User Roles & Access Requirements

### 7.1 Role Summary

| Role | Login Credentials | Dashboard URL | Access Level |
|------|------------------|---------------|--------------|
| **Student** | Email + Password (provided by admin) | `/student/dashboard` | Read-only (view own data only) |
| **Faculty / Teacher** | Email + Password (provided by admin) | `/teacher/dashboard` | Read/Write for assigned courses; Read for own data |
| **Admin** | Email + Password (stored in `teachers` table with `role='admin'`) | `/admin` | Full CRUD on all entities |

### 7.2 Authentication Flow (All Users)

1. User navigates to the application URL (root `/` redirects to `/login`).
2. Enters **email** and **password** on the login page.
3. Passes **CAPTCHA** verification (6-character alphanumeric code).
4. On successful login:
   - Server returns a **JWT access token** (30 min TTL) and sets a **refresh token** as an `httpOnly` cookie (7-day TTL).
   - Client stores the access token in `localStorage`.
   - User is redirected to the appropriate dashboard based on role.
5. Token auto-refreshes silently on 401 responses (seamless session continuity).
6. **Logout** clears tokens from both client and server.

### 7.3 Session Management

| Parameter | Value |
|-----------|-------|
| Access Token Lifetime | 30 minutes |
| Refresh Token Lifetime | 7 days |
| Auto Token Refresh | Yes (transparent to user, on 401 response) |
| Simultaneous Sessions | Allowed (no session limit enforced) |
| Idle Timeout | None (token-based, not session-based) |

---

## 8. Functional Requirements — Student

The Student dashboard is a **read-only** view of academic data. Students cannot modify any data.

### 8.1 Student Dashboard Features

| # | Feature | Description | Data Source |
|---|---------|-------------|-------------|
| **FR-S01** | **Profile Card** | View personal info: Name, Email, Department, Year, Semester, Academic Year | `students` table |
| **FR-S02** | **Enrolled Subjects** | View list of all enrolled courses for current semester | `enrollments` + `courses` tables |
| **FR-S03** | **Attendance Overview** | Per-subject attendance bars showing total classes, present count, and percentage | `attendance_sessions` + `attendance_records` |
| **FR-S04** | **Overall Attendance** | Aggregate attendance percentage across all subjects | Computed from attendance records |
| **FR-S05** | **Fee Records** | View fee summary: Total Fee, Paid Amount, Remaining Fee | `student_fees` table |
| **FR-S06** | **Weekly Timetable** | View timetable grid (Monday–Saturday) with course and time slot details | `timetable` + `time_slots` + `courses` |
| **FR-S07** | **Assignments** | View assignment list with title, deadline, and submission status (submitted / not submitted) | `assignments` + `assignment_submissions` |
| **FR-S08** | **Unit Tests** | View unit test list with title, test date, max marks, marks obtained, and absent status | `unit_tests` + `test_scores` |
| **FR-S09** | **Notices / Notifications** | View notices from admin and faculty (last 7 days), with poster name and timestamp; admin and department-specific notices | `notices` table |
| **FR-S10** | **Notice Marquee** | Scrolling marquee banner of recent notices at the top of the dashboard | `notices` table |
| **FR-S11** | **Essential Links** | View essential links (title + clickable URL) provided by the institution | `essential_links` table |
| **FR-S12** | **Academic Status** | View current standing status (e.g., "Good Standing") | Derived from student `status` field |
| **FR-S13** | **Real-Time Updates** | Dashboard auto-refreshes when any database change occurs (via WebSocket) | Socket.IO `db_change` event |
| **FR-S14** | **Theme Toggle** | Switch between dark and light themes; preference persists across sessions | `localStorage` |

### 8.2 Student Input Requirements

| Input | Type | Validation | Required |
|-------|------|-----------|----------|
| Email | Email address | Valid email format | Yes (login only) |
| Password | Text | Minimum length enforced by admin-set password | Yes (login only) |
| CAPTCHA | Text (6 chars) | Case-insensitive match | Yes (login only) |

> **Note:** Students do not enter any data beyond the login form. All academic data is view-only.

---

## 9. Functional Requirements — Faculty

Faculty users have both **read** and **write** capabilities for their assigned courses.

### 9.1 Faculty Dashboard Features

| # | Feature | Description | Data Source |
|---|---------|-------------|-------------|
| **FR-F01** | **Profile Card** | View personal info: Name, Email, Department, Designation | `teachers` + `department` tables |
| **FR-F02** | **Assigned Courses** | View list of courses assigned to this faculty member | `courses` table |
| **FR-F03** | **Today's Timetable** | View today's schedule with time slots and course names | `timetable` + `time_slots` + `courses` |
| **FR-F04** | **Dashboard Statistics** | View total students, classes per week, and average attendance | Computed from enrollments, timetable, attendance |
| **FR-F05** | **Notice Marquee** | View recent notices (admin broadcasts + own department) | `notices` table |
| **FR-F06** | **Essential Links** | View essential links | `essential_links` table |
| **FR-F07** | **Real-Time Updates** | Dashboard auto-refreshes on data changes | Socket.IO `db_change` event |
| **FR-F08** | **Theme Toggle** | Dark/light mode toggle | `localStorage` |

### 9.2 Attendance Management

| # | Feature | Description |
|---|---------|-------------|
| **FR-F09** | **View Attendance Summary** | View total sessions per course for the current academic batch |
| **FR-F10** | **View Course Attendance** | View student-wise attendance with percentage for each course (must be course owner) |
| **FR-F11** | **Select Course** | Choose course from dropdown to manage attendance |
| **FR-F12** | **Create Attendance Session** | Create a new session for a specific date; auto-detects academic year |
| **FR-F13** | **View Session Students** | View list of enrolled students for marking attendance |
| **FR-F14** | **Mark Attendance** | Mark each student as present/absent; submit in bulk; supports upsert (re-marking) |

### 9.3 Assignment Management

| # | Feature | Description |
|---|---------|-------------|
| **FR-F15** | **View Assignments** | List assignments for a selected course with total submission count |
| **FR-F16** | **Create Assignment** | Create assignment with title and optional deadline (must own course) |
| **FR-F17** | **Delete Assignment** | Delete an assignment (cascades to submissions) |
| **FR-F18** | **View Submissions** | View submission status for all enrolled students per assignment |
| **FR-F19** | **Mark Submissions** | Batch mark students as submitted/not submitted for an assignment |

### 9.4 Unit Test Management

| # | Feature | Description |
|---|---------|-------------|
| **FR-F20** | **View Tests** | List unit tests for a selected course with total scored count |
| **FR-F21** | **Create Test** | Create test with title, optional date, and max marks (must own course) |
| **FR-F22** | **Delete Test** | Delete a test (cascades to scores) |
| **FR-F23** | **View Scores** | View scores for all enrolled students per test |
| **FR-F24** | **Enter Scores** | Batch enter marks or mark as absent for each student |

### 9.5 Internal Marks Calculation

| # | Feature | Description |
|---|---------|-------------|
| **FR-F25** | **Select Course** | Choose course for internal marks calculation |
| **FR-F26** | **Configure Weights** | Set weights for Assignment (%), Unit Test (%), and Attendance (%) |
| **FR-F27** | **Calculate Marks** | View computed breakdown: assignment score, unit test score, attendance score, and total |
| **FR-F28** | **View Results Table** | View per-student internal marks in tabular format |

> **Note:** Internal marks are computed on-the-fly and are **not stored** in the database.

### 9.6 Notice Publishing

| # | Feature | Description |
|---|---------|-------------|
| **FR-F29** | **Create Notice** | Publish a targeted notice with title, message, optional department, year, and target audience (students/teachers/all) |

### 9.7 Faculty Input Requirements

| Input | Type | Validation | Required |
|-------|------|-----------|----------|
| Session Date | Date | Valid date | Yes (attendance) |
| Attendance Status | present/absent per student | Must select for each student | Yes |
| Assignment Title | Text | Non-empty | Yes |
| Assignment Deadline | Date | Optional | No |
| Test Title | Text | Non-empty | Yes |
| Test Date | Date | Optional | No |
| Max Marks | Number | Positive integer | Yes |
| Student Marks | Number | 0 ≤ marks ≤ max_marks | Yes (scoring) |
| Is Absent | Boolean | Checkbox | Optional |
| Weight Values | Number | Positive integers (aw, utw, atw) | Yes (internal marks) |
| Notice Title | Text | Non-empty | Yes |
| Notice Message | Text | Non-empty | Yes |
| Target Audience | Enum | students / teachers / all | Yes |

---

## 10. Functional Requirements — Admin

Admin users have **full CRUD** access to all system entities.

### 10.1 Admin Dashboard Overview

| # | Feature | Description |
|---|---------|-------------|
| **FR-A01** | **Statistics Cards** | View total counts: Departments, Teachers (excluding admins), Active Students, Courses |
| **FR-A02** | **Notice Marquee** | View all recent notices (last 7 days) |
| **FR-A03** | **Create Notice** | Publish targeted notice (title, message, department, year, target audience) |
| **FR-A04** | **Tabbed Navigation** | Switch between management sections via tab layout |
| **FR-A05** | **Real-Time Updates** | All data auto-refreshes on database changes (WebSocket) |

### 10.2 Department Management

| # | Feature | Description |
|---|---------|-------------|
| **FR-A06** | **View Departments** | List all departments with code and name |
| **FR-A07** | **Create Department** | Add new department with unique code and name; supports single or batch creation |
| **FR-A08** | **Edit Department** | Modify department code and/or name |
| **FR-A09** | **Delete Department** | Remove a department (restricted if foreign key constraints exist) |

### 10.3 Teacher Management

| # | Feature | Description |
|---|---------|-------------|
| **FR-A10** | **View Teachers** | List teachers with full details; filter by department |
| **FR-A11** | **Create Teacher** | Add new teacher(s) with first name, last name, email, password, phone numbers, department, and designation; password is hashed |
| **FR-A12** | **Edit Teacher** | Modify teacher fields (name, email, phone, designation, department) |
| **FR-A13** | **Delete Teacher** | Remove teacher (restricted if assigned to courses) |

### 10.4 Student Management

| # | Feature | Description |
|---|---------|-------------|
| **FR-A14** | **View Students** | List students with full details; filter by department, year, semester, and academic year |
| **FR-A15** | **Create Student** | Add new student with personal details, password, department, year, semester, academic year; auto-enrolls in courses; creates fee record, password is hashed |
| **FR-A16** | **Edit Student** | Modify personal fields only (name, DOB, email, phone); year/semester/academic year are read-only and only changed via promote/detain flows |
| **FR-A17** | **Delete Student** | Remove student and all related records (enrollments, attendance, fees, etc.) |

### 10.5 Course Management

| # | Feature | Description |
|---|---------|-------------|
| **FR-A18** | **View Courses** | List courses with full details (code, name, department, teacher, year, semester); filter by department, year, semester |
| **FR-A19** | **Create Course** | Add new course(s) with code (auto-uppercase), name, department, year, semester, and assigned teacher |
| **FR-A20** | **Edit Course** | Modify course fields (code, name, department, year, semester, teacher) |
| **FR-A21** | **Delete Course** | Remove course (restricted if foreign key constraints exist) |

### 10.6 Timetable Management

| # | Feature | Description |
|---|---------|-------------|
| **FR-A22** | **Manage Time Slots** | CRUD for time slot definitions (start time, end time) |
| **FR-A23** | **View Timetable Grid** | View timetable filtered by department + semester |
| **FR-A24** | **Create Timetable Entry** | Assign a course to a specific day + time slot for a department/semester |
| **FR-A25** | **Edit Timetable Entry** | Change day, slot, or course for an existing entry |
| **FR-A26** | **Delete Timetable Entry** | Remove a timetable entry |

### 10.7 Student Status Management

| # | Feature | Description |
|---|---------|-------------|
| **FR-A27** | **Promote Students** | Bulk promote all students in a department + semester to next semester; semester 8 → graduation; creates new enrollments and fee record (₹85,000) |
| **FR-A28** | **Detain / Mark DC** | Mark individual student as detained (DC); sets status to `dc`, removes enrollments for that year |
| **FR-A29** | **View DC Students** | View detained students, filter by department and semester |
| **FR-A30** | **Re-enroll Student** | Re-enroll a detained student; reactivates status, creates enrollments and fee record |

### 10.8 Essential Links Management

| # | Feature | Description |
|---|---------|-------------|
| **FR-A31** | **View Links** | List all essential links |
| **FR-A32** | **Add Link** | Create a new link with title and URL |
| **FR-A33** | **Delete Link** | Remove an essential link |

### 10.9 Admin Input Requirements

| Input | Type | Validation | Required |
|-------|------|-----------|----------|
| Department Code | Text | Unique, non-empty | Yes |
| Department Name | Text | Non-empty | Yes |
| Teacher/Student Name | Text | Non-empty (first, last) | Yes |
| Email | Email | Valid email format, unique | Yes |
| Password | Text | Validated strength | Yes (create only) |
| Phone | Text | Valid phone format | Yes (primary) |
| Date of Birth | Date | Valid past date | Optional |
| Department Selection | Dropdown | Must exist | Yes |
| Year | Number | 1–4 | Yes |
| Semester | Number | 1–8 | Yes |
| Academic Year | Text | Format `YYYY-YYYY` | Yes |
| Course Code | Text | Unique, auto-uppercase | Yes |
| Course Name | Text | Non-empty | Yes |
| Teacher Assignment | Dropdown | Must exist | Yes |
| Time Slot Start/End | Time | Valid time, end > start | Yes |
| Timetable Day | Enum | Monday–Saturday | Yes |
| Link Title | Text | Non-empty | Yes |
| Link URL | URL | Valid URL format | Yes |
| Notice Title | Text | Non-empty | Yes |
| Notice Message | Text | Non-empty | Yes |

---

## 11. Non-Functional Requirements

### 11.1 Performance

| Parameter | Requirement |
|-----------|------------|
| **Page Load Time** | Initial load < 3 seconds on broadband (5 Mbps+); < 5 seconds on 3G |
| **API Response Time** | Dashboard data loads < 2 seconds |
| **UI Responsiveness** | All UI interactions (clicks, tabs, modals) respond within 200ms |
| **Animation Frame Rate** | Smooth 60fps for Framer Motion animations |
| **Real-Time Latency** | WebSocket `db_change` event propagation < 1 second |

### 11.2 Scalability

| Parameter | Requirement |
|-----------|------------|
| **Concurrent Users** | Supports 100+ simultaneous users (limited by backend connection pool of 10) |
| **Data Volume** | Handles departments, 100s of teachers, 1000s of students |

### 11.3 Availability

| Parameter | Requirement |
|-----------|------------|
| **Uptime Target** | 99% availability during academic hours (8 AM – 8 PM) |
| **Graceful Degradation** | Shows error states with retry buttons on API failures |
| **Offline Behavior** | Not supported — requires active internet |

### 11.4 Usability

| Parameter | Requirement |
|-----------|------------|
| **Learnability** | New users can navigate the dashboard within 5 minutes |
| **Accessibility** | Semantic HTML5 elements used; keyboard navigation supported |
| **Responsive Design** | Fully responsive from 320px (mobile) to 2560px (ultrawide) |
| **Theme Support** | Light and Dark modes; persisted across sessions |
| **Feedback** | Toast notifications (Sonner) for all success/error operations |
| **Loading States** | Spinner with message during data fetching |
| **Error Handling** | User-friendly error messages with retry options |

---

## 12. Security Requirements

### 12.1 Authentication

| Requirement | Implementation |
|-------------|---------------|
| **Login Method** | Email + Password |
| **CAPTCHA** | 6-character alphanumeric CAPTCHA on login page |
| **Password Storage** | Hashed with bcrypt (server-side) |
| **Token Type** | JWT (access token: 30 min, refresh token: 7 days) |
| **Token Storage** | Access token in `localStorage`; refresh token as `httpOnly` cookie |
| **Silent Refresh** | Automatic token refresh on 401 (transparent to user) |

### 12.2 Authorization

| Requirement | Implementation |
|-------------|---------------|
| **Role-Based Access** | Three roles: `student`, `faculty`, `admin` |
| **Route Protection** | `ProtectedRoute` component checks role before rendering |
| **API Protection** | Backend middleware (`authenticate` + `authorize`) on every endpoint |
| **Unauthorized Access** | Redirects to `/unauthorized` (403 page) |
| **Unauthenticated Access** | Redirects to `/login` |

### 12.3 Communication Security

| Requirement | Specification |
|-------------|--------------|
| **HTTPS** | Recommended for production (refresh token cookie requires `secure: true`) |
| **CORS** | Configured on backend; `withCredentials: true` on client |
| **Cookie Policy** | `sameSite: lax` for CSRF mitigation |

### 12.4 Client-Side Security Considerations

| Area | Current Status |
|------|---------------|
| Access token in `localStorage` | Vulnerable to XSS — ensure no untrusted scripts are loaded |
| Refresh token as `httpOnly` cookie | Protected from JavaScript access |
| Input validation | Client-side validation via `validation.ts` (email, phone, password, date, academic year) |
| Error messages | Generic error messages to avoid information leakage |

---

## 13. User Interface Requirements

### 13.1 Design System

| Aspect | Specification |
|--------|--------------|
| **Framework** | shadcn/ui component library (Radix UI primitives) |
| **Color Scheme** | Light: Primary `#6366f1` (Indigo); Dark: Primary `#818cf8` |
| **Theme System** | Full color system with primary, secondary, success, warning, danger, info, background, surface, text, border, gradient |
| **Typography** | System font stack with TailwindCSS |
| **Icons** | Lucide React icon library |
| **Animations** | Framer Motion for page transitions, card reveals, and hover effects |

### 13.2 Page Requirements

| Page | Description |
|------|-------------|
| **Login** (`/login`) | Split layout — branding left, form right; animated background; CAPTCHA; show/hide password; remember me; theme toggle |
| **Student Dashboard** (`/student/dashboard`) | Two-column layout (profile sidebar + content area); profile card, subjects, attendance, assignments, tests, notices, fees, timetable, links |
| **Faculty Dashboard** (`/teacher/dashboard`) | Tabbed layout with Dashboard, Attendance, Assignments, Unit Tests, Internal Marks tabs |
| **Admin Dashboard** (`/admin`) | Tabbed layout with Dashboard, Departments, Teachers, Students, Courses, Timetable, Essential Links, Student Status tabs |
| **Not Found** (`*`) | 404 error page with navigation back to login |
| **Unauthorized** (`/unauthorized`) | 403 error page with navigation back to login |

### 13.3 Responsive Breakpoints

| Breakpoint | Layout Adaptation |
|------------|------------------|
| **< 640px** (Mobile) | Single column; stacked cards; collapsible navigation |
| **640px – 1024px** (Tablet) | Two-column where appropriate; condensed tables |
| **1024px – 1280px** (Desktop) | Full layout; side-by-side columns |
| **> 1280px** (Wide) | Max-width container (7xl = 1280px); centered content |

### 13.4 Component Library

The following reusable components are available across the application:

| Component | Purpose |
|-----------|---------|
| `Navbar` | Top navigation with logo, user info, theme toggle, logout |
| `DataTable` | Generic sortable table with action columns |
| `Modal` | Generic dialog overlay |
| `ConfirmDialog` | Destructive action confirmation |
| `FormInput` | Text input with label and error display |
| `FormSelect` | Dropdown select with label and error display |
| `StatCard` | Dashboard statistic card with icon |
| `LoadingSpinner` | Centered spinner with optional message |
| `ErrorComponent` | Error display with retry button |
| `NoticeMarquee` | Scrolling notice banner |
| `NoticeFormModal` | Notice creation form |

---

## 14. Data Requirements

### 14.1 Data Displayed to Students

| Data Entity | Fields Visible |
|-------------|---------------|
| **Profile** | Name, Email, Department, Year, Semester, Academic Year |
| **Subjects** | Course Code, Course Name |
| **Attendance** | Course Name, Total Classes, Present Count, Percentage |
| **Fees** | Total Fee, Paid Amount, Remaining Fee |
| **Timetable** | Day, Time Slot (Start–End), Course Name, Teacher Name |
| **Assignments** | Course Name, Title, Deadline, Submitted (Yes/No) |
| **Tests** | Course Name, Title, Test Date, Max Marks, Marks Obtained, Absent Status |
| **Notices** | Title, Message, Posted By (Admin/Faculty), Poster Name, Date |
| **Essential Links** | Title, URL (clickable) |

### 14.2 Data Displayed to Faculty

| Data Entity | Fields Visible |
|-------------|---------------|
| **Profile** | Name, Email, Department Name, Designation |
| **Courses** | Course Code, Course Name, Department Name |
| **Today's Schedule** | Time Slot, Course Name |
| **Statistics** | Total Students, Classes Per Week, Average Attendance |
| **Attendance Details** | Student Name, Present/Absent Count, Percentage |
| **Assignment Details** | Title, Deadline, Submission Count, Per-Student Status |
| **Test Details** | Title, Date, Max Marks, Per-Student Scores |
| **Internal Marks** | Student Name, Assignment Score, UT Score, Attendance Score, Total |

### 14.3 Data Managed by Admin

Full CRUD access to: Departments, Teachers, Students, Courses, Time Slots, Timetable Entries, Essential Links, Notices, and Student Status transitions (Promote, Detain, Re-enroll).

---

## 15. External Interface Requirements

### 15.1 REST API Endpoints (Client Consumes)

| Category | Base Prefix | Methods |
|----------|------------|---------|
| **Auth** | `/login` | POST (login), POST (refresh), POST (logout), GET (me) |
| **Student** | `/student` | GET (dashboard), GET (notices) |
| **Faculty** | `/teacher` | GET/POST (dashboard, attendance, assignments, tests, internal marks, notices) |
| **Admin** | `/admin` | GET/POST/PATCH/PUT/DELETE (all CRUD operations) |

### 15.2 WebSocket Events

| Event | Direction | Purpose |
|-------|-----------|---------|
| `connect` | Client ← Server | Connection established |
| `disconnect` | Client ← Server | Connection lost |
| `db_change` | Client ← Server | Database modified (triggers UI refresh) |

### 15.3 Client-Side Storage

| Storage | Key | Data | Persists |
|---------|-----|------|----------|
| `localStorage` | `token` | JWT access token | Until logout or cleared |
| `localStorage` | `user` | User profile JSON | Until logout or cleared |
| `localStorage` | `theme` | Dark/light preference | Indefinitely |
| `httpOnly` cookie | `refreshToken` | Refresh JWT | 7 days (server-set) |

---

## 16. Assumptions & Dependencies

### 16.1 Assumptions

1. Users have access to a device with a modern web browser and reliable internet connection.
2. User credentials (email and initial password) are created and provided by the system admin.
3. Students cannot self-register; all accounts are admin-created.
4. Users understand basic web navigation (clicking, typing, scrolling).
5. The academic institution has a consistent department-course-semester structure.
6. Fee amounts are predefined (₹85,000 for promotions; custom amount at student creation).

### 16.2 Dependencies

| Dependency | Description |
|------------|-------------|
| **Backend Server** | Node.js + Express 5 server running on port 3000 (or configured port) |
| **MySQL Database** | `clg_db` database with all required tables schema deployed |
| **Network Connectivity** | Active internet or LAN connection to reach the server |
| **DNS / URL Access** | Access to the application's domain or IP address |

### 16.3 Constraints

| Constraint | Description |
|------------|-------------|
| **No Offline Mode** | Application requires active connection; no PWA/offline caching |
| **No File Upload** | Current system does not support file upload for assignments (submission is marked as boolean) |
| **No Password Reset** | No self-service password reset; admin must reset passwords manually |
| **No Email Notifications** | All notifications are in-app only (no email/SMS integration) |
| **Single Language** | UI is English-only; no multi-language/i18n support |
| **Single Institution** | Designed for a single college; no multi-tenancy |

---

*End of Document*
