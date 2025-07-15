document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('.profile-name').addEventListener('click', function() {
      document.querySelector('.profile-dropdown').classList.toggle('show');
    });
    window.addEventListener('click', function(e) {
      if (!e.target.classList.contains('profile-name')) {
        document.querySelector('.profile-dropdown').classList.remove('show');
      }
    });

    // Fetch username and role for navbar
    fetch('/api/home')
      .then(res => res.json())
      .then(data => {
        if (data && data.user) {
          const usernameWithRole = `${data.user.username} (${data.user.role})`;
          document.getElementById('navbar-username').textContent = `${usernameWithRole} ▼`;
        }
      });
  });