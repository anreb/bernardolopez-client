// main.js
document.addEventListener("DOMContentLoaded", () => {
  const output = document.getElementById("api-output");

  fetch("https://api.bernardolopez.me/api/test")
    .then((response) => response.json())
    .then((data) => {
      output.textContent = JSON.stringify(data, null, 2);
    })
    .catch((error) => {
      output.textContent = "Error fetching API: " + error;
    });
});
