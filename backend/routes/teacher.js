import express from 'express';
import pool from "../config/connect_db.js";
import authenticate from '../middleware/auth.js';
import authorize from '../middleware/authorize.js';



const router = express.Router();


//course progress tracking

// ========================
// NOTICES
// ========================

// Create a notice (faculty — scoped to their department)
router.post(
  "/notices",
  authenticate,
  authorize("faculty"),
  async (req, res) => {
    const { title, message, department_id, year, target_audience } = req.body;
    const teacher_id = req.user.userId;

    if (!title || !message) {
      return res.status(400).json({ message: "title and message are required" });
    }

    try {
      // Get the teacher's department (used as fallback)
      const [teacher] = await pool.execute(
        `SELECT department_id FROM teachers WHERE teacher_id = ?`,
        [teacher_id]
      );

      if (teacher.length === 0) {
        return res.status(404).json({ message: "Teacher not found" });
      }

      const [result] = await pool.execute(
        `INSERT INTO notices (title, message, posted_by, posted_by_id, department_id, year, target_audience)
         VALUES (?, ?, 'faculty', ?, ?, ?, ?)`,
        [title.trim(), message.trim(), teacher_id,
        department_id || teacher[0].department_id, year || null, target_audience || 'all']
      );

      const io = req.app.get('io');
      if (io) {
        io.emit('refresh_notices', { message: 'New notice from faculty' });
      }

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

// Get recent notices visible to this teacher (admin broadcasts + own department)
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
            n.posted_at,
            n.department_id,
            n.year,
            n.target_audience
         FROM notices n
         JOIN teachers t ON n.posted_by_id = t.teacher_id
         WHERE n.posted_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
           AND (n.department_id IS NULL OR n.department_id = ?)
           AND n.target_audience IN ('all', 'teachers')
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



//teachers dashboard 
router.get(
  "/dashboard",
  authenticate,
  authorize("faculty"),
  async (req, res) => {

    try {

      const teacher_id = req.user.userId;

      // 1️⃣ Teacher profile
      const [rows] = await pool.query(
        `SELECT 
            t.teacher_id,
            t.first_name,
            t.last_name,
            t.email,
            t.primary_phone,
            t.designation,
            t.department_id,
            d.department_name
         FROM teachers t
         JOIN department d 
           ON t.department_id = d.department_id
         WHERE t.teacher_id = ?`,
        [teacher_id]
      );

      if (rows.length === 0) {
        return res.status(404).json({ message: "No teacher found" });
      }

      // Assigned courses
      const [teaches] = await pool.query(
        `SELECT 
            course_id,
            course_code,
            course_name,
            year,
            semester
         FROM courses
         WHERE teacher_id = ?`,
        [teacher_id]
      );

      // Today's timetable
      const today = new Date().toLocaleString('en-US', { weekday: 'long' });

      const [todaySchedule] = await pool.query(
        `SELECT 
            tt.day,
            ts.start_time,
            ts.end_time,
            c.course_id,
            c.course_name,
            c.course_code,
            c.semester
         FROM timetable tt
         JOIN courses c 
           ON tt.course_id = c.course_id
         JOIN time_slots ts 
           ON tt.slot_id = ts.slot_id
         WHERE c.teacher_id = ?
           AND tt.day = ?
         ORDER BY ts.start_time ASC`,
        [teacher_id, today]
      );

      // 4️⃣ Stats Calculations

      // Total Students (Unique count across all taught courses)
      const [studentCount] = await pool.query(
        `SELECT COUNT(DISTINCT e.student_id) as total_students
         FROM enrollments e
         JOIN courses c ON e.course_id = c.course_id
         JOIN students s ON e.student_id = s.student_id
         WHERE c.teacher_id = ? AND s.status = 'active'`,
        [teacher_id]
      );

      // Classes Per Week (Count slots in timetable)
      const [timetableCount] = await pool.query(
        `SELECT COUNT(*) as unique_slots
         FROM timetable t
         JOIN courses c ON t.course_id = c.course_id
         WHERE c.teacher_id = ?`,
        [teacher_id]
      );

      // Average Attendance (Across all courses)
      const [attendanceStats] = await pool.query(
        `SELECT 
            COALESCE(SUM(CASE WHEN ar.status = 'present' THEN 1 ELSE 0 END), 0) as total_present,
            COUNT(ar.record_id) as total_records
         FROM attendance_records ar
         JOIN attendance_sessions s ON ar.session_id = s.session_id
         JOIN courses c ON s.course_id = c.course_id
         WHERE c.teacher_id = ?`,
        [teacher_id]
      );

      const totalRecords = attendanceStats[0].total_records;
      const totalPresent = attendanceStats[0].total_present;
      const avgAttendance = totalRecords > 0 ? ((totalPresent / totalRecords) * 100).toFixed(1) : 0;

      // Essential links
      const [essentialLinksData] = await pool.execute(
        `SELECT link_id, title, url FROM essential_links ORDER BY link_id DESC`
      );

      res.json({
        profile: rows[0],
        teaches: teaches,
        today_timetable: todaySchedule,
        stats: {
          total_students: studentCount[0].total_students || 0,
          classes_per_week: timetableCount[0].unique_slots || 0,
          avg_attendance: avgAttendance
        },
        essential_links: essentialLinksData
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);



// Total Sessions Per Course (Current Academic Batch Only)
router.get(
  "/courses/attendance-summary",
  authenticate,
  authorize("faculty", "admin"),
  async (req, res) => {

    const teacher_id = req.user.userId;

    try {

      const [courses] = await pool.execute(
        `SELECT 
          c.course_id,
          c.course_name,
          c.course_code,
          COUNT(DISTINCT s.session_id) AS total_sessions
      FROM courses c
      LEFT JOIN enrollments e 
          ON c.course_id = e.course_id
      LEFT JOIN students st 
          ON e.student_id = st.student_id
          AND st.status = 'active'
          AND e.academic_year = st.academic_year
      LEFT JOIN attendance_sessions s 
          ON c.course_id = s.course_id
          AND s.academic_year = st.academic_year
      WHERE c.teacher_id = ?
      GROUP BY c.course_id`,
        [teacher_id]
      );

      res.json({ courses });

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);
// Student-wise Attendance Detail (Current Academic Batch Only)
router.get(
  "/courses/:course_id/attendance",
  authenticate,
  authorize("faculty", "admin"),
  async (req, res) => {

    const { course_id } = req.params;
    const teacher_id = req.user.userId;

    try {

      // 1️⃣ Verify teacher owns course
      const [course] = await pool.execute(
        `SELECT course_id 
         FROM courses 
         WHERE course_id = ? AND teacher_id = ?`,
        [course_id, teacher_id]
      );

      if (course.length === 0) {
        return res.status(403).json({ message: "Unauthorized access" });
      }

      // 2️⃣ Get current academic_year from active students
      const [yearRow] = await pool.execute(
        `SELECT DISTINCT e.academic_year
         FROM enrollments e
         JOIN students st 
            ON e.student_id = st.student_id
         WHERE e.course_id = ?
           AND st.status = 'active'
           AND e.academic_year = st.academic_year
         LIMIT 1`,
        [course_id]
      );

      if (yearRow.length === 0) {
        return res.json({
          course_id,
          total_sessions: 0,
          students: []
        });
      }

      const academic_year = yearRow[0].academic_year;

      // 3️⃣ Count total sessions correctly (NO JOIN)
      const [sessionCount] = await pool.execute(
        `SELECT COUNT(*) AS total_sessions
         FROM attendance_sessions
         WHERE course_id = ?
           AND academic_year = ?`,
        [course_id, academic_year]
      );

      const totalSessions = sessionCount[0].total_sessions;

      // 4️⃣ Get student attendance
      const [students] = await pool.execute(
        `SELECT 
            st.student_id,
            st.first_name,
            st.last_name,
            COUNT(CASE WHEN ar.status = 'present' THEN 1 END) AS attended_sessions
         FROM enrollments e
         JOIN students st 
            ON e.student_id = st.student_id
         LEFT JOIN attendance_sessions s 
            ON e.course_id = s.course_id
            AND s.academic_year = e.academic_year
         LEFT JOIN attendance_records ar 
            ON s.session_id = ar.session_id
            AND st.student_id = ar.student_id
         WHERE e.course_id = ?
           AND st.status = 'active'
           AND e.academic_year = ?
         GROUP BY st.student_id, st.first_name, st.last_name`,
        [course_id, academic_year]
      );

      // 5️⃣ Calculate percentage
      const result = students.map(st => ({
        student_id: st.student_id,
        first_name: st.first_name,
        last_name: st.last_name,
        attended_sessions: st.attended_sessions,
        total_sessions: totalSessions,
        attendance_percentage:
          totalSessions > 0
            ? ((st.attended_sessions / totalSessions) * 100).toFixed(2)
            : "0.00"
      }));

      res.json({
        course_id,
        academic_year,
        total_sessions: totalSessions,
        students: result
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);





//get all courses of the teacher
router.get(
  "/attendance/my-courses",
  authenticate,
  authorize("faculty"),
  async (req, res) => {

    const teacher_id = req.user.userId;

    try {

      const [courses] = await pool.execute(
        `SELECT 
            course_id,
            course_code,
            course_name,
            semester
         FROM courses
         WHERE teacher_id = ?
         ORDER BY semester`,
        [teacher_id]
      );

      res.json({ courses });

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error fetching courses" });
    }
  }
);
//creating a attendance session
router.post(
  "/attendance/session",
  authenticate,
  authorize("faculty", "admin"),
  async (req, res) => {

    const { course_id, session_date } = req.body;
    const teacher_id = req.user.userId;

    if (!course_id || !session_date) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    try {

      // Verify teacher teaches this course
      const [course] = await pool.execute(
        `SELECT course_id 
         FROM courses 
         WHERE course_id = ? AND teacher_id = ?`,
        [course_id, teacher_id]
      );

      if (course.length === 0) {
        return res.status(403).json({ message: "Not authorized for this course" });
      }

      //Fetch academic_year from enrollments
      const [enrollment] = await pool.execute(
        `SELECT academic_year
         FROM enrollments
         WHERE course_id = ?
         LIMIT 1`,
        [course_id]
      );

      if (enrollment.length === 0) {
        return res.status(400).json({ message: "No students enrolled for this course" });
      }

      const academic_year = enrollment[0].academic_year;

      //Insert attendance session
      const [result] = await pool.execute(
        `INSERT INTO attendance_sessions
         (course_id, session_date, created_by, academic_year)
         VALUES (?, ?, ?, ?)`,
        [course_id, session_date, teacher_id, academic_year]
      );

      res.status(201).json({
        message: "Attendance session created",
        session_id: result.insertId
      });

    } catch (error) {

      console.error(error);

      if (error.code === "ER_DUP_ENTRY") {
        return res.status(409).json({
          message: "Session already exists for this date"
        });
      }

      res.status(500).json({ message: "Internal server error" });
    }
  }
);
//eligible students for attendance and marks attendance
router.get(
  "/attendance/session/:session_id/students",
  authenticate,
  authorize("faculty", "admin"),
  async (req, res) => {

    const { session_id } = req.params;
    const teacher_id = req.user.userId;

    try {

      // 1️⃣ Fetch session + verify teacher ownership
      const [session] = await pool.execute(
        `SELECT s.course_id, s.academic_year
         FROM attendance_sessions s
         JOIN courses c ON s.course_id = c.course_id
         WHERE s.session_id = ?
           AND c.teacher_id = ?`,
        [session_id, teacher_id]
      );

      if (session.length === 0) {
        return res.status(403).json({ message: "Unauthorized session access" });
      }

      const course_id = session[0].course_id;
      const academic_year = session[0].academic_year;

      const [students] = await pool.execute(
        `SELECT st.student_id, st.first_name, st.last_name
        FROM enrollments e
        JOIN students st ON e.student_id = st.student_id
        WHERE e.course_id = ?
          AND e.academic_year = ?
          AND st.status = 'active'`,
        [course_id, academic_year]
      );


      res.json({
        session_id,
        students
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);
//submit attendance
router.post("/attendance/submit", authenticate, authorize("faculty", "admin"),
  async (req, res) => {
    const { session_id, attendance } = req.body;
    const teacher_id = req.user.userId;

    if (!session_id || !Array.isArray(attendance)) {
      return res.status(400).json({ message: "Invalid request" });
    }

    const conn = await pool.getConnection();

    try {
      await conn.beginTransaction();

      // Verify session ownership
      const [session] = await conn.execute(
        `SELECT s.course_id
           FROM attendance_sessions s
           JOIN courses c ON s.course_id = c.course_id
           WHERE s.session_id = ? AND c.teacher_id = ?`,
        [session_id, teacher_id]
      );

      if (session.length === 0) {
        await conn.rollback();
        return res.status(403).json({ message: "Unauthorized session" });
      }

      const values = attendance.map(a => [
        session_id,
        a.student_id,
        a.status
      ]);

      // Insert attendance records
      await conn.query(
        `INSERT INTO attendance_records (session_id, student_id, status)
           VALUES ?`,
        [values]
      );

      await conn.commit();

      res.json({ message: "Attendance submitted successfully" });

    } catch (error) {
      await conn.rollback();
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    } finally {
      conn.release();
    }
  }
);


//entire timetable
router.get(
  "/entire_timetable",
  authenticate,
  authorize("faculty"),
  async (req, res) => {

    const teacher_id = req.user.userId;

    try {
      // 1. Get semesters taught by the teacher
      const [semesters] = await pool.execute(
        `SELECT DISTINCT semester FROM courses WHERE teacher_id = ?`,
        [teacher_id]
      );

      if (semesters.length === 0) {
        return res.json({ timetable: [] });
      }

      const semesterList = semesters.map(s => s.semester);

      // 2. Fetch timetable for those semesters (all subjects)
      const [rows] = await pool.query(
        `SELECT 
            t.semester,
            t.day,
            ts.start_time,
            ts.end_time,
            t.slot_id AS slot,
            c.course_code,
            c.course_name,
            te.first_name AS teacher_first_name,
            te.last_name AS teacher_last_name
         FROM timetable t
         JOIN courses c ON t.course_id = c.course_id
         JOIN teachers te ON c.teacher_id = te.teacher_id
         JOIN time_slots ts ON t.slot_id = ts.slot_id
         WHERE t.semester IN (?)
         ORDER BY t.semester,
                  FIELD(t.day,'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'),
                  ts.start_time`,
        [semesterList]
      );

      res.json({ timetable: rows });

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);



// ========================
// ASSIGNMENT MANAGEMENT
// ========================

// 1. Create an assignment for a course
router.post(
  "/assignments",
  authenticate,
  authorize("faculty", "admin"),
  async (req, res) => {

    const { course_id, title, deadline } = req.body;
    const teacher_id = req.user.userId;

    if (!course_id || !title) {
      return res.status(400).json({ message: "course_id and title are required" });
    }

    try {

      // Verify teacher owns this course
      const [course] = await pool.execute(
        `SELECT course_id FROM courses WHERE course_id = ? AND teacher_id = ?`,
        [course_id, teacher_id]
      );

      if (course.length === 0) {
        return res.status(403).json({ message: "Not authorized for this course" });
      }

      const [result] = await pool.execute(
        `INSERT INTO assignments (course_id, title, deadline, created_by)
         VALUES (?, ?, ?, ?)`,
        [course_id, title.trim(), deadline || null, teacher_id]
      );

      res.status(201).json({
        message: "Assignment created",
        assignment_id: result.insertId
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// 2. List all assignments for a course
router.get(
  "/assignments/:course_id",
  authenticate,
  authorize("faculty", "admin"),
  async (req, res) => {

    const { course_id } = req.params;
    const teacher_id = req.user.userId;

    try {

      // Verify teacher owns this course
      const [course] = await pool.execute(
        `SELECT course_id FROM courses WHERE course_id = ? AND teacher_id = ?`,
        [course_id, teacher_id]
      );

      if (course.length === 0) {
        return res.status(403).json({ message: "Not authorized for this course" });
      }

      const [assignments] = await pool.execute(
        `SELECT 
            a.assignment_id,
            a.title,
            a.deadline,
            a.created_at,
            COUNT(asub.submission_id) AS total_submissions
         FROM assignments a
         LEFT JOIN assignment_submissions asub 
            ON a.assignment_id = asub.assignment_id
            AND asub.submitted = TRUE
         WHERE a.course_id = ?
         GROUP BY a.assignment_id
         ORDER BY a.created_at ASC`,
        [course_id]
      );

      res.json({ course_id: Number(course_id), assignments });

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// 3. Delete an assignment
router.delete(
  "/assignments/:assignment_id",
  authenticate,
  authorize("faculty", "admin"),
  async (req, res) => {

    const { assignment_id } = req.params;
    const teacher_id = req.user.userId;

    try {

      // Verify teacher owns the assignment's course
      const [assignment] = await pool.execute(
        `SELECT a.assignment_id
         FROM assignments a
         JOIN courses c ON a.course_id = c.course_id
         WHERE a.assignment_id = ? AND c.teacher_id = ?`,
        [assignment_id, teacher_id]
      );

      if (assignment.length === 0) {
        return res.status(403).json({ message: "Not authorized or assignment not found" });
      }

      // CASCADE will remove related submissions
      await pool.execute(
        `DELETE FROM assignments WHERE assignment_id = ?`,
        [assignment_id]
      );

      res.json({ message: "Assignment deleted successfully" });

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// 4. Batch mark submissions for an assignment
router.post(
  "/assignments/:assignment_id/submissions",
  authenticate,
  authorize("faculty", "admin"),
  async (req, res) => {

    const { assignment_id } = req.params;
    const { submissions } = req.body;
    const teacher_id = req.user.userId;

    if (!Array.isArray(submissions) || submissions.length === 0) {
      return res.status(400).json({ message: "submissions array is required" });
    }

    const conn = await pool.getConnection();

    try {
      await conn.beginTransaction();

      // Verify teacher owns the assignment's course
      const [assignment] = await conn.execute(
        `SELECT a.assignment_id, a.course_id
         FROM assignments a
         JOIN courses c ON a.course_id = c.course_id
         WHERE a.assignment_id = ? AND c.teacher_id = ?`,
        [assignment_id, teacher_id]
      );

      if (assignment.length === 0) {
        await conn.rollback();
        return res.status(403).json({ message: "Not authorized or assignment not found" });
      }

      for (const sub of submissions) {
        const { student_id, submitted } = sub;

        if (!student_id || submitted === undefined) continue;

        const submittedAt = submitted ? new Date() : null;

        // INSERT or UPDATE if already exists
        await conn.execute(
          `INSERT INTO assignment_submissions (assignment_id, student_id, submitted, submitted_at)
           VALUES (?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE submitted = VALUES(submitted), submitted_at = VALUES(submitted_at)`,
          [assignment_id, student_id, submitted ? 1 : 0, submittedAt]
        );
      }

      await conn.commit();

      res.json({ message: "Submissions updated successfully" });

    } catch (error) {
      await conn.rollback();
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    } finally {
      conn.release();
    }
  }
);

// 5. Get submission status for all enrolled students of an assignment
router.get(
  "/assignments/:assignment_id/submissions",
  authenticate,
  authorize("faculty", "admin"),
  async (req, res) => {

    const { assignment_id } = req.params;
    const teacher_id = req.user.userId;

    try {

      // Verify teacher owns the assignment's course + get assignment info
      const [assignmentRows] = await pool.execute(
        `SELECT a.assignment_id, a.title, a.deadline, a.course_id
         FROM assignments a
         JOIN courses c ON a.course_id = c.course_id
         WHERE a.assignment_id = ? AND c.teacher_id = ?`,
        [assignment_id, teacher_id]
      );

      if (assignmentRows.length === 0) {
        return res.status(403).json({ message: "Not authorized or assignment not found" });
      }

      const assignmentInfo = assignmentRows[0];

      // Get all enrolled active students with their submission status
      const [students] = await pool.execute(
        `SELECT 
            st.student_id,
            st.first_name,
            st.last_name,
            COALESCE(asub.submitted, FALSE) AS submitted,
            asub.submitted_at
         FROM enrollments e
         JOIN students st ON e.student_id = st.student_id
         LEFT JOIN assignment_submissions asub 
            ON asub.assignment_id = ?
            AND asub.student_id = st.student_id
         WHERE e.course_id = ?
           AND st.status = 'active'
         ORDER BY st.first_name, st.last_name`,
        [assignment_id, assignmentInfo.course_id]
      );

      res.json({
        assignment_id: assignmentInfo.assignment_id,
        title: assignmentInfo.title,
        deadline: assignmentInfo.deadline,
        students
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);


// ========================
// UNIT TEST MANAGEMENT
// ========================

// 1. Create a unit test for a course
router.post(
  "/tests",
  authenticate,
  authorize("faculty", "admin"),
  async (req, res) => {

    const { course_id, title, test_date, max_marks } = req.body;
    const teacher_id = req.user.userId;

    if (!course_id || !title || max_marks === undefined) {
      return res.status(400).json({ message: "course_id, title, and max_marks are required" });
    }

    try {
      // Verify teacher owns this course
      const [course] = await pool.execute(
        `SELECT course_id FROM courses WHERE course_id = ? AND teacher_id = ?`,
        [course_id, teacher_id]
      );

      if (course.length === 0) {
        return res.status(403).json({ message: "Not authorized for this course" });
      }

      const [result] = await pool.execute(
        `INSERT INTO unit_tests (course_id, title, test_date, max_marks, created_by)
         VALUES (?, ?, ?, ?, ?)`,
        [course_id, title.trim(), test_date || null, max_marks, teacher_id]
      );

      res.status(201).json({
        message: "Test created successfully",
        test_id: result.insertId
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// 2. List all tests for a course
router.get(
  "/tests/:course_id",
  authenticate,
  authorize("faculty", "admin"),
  async (req, res) => {

    const { course_id } = req.params;
    const teacher_id = req.user.userId;

    try {
      // Verify teacher owns this course
      const [course] = await pool.execute(
        `SELECT course_id FROM courses WHERE course_id = ? AND teacher_id = ?`,
        [course_id, teacher_id]
      );

      if (course.length === 0) {
        return res.status(403).json({ message: "Not authorized for this course" });
      }

      const [tests] = await pool.execute(
        `SELECT 
            t.test_id,
            t.title,
            t.test_date,
            t.max_marks,
            t.created_at,
            COUNT(ts.score_id) AS total_scored
         FROM unit_tests t
         LEFT JOIN test_scores ts 
            ON t.test_id = ts.test_id
         WHERE t.course_id = ?
         GROUP BY t.test_id
         ORDER BY t.created_at ASC`,
        [course_id]
      );

      res.json({ course_id: Number(course_id), tests });

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// 3. Delete a test
router.delete(
  "/tests/:test_id",
  authenticate,
  authorize("faculty", "admin"),
  async (req, res) => {

    const { test_id } = req.params;
    const teacher_id = req.user.userId;

    try {
      // Verify teacher owns the test's course
      const [test] = await pool.execute(
        `SELECT t.test_id
         FROM unit_tests t
         JOIN courses c ON t.course_id = c.course_id
         WHERE t.test_id = ? AND c.teacher_id = ?`,
        [test_id, teacher_id]
      );

      if (test.length === 0) {
        return res.status(403).json({ message: "Not authorized or test not found" });
      }

      // CASCADE will remove related test_scores
      await pool.execute(
        `DELETE FROM unit_tests WHERE test_id = ?`,
        [test_id]
      );

      res.json({ message: "Test deleted successfully" });

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// 4. Batch update test scores
router.post(
  "/tests/:test_id/scores",
  authenticate,
  authorize("faculty", "admin"),
  async (req, res) => {

    const { test_id } = req.params;
    const { scores } = req.body;
    const teacher_id = req.user.userId;

    if (!Array.isArray(scores) || scores.length === 0) {
      return res.status(400).json({ message: "scores array is required" });
    }

    const conn = await pool.getConnection();

    try {
      await conn.beginTransaction();

      // Verify teacher owns the test's course
      const [test] = await conn.execute(
        `SELECT t.test_id, t.course_id, t.max_marks
         FROM unit_tests t
         JOIN courses c ON t.course_id = c.course_id
         WHERE t.test_id = ? AND c.teacher_id = ?`,
        [test_id, teacher_id]
      );

      if (test.length === 0) {
        await conn.rollback();
        return res.status(403).json({ message: "Not authorized or test not found" });
      }

      for (const sc of scores) {
        const { student_id, marks_obtained, is_absent } = sc;

        if (!student_id) continue;

        const absent = !!is_absent;
        const marks = absent ? null : (marks_obtained !== undefined ? marks_obtained : null);

        // INSERT or UPDATE if already exists
        await conn.execute(
          `INSERT INTO test_scores (test_id, student_id, marks_obtained, is_absent)
           VALUES (?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE marks_obtained = VALUES(marks_obtained), is_absent = VALUES(is_absent)`,
          [test_id, student_id, marks, absent ? 1 : 0]
        );
      }

      await conn.commit();
      res.json({ message: "Scores updated successfully" });

    } catch (error) {
      await conn.rollback();
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    } finally {
      conn.release();
    }
  }
);

// 5. Get scores for all enrolled students
router.get(
  "/tests/:test_id/scores",
  authenticate,
  authorize("faculty", "admin"),
  async (req, res) => {

    const { test_id } = req.params;
    const teacher_id = req.user.userId;

    try {
      // Verify teacher owns the test's course + get test info
      const [testRows] = await pool.execute(
        `SELECT t.test_id, t.title, t.test_date, t.max_marks, t.course_id
         FROM unit_tests t
         JOIN courses c ON t.course_id = c.course_id
         WHERE t.test_id = ? AND c.teacher_id = ?`,
        [test_id, teacher_id]
      );

      if (testRows.length === 0) {
        return res.status(403).json({ message: "Not authorized or test not found" });
      }

      const testInfo = testRows[0];

      // Get all active students with their scores
      const [students] = await pool.execute(
        `SELECT 
            st.student_id,
            st.first_name,
            st.last_name,
            ts.marks_obtained,
            COALESCE(ts.is_absent, FALSE) AS is_absent
         FROM enrollments e
         JOIN students st ON e.student_id = st.student_id
         LEFT JOIN test_scores ts 
            ON ts.test_id = ?
            AND ts.student_id = st.student_id
         WHERE e.course_id = ?
           AND st.status = 'active'
         ORDER BY st.first_name, st.last_name`,
        [test_id, testInfo.course_id]
      );

      res.json({
        test_id: testInfo.test_id,
        title: testInfo.title,
        test_date: testInfo.test_date,
        max_marks: testInfo.max_marks,
        students
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// ==========================================
// 🎓 INTERNAL MARKS (STATELESS)
// ==========================================

router.get(
  "/internal-marks/calculate/:course_id",
  authenticate,
  authorize("faculty", "admin"),
  async (req, res) => {
    const { course_id } = req.params;
    const teacher_id = req.user.userId;

    const aw = parseFloat(req.query.aw) || 5;
    const utw = parseFloat(req.query.utw) || 10;
    const atw = parseFloat(req.query.atw) || 5;

    try {
      // 1. Verify Ownership & Get Academic Year
      const [enrollmentsInfo] = await pool.execute(
        `SELECT e.academic_year
         FROM enrollments e
         JOIN courses c ON e.course_id = c.course_id
         WHERE c.course_id = ? AND c.teacher_id = ?
         LIMIT 1`,
        [course_id, teacher_id]
      );

      if (enrollmentsInfo.length === 0) {
        // Might be no enrollments, check if they just own the course
        const [courseRows] = await pool.execute(
          `SELECT course_id FROM courses WHERE course_id = ? AND teacher_id = ?`,
          [course_id, teacher_id]
        );
        if (courseRows.length === 0) return res.status(403).json({ message: "Not authorized for this course" });
        return res.json([]); // No students enrolled
      }

      const academic_year = enrollmentsInfo[0].academic_year;

      // 2. Get All Enrolled Students
      const [students] = await pool.execute(
        `SELECT st.student_id, st.first_name, st.last_name
         FROM enrollments e
         JOIN students st ON e.student_id = st.student_id
         WHERE e.course_id = ? AND e.academic_year = ? AND st.status = 'active'
         ORDER BY st.first_name, st.last_name`,
        [course_id, academic_year]
      );

      // 3. Get Absolute Totals
      const [[{ total_assignments }]] = await pool.execute(`SELECT COUNT(*) as total_assignments FROM assignments WHERE course_id = ?`, [course_id]);
      const [[{ total_test_marks }]] = await pool.execute(`SELECT SUM(max_marks) as total_test_marks FROM unit_tests WHERE course_id = ?`, [course_id]);
      const [[{ total_sessions }]] = await pool.execute(`SELECT COUNT(*) as total_sessions FROM attendance_sessions WHERE course_id = ?`, [course_id]);

      // 4. Get Student Aggregates (Assignments)
      const [assignmentStats] = await pool.execute(
        `SELECT sub.student_id, COUNT(*) as submitted_count 
         FROM assignment_submissions sub 
         JOIN assignments a ON sub.assignment_id = a.assignment_id 
         WHERE a.course_id = ? AND sub.submitted = TRUE 
         GROUP BY sub.student_id`,
        [course_id]
      );

      // 5. Get Student Aggregates (Unit Tests)
      const [testStats] = await pool.execute(
        `SELECT ts.student_id, SUM(ts.marks_obtained) as total_obtained 
         FROM test_scores ts 
         JOIN unit_tests ut ON ts.test_id = ut.test_id 
         WHERE ut.course_id = ? AND ts.is_absent = FALSE 
         GROUP BY ts.student_id`,
        [course_id]
      );

      // 6. Get Student Aggregates (Attendance)
      const [attendanceStats] = await pool.execute(
        `SELECT ar.student_id, COUNT(*) as present_count 
         FROM attendance_records ar 
         JOIN attendance_sessions s ON ar.session_id = s.session_id 
         WHERE s.course_id = ? AND ar.status = 'present' 
         GROUP BY ar.student_id`,
        [course_id]
      );

      // 7. Calculate logic cleanly in memory
      const calculatedMarks = students.map(student => {
        const sid = student.student_id;

        // --- Assignment Score ---
        const aStat = assignmentStats.find(s => s.student_id === sid);
        const submitted = aStat ? aStat.submitted_count : 0;
        const totalA = total_assignments || 0;
        const assignment_score = totalA > 0 ? (submitted / totalA) * aw : 0;

        // --- Unit Test Score ---
        const tStat = testStats.find(s => s.student_id === sid);
        const obtained = tStat ? Number(tStat.total_obtained || 0) : 0;
        const maxT = Number(total_test_marks || 0);
        const unit_test_score = maxT > 0 ? (obtained / maxT) * utw : 0;

        // --- Attendance Score ---
        const attStat = attendanceStats.find(s => s.student_id === sid);
        const present = attStat ? attStat.present_count : 0;
        const totalS = total_sessions || 0;
        const attendPercent = totalS > 0 ? (present / totalS) * 100 : 0;

        let baseAttendMark = 0;
        if (attendPercent >= 96) baseAttendMark = 5;
        else if (attendPercent >= 91) baseAttendMark = 4;
        else if (attendPercent >= 86) baseAttendMark = 3;
        else if (attendPercent >= 81) baseAttendMark = 2;
        else if (attendPercent >= 75) baseAttendMark = 1;

        // Scale the 1-5 bucket base mark to the configured proportion natively
        const attendance_score = (baseAttendMark / 5) * atw;

        const total_score = assignment_score + unit_test_score + attendance_score;

        return {
          student_id: sid,
          first_name: student.first_name,
          last_name: student.last_name,
          assignment_score: Number(assignment_score.toFixed(2)),
          unit_test_score: Number(unit_test_score.toFixed(2)),
          attendance_score: Number(attendance_score.toFixed(2)),
          total_score: Number(total_score.toFixed(2))
        };
      });

      res.json(calculatedMarks);

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

export default router;
