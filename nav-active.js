document.addEventListener("DOMContentLoaded", () => {
  const currentPage = window.location.pathname.split("/").pop();

  document.querySelectorAll(".bottom-nav .bnav-item").forEach(item => {
    const href = item.getAttribute("href");
    item.classList.remove("active");

    if (
      href === currentPage ||
      (currentPage === "" && href.includes("feed.html"))
    ) {
      item.classList.add("active");
    }
  });
});