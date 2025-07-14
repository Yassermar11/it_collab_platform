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
                
                // Create username text
                const username = document.createElement('span');
                username.className = 'username';
                username.textContent = user.username;
                
                // Combine elements
                userElement.appendChild(avatar);
                userElement.appendChild(username);
                
                // Add event listeners
                userElement.addEventListener('mouseenter', () => {
                    userElement.style.transform = 'scale(1.05)';
                    userElement.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                });

                userElement.addEventListener('mouseleave', () => {
                    userElement.style.transform = 'scale(1)';
                    userElement.style.boxShadow = 'none';
                });

                userElement.addEventListener('click', () => selectUser(user));
                
                usersContainer.appendChild(userElement);
            });
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    }

    // Initialize chat when the page loads
    fetchUsers();

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
                    if (!message || typeof message !== 'object' || !message.content || !message.senderId) {
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
                    // Compare senderId with current user's ID
                    messageDiv.className = `message ${message.senderId === userId ? 'received' : 'sent'}`;
                    
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
                        
                        const timeString = date.toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false
                        });
                        
                        messageDiv.innerHTML = `
                            <div class="message-content">
                                <span class="message-text">${message.content}</span>
                                <span class="message-time">${timeString}</span>
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
                    receiverId: currentChatUser.id,
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

    // Fetch users every 30 seconds to keep the list updated
    setInterval(fetchUsers, 30000);
});
