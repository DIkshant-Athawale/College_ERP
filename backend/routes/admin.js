import express from 'express';
import bcrypt from "bcrypt";
import pool from "../config/connect_db.js";
import authenticate from '../middleware/auth.js';
import authorize from '../middleware/authorize.js';


const router = express.Router()

//fee management
//notices


//total department
router.get(
  "/departments/total",
  authenticate,
  authorize("admin"),
  async (req, res) => {
    try {
      const [rows] = await pool.execute(
        `SELECT COUNT(*) AS total_departments FROM department`
      );

      const total = (rows && rows[0] && rows[0].total_departments) || 0;

      res.json({ total_departments: total });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);
//total faculty 
router.get(
  "/teachers/total",
  authenticate,
  authorize("admin"),
  async (req, res) => {
    try {
      const [rows] = await pool.execute(
        `SELECT COUNT(*) AS total_faculty FROM teachers WHERE role != 'admin'`
      );

      const total = (rows && rows[0] && rows[0].total_faculty) || 0;

      res.json({ total_faculty: total });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);
//total currently enrolled students (exclude passout/graduated)
router.get(
  "/students/total/enrolled",
  authenticate,
  authorize("admin"),
  async (req, res) => {
    try {
      const { academic_year } = req.query;

      let sql = `SELECT COUNT(*) AS total_enrolled FROM students WHERE year BETWEEN 1 AND 4`;
      const params = [];

      if (academic_year) {
        sql += ` AND academic_year = ?`;
        params.push(academic_year);
      }

      const [rows] = await pool.execute(sql, params);

      const total = (rows && rows[0] && rows[0].total_enrolled) || 0;

      res.json({ total_students: total });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);
//total courses 
router.get(
  "/courses/total",
  authenticate,
  authorize("admin"),
  async (req, res) => {
    try {
      const [rows] = await pool.execute(
        `SELECT COUNT(*) AS total_courses FROM courses`
      );
      const total = (rows && rows[0] && rows[0].total_courses) || 0;
      res.json({ total_courses: total });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);


//get all information for dropdown
router.get(
  "/departments",
  authenticate,
  authorize("admin", "faculty"),
  async (req, res) => {
    try {

      const [rows] = await pool.execute(
        `SELECT department_id, department_code, department_name
         FROM department
         ORDER BY department_name`
      );

      res.json({ departments: rows });

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error fetching departments" });
    }
  }
);
router.get(
  "/teachers",
  authenticate,
  authorize("admin"),
  async (req, res) => {

    const { department_id } = req.query;

    try {

      let query = `
        SELECT teacher_id, first_name, last_name, designation
        FROM teachers
        WHERE role = 'faculty'
      `;

      const values = [];

      if (department_id) {
        query += " AND department_id = ?";
        values.push(Number(department_id));
      }

      query += " ORDER BY first_name";

      const [rows] = await pool.execute(query, values);

      res.json({ teachers: rows });

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error fetching teachers" });
    }
  }
);
router.get(
  "/courses",
  authenticate,
  authorize("admin", "faculty"),
  async (req, res) => {

    const { department_id, semester } = req.query;

    try {

      let query = `
        SELECT course_id, course_code, course_name, semester
        FROM courses
        WHERE 1=1
      `;

      const values = [];

      if (department_id) {
        query += " AND department_id = ?";
        values.push(Number(department_id));
      }

      if (semester) {
        query += " AND semester = ?";
        values.push(Number(semester));
      }

      query += " ORDER BY semester, course_code";

      const [rows] = await pool.execute(query, values);

      res.json({ courses: rows });

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error fetching courses" });
    }
  }
);













//get time slots
router.get(
  "/time_slots",
  authenticate,
  authorize("admin"),
  async (req, res) => {
    try {
      const [slots] = await pool.execute(
        `SELECT slot_id, start_time, end_time
         FROM time_slots
         ORDER BY start_time ASC`
      );

      res.json({ slots });

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);
//edit time slot
router.post(
  "/time_slots",
  authenticate,
  authorize("admin"),
  async (req, res) => {

    const conn = await pool.getConnection();

    try {
      const data = Array.isArray(req.body) ? req.body : [req.body];

      if (data.length === 0) {
        return res.status(400).json({ message: "No slot data provided" });
      }

      const values = [];

      for (const slot of data) {
        const { start_time, end_time } = slot;

        if (!start_time || !end_time) {
          return res.status(400).json({
            message: "start_time and end_time required"
          });
        }

        if (start_time >= end_time) {
          return res.status(400).json({
            message: "start_time must be before end_time"
          });
        }

        values.push([start_time, end_time]);
      }

      await conn.beginTransaction();

      const [result] = await conn.query(
        `INSERT INTO time_slots (start_time, end_time)
         VALUES ?`,
        [values]
      );

      await conn.commit();

      res.status(201).json({
        message: "Time slot(s) created successfully",
        affected_rows: result.affectedRows
      });

    } catch (error) {
      await conn.rollback();
      console.error(error);

      if (error.code === "ER_DUP_ENTRY") {
        return res.status(409).json({
          message: "Duplicate time slot"
        });
      }

      res.status(500).json({ message: "Internal server error" });

    } finally {
      conn.release();
    }
  }
);

// Update existing time slot
router.patch(
  "/time_slots/:id",
  authenticate,
  authorize("admin"),
  async (req, res) => {

    const { id } = req.params;
    const { start_time, end_time } = req.body;

    if (!start_time || !end_time) {
      return res.status(400).json({ message: "start_time and end_time required" });
    }

    if (start_time >= end_time) {
      return res.status(400).json({ message: "start_time must be before end_time" });
    }

    try {
      const [result] = await pool.execute(
        `UPDATE time_slots SET start_time = ?, end_time = ? WHERE slot_id = ?`,
        [start_time, end_time, id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Time slot not found" });
      }

      res.json({ message: "Time slot updated successfully" });

    } catch (error) {
      console.error(error);

      if (error.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ message: "A time slot with that start/end time already exists" });
      }

      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Delete a time slot
router.delete(
  "/time_slots/:id",
  authenticate,
  authorize("admin"),
  async (req, res) => {

    const { id } = req.params;

    try {
      const [result] = await pool.execute(
        `DELETE FROM time_slots WHERE slot_id = ?`,
        [id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Time slot not found" });
      }

      res.json({ message: "Time slot deleted successfully" });

    } catch (error) {
      console.error(error);

      if (error.code === "ER_ROW_IS_REFERENCED_2") {
        return res.status(409).json({
          message: "Cannot delete this time slot because it is used in a timetable"
        });
      }

      res.status(500).json({ message: "Internal server error" });
    }
  }
);

//create/ deleting /get  the time table
router.get(
  "/timetable",
  authenticate,
  authorize("admin"),
  async (req, res) => {

    const { department_id, semester } = req.query;

    // Validate required query params
    if (!department_id || !semester) {
      return res.status(400).json({
        message: "department_id and semester are required query parameters"
      });
    }

    try {
      const [rows] = await pool.execute(
        `SELECT t.timetable_id,
                t.day,
                t.slot_id,
                ts.start_time,
                ts.end_time,
                c.course_name,
                c.course_code
         FROM timetable t
         JOIN time_slots ts ON t.slot_id = ts.slot_id
         JOIN courses c ON t.course_id = c.course_id
         WHERE t.department_id = ?
           AND t.semester = ?
         ORDER BY t.day, ts.start_time`,
        [Number(department_id), Number(semester)]
      );

      res.json({ timetable: rows });

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);
//can delete the subject slots
router.delete(
  "/timetable/:id",
  authenticate,
  authorize("admin"),
  async (req, res) => {

    const { id } = req.params;

    try {
      await pool.execute(
        `DELETE FROM timetable WHERE timetable_id = ?`,
        [id]
      );

      res.json({ message: "Timetable entry deleted" });

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);
//create timetable 
router.post("/timetable", authenticate, authorize("admin"), async (req, res) => {

  const {
    department_id,
    semester,
    day,
    slot_id,
    course_id
  } = req.body;

  try {

    await pool.execute(
      `INSERT INTO timetable
       (department_id,  semester, day, slot_id, course_id)
       VALUES (?, ?, ?, ?, ?)`,
      [department_id, semester, day, slot_id, course_id]
    );

    res.json({ message: "Timetable updated successfully" });

  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
})







//get filtered students
router.get(
  "/filter_students",
  authenticate,
  authorize("admin"),
  async (req, res) => {

    const { department_id, year, semester,
      academic_year } = req.query;

    try {
      let query = `
        SELECT 
          student_id,
          first_name,
          middle_name,
          last_name,
          DOB,
          email,
          primary_phone,
          alternate_phone,
          department_id,
          year,
          semester,
          academic_year
        FROM students
        WHERE 1=1
      `;

      const values = [];

      if (department_id) {
        query += " AND department_id = ?";
        values.push(Number(department_id));
      }

      if (year) {
        query += " AND year = ?";
        values.push(Number(year));
      }

      if (semester) {
        query += " AND semester = ?";
        values.push(Number(semester));
      }

      if (academic_year) {
        query += " AND academic_year = ?";
        values.push(academic_year);
      }

      query += " ORDER BY student_id ASC";

      const [students] = await pool.execute(query, values);

      res.json({ students });

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
)
//edit the students 
router.patch(
  "/students/edit",
  authenticate,
  authorize("admin"),
  async (req, res) => {

    const { students } = req.body;

    if (!Array.isArray(students) || students.length === 0) {
      return res.status(400).json({ message: "No students provided" });
    }

    // 🔒 Allowed fields (NO year, semester, academic_year)
    const allowedFields = [
      "first_name",
      "middle_name",
      "last_name",
      "primary_phone",
      "alternate_phone",
      "department_id",
      "email",
      "DOB"
    ];

    const conn = await pool.getConnection();

    try {
      await conn.beginTransaction();

      for (const student of students) {

        const { student_id, updates } = student;

        if (!student_id || !updates || Object.keys(updates).length === 0) {
          continue;
        }

        const fields = [];
        const values = [];

        for (const key of Object.keys(updates)) {
          if (!allowedFields.includes(key)) {
            continue; // ignore forbidden fields
          }

          fields.push(`${key} = ?`);
          values.push(updates[key]);
        }

        if (fields.length === 0) continue;

        const query = `
          UPDATE students
          SET ${fields.join(", ")}
          WHERE student_id = ?
        `;

        await conn.execute(query, [...values, student_id]);
      }

      await conn.commit();

      res.json({ message: "Students updated successfully" });

    } catch (error) {
      await conn.rollback();
      console.error(error);

      if (error.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ message: "Email already exists" });
      }

      res.status(500).json({ message: "Internal server error" });
    } finally {
      conn.release();
    }
  }
)
// Delete single student (and related records)
router.delete(
  "/students/:id",
  authenticate,
  authorize("admin"),
  async (req, res) => {
    const { id } = req.params;
    const conn = await pool.getConnection();

    try {
      await conn.beginTransaction();

      await conn.execute(`DELETE FROM enrollments WHERE student_id = ?`, [id]);
      await conn.execute(`DELETE FROM student_fees WHERE student_id = ?`, [id]);
      await conn.execute(`DELETE FROM students WHERE student_id = ?`, [id]);

      await conn.commit();

      res.json({ message: "Student deleted successfully" });
    } catch (error) {
      await conn.rollback();
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    } finally {
      conn.release();
    }
  }
);
// create/add students profile
router.post("/create_student", authenticate, authorize("admin"), async (req, res) => {

  const conn = await pool.getConnection()

  try {

    // If single object → convert to array
    const students = Array.isArray(req.body) ? req.body : [req.body]

    if (students.length === 0) {
      return res.status(400).json({ message: "No student data provided" });
    }

    // transaction begin
    await conn.beginTransaction()

    const createdStudents = []

    for (const student of students) {
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
      if (!first_name || !last_name || !email || !year || !semester || !primary_phone || !department_id || !password || !academic_year) {
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
      const saltRounds = 10
      const hashedPassword = await bcrypt.hash(password, saltRounds)

      //insert query 
      const [result] = await conn.execute(`INSERT INTO students
        (first_name, middle_name, last_name, DOB,year,semester , email, primary_phone, alternate_phone, department_id, password, academic_year)
        VALUES (?, ?, ?, ?, ?,?,?, ?, ?, ?, ?,?)`, [
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
      ]);

      const studentId = result.insertId

      //insert fee record 
      await conn.execute(
        `INSERT INTO student_fees (student_id, academic_year, total_fee)
           VALUES (?, ?, ?)`,
        [studentId, academic_year, 85000] // example default fee
      );



      //find eligible courses for enrollment
      const [courses] = await conn.execute(
        `SELECT course_id FROM courses
          where department_id = ? 
          AND year = ?
          and semester =?`,
        [department_id, year, semester]
      )

      let enroll = [];

      //auto enroll student in respective semester subject
      if (courses.length > 0) {
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
  } finally {
    conn.release();
  }


}
)


//get filtered teacher
router.get(
  "/filter_teachers",
  authenticate,
  authorize("admin"),
  async (req, res) => {

    const { department_id } = req.query;

    try {
      let query = `
        SELECT 
          teacher_id,
          first_name,
          last_name,
          email,
          role,
          primary_phone,
          alternate_phone,
          department_id,
          designation
        FROM teachers
        WHERE 1=1
      `;

      const values = [];

      if (department_id) {
        query += " AND department_id = ?";
        values.push(department_id);
      }

      query += " ORDER BY teacher_id ASC";

      const [teachers] = await pool.execute(query, values);

      res.json({ teachers });

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);
//edit teacher (except password and role)
router.patch(
  "/teachers/edit",
  authenticate,
  authorize("admin"),
  async (req, res) => {

    const { teachers } = req.body;

    if (!Array.isArray(teachers) || teachers.length === 0) {
      return res.status(400).json({ message: "No teachers provided" });
    }

    //Allowed editable fields
    const allowedFields = [
      "first_name",
      "last_name",
      "primary_phone",
      "alternate_phone",
      "department_id",
      "designation",
      "email"
    ];

    const conn = await pool.getConnection();

    try {
      await conn.beginTransaction();

      for (const teacher of teachers) {

        const { teacher_id, updates } = teacher;

        if (!teacher_id || !updates || Object.keys(updates).length === 0) {
          continue;
        }

        const fields = [];
        const values = [];

        for (const key of Object.keys(updates)) {
          if (!allowedFields.includes(key)) continue; // ignore forbidden fields

          fields.push(`${key} = ?`);
          values.push(updates[key]);
        }

        if (fields.length === 0) continue;

        const query = `
          UPDATE teachers
          SET ${fields.join(", ")}
          WHERE teacher_id = ?
        `;

        await conn.execute(query, [...values, teacher_id]);
      }

      await conn.commit();

      res.json({ message: "Teachers updated successfully" });

    } catch (error) {
      await conn.rollback();
      console.error(error);

      if (error.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ message: "Email already exists" });
      }

      res.status(500).json({ message: "Internal server error" });
    } finally {
      conn.release();
    }
  }
);
// Delete teacher (single) — prevents deletion if assigned to courses
router.delete(
  "/teachers/:id",
  authenticate,
  authorize("admin"),
  async (req, res) => {
    const { id } = req.params;
    const conn = await pool.getConnection();

    try {
      await conn.beginTransaction();

      const [courses] = await conn.execute(
        `SELECT course_id FROM courses WHERE teacher_id = ? LIMIT 1`,
        [id]
      );

      if (courses.length > 0) {
        await conn.rollback();
        return res.status(400).json({
          message: "Teacher assigned to course(s). Reassign or remove courses before deleting."
        });
      }

      await conn.execute(`DELETE FROM teachers WHERE teacher_id = ?`, [id]);

      await conn.commit();

      res.json({ message: "Teacher deleted successfully" });
    } catch (error) {
      await conn.rollback();
      console.error(error);

      if (error.code === "ER_ROW_IS_REFERENCED_2" || error.code === "ER_NO_REFERENCED_ROW_2") {
        return res.status(400).json({ message: "Cannot delete teacher due to foreign key constraints" });
      }

      res.status(500).json({ message: "Internal server error" });
    } finally {
      conn.release();
    }
  }
);
//create teacher
router.post("/create_teacher", authenticate, authorize("admin"), async (req, res) => {

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
        !password ||
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



//get filtered courses 
router.get(
  "/filter_courses",
  authenticate,
  authorize("admin"),
  async (req, res) => {

    const { department_id, year, semester } = req.query;

    try {
      let query = `
        SELECT 
          c.course_id,
          c.course_code,
          c.course_name,
          c.department_id,
          d.department_name,
          c.year,
          c.semester,
          c.teacher_id,
          CONCAT(t.first_name, ' ', t.last_name) AS teacher_name
        FROM courses c
        JOIN teachers t 
          ON c.teacher_id = t.teacher_id
        JOIN department d
          ON c.department_id = d.department_id
        WHERE 1=1
      `;

      const values = [];

      if (department_id) {
        query += " AND c.department_id = ?";
        values.push(department_id);
      }

      if (year) {
        query += " AND c.year = ?";
        values.push(year);
      }

      if (semester) {
        query += " AND c.semester = ?";
        values.push(semester);
      }

      query += " ORDER BY c.course_id ASC";

      const [courses] = await pool.execute(query, values);

      res.json({ courses });

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);
//edit courses
router.patch(
  "/courses/edit",
  authenticate,
  authorize("admin"),
  async (req, res) => {

    const { courses } = req.body;

    if (!Array.isArray(courses) || courses.length === 0) {
      return res.status(400).json({ message: "No courses provided" });
    }

    const allowedFields = [
      "course_code",
      "course_name",
      "department_id",
      "year",
      "semester",
      "teacher_id"
    ];

    const conn = await pool.getConnection();

    try {
      await conn.beginTransaction();

      for (const course of courses) {

        const { course_id, updates } = course;

        if (!course_id || !updates || Object.keys(updates).length === 0) {
          continue;
        }

        const fields = [];
        const values = [];

        for (const key of Object.keys(updates)) {
          if (!allowedFields.includes(key)) continue;

          fields.push(`${key} = ?`);
          values.push(updates[key]);
        }

        if (fields.length === 0) continue;

        const query = `
          UPDATE courses
          SET ${fields.join(", ")}
          WHERE course_id = ?
        `;

        await conn.execute(query, [...values, course_id]);
      }

      await conn.commit();

      res.json({ message: "Courses updated successfully" });

    } catch (error) {
      await conn.rollback();
      console.error(error);

      if (error.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ message: "Course code already exists" });
      }

      if (error.code === "ER_NO_REFERENCED_ROW_2") {
        return res.status(400).json({ message: "Invalid teacher or department" });
      }

      res.status(500).json({ message: "Internal server error" });
    } finally {
      conn.release();
    }
  }
);
router.delete(
  "/courses/:id",
  authenticate,
  authorize("admin"),
  async (req, res) => {
    const { id } = req.params;
    const conn = await pool.getConnection();

    try {
      await conn.beginTransaction();

      // remove timetable entries referencing the course (no cascade assumed)
      await conn.execute(`DELETE FROM timetable WHERE course_id = ?`, [id]);

      // enrollments have ON DELETE CASCADE in your schema, so deleting course will remove them
      const [result] = await conn.execute(`DELETE FROM courses WHERE course_id = ?`, [id]);

      await conn.commit();

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Course not found" });
      }

      res.json({ message: "Course and related records deleted successfully" });
    } catch (error) {
      await conn.rollback();
      console.error(error);
      if (error.code === "ER_ROW_IS_REFERENCED_2" || error.code === "ER_NO_REFERENCED_ROW_2") {
        return res.status(400).json({ message: "Cannot delete course due to foreign key constraints" });
      }
      res.status(500).json({ message: "Internal server error" });
    } finally {
      conn.release();
    }
  }
);
router.post("/create_course", authenticate, authorize("admin"), async (req, res) => {
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



//get department from function 
//create the department
router.post("/create_department", authenticate, authorize("admin"), async (req, res) => {

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
//edit department 
router.patch(
  "/departments/edit",
  authenticate,
  authorize("admin"),
  async (req, res) => {

    const { departments } = req.body;

    if (!Array.isArray(departments) || departments.length === 0) {
      return res.status(400).json({ message: "No departments provided" });
    }

    const allowedFields = ["department_code", "department_name"];

    const conn = await pool.getConnection();

    try {
      await conn.beginTransaction();

      for (const dept of departments) {

        const { department_id, updates } = dept;

        if (!department_id || !updates || Object.keys(updates).length === 0) {
          continue;
        }

        const fields = [];
        const values = [];

        for (const key of Object.keys(updates)) {

          if (!allowedFields.includes(key)) continue;

          if (key === "department_code") {
            values.push(updates[key].trim().toUpperCase());
          } else {
            values.push(updates[key].trim());
          }

          fields.push(`${key} = ?`);
        }

        if (fields.length === 0) continue;

        const query = `
          UPDATE department
          SET ${fields.join(", ")}
          WHERE department_id = ?
        `;

        await conn.execute(query, [...values, department_id]);
      }

      await conn.commit();

      res.json({ message: "Departments updated successfully" });

    } catch (error) {

      await conn.rollback();
      console.error(error);

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




//promote all students by sem and department(includes fee and course enrollment changes) — careful with this one, maybe add confirmation step in frontend
router.post(
  "/promote_students",
  authenticate,
  authorize("admin"),
  async (req, res) => {

    const { department_id, current_semester, new_academic_year } = req.body;

    if (!department_id || !current_semester || !new_academic_year) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const conn = await pool.getConnection();

    try {
      await conn.beginTransaction();

      // 1️⃣ Get all active students in that department + semester
      const [students] = await conn.execute(
        `SELECT student_id
         FROM students
         WHERE department_id = ?
           AND semester = ?
           AND status = 'active'`,
        [department_id, current_semester]
      );

      for (const student of students) {

        const student_id = student.student_id;

        // 🎓 If semester 8 → graduate
        if (current_semester === 8) {

          await conn.execute(
            `UPDATE students
             SET status = 'graduated'
             WHERE student_id = ?`,
            [student_id]
          );

          continue;
        }

        // 🔁 Normal Promotion
        const newSemester = current_semester + 1;
        const newYear = Math.ceil(newSemester / 2);

        // Update student academic data
        await conn.execute(
          `UPDATE students
           SET semester = ?, 
               year = ?, 
               academic_year = ?
           WHERE student_id = ?`,
          [newSemester, newYear, new_academic_year, student_id]
        );

        // Get new semester courses
        const [courses] = await conn.execute(
          `SELECT course_id
           FROM courses
           WHERE department_id = ?
             AND semester = ?`,
          [department_id, newSemester]
        );

        if (courses.length > 0) {
          const values = courses.map(c => [
            student_id,
            c.course_id,
            new_academic_year
          ]);

          await conn.query(
            `INSERT INTO enrollments
             (student_id, course_id, academic_year)
             VALUES ?`,
            [values]
          );
        }

        // Create new fee record
        await conn.execute(
          `INSERT INTO student_fees
           (student_id, academic_year, total_fee)
           VALUES (?, ?, ?)`,
          [student_id, new_academic_year, 85000]
        );
      }

      await conn.commit();



      // Get department name for message
      const [deptRows] = await conn.execute(
        `SELECT department_name 
        FROM department 
        WHERE department_id = ?`,
        [department_id]
      );

      const departmentName = deptRows.length > 0
        ? deptRows[0].department_name
        : `Department ID ${department_id}`;

      let message;

      if (current_semester === 8) {
        message = `${departmentName} Semester 8 students marked as graduated successfully`;
      } else {
        const nextSemester = current_semester + 1;
        message = `${departmentName} Semester ${current_semester} promoted to Semester ${nextSemester} successfully`;
      }

      res.json({ message });


    } catch (error) {
      await conn.rollback();
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    } finally {
      conn.release();
    }
  }
);

//remember to get the student of that sem
//marks the student as DC and removes their enrollments for the current academic year (but keeps fee records for history)
router.put(
  "/students/:id/mark_dc",
  authenticate,
  authorize("admin"),
  async (req, res) => {

    const student_id = req.params.id;
    const { academic_year } = req.body;

    if (!academic_year) {
      return res.status(400).json({ message: "academic_year is required" });
    }

    const conn = await pool.getConnection();

    try {
      await conn.beginTransaction();

      // 1️⃣ Check student exists
      const [studentRows] = await conn.execute(
        `SELECT status FROM students WHERE student_id = ?`,
        [student_id]
      );

      if (studentRows.length === 0) {
        await conn.rollback();
        return res.status(404).json({ message: "Student not found" });
      }

      // 2️⃣ Update status to DC
      await conn.execute(
        `UPDATE students
         SET status = 'dc'
         WHERE student_id = ?`,
        [student_id]
      );

      // 3️⃣ Delete only current academic year enrollments
      await conn.execute(
        `DELETE FROM enrollments
         WHERE student_id = ?
         AND academic_year = ?`,
        [student_id, academic_year]
      );

      await conn.commit();

      res.json({ message: "Student marked as DC and enrollments removed" });

    } catch (error) {
      await conn.rollback();
      console.error(error);
      res.status(500).json({ message: "Error marking student as DC" });
    } finally {
      conn.release();
    }
  }
);



//get dc students 
router.get(
  "/students/dc",
  authenticate,
  authorize("admin"),
  async (req, res) => {

    const { department_id, semester } = req.query;

    try {

      let query = `
        SELECT 
            s.student_id,
            s.first_name,
            s.middle_name,
            s.last_name,
            s.email,
            s.primary_phone,
            s.department_id,
            s.semester,
            s.academic_year,
            d.department_name
        FROM students s
        JOIN department d 
            ON s.department_id = d.department_id
        WHERE s.status = 'dc'
      `;

      const values = [];

      // Optional filter: department
      if (department_id) {
        query += " AND s.department_id = ?";
        values.push(Number(department_id));
      }

      // Optional filter: semester
      if (semester) {
        query += " AND s.semester = ?";
        values.push(Number(semester));
      }

      query += " ORDER BY s.department_id, s.semester, s.first_name";

      const [rows] = await pool.execute(query, values);

      res.json({ dc_students: rows });

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error fetching DC students" });
    }
  }
);
//re-enroll dc students
router.put(
  "/students/:id/enroll",
  authenticate,
  authorize("admin"),
  async (req, res) => {

    const student_id = req.params.id;
    const { academic_year } = req.body;

    if (!academic_year) {
      return res.status(400).json({ message: "academic_year is required" });
    }

    const conn = await pool.getConnection();

    try {
      await conn.beginTransaction();

      // 1️⃣ Get student details
      const [studentRows] = await conn.execute(
        `SELECT department_id, semester, status
         FROM students
         WHERE student_id = ?`,
        [student_id]
      );

      if (studentRows.length === 0) {
        await conn.rollback();
        return res.status(404).json({ message: "Student not found" });
      }

      const { department_id, semester, status } = studentRows[0];

      if (status !== 'dc') {
        await conn.rollback();
        return res.status(400).json({ message: "Student is not in DC status" });
      }

      // 2️⃣ Update status to active
      await conn.execute(
        `UPDATE students
         SET status = 'active'
         WHERE student_id = ?`,
        [student_id]
      );

      // 3️⃣ Insert fresh enrollments for that semester
      await conn.execute(
        `INSERT INTO enrollments (student_id, course_id, academic_year)
         SELECT ?, course_id, ?
         FROM courses
         WHERE department_id = ?
         AND semester = ?`,
        [student_id, academic_year, department_id, semester]
      );

      await conn.commit();

      res.json({ message: "Student re-enrolled successfully" });

    } catch (error) {
      await conn.rollback();
      console.error(error);
      res.status(500).json({ message: "Error re-enrolling student" });
    } finally {
      conn.release();
    }
  }
);







export default router