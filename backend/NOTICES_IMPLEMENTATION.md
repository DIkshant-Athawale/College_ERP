# Backend — Notices Implementation Guide

## Overview

Add a **notices system** so admins and faculty can post text notices, and all roles can view them. The frontend marquee shows the **latest 10 notices from the past 7 days**.

Currently, both `admin.js` and `teacher.js` have `//notices` placeholder comments (lines 11–12) but **no implementation exists**. The student dashboard endpoint (`GET /student/dashboard`) does **not** return notices.

---

## 1. Database: Create `notices` Table

Run this SQL in the `clg_db` database:

```sql
CREATE TABLE notices (
  notice_id    INT AUTO_INCREMENT PRIMARY KEY,
  title        VARCHAR(255) NOT NULL,
  message      TEXT NOT NULL,
  posted_by    ENUM('admin', 'faculty') NOT NULL,
  posted_by_id INT NOT NULL,            -- teacher_id of the poster
  department_id INT DEFAULT NULL,        -- NULL = broadcast to ALL departments
  posted_at    DATETIME DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_posted_at (posted_at),
  INDEX idx_department (department_id),

  FOREIGN KEY (posted_by_id) REFERENCES teachers(teacher_id),
  FOREIGN KEY (department_id) REFERENCES department(department_id)
);
```

### Key Design Decisions

| Column | Purpose |
|---|---|
| `posted_by` | `'admin'` or `'faculty'` — determines badge color on frontend |
| `posted_by_id` | FK to `teachers` table (admins are also in `teachers` with `role='admin'`) |
| `department_id` | `NULL` = visible to everyone (admin broadcasts). Non-null = only visible to that department's students/faculty |

---

## 2. API Routes

### 2a. `POST /admin/notices` — Admin creates a notice

**File:** `routes/admin.js` (add below the `//notices` comment, line 11)

```js
// Create a notice (admin — broadcasts to all)
router.post(
  "/notices",
  authenticate,
  authorize("admin"),
  async (req, res) => {
    const { title, message } = req.body;

    if (!title || !message) {
      return res.status(400).json({ message: "title and message are required" });
    }

    try {
      const [result] = await pool.execute(
        `INSERT INTO notices (title, message, posted_by, posted_by_id, department_id)
         VALUES (?, ?, 'admin', ?, NULL)`,
        [title.trim(), message.trim(), req.user.userId]
      );

      res.status(201).json({
        message: "Notice posted",
        notice_id: result.insertId,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);
```

### 2b. `POST /teacher/notices` — Faculty creates a notice

**File:** `routes/teacher.js` (add below the `//notice` comment, line 12)

```js
// Create a notice (faculty — targeted to their department)
router.post(
  "/notices",
  authenticate,
  authorize("faculty"),
  async (req, res) => {
    const { title, message } = req.body;
    const teacher_id = req.user.userId;

    if (!title || !message) {
      return res.status(400).json({ message: "title and message are required" });
    }

    try {
      // Get the teacher's department
      const [teacher] = await pool.execute(
        `SELECT department_id FROM teachers WHERE teacher_id = ?`,
        [teacher_id]
      );

      if (teacher.length === 0) {
        return res.status(404).json({ message: "Teacher not found" });
      }

      const [result] = await pool.execute(
        `INSERT INTO notices (title, message, posted_by, posted_by_id, department_id)
         VALUES (?, ?, 'faculty', ?, ?)`,
        [title.trim(), message.trim(), teacher_id, teacher[0].department_id]
      );

      res.status(201).json({
        message: "Notice posted",
        notice_id: result.insertId,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);
```

### 2c. `GET /student/notices/recent` — Student fetches recent notices

**File:** `routes/student.js`

Students see: **admin notices (dept NULL)** + **faculty notices targeting their department**.

