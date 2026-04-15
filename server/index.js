require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { connectToDatabase } = require('./db');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { requestLogger } = require('./middleware/requestLogger');
const sessionRoutes = require('./routes/sessions');

const app = express();
const port = process.env.PORT || 4000;
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/milking_tracker';
const frontendOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:3000';

app.use(cors({ origin: frontendOrigin }));
app.use(express.json({ limit: '1mb' }));
app.use(requestLogger);

app.get('/health', (req, res) => {
    const dbState = mongoose.connection.readyState;
    const dbStatus = dbState === 1 ? 'connected' : 'disconnected';

    res.json({
        data: {
            status: dbState === 1 ? 'ok' : 'degraded',
            database: dbStatus
        }
    });
});

app.get('/', (req, res) => {
    res.json({
        data: {
            status: 'Milking Tracker backend is running'
        }
    });
});

app.use('/sessions', sessionRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

connectToDatabase(mongoUri)
    .then(() => {
        console.log('Connected to MongoDB');
        app.listen(port, () => {
            console.log(`Server listening on http://localhost:${port}`);
        });
    })
    .catch((error) => {
        console.error('MongoDB connection error:', error.message);
        process.exit(1);
    });
