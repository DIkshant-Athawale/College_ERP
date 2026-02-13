async function login() {
  const email = document.querySelector('input[type="email"]').value.trim();
  const password = document.querySelector('input[type="password"]').value.trim();
  const captcha = document.querySelector('.captcha-box input').value.trim();
  const error = document.getElementById("error-msg");

  error.style.display = "none";

  // Empty field check
  if (email === "" || password === "" || captcha === "") {
    error.innerText = "Please fill all the fields";
    error.style.display = "block";
    return;
  }

  // Captcha validation
  if (captcha !== "12") {
    error.innerText = "Incorrect captcha";
    error.style.display = "block";
    return;
  }

  try {
    const response = await fetch("http://localhost:3000/auth", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include", // VERY IMPORTANT for refresh token cookie
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      error.innerText = data.message || "Login failed";
      error.style.display = "block";
      return;
    }

    // Save access token
    localStorage.setItem("accessToken", data.accessToken);

    // Redirect based on role / userType
    if (data.role === "admin") {
      window.location.href = "admin.html";
    }
    else if (data.userType === "faculty") {
      window.location.href = "faculty.html";
    }
    else if (data.userType === "student") {
      window.location.href = "student.html";
    }

  } catch (err) {
    error.innerText = "Server error. Please try again.";
    error.style.display = "block";
  }
}