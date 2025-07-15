document.addEventListener('DOMContentLoaded', function() {
    let currentChatUser = null;
    
    // Function to update the conversation header
    function updateConversationHeader(user) {
        const currentChatAvatar = document.getElementById('currentChatAvatar');
        const currentChatUsername = document.getElementById('currentChatUsername');
        const lastMessageText = document.querySelector('.last-message');
        
        if (currentChatAvatar) {
            currentChatAvatar.textContent = user.username.charAt(0).toUpperCase();
        }
        if (currentChatUsername) {
            currentChatUsername.textContent = user.username;
        }
        if (lastMessageText) {
            lastMessageText.textContent = 'No messages yet';
        }
    }

    // Function to select a user and update conversation
    function selectUser(user) {
        currentChatUser = user;
        updateConversationHeader(user);
        fetchMessages(user.id);
    }

    // Fetch and display users
    async function fetchUsers() {
        try {
            const response = await fetch('/api/chat/users');
            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }
            
            const users = await response.json();
            console.log('Fetched users:', users);
            
            const usersContainer = document.getElementById('usersList');
            if (!usersContainer) {
                console.error('Users container not found');
                return;
            }
            
            usersContainer.innerHTML = '';
            
            users.forEach(user => {
                const userElement = document.createElement('div');
                userElement.className = 'user-item';
                userElement.dataset.userId = user.id;
                userElement.dataset.username = user.username;
                
                // Create avatar
                const avatar = document.createElement('div');
                avatar.className = 'user-avatar';
                avatar.textContent = user.username.charAt(0).toUpperCase();
                avatar.title = user.username;
                
                // Create status indicator
                const status = document.createElement('div');
                status.className = `user-status ${user.isOnline ? 'online' : ''}`;
                
                // Create user info
                const userInfo = document.createElement('div');
                userInfo.className = 'user-info';
                
                const userName = document.createElement('span');
                userName.className = 'user-name';
                userName.textContent = user.username;
                
                const userRole = document.createElement('span');
                userRole.className = 'user-role';
                userRole.textContent = "Role: " + user.role;
                
                userInfo.appendChild(userName);
                userInfo.appendChild(userRole);
                
                // Combine elements
                userElement.appendChild(avatar);
                userElement.appendChild(status);
                userElement.appendChild(userInfo);
                
                // Add event listeners
                userElement.addEventListener('click', () => selectUser(user));
                
                usersContainer.appendChild(userElement);
            });
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    }

    // Add search functionality
    const userSearch = document.getElementById('userSearch');
    if (userSearch) {
        userSearch.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const userItems = document.querySelectorAll('.user-item');
            
            userItems.forEach(item => {
                const username = item.dataset.username.toLowerCase();
                const role = item.querySelector('.user-role').textContent.toLowerCase();
                const shouldShow = username.includes(searchTerm) || role.includes(searchTerm);
                item.style.display = shouldShow ? 'flex' : 'none';
            });
        });
    }

    // Initialize chat when the page loads
    fetchUsers();

    // Add event listener for group chat button
    const startGroupChat = document.getElementById('startGroupChat');
    if (startGroupChat) {
        startGroupChat.addEventListener('click', () => {
            // TODO: Implement group chat functionality
            alert('Group chat coming soon!');
        });
    }

    // Fetch messages for a specific user
    function fetchMessages(userId) {
        fetch(`/api/chat/messages/${userId}`)
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                return res.json();
            })
            .then(messages => {
                const messagesContainer = document.querySelector('.chat-messages');
                if (!messagesContainer) {
                    console.error('Messages container not found');
                    return;
                }
                
                messagesContainer.innerHTML = '';
                
                if (!Array.isArray(messages)) {
                    console.error('Invalid response format:', messages);
                    alert('Invalid message data received');
                    return;
                }
                
                messages.forEach(message => {
                    // Validate required fields
                    if (!message || typeof message !== 'object' || !message.content || !message.sender_id) {
                        console.error('Invalid message:', message);
                        return;
                    }
                    
                    // Get the creation time - it might be called 'createdAt' or 'created_at'
                    const creationTime = message.createdAt || message.created_at;
                    if (!creationTime) {
                        console.error('No creation time found in message:', message);
                        return;
                    }
                    
                    const messageDiv = document.createElement('div');
                    // Compare sender_id with current user's ID
                    messageDiv.className = `message ${message.sender_id === userId ? 'received' : 'sent'}`;
                    
                    // Format the date
                    try {
                        // Try different date formats
                        let date;
                        if (typeof creationTime === 'string') {
                            // Try MySQL format
                            date = new Date(creationTime.replace(' ', 'T') + '.000Z');
                            if (isNaN(date.getTime())) {
                                // Try ISO format
                                date = new Date(creationTime);
                            }
                        } else if (creationTime instanceof Date) {
                            date = creationTime;
                        } else {
                            console.error('Invalid date type:', typeof creationTime);
                            return;
                        }
                        
                        if (isNaN(date.getTime())) {
                            console.error('Invalid date:', creationTime);
                            return;
                        }
                        
                        // Get today's date
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        
                        // Create date object for the message
                        const messageDate = new Date(date);
                        messageDate.setHours(0, 0, 0, 0);
                        
                        // Format the time and date
                        const timeString = date.toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false
                        });
                        
                        let dateString = '';
                        if (messageDate.getTime() !== today.getTime()) {
                            dateString = date.toLocaleDateString('fr-FR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            });
                        }
                        
                        messageDiv.innerHTML = `
                            <div class="message-content">
                                <span class="message-text">${message.content}</span>
                                <span class="message-time">${dateString ? `${dateString} - ${timeString}` : timeString}</span>
                            </div>
                        `;
                        messagesContainer.appendChild(messageDiv);
                    } catch (dateError) {
                        console.error('Error parsing date:', dateError);
                    }
                });
                
                // Scroll to bottom
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            })
            .catch(error => {
                console.error('Error fetching messages:', error);
                const errorDiv = document.createElement('div');
                errorDiv.className = 'error-message';
                errorDiv.textContent = 'Failed to load messages. Please try again.';
                
                const messagesContainer = document.querySelector('.chat-messages');
                if (messagesContainer) {
                    messagesContainer.innerHTML = '';
                    messagesContainer.appendChild(errorDiv);
                }
            });
    }

    // Send message
    const sendButton = document.getElementById('sendButton');
    if (sendButton) {
        sendButton.addEventListener('click', () => {
            if (!currentChatUser) return;
            
            const messageInput = document.getElementById('messageInput');
            if (!messageInput) {
                console.error('Message input not found');
                return;
            }
            
            const content = messageInput.value.trim();
            if (!content) return;
            
            fetch('/api/chat/message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    receiver_id: currentChatUser.id,
                    content
                })
            })
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                return res.json();
            })
            .then(message => {
                messageInput.value = '';
                fetchMessages(currentChatUser.id);
            })
            .catch(error => {
                console.error('Error sending message:', error);
                alert('Failed to send message. Please try again.');
            });
        });
    } else {
        console.error('Send button not found');
    }

    // Also handle Enter key for sending
    const messageInput = document.getElementById('messageInput');
    if (messageInput) {
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (sendButton) {
                    sendButton.click();
                }
            }
        });
    }


});
