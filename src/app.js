const express = require('express');
const path = require('path');
const app = express();
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const groupRoutes = require('./routes/group.routes');
const incidentRoutes = require('./routes/incident.routes');
const notificationRoutes = require('./routes/notification.routes');
const communityRoutes = require('./routes/community.routes');
const errorHandler = require('./middlewares/error.middleware');

app.use(express.json({ limit: '8mb' }));
app.use(express.urlencoded({ extended: true, limit: '8mb' }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// Public auth routes
app.use('/api/auth', authRoutes);

// Protected user routes
app.use('/api/users', userRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/community', communityRoutes);

// Serve index.html for all non-API routes (SPA routing)
app.get('*', (req, res, next) => {
    if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(__dirname, '../public/index.html'));
    } else {
        const error = new Error('Route not found');
        error.statusCode = 404;
        next(error);
    }
});

// Centralized error middleware
app.use(errorHandler);

module.exports = app;
