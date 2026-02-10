import express from 'express';
import bcrypt from "bcrypt";
import pool from "../config/connect_db.js";
import authenticate from '../middleware/auth.js';
import authorize from '../middleware/authorize.js';


const router = express.Router()


//create the department

router.post(
  "/create_department",
  authenticate,
  authorize("admin"),
  async (req, res) => {



    try {
      const { department_code, department_name } = req.body;

      // Basic validation
      if (!department_code || !department_name) {
        return res.status(400).json({
          message: "department_code and department_name are required",
        });
      }

      // Normalize inputs
      const code = department_code.trim().toUpperCase();
      const name = department_name.trim();

      // Insert department
      const [result] = await pool.execute(
        `INSERT INTO department (department_code, department_name)
         VALUES (?, ?)`,
        [code, name]
      );

      res.status(201).json({
        message: "Department created successfully",
        department_id: result.insertId,
      });
    } catch (error) {
      console.error(error);

      // Duplicate department
      if (error.code === "ER_DUP_ENTRY") {
        return res.status(409).json({
          message: "Department code or name already exists",
        });
      }

      res.status(500).json({ message: "Internal server error" })
    }
  }
);





 //create/add students (optimize for bulk inputs later) 
 router.post("/create_student",authenticate , authorize("faculty","admin"),async (req,res)=>{

      const conn = await pool.getConnection()
      try{

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
          password
        } = req.body;

        //basic validation
        if  (!first_name || !last_name || !email  ||!year || !semester || !primary_phone || !department_id || !password)
        {
          return res.status(400).json({message:"req fields missing"})
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

        // transaction begin
        await conn.beginTransaction();

        //hash password using bcrypt
        const saltRounds=10
        const hashedPassword = await bcrypt.hash(password, saltRounds)

        //insert query 
        const [result] = await conn.execute(`INSERT INTO students
        (first_name, middle_name, last_name, DOB,year,semester , email, primary_phone, alternate_phone, department_id, password)
        VALUES (?, ?, ?, ?, ?,?,?, ?, ?, ?, ?)`,[
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
          hashedPassword
        ] );


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
              result.insertId,
              c.course_id,
              "2024-2025" //hard coded make dynamic 
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

        //commit the tnx
        await conn.commit()

        res.status(201).json(
          {
            message: "Student created successfully",
            student_id: result.insertId
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


//create/add teachers (add DOB and optimize for bulk inputs later )
router.post("/create_teacher", authenticate , authorize("admin"), async(req,res)=>{ 
      try{

          const { 
              first_name,
              last_name,
              email,
              password,
              role,
              primary_phone,
              alternate_phone ,
              department_id,
              designation
              } =req.body

          if ( !first_name || !last_name || !email ||!role|| !primary_phone || !department_id || !password ||!designation)
          {
              return res.status(400).json({message:"req fields missing"})
          }

          //hash password using bcrypt 
          const saltRounds = 10
          const hashedPassword = await bcrypt.hash(password,saltRounds)

          //insert the data into teacher db
          const [result] = await pool.execute(
              `INSERT INTO teachers 
                  (
                  first_name,
                  last_name,
                  email,
                  password,
                  role,
                  primary_phone,
                  alternate_phone,
                  department_id,
                  designation )
                  VALUES (?,?,?,?,?,?,?,?,?)
                  `,
                  [ 
                  first_name,
                  last_name,
                  email,
                  hashedPassword,
                  role,
                  primary_phone,
                  alternate_phone || null,
                  department_id ,
                  designation
                  ]
          )

          res.status(201).json(
              {
                message: "Teacher created successfully",
                teacher_id: result.insertId
              }
            )


      } catch(error){
          console.log(error)

          //for existing email
          if ( error.code == "ER_DUP_ENTRY")
          {
            return res.status(409).json({message : "Email Already Registered"})
          }

          res.status(500).json({ message : "Internal server error"})
      }
  }
)



//create courses
router.post("/create_course", authenticate , authorize("admin") , async(req,res)=>
      {
        try
        {
          const {
            course_code,
            course_name,
            department_id,
            year,
            semester,
            teacher_id
            } = req.body;


            // basic validation
            if (
              !course_code || 
              !course_name ||
              !department_id ||
              year== null||
              semester == null ||
              !teacher_id
            ) {
              return res.status(400).json({ message: "Required fields missing" });
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

            // This avoids silent duplicates
            const normalizedCourseCode = course_code.trim().toUpperCase();


            //insert course
            const [result] = await pool.execute(
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
            )


            res.status(201).json(
              {
                message : "course created succesfully",
                course_id : result.insertId
              }
            )

            
          
        } catch (error) {
          console.error(error);

          if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({ message: "Course code already exists" });
          }

          if (error.code === "ER_NO_REFERENCED_ROW_2") {
            return res.status(400).json({ message: "Invalid department or teacher" });
          }

          res.status(500).json({ message: "Internal server error" });
        }


      }
)









export  default router