import express from 'express';
import bcrypt from "bcrypt";
import pool from "../config/connect_db.js";
import authenticate from '../middleware/auth.js';
import authorize from '../middleware/authorize.js';


const router = express.Router()


//create the department
router.post("/create_department",authenticate,authorize("admin"),async (req, res) => {

    const conn = await pool.getConnection();

    try {

      const departments = Array.isArray(req.body)
        ? req.body
        : [req.body];

      if (departments.length === 0) {
        return res.status(400).json({
          message: "No department data provided"
        });
      }

      const values = [];

      for (const dept of departments) {

        const { department_code, department_name } = dept;

        if (!department_code || !department_name) {
          return res.status(400).json({
            message: "department_code and department_name are required"
          });
        }

        const code = department_code.trim().toUpperCase();
        const name = department_name.trim();

        values.push([code, name]);
      }

      await conn.beginTransaction();

      
      const [result] = await conn.query(
        `INSERT INTO department (department_code, department_name)
         VALUES ?`,
        [values]
      );

      await conn.commit();

      res.status(201).json({
        message: "Department(s) created successfully",
        affected_rows: result.affectedRows
      });

    } catch (error) {

      await conn.rollback();

      if (error.code === "ER_DUP_ENTRY") {
        return res.status(409).json({
          message: "Department code or name already exists"
        });
      }

      res.status(500).json({ message: "Internal server error" });

    } finally {
      conn.release();
    }
  }
);





 // create/add students
 router.post("/create_student",authenticate , authorize("admin"), async (req,res)=>{

      const conn = await pool.getConnection()

      try{

         // If single object → convert to array
        const students = Array.isArray(req.body) ? req.body : [req.body]

        if (students.length === 0) {
          return res.status(400).json({ message: "No student data provided" });
        }

        // transaction begin
        await conn.beginTransaction()

        const createdStudents = []

        for(const student of students) {
        const {
          first_name,
          middle_name,
          last_name,
          DOB,
          year,
          semester,
          email,
          primary_phone,
          alternate_phone,
          department_id,
          password,
          academic_year
        } = student;

        //basic validation
        if  (!first_name || !last_name || !email  ||!year || !semester || !primary_phone || !department_id || !password || !academic_year)
        {
          throw new Error("Required fields missing")
        }

        if (year < 1 || year > 4) {
          return res.status(400).json({ message: "Invalid year" });
        }

        //correct validation for semester as:
        // Year 1 → Sem 1–2
        // Year 2 → Sem 3–4
        // Year 3 → Sem 5–6
        // Year 4 → Sem 7–8
        const minSem = (year - 1) * 2 + 1;
        const maxSem = year * 2;
        
        if (semester < minSem || semester > maxSem) {
          return res.status(400).json({
            message: `Invalid semester for year ${year}`
          });
        }



        //hash password using bcrypt
        const saltRounds=10
        const hashedPassword = await bcrypt.hash(password, saltRounds)

        //insert query 
        const [result] = await conn.execute(`INSERT INTO students
        (first_name, middle_name, last_name, DOB,year,semester , email, primary_phone, alternate_phone, department_id, password, academic_year)
        VALUES (?, ?, ?, ?, ?,?,?, ?, ?, ?, ?,?)`,[
          first_name,
          middle_name || null,
          last_name,
          DOB || null,
          year,
          semester,
          email,
          primary_phone,
          alternate_phone || null,
          department_id,
          hashedPassword,
          academic_year
        ] );

        const studentId = result.insertId

        //find eligible courses for enrollment
        const [courses] =await conn.execute(
          `SELECT course_id FROM courses
          where department_id = ? 
          AND year = ?
          and semester =?`,
          [department_id,year,semester]
        )

        let enroll = [];

        //auto enroll student in respective semester subject
        if(courses.length > 0)
        {
          enroll = courses.map(c =>
            [
              studentId,
              c.course_id,
              academic_year
            ])
        }

        //insert values if exists and use query for bulk inserts
        if (enroll.length > 0) {
          await conn.query(
            `INSERT INTO enrollments (student_id, course_id, academic_year)
             VALUES ?`,
            [enroll]
          )

        }

        createdStudents.push(studentId)

      } 

        //commit the tnx
        await conn.commit()

        res.status(201).json(
          {
            message: "Student created successfully",
            student_id: createdStudents
          }
        )

      } catch (error) {
          console.error(error);
          
          await conn.rollback();

          // Email already exists
          if (error.code === "ER_DUP_ENTRY") {
              //code 409 for duplication
              return res.status(409).json({ message: "Email already registered" });
          }
      
          res.status(500).json({ message: "Internal server error" });
          }  finally {
            conn.release();
          }


    }
)


