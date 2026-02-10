import express from 'express';
import pool from "../config/connect_db.js";
import authenticate from '../middleware/auth.js';
import authorize from '../middleware/authorize.js';



const router = express.Router();


//teachers dashboard 
router.get("/dashboard",authenticate,authorize("faculty"),async (req,res)=>
{
    try{

        const teacher_id = req.user.user_id

        const [rows] = await pool.query(
            `SELECT first_name,last_name,primary_phone,department,designation 
            FROM teachers where teacher_id = ? `,
            [teacher_id]
        )

        if (rows.length === 0)
        {
            return res.this.status(404).json({ message : "No teacher found"})
        }

        //fetch courses assigned
        const [teaches] = await pool.query(
            `SELECT course_name 
            FROM courses  where teacher_id = ? `
            [teacher_id]
        )

        res.json({
            profile:rows[0] , 
            teaches:teaches
        })



    } catch(error){
        console.error(error)
        res.status(500).json({ message: "Internal server error" })
    }
})


//creating a attendance session
router.post("/attendance/session" ,authenticate ,authorize("faculty","admin"), async(req, res) =>
{

    const {course_id , session_date} = req.body
    const teacher_id =req.user.userId

    if (!course_id || !session_date) {
        return res.status(400).json({ message: "Required fields missing" });
    }

    try {

        // Verify teacher teaches this course
        const [course] = await pool.execute(
        `SELECT course_id FROM courses WHERE course_id = ? AND teacher_id = ?`,
        [course_id, teacher_id]
        );

        if (course.length === 0) {
          return res.status(403).json({ message: "Not authorized for this course" });
        }

        // Create attendance session
        const [result] = await pool.execute(
        `INSERT INTO attendance_sessions
         (course_id, session_date, created_by)
         VALUES (?, ?, ?)`,
        [course_id, session_date,  teacher_id]
        );

        res.status(201).json({
        message: "Attendance session created",
        session_id: result.insertId
         });

    } catch (error) {
        console.error(error);
  
        if (error.code === "ER_DUP_ENTRY") {
          return res.status(409).json({ message: "Session already exists for this time" });
        }
  
        res.status(500).json({ message: "Internal server error" });
      }
})

//eligible students for attendance and marks attendance
router.get("/attendance/session/:session_id/students" ,authenticate,authorize("faculty", "admin"),async(req,res)=>
{
    const { session_id } = req.params
    const teacher_id  = req.user.userId

    try{

        // Verify session belongs to teacher
        const [session] = await pool.execute(
        `SELECT s.course_id
         FROM attendance_sessions s
         JOIN courses c ON s.course_id = c.course_id
         WHERE s.session_id = ? AND c.teacher_id = ?`,
        [session_id, teacher_id]
       );

       if (session.length === 0) {
        return res.status(403).json({ message: "Unauthorized session access" });
        }

        const course_id = session[0].course_id;

        //fetch enrolled students
        const [students] = await pool.execute(
        `SELECT st.student_id, st.first_name, st.last_name
         FROM enrollments e
         JOIN students st ON e.student_id = st.student_id
         WHERE e.course_id = ?`,
        [course_id]
        );

        res.json({
            session_id,
            students
          });


    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
      }
  

})

//submit attendance
router.post("/attendance/submit",authenticate,authorize("faculty", "admin"),
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
  






export default router 