import express from 'express';
import pool from "../config/connect_db.js";
import authenticate from '../middleware/auth.js';
import authorize from '../middleware/authorize.js';



const router = express.Router();


//course progress tracking
//create assignment and deadlines
//mark the assignment submission
//notice
//create tests and send marks and their absent




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
            t.first_name,
            t.last_name,
            t.primary_phone,
            t.designation,
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

      res.json({
        profile: rows[0],
        teaches: teaches,
        today_timetable: todaySchedule,
        stats: {
          total_students: studentCount[0].total_students || 0,
          classes_per_week: timetableCount[0].unique_slots || 0,
          avg_attendance: avgAttendance
        }
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




export default router 