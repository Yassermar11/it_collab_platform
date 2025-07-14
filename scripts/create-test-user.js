const { sequelize, User } = require('../models');
const bcrypt = require('bcrypt');

async function createTestUser() {
    try {
        // Hash the password
        const password = await bcrypt.hash('test123', 10);
        
        // Create the user
        const user = await User.create({
            username: 'testuser',
            email: 'test@example.com',
            password: password,
            role: 'user'
        });

        console.log('User created successfully:', user.toJSON());
    } catch (error) {
        console.error('Error creating user:', error);
    } finally {
        // Close the database connection
        await sequelize.close();
    }
}

// Run the script
createTestUser();
