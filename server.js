const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const http = require('http');
const socketIo = require('socket.io');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const dotenv = require('dotenv');
const cors = require('cors');
const { sequelize } = require('./models');

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3000;

const app = express();

// Session configuration
const sessionStore = new MySQLStore({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    checkExpirationInterval: 1000, // Check every second
    createDatabaseTable: true, // Whether or not to create the sessions table automatically.
    schema: {
        tableName: 'sessions',
        columnNames: {
            session_id: 'session_id',
            expires: 'expires',
            data: 'data'
        },
        mysql: {
            charset: 'utf8mb4',
            sql: {
                'NO_ZERO_DATE': true,
                'NO_ZERO_IN_DATE': true,
                'NO_ENGINE_SUBSTITUTION': true,
                'STRICT_TRANS_TABLES': true
            }
        }
    },
    expires: 86400000, // 24 hours in milliseconds
    touchAfter: 24 * 3600, // 24 hours
    clearExpired: true,
    cleanup: true
});

// Configure Express session
app.use(session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET || 'your-session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 86400000, // 24 hours in milliseconds
        sameSite: 'lax'
    }
}));

app.use(session({
    secret: process.env.SESSION_SECRET || 'your-session-secret',
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware
app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Initialize Socket.IO configuration
const socketConfig = require('./config/socket');
const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');
const taskRoutes = require('./routes/tasks');
const meetingsRoutes = require('./routes/meetings');
const indexRoutes = require('./routes/index');

// Mount routes
app.use('/', indexRoutes);
app.use('/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/meetings', meetingsRoutes);

socketConfig(io);

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  
  // Test database connection
  sequelize.authenticate()
    .then(() => {
      console.log('Database connection has been established successfully.');
    })
    .catch(err => {
      console.error('Unable to connect to the database:', err);
    });
});
