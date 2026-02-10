import express from 'express';
import pool from "../config/connect_db.js";
import authenticate from '../middleware/auth.js';
import authorize from '../middleware/authorize.js';


const router = express.Router()

  // API route for students and authorize to student only bcuz of req.user 
  router.get("/info",authenticate , authorize("student"),async (req, res) => {

    console.log(req.user)
    const student_id = req.user.userId 

    const [rows] = await pool.execute(
      "SELECT student_id, first_name, last_name, email FROM students WHERE student_id = ?", //"?" protection against sql injection
      [student_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Student not found" });
    }
    
    res.json(rows[0]);
    
  }); 


export default router