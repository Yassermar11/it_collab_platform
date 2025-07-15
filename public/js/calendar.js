document.addEventListener('DOMContentLoaded', function() {
    // Fetch user info
    fetch('/api/home')
        .then(res => res.json())
        .then(data => {
            if (data && data.username) {
                document.getElementById('navbar-username').textContent = `${data.username} ▼`;
            }
        });

    // Initialize calendar
    const calendarEl = document.getElementById('calendar');
    
    if (!calendarEl) {
        console.error('Calendar element not found');
        return;
    }

    const calendar = new FullCalendar.Calendar(calendarEl, {
        locale: 'fr',
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'today,prev,next',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        height: 'auto',
        contentHeight: 'auto',
        eventTimeFormat: {
            hour: 'numeric',
            minute: '2-digit'
        },
        eventMinHeight: 30,
        eventMaxStack: 5,
        eventOverlap: false,
        events: async function(fetchInfo, successCallback, failureCallback) {
            try {
                const response = await fetch('/api/tasks');
                
                if (!response.ok) {
                    throw new Error('Failed to fetch tasks');
                }

                const tasks = await response.json();
                
                if (!Array.isArray(tasks)) {
                    throw new Error('Invalid tasks format');
                }

                const events = tasks.map(task => {
                    const dueDate = new Date(task.dueDate);
                    
                    return {
                        id: task.id,
                        title: task.title || 'Untitled',
                        start: dueDate.toISOString().split('T')[0],
                        extendedProps: {
                            description: task.description || '',
                            status: task.status
                        },
                        backgroundColor: getColorForStatus(task.status),
                        borderColor: getColorForStatus(task.status),
                        display: 'block'
                    };
                });
                
                successCallback(events);
            } catch (error) {
                console.error('Error fetching tasks:', error);
                failureCallback(error);
            }
        },
        eventContent: function(arg) {
            const statusMap = {
                'pending': 'En attente',
                'inprogress': 'En cours',
                'completed': 'Terminée'
            };
            
            const statusText = statusMap[arg.event.extendedProps.status] || arg.event.extendedProps.status;
            const statusColor = getColorForStatus(arg.event.extendedProps.status);

            return {
                domNodes: [
                    document.createElement('div'),
                    document.createElement('div')
                ].map((el, i) => {
                    el.className = 'fc-event-main';
                    el.style.backgroundColor = statusColor;
                    el.style.borderColor = statusColor;
                    
                    if (i === 0) {
                        el.textContent = arg.event.title;
                    } else {
                        el.className = 'fc-event-status';
                        el.textContent = statusText;
                    }
                    
                    return el;
                })
            };
        },
        eventDidMount: function(info) {
            const eventEl = info.el;
            const event = info.event;
            
            // Add tooltip with task details
            eventEl.setAttribute('data-tooltip', `
                <strong>${event.title}</strong><br>
                ${event.extendedProps.description || 'No description'}<br>
                Status: ${event.extendedProps.status || 'Not specified'}
            `);

            // Show tooltip on hover
            eventEl.addEventListener('mouseenter', () => {
                const tooltipEl = document.createElement('div');
                tooltipEl.className = 'tooltip';
                tooltipEl.innerHTML = eventEl.getAttribute('data-tooltip');
                document.body.appendChild(tooltipEl);
                
                const rect = eventEl.getBoundingClientRect();
                tooltipEl.style.position = 'absolute';
                tooltipEl.style.left = `${rect.left + window.scrollX}px`;
                tooltipEl.style.top = `${rect.bottom + window.scrollY + 5}px`;
            });
            
            eventEl.addEventListener('mouseleave', () => {
                const tooltipEl = document.querySelector('.tooltip');
                if (tooltipEl) {
                    tooltipEl.remove();
                }
            });
        }
    });

    // Helper function for status colors
    function getColorForStatus(status) {
        const colors = {
            'pending': '#f5a623',
            'inprogress': '#2b79e3',
            'completed': '#27ae60'
        };
        return colors[status] || '#666';
    }

    // Render calendar
    calendar.render();
});