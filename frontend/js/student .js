

// Animated attendance
document.addEventListener("DOMContentLoaded", function () {

    function setAttendance(barId, attended, total, infoId) {

        let percentage = (attended / total) * 100;

        let bar = document.getElementById(barId);
        let info = document.getElementById(infoId);

        if (bar && info) {
            bar.style.width = percentage + "%";
            info.innerText =
                percentage.toFixed(0) + "% • " + attended + " / " + total;
        }
    }

    // Set Attendance Data Here
    setAttendance("dsBar", 30, 40, "dsInfo");
    setAttendance("cnBar", 28, 40, "cnInfo");
    setAttendance("dbBar", 32, 40, "dbInfo");
    setAttendance("osBar", 35, 40, "osInfo");
    setAttendance("wdBar", 20, 40, "wdInfo");

});




// Accordion (one open only)
function toggleAccordion(index) {
    const contents = document.querySelectorAll(".accordion-content");
    contents.forEach((content, i) => {
        content.style.display =
            i === index && content.style.display !== "block"
            ? "block"
            : "none";
    });
}

// Dynamic name
document.getElementById("studentName").innerText =
localStorage.getItem("studentName") || "Student Name";

// Logout
function logout(){
    window.location.href = "index.html";
}
