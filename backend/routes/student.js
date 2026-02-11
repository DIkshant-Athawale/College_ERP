import express from 'express';
import pool from "../config/connect_db.js";
import authenticate from '../middleware/auth.js';
import authorize from '../middleware/authorize.js';


const router = express.Router()

  // API route for students and authorize to student only bcuz of req.user 
  router.get("/dashboard",authenticate , authorize("student"),async (req, res) => {

    console.log(req.user)
    const student_id = req.user.userId 

    try {

      //Profile Info
      const [profileRows] = await pool.execute(
        `SELECT student_id, first_name, last_name, email, year, semester
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
            SUM(ar.status = 'present') AS present_classes
         FROM enrollments e
         JOIN courses c ON e.course_id = c.course_id
         LEFT JOIN attendance_sessions s ON c.course_id = s.course_id
         LEFT JOIN attendance_records ar 
           ON ar.session_id = s.session_id 
           AND ar.student_id = ?
         WHERE e.student_id = ?
         GROUP BY c.course_id`,
        [student_id, student_id]
      );

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

      
      res.json({
        profile,
        subjects,
        attendance_by_subject: attendanceData,
        overall_attendance: overallSummary,
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
    
  }); 


export default router