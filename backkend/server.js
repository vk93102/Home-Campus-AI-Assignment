require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./config/database');
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');

const app = express();
const PORT = process.env.PORT || 3001;

// --- Middleware and Routes Setup ---
app.use(cors());
app.use(express.json());
app.use('/auth', authRoutes);
app.use('/api/students', studentRoutes);

// --- Asynchronous Start Function ---
const startServer = async () => {
    try {
        console.log('--- Connecting to database... ---');
        // 1. Test the connection and set up tables. This will throw an error if it fails.
        await db.setupTables();
        console.log('✅ Database connection successful and tables are ready.');

        // 2. Only start the server if the database connection was successful.
        app.listen(PORT, () => {
            console.log(`🚀 Server is now running on http://localhost:${PORT}`);
        });

    } catch (error) {
        // 3. If the database fails to connect, log the fatal error and exit.
        console.error('❌ FATAL ERROR: Could not connect to the database.');
        console.error(error);
        process.exit(1); // Exit with a failure code.
    }
};

startServer();
