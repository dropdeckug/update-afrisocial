// It runs before the page renders so there's zero flash
(function () {
  if (localStorage.getItem("afri_theme") === "dark") {
    document.documentElement.classList.add("dark");
    document.body && document.body.classList.add("dark");
  }
})();
