const bcrypt = require('bcrypt');
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'users',
  timestamps: false,
});

async function updatePassword() {
  try {
    // Find the test user
    const user = await User.findOne({ where: { email: 'test@example.com' } });
    
    if (!user) {
      console.log('Test user not found. Creating a new test user...');
      const hashedPassword = await bcrypt.hash('testpassword', 10);
      await User.create({
        email: 'test@example.com',
        password: hashedPassword,
        username: 'testuser',
        role: 'user'
      });
      console.log('Test user created successfully!');
    } else {
      // Hash the password if it's not already hashed
      if (!user.password.startsWith('$2b$')) {
        const hashedPassword = await bcrypt.hash('testpassword', 10);
        user.password = hashedPassword;
        await user.save();
        console.log('Password updated successfully!');
      } else {
        console.log('Password is already hashed.');
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error updating password:', error);
    process.exit(1);
  }
}

updatePassword();
