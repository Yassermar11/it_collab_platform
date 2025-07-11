document.querySelector("form").addEventListener("submit", function(e) {
  const email = document.querySelector("#email").value.trim();
  const password = document.querySelector("#password").value.trim();

  if (!email || !password) {
    e.preventDefault();
    alert("Veuillez remplir tous les champs.");
  }
});
