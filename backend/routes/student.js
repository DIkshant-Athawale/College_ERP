import express from 'express';
import pool from "../config/connect_db.js";
import authenticate from '../middleware/auth.js';
import authorize from '../middleware/authorize.js';


const router = express.Router()

// API route for students and authorize to student only bcuz of req.user 
router.get("/dashboard", authenticate, authorize("student"), async (req, res) => {

  console.log(req.user)
  const student_id = req.user.userId

  try {

    //Profile Info
    const [profileRows] = await pool.execute(
      `SELECT student_id, first_name, last_name, email, year, semester, department_id, academic_year
         FROM students
         WHERE student_id = ?`,
      [student_id]
    );

    if (profileRows.length === 0) {
      return res.status(404).json({ message: "Student not found" });
    }

    const profile = profileRows[0];

    //Enrolled Subjects
    const [subjects] = await pool.execute(
      `SELECT c.course_id, c.course_name, c.course_code
         FROM enrollments e
         JOIN courses c ON e.course_id = c.course_id
         WHERE e.student_id = ?`,
      [student_id]
    );

    //Subject-wise Attendance
    const [attendanceData] = await pool.execute(
      `SELECT 
            c.course_name,
            COUNT(ar.record_id) AS total_classes,
            COALESCE(SUM(ar.status = 'present'), 0) AS present_classes
         FROM enrollments e
         JOIN courses c ON e.course_id = c.course_id
         LEFT JOIN attendance_sessions s 
             ON c.course_id = s.course_id
         LEFT JOIN attendance_records ar 
             ON ar.session_id = s.session_id 
             AND ar.student_id = ?
         WHERE e.student_id = ?
         GROUP BY c.course_id`,
      [student_id, student_id]
    )


    //fee record
    const [feeRecord] = await pool.execute(
      `SELECT 
        total_fee,
        paid_amount,
        (total_fee - paid_amount) AS remaining_fee
        FROM student_fees
        WHERE student_id = ?`,
      [student_id]
    )

    // Overall Attendance
    const [overall] = await pool.execute(
      `SELECT 
            COUNT(ar.record_id) AS total_classes,
            SUM(ar.status = 'present') AS present_classes
         FROM attendance_records ar
         WHERE ar.student_id = ?`,
      [student_id]
    );

    const overallSummary = {
      total_classes: overall[0].total_classes || 0,
      present_classes: overall[0].present_classes || 0,
      percentage:
        overall[0].total_classes > 0
          ? (
            (overall[0].present_classes /
              overall[0].total_classes) *
            100
          ).toFixed(2)
          : 0
    };

    const { department_id, semester, } = profile;

    //get timetable by sem and department
    const [timetable] = await pool.execute(
      `SELECT 
            t.day,
            ts.start_time,
            ts.end_time,
            c.course_name,
            CONCAT(tr.first_name, ' ', tr.last_name) AS teacher_name
         FROM timetable t
         JOIN time_slots ts ON t.slot_id = ts.slot_id
         JOIN courses c ON t.course_id = c.course_id
         JOIN teachers tr ON c.teacher_id = tr.teacher_id
         WHERE t.department_id = ?
         AND t.semester = ?
         ORDER BY FIELD(t.day,'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'),
                  ts.start_time`,
      [department_id, semester]
    );

    // Assignments for enrolled courses + submission status
    const [assignmentsData] = await pool.execute(
      `SELECT 
            a.assignment_id,
            a.title,
            a.deadline,
            c.course_name,
            c.course_code,
            COALESCE(asub.submitted, FALSE) AS submitted
         FROM enrollments e
         JOIN assignments a ON a.course_id = e.course_id
         JOIN courses c ON e.course_id = c.course_id
         LEFT JOIN assignment_submissions asub 
            ON asub.assignment_id = a.assignment_id 
            AND asub.student_id = ?
         WHERE e.student_id = ?
         ORDER BY c.course_name, a.created_at`,
      [student_id, student_id]
    );

    // Tests for enrolled courses + scores
    const [testsData] = await pool.execute(
      `SELECT 
          t.test_id,
          t.title,
          t.test_date,
          t.max_marks,
          c.course_name,
          c.course_code,
          ts.marks_obtained,
          COALESCE(ts.is_absent, FALSE) AS is_absent
       FROM enrollments e
       JOIN unit_tests t ON t.course_id = e.course_id
       JOIN courses c ON e.course_id = c.course_id
       LEFT JOIN test_scores ts 
          ON ts.test_id = t.test_id 
          AND ts.student_id = ?
       WHERE e.student_id = ?
       ORDER BY c.course_name, t.test_date DESC`,
      [student_id, student_id]
    );


    res.json({
      profile,
      subjects,
      attendance_by_subject: attendanceData,
      overall_attendance: overallSummary,
      feeRecord,
      timetablerows: timetable,
      assignments: assignmentsData,
      tests: testsData
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }

});


export default router