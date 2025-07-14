document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('.profile-name').addEventListener('click', function() {
      document.querySelector('.profile-dropdown').classList.toggle('show');
    });
    window.addEventListener('click', function(e) {
      if (!e.target.classList.contains('profile-name')) {
        document.querySelector('.profile-dropdown').classList.remove('show');
      }
    });

    // Fetch username for navbar (reuse home logic)
    fetch('/api/home')
      .then(res => res.json())
      .then(data => {
        if (data && data.username) {
          document.getElementById('navbar-username').textContent = `${data.username} ▼`;
        }
      });
  });