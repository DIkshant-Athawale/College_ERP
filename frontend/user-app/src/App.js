import React, { useEffect, useState } from "react";


const App = () => {
  const [student, setStudent] = useState(null);

  const getStudent = () => {
    fetch("/api/students/2")
      .then(res => res.json())
      .then(data => setStudent(data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    getStudent();
  }, []);

  if (!student) {
    return <p>Loading student data...</p>;
  }

  return (
    <div>
      <h2>Student Profile</h2>

      <p><b>ID:</b> {student.student_id}</p>
      <p><b>Name:</b> {student.first_name} {student.last_name}</p>
      <p><b>Email:</b> {student.email}</p>
      <p><b>Date of Birth:</b> {student.date_of_birth}</p>
      <p><b>Enrollment Date:</b> {student.admission_date}</p>
      <p><b>Semester:</b> {student.current_semester}</p>
      <p><b>Department ID:</b> {student.department_id}</p>
      <p><b>Gender</b> : {student.gender}</p>
      <p><b>Roll no</b> : {student.roll_number}</p>
    </div>

    
  );

};


export default App;