```js
// Recent notices for the student's department
router.get(
  "/notices/recent",
  authenticate,
  authorize("student"),
  async (req, res) => {
    const student_id = req.user.userId;

    try {
      const [student] = await pool.execute(
        `SELECT department_id FROM students WHERE student_id = ?`,
        [student_id]
      );

      if (student.length === 0) {
        return res.status(404).json({ message: "Student not found" });
      }

      const dept_id = student[0].department_id;

      const [notices] = await pool.execute(
        `SELECT 
            n.notice_id,
            n.title,
            n.message,
            n.posted_by,
            CONCAT(t.first_name, ' ', t.last_name) AS posted_by_name,
            n.posted_at
         FROM notices n
         JOIN teachers t ON n.posted_by_id = t.teacher_id
         WHERE n.posted_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
           AND (n.department_id IS NULL OR n.department_id = ?)
         ORDER BY n.posted_at DESC
         LIMIT 10`,
        [dept_id]
      );

      res.json({ notices });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);
```

### 2d. `GET /teacher/notices/recent` — Faculty fetches recent notices

**File:** `routes/teacher.js`

Faculty see: **admin notices** + **their own notices**.

```js
// Recent notices visible to this teacher
router.get(
  "/notices/recent",
  authenticate,
  authorize("faculty"),
  async (req, res) => {
    const teacher_id = req.user.userId;

    try {
      const [teacher] = await pool.execute(
        `SELECT department_id FROM teachers WHERE teacher_id = ?`,
        [teacher_id]
      );

      if (teacher.length === 0) {
        return res.status(404).json({ message: "Teacher not found" });
      }

      const dept_id = teacher[0].department_id;

      const [notices] = await pool.execute(
        `SELECT 
            n.notice_id,
            n.title,
            n.message,
            n.posted_by,
            CONCAT(t.first_name, ' ', t.last_name) AS posted_by_name,
            n.posted_at
         FROM notices n
         JOIN teachers t ON n.posted_by_id = t.teacher_id
         WHERE n.posted_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
           AND (n.department_id IS NULL OR n.department_id = ?)
         ORDER BY n.posted_at DESC
         LIMIT 10`,
        [dept_id]
      );

      res.json({ notices });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);
```

### 2e. `GET /admin/notices/recent` — Admin fetches ALL recent notices

**File:** `routes/admin.js`

Admin sees **all notices** (from admin + all faculty).

```js
// Recent notices — admin sees everything
router.get(
  "/notices/recent",
  authenticate,
  authorize("admin"),
  async (req, res) => {
    try {
      const [notices] = await pool.execute(
        `SELECT 
            n.notice_id,
            n.title,
            n.message,
            n.posted_by,
            CONCAT(t.first_name, ' ', t.last_name) AS posted_by_name,
            n.posted_at
         FROM notices n
         JOIN teachers t ON n.posted_by_id = t.teacher_id
         WHERE n.posted_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
         ORDER BY n.posted_at DESC
         LIMIT 10`
      );

      res.json({ notices });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);
```

---

## 3. Visibility Rules Summary

| Viewer | Sees Admin Notices | Sees Faculty Notices |
|---|---|---|
| **Admin** | ✅ All | ✅ All (every department) |
| **Faculty** | ✅ All (dept=NULL) | ✅ Only own department |
| **Student** | ✅ All (dept=NULL) | ✅ Only own department |

---

## 4. Frontend API Integration Needed

After these backend routes are added, update the frontend:

| File | Change |
|---|---|
| `api/student.ts` | Add `getRecentNotices()` → `GET /student/notices/recent` |
| `api/faculty.ts` | Add `getRecentNotices()` → `GET /teacher/notices/recent` |
| `api/admin.ts` *(new or existing)* | Add `getRecentNotices()` → `GET /admin/notices/recent` |
| `StudentDashboard.tsx` | Call the new API, pass to `<NoticeMarquee>` |
| `FacultyDashboard.tsx` | Replace `TODO` stub with real API call |
| `AdminDashboard.tsx` | Replace `TODO` stub with real API call |

---

## 5. Quick Test

After adding the table and routes:

```bash
# 1. Create table
mysql -u root -p1234 clg_db < "paste the CREATE TABLE above"

# 2. Insert a test notice
curl -X POST http://localhost:3000/admin/notices \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Welcome Back","message":"Classes resume from Monday. Check your timetable."}'

# 3. Fetch recent notices
curl http://localhost:3000/admin/notices/recent \
  -H "Authorization: Bearer <admin_token>"
```
