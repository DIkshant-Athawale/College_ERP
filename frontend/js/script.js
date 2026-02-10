function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const role = document.getElementById("role").value;

  if (username === "" || password === "" || role === "") {
    const error = document.getElementById("error-msg");
   error.innerText = "Please login using valid or correct credentials";
   error.style.display = "block";

    return;
  }

  if (role === "admin") {
    window.location.href = "admin.html";
  } 
  else if (role === "student") {
    window.location.href = "student.html";
  } 
  else if (role === "faculty") {
    window.location.href = "faculty.html";
  }
}

