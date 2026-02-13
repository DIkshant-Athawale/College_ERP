function loginFaculty() {
    const email = document.querySelector(".login-box input[type='email']").value;
    const password = document.querySelector(".login-box input[type='password']").value;

    if(!email || !password) {
        document.getElementById("error-msg").innerText = "Enter email and password";
        return;
    }

    localStorage.setItem("facultyName", email);
    window.location.href = "faculty.html";
}
