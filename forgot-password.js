async function forgotPassword(e) {
    e.preventDefault();

    const email = document.getElementById("email").value;

    try {
        const res = await fetch("https://afrisocial-backend-dev-production.up.railway.app/api/users/forgot-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email })
        });

        const data = await res.json();

        if (!res.ok) {
            alert(data.message || "Something went wrong. Please try again.");
            return;
        }

        // Show the modal on success
        document.getElementById("resetModal").style.display = "block";

    } catch (err) {
        console.error("Forgot password error:", err);
        alert("Network error. Please try again.");
    }
}