//create/add teachers (add DOB  )
router.post("/create_teacher",authenticate , authorize("admin"), async(req,res)=>{
   
    const conn = await pool.getConnection();

    try {
      const data = req.body;

      // Normalize input → always treat as array
      const teachers = Array.isArray(data) ? data : [data];

      if (teachers.length === 0) {
        return res.status(400).json({ message: "No teacher data provided" });
      }

      await conn.beginTransaction();

      const insertedIds = [];

      for (const teacher of teachers) {
        const {
          first_name,
          last_name,
          email,
          role,
          primary_phone,
          alternate_phone,
          department_id,
          password,
          designation
        } = teacher;

        if (
          !first_name ||
          !last_name ||
          !email ||
          !role ||
          !primary_phone ||
          !department_id ||
          !password,
          !designation
        ) {
          await conn.rollback();
          return res.status(400).json({
            message: "Required fields missing in one of the records"
          });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await conn.execute(
          `INSERT INTO teachers 
          (first_name, last_name, email, password, role, primary_phone, alternate_phone, department_id, designation)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?,?)`,
          [
            first_name,
            last_name,
            email,
            hashedPassword,
            role,
            primary_phone,
            alternate_phone || null,
            department_id,
            designation
          ]
        );

        insertedIds.push(result.insertId);
      }

      await conn.commit();

      //  KEEP SAME RETURN STYLE
      if (insertedIds.length === 1) {
        return res.status(201).json({
          message: "Teacher created successfully",
          teacher_id: insertedIds[0]
        });
      } else {
        return res.status(201).json({
          message: "Teachers created successfully",
          teacher_ids: insertedIds
        });
      }

    } catch (error) {
      await conn.rollback();
      console.error(error);

      if (error.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ message: "Email already registered" });
      }

      res.status(500).json({ message: "Internal server error" });
    } finally {
      conn.release();
    }
  }
)



//create courses
router.post("/create_course", authenticate , authorize("admin") , async(req,res)=>
{
  const conn = await pool.getConnection();

  try {
    const data = req.body;

    // Normalize → always array
    const courses = Array.isArray(data) ? data : [data];

    if (courses.length === 0) {
      return res.status(400).json({ message: "No course data provided" });
    }

    await conn.beginTransaction();

    const insertedIds = [];

    for (const course of courses) {
      const {
        course_code,
        course_name,
        department_id,
        year,
        semester,
        teacher_id
      } = course;

      // Basic validation
      if (
        !course_code ||
        !course_name ||
        !department_id ||
        year == null ||
        semester == null ||
        !teacher_id
      ) {
        await conn.rollback();
        return res.status(400).json({
          message: "Required fields missing in one of the records"
        });
      }

      if (year < 1 || year > 4) {
        await conn.rollback();
        return res.status(400).json({
          message: `Invalid year: ${year}`
        });
      }

      const minSem = (year - 1) * 2 + 1;
      const maxSem = year * 2;

      if (semester < minSem || semester > maxSem) {
        await conn.rollback();
        return res.status(400).json({
          message: `Invalid semester for year ${year}`
        });
      }

      const normalizedCourseCode = course_code.trim().toUpperCase();

      const [result] = await conn.execute(
        `INSERT INTO courses
         (course_code, course_name, department_id, year, semester, teacher_id)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          normalizedCourseCode,
          course_name.trim(),
          department_id,
          year,
          semester,
          teacher_id
        ]
      );

      insertedIds.push(result.insertId);
    }

    await conn.commit();

    //send response
    if (insertedIds.length === 1) {
      return res.status(201).json({
        message: "course created succesfully",
        course_id: insertedIds[0]
      });
    } else {
      return res.status(201).json({
        message: "courses created succesfully",
        course_ids: insertedIds
      });
    }

  } catch (error) {
    await conn.rollback();
    console.error(error);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        message: "Course code already exists"
      });
    }

    if (error.code === "ER_NO_REFERENCED_ROW_2") {
      return res.status(400).json({
        message: "Invalid department or teacher"
      });
    }

    res.status(500).json({ message: "Internal server error" });
  } finally {
    conn.release();
  }
}
)








export  default router