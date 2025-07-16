// Global variables
let currentUser = null;

// Helper functions
function formatTime(date) {
    return new Date(date).toLocaleString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
}

function closeModal() {
    const modal = document.getElementById('meetingDetailsModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Meeting details modal
function showMeetingDetails(meetingId) {
    const detailsModal = document.getElementById('meetingDetailsModal');
    const detailsCloseBtn = detailsModal.querySelector('.close');

    // Fetch meeting details
    fetch(`/api/meetings/${meetingId}`, {
        credentials: 'include'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch meeting details');
        }
        return response.json();
    })
    .then(meeting => {
        // Update modal content
        document.getElementById('meetingTitle').textContent = meeting.title;
        document.getElementById('meetingDescription').textContent = meeting.description || 'No description';
        document.getElementById('meetingDate').textContent = 
            `${formatTime(meeting.start_time)} - ${formatTime(meeting.end_time)}`;
        
        const statusElement = document.getElementById('meetingStatus');
        statusElement.textContent = meeting.status;
        statusElement.className = `status-badge status-${meeting.status.replace(/\s+/g, '_').toLowerCase()}`;

        document.getElementById('meetingCreator').textContent = 
            meeting.creator ? meeting.creator.username : 'Unknown';

        // Update participants list
        const participantsContainer = document.getElementById('meetingParticipants');
        participantsContainer.innerHTML = '';
        if (Array.isArray(meeting.invited_users)) {
            meeting.invited_users.forEach(userId => {
                const participantDiv = document.createElement('div');
                participantDiv.className = 'participant-item';
                participantDiv.textContent = `User ${userId}`;
                participantsContainer.appendChild(participantDiv);
            });
        } else {
            participantsContainer.textContent = 'No participants';
        }

        // Update link
        const linkElement = document.getElementById('meetingLink');
        if (meeting.link) {
            linkElement.href = meeting.link;
            linkElement.textContent = meeting.link;
            linkElement.style.display = 'block';
        } else {
            linkElement.style.display = 'none';
        }

        // Show modal
        detailsModal.style.display = 'block';
    })
    .catch(error => {
        console.error('Error showing meeting details:', error);
        alert('Erreur lors du chargement des détails de la réunion');
    });

    // Close modal when clicking the X button
    detailsCloseBtn.onclick = function() {
        detailsModal.style.display = 'none';
    };

    // Close modal when clicking outside
    window.onclick = function(event) {
        if (event.target === detailsModal) {
            detailsModal.style.display = 'none';
        }
    };
}

// Meeting actions
function editMeeting(meetingId) {
    // TODO: Implement meeting edit
    alert('Edit meeting coming soon!');
}

function deleteMeeting(meetingId) {
    if (confirm('Are you sure you want to delete this meeting?')) {
        fetch(`/api/meetings/${meetingId}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (response.ok) {
                loadMeetings();
            } else {
                alert('Failed to delete meeting');
            }
        })
        .catch(error => {
            console.error('Error deleting meeting:', error);
            alert('Failed to delete meeting');
        });
    }
}

document.addEventListener('DOMContentLoaded', async function() {
    // Check authentication
    try {
        const response = await fetch('/api/home', {
            credentials: 'include'
        });
        if (!response.ok) {
            window.location.href = '/login';
            return;
        }
        const data = await response.json();
        currentUser = data.user;
    } catch (error) {
        console.error('Authentication error:', error);
        window.location.href = '/login';
        return;
    }

    // Initialize meeting modal
    const meetingsList = document.getElementById('meetingsList');
    const statusFilter = document.getElementById('statusFilter');
    const searchInput = document.getElementById('searchInput');

    if (!meetingsList || !statusFilter || !searchInput) {
        console.error('Missing required elements in DOM');
        return;
    }

    // Load meetings with filtering
    async function loadMeetings() {
        try {
            const response = await fetch('/api/meetings', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Failed to fetch meetings');
            }

            const meetings = await response.json();
            
            if (!Array.isArray(meetings)) {
                throw new Error('Invalid meetings data format');
            }
            
            const filteredMeetings = meetings.filter(meeting => {
                const statusMatch = !statusFilter.value || meeting.status === statusFilter.value;
                const searchMatch = !searchInput.value || 
                    meeting.title.toLowerCase().includes(searchInput.value.toLowerCase()) ||
                    (meeting.description || '').toLowerCase().includes(searchInput.value.toLowerCase());
                return statusMatch && searchMatch;
            });
            
            meetingsList.innerHTML = '';
            
            filteredMeetings.forEach(meeting => {
                if (!meeting.id || !meeting.title || !meeting.start_time || !meeting.end_time) {
                    console.warn('Invalid meeting data:', meeting);
                    return;
                }
                
                const meetingCard = document.createElement('div');
                meetingCard.className = 'meeting-card';
                meetingCard.innerHTML = `
                    <div class="meeting-header">
                        <h3>${meeting.title}</h3>
                        <span class="meeting-status status-${meeting.status}">${meeting.status}</span>
                    </div>
                    <div class="meeting-details">
                        <p><strong>Date:</strong> ${formatTime(meeting.start_time)} - ${formatTime(meeting.end_time)}</p>
                        <p><strong>Créé par:</strong> ${meeting.creator.username}</p>
                        <p><strong>Participants:</strong> ${Array.isArray(meeting.invited_users) ? meeting.invited_users.length : 0}</p>
                    </div>
                    <div class="meeting-actions">
                        <button class="btn-det" onclick="showMeetingDetails('${meeting.id}')">Détails</button>
                        ${meeting.creator_id === currentUser.id ? `
                        ` : ''}
                    </div>
                `;
                meetingsList.appendChild(meetingCard);
            });
        } catch (error) {
            console.error('Error loading meetings:', error);
            alert('Erreur lors du chargement des réunions');
        }
    }

    statusFilter.addEventListener('change', loadMeetings);
    searchInput.addEventListener('input', loadMeetings);

    // Initialize
    loadMeetings();
});
