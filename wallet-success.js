const baseUrl =
  "https://afrisocial-backend.onrender.com";

const token =
  localStorage.getItem("token");

const params =
  new URLSearchParams(window.location.search);

const transactionId =
  params.get("transaction_id");

const statusText =
  document.getElementById("statusText");

async function verifyPayment() {

  if (!transactionId) {

    statusText.textContent =
      "Invalid payment.";

    return;
  }

  try {

    const res = await fetch(

      `${baseUrl}/api/wallet/recharge/verify?transaction_id=${transactionId}`,

      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }

    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(
        data.message || "Verification failed"
      );
    }

    statusText.textContent =
      "Your wallet has been credited successfully.";

  } catch (err) {

    statusText.textContent =
      err.message || "Verification failed.";

  }

}

verifyPayment();

document
.getElementById("continueBtn")
.addEventListener("click", () => {

  window.location.href =
    "/wallet.html";

});
