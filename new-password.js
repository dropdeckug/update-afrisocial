const params = new URLSearchParams(window.location.search);
const token = params.get("token");

async function resetPassword(e) {
  e.preventDefault();
  const newPassword = document.getElementById("password").value;

  const res = await fetch("https://afrisocial-backend-dev-production.up.railway.app/api/users/new-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, newPassword })
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.message);
    return;
  }

  // Show success modal instead of redirect
  document.getElementById("successModal").style.display = "flex";
}

// Button inside modal
function goToLogin(){
  window.location.href = "/login.html";

}
