// Fetch projects from backend
async function fetchProjects() {
  const res = await fetch('/api/projects');
  if (!res.ok) return [];
  return await res.json();
}

function renderProjects(projects) {
  const container = document.getElementById('projects-container');
  container.innerHTML = '';
  projects.forEach(project => {
    const card = document.createElement('div');
    card.className = 'project-card';
    card.innerHTML = `
      <div class="project-title">${project.name}</div>
      <div class="project-desc">${project.description ? (project.description.length > 100 ? project.description.slice(0, 100) + '...' : project.description) : ''}</div>
      <div class="project-meta">
        <span class="project-status ${project.status.replace(/\s/g,'').toLowerCase()}">${project.status}</span>
      </div>
      <button class="action-btn view-btn" data-id="${project.id}">View</button>
    `;
    container.appendChild(card);
  });
}

function filterProjects(projects) {
  const search = document.getElementById('search-input').value.toLowerCase();
  const status = document.getElementById('status-filter').value;
  let filtered = projects.filter(p => p.name.toLowerCase().includes(search));
  if (status) filtered = filtered.filter(p => p.status.toLowerCase() === status);
  renderProjects(filtered);
}

async function showProjectDetails(id) {
  const res = await fetch(`/api/projects/${id}`);
  if (!res.ok) return;
  const project = await res.json();
  const details = document.getElementById('project-details');
  details.innerHTML = `
    <h2>${project.name}</h2>
    <p><b>Status:</b> <span class="project-status ${project.status.replace(/\s/g,'').toLowerCase()}">${project.status}</span></p>
    <p><b>Description:</b> ${project.description || ''}</p>
    <p><b>Created:</b> ${project.created_at ? new Date(project.created_at).toLocaleDateString('en-GB') : ''}</p>
    <p><b>Assigned Users:</b></p>
    <ul>
      ${(project.assigned_users || []).map(u => `<li>${u.username}</li>`).join('')}
    </ul>
    <div style="margin-top:16px;">
      <button class="action-btn">Edit</button>
      <button class="action-btn">Delete</button>
    </div>
  `;
  document.getElementById('project-modal').classList.add('show');
}

// Modal logic
const modal = document.getElementById('project-modal');
const closeBtn = document.getElementById('close-project-modal');
closeBtn.onclick = () => modal.classList.remove('show');
window.onclick = function(e) {
  if (e.target === modal) modal.classList.remove('show');
};

// Main logic
let allProjects = [];
fetchProjects().then(projects => {
  allProjects = projects;
  renderProjects(allProjects);
});

document.getElementById('search-input').addEventListener('input', () => filterProjects(allProjects));
document.getElementById('status-filter').addEventListener('change', () => filterProjects(allProjects));
document.getElementById('projects-container').addEventListener('click', function(e) {
  if (e.target.classList.contains('view-btn')) {
    showProjectDetails(e.target.getAttribute('data-id'));
  }
});