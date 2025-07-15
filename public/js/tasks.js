    // Modal functions
    function showTaskDetails(task) {
        const modal = document.getElementById('taskDetailsModal');
        const content = document.getElementById('taskDetailsContent');
        
        // Format the status text
        const statusMap = {
          'pending': 'En attente',
          'inprogress': 'En cours',
          'completed': 'Terminée'
        };
        
        // Create task details HTML
        content.innerHTML = `
          <div class="task-detail-item">
            <span class="task-detail-label">Titre</span>
            <span class="task-detail-value">${task.title || 'Sans titre'}</span>
          </div>
          <div class="task-detail-item">
            <span class="task-detail-label">Description</span>
            <span class="task-detail-value task-detail-description">${task.description || 'Aucune description'}</span>
          </div>
          <div class="task-detail-item">
            <span class="task-detail-label">À rendre le</span>
            <span class="task-detail-value">${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Date non définie'}</span>
          </div>
          <div class="task-detail-item">
            <span class="task-detail-label">Statut</span>
            <span class="task-detail-value status-${task.status || 'pending'}">${statusMap[task.status] || task.status}</span>
          </div>
        `;
        
        // Show modal
        modal.style.display = 'flex';
        
        // Add click outside to close
        modal.onclick = function(e) {
          if (e.target === modal) {
            closeTaskDetails();
          }
        };
      }
      
      function closeTaskDetails() {
        const modal = document.getElementById('taskDetailsModal');
        modal.style.display = 'none';
      }
  
      // Add event listener for detail buttons
      document.addEventListener('click', function(e) {
        if (e.target.classList.contains('btn-detail')) {
          const task = {
            id: e.target.dataset.taskId,
            title: e.target.dataset.taskTitle,
            description: e.target.dataset.taskDescription,
            status: e.target.dataset.taskStatus,
            dueDate: e.target.dataset.taskDueDate
          };
          showTaskDetails(task);
        }
      });
  
      async function fetchTasks() {
        console.log('Fetching tasks...');
        try {
          const response = await fetch('/api/tasks', {
            credentials: 'include',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache'
            }
          });
          
          console.log('Response status:', response.status);
          const data = await response.json();
          
          if (response.status === 401 || data.requiresLogin) {
            console.log('Unauthorized - redirecting to login');
            // Add a small delay to ensure the error message is logged
            setTimeout(() => {
              window.location.href = '/login';
            }, 500);
            return [];
          }
          
          if (!response.ok) {
            console.error('Error response from server:', data);
            const error = new Error(data.message || 'Failed to fetch tasks');
            error.data = data;
            throw error;
          }
          
          console.log('Fetched tasks:', data);
          return Array.isArray(data) ? data : [];
        } catch (error) {
          console.error('Error in fetchTasks:', {
            message: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
          });
          throw error;
        }
      }
  
      async function markTaskComplete(taskId) {
        try {
          const response = await fetch(`/api/tasks/${taskId}/complete`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          
          if (!response.ok) {
            throw new Error('Failed to update task');
          }
          
          return await response.json();
        } catch (error) {
          console.error('Error completing task:', error);
          throw error;
        }
      }
  
      async function displayTasks(tasks) {
        const container = document.getElementById('tasksContainer');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (!tasks || tasks.length === 0) {
          container.innerHTML = '<p class="no-tasks">Aucune tâche trouvée.</p>';
          return;
        }
        
        tasks.forEach(task => {
          try {
            const isCompleted = task.status === 'completed';
            const dueDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Date non définie';
            
            const taskElement = document.createElement('div');
            taskElement.className = 'task-card';
            taskElement.innerHTML = `
              <div class="task-header">
                <h3>${task.title || 'Sans titre'}</h3>
                <span class="task-status status-${task.status || 'pending'}">${formatStatus(task.status)}</span>
              </div>
              ${task.description ? `<p class="task-meta">${task.description}</p>` : ''}
              <p class="task-meta">📅 À rendre le: ${dueDate}</p>
              <div class="task-buttons">
                ${!isCompleted ? `
                  <button class="btn-complete" data-task-id="${task.id}">
                    Déclarer comme terminé
                  </button>
                ` : ''}
                <button class="btn-detail" data-task-id="${task.id}" data-task-title="${task.title}" data-task-description="${task.description}" data-task-status="${task.status}" data-task-due-date="${task.dueDate}">
                  Voir Détail
                </button>
              </div>
            `;
            container.appendChild(taskElement);
          } catch (error) {
            console.error('Error rendering task:', error, task);
          }
        });
      }
  
      function formatStatus(status) {
        const statusMap = {
          'pending': 'En attente',
          'inprogress': 'En cours',
          'completed': 'Terminée'
        };
        return statusMap[status] || status;
      }
  
      function filterTasks(tasks, status, searchTerm) {
        return tasks.filter(task => {
          const matchesStatus = !status || task.status === status;
          const matchesSearch = !searchTerm || 
            (task.title && task.title.toLowerCase().includes(searchTerm)) ||
            (task.description && task.description.toLowerCase().includes(searchTerm));
          return matchesStatus && matchesSearch;
        });
      }
  
      async function updateDisplayedTasks() {
        const container = document.getElementById('tasksContainer');
        if (!container) return;
        
        // Show loading state
        container.innerHTML = '<p class="loading">Chargement des tâches...</p>';
        
        try {
          const tasks = await fetchTasks();
          
          if (!tasks || !Array.isArray(tasks)) {
            throw new Error('Invalid tasks data received');
          }
          
          const statusFilter = document.getElementById('statusFilter')?.value || '';
          const searchTerm = (document.getElementById('search')?.value || '').toLowerCase();
          
          console.log('Filtering tasks:', { statusFilter, searchTerm, taskCount: tasks.length });
          
          const filteredTasks = filterTasks(tasks, statusFilter, searchTerm);
          console.log(`Displaying ${filteredTasks.length} filtered tasks`);
          
          displayTasks(filteredTasks);
        } catch (error) {
          console.error('Error in updateDisplayedTasks:', {
            message: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
          });
          
          if (container) {
            container.innerHTML = `
              <div class="error-message">
                <p>Erreur lors du chargement des tâches.</p>
                <p>${error.message || 'Veuillez réessayer plus tard.'}</p>
                <button onclick="updateDisplayedTasks()" class="retry-button">Réessayer</button>
              </div>
            `;
          }
        }
      }
  
      // Event listeners
      document.addEventListener('DOMContentLoaded', async function() {
        // Status filter
        const statusFilter = document.getElementById('statusFilter');
        if (statusFilter) {
          statusFilter.addEventListener('change', updateDisplayedTasks);
        }
  
        // Search input
        const searchInput = document.getElementById('search');
        if (searchInput) {
          searchInput.addEventListener('input', updateDisplayedTasks);
        }
  
        // Load initial tasks
        updateDisplayedTasks();
  
        // Profile dropdown toggle
        const profileName = document.querySelector('.profile-name');
        if (profileName) {
          profileName.addEventListener('click', function(e) {
            e.stopPropagation();
            const dropdown = document.querySelector('.profile-dropdown');
            if (dropdown) {
              dropdown.classList.toggle('show');
            }
          });
        }
  
        // Click outside dropdown to close it
        window.addEventListener('click', function() {
          const dropdown = document.querySelector('.profile-dropdown');
          if (dropdown) {
            dropdown.classList.remove('show');
          }
        });
  
        // Load username
        fetch('/api/home')
          .then(res => res.json())
          .then(data => {
            if (data && data.username) {
              const usernameElement = document.getElementById('navbar-username');
              if (usernameElement) {
                usernameElement.textContent = `${data.username} ▼`;
              }
            }
          })
          .catch(error => console.error('Error fetching user data:', error));
      });
      // Profile dropdown toggle (same as home page)
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
  
      document.addEventListener('click', function(e) {
        if (e.target.classList.contains('btn-complete')) {
          const taskId = e.target.dataset.taskId;
          
          // For demo purposes, we'll just reload the tasks
          const taskIndex = tasks.findIndex(t => t.id == taskId);
          if (taskIndex !== -1) {
            tasks[taskIndex].status = 'completed';
            displayTasks(tasks);
          }
        }
      });