import express from "express";
import pool from "./database.js";

const app = express();

app.get("/",(req,res)=> {
  res.send("backend is running")
})

app.get("/api/students/:id", (req, res) => {
  const studentId = req.params.id;

  pool.query(
    "SELECT * FROM students WHERE student_id = ?",
    [studentId],
    (err, results) => {
      if (err) {
        return res.status(500).json(err);
      }

      res.json(results[0]); // 👈 single student object
    }
  );
});


app.listen(3000, () => {
  console.log("Backend running on http://localhost:3000");
});
