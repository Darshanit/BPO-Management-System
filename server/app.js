const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const path = require('path');

const { errorHandler, notFound } = require('./middlewares/error.middleware');
const { apiLimiter } = require('./middlewares/security.middleware');
const logger = require('./utils/logger');

const app = express();

// ---------- Security Middleware ----------
app.use(helmet()); // secure HTTP headers
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true, // allow httpOnly refresh-token cookie
  })
);
app.use(mongoSanitize()); // strip $ and . from req.body/query/params to prevent NoSQL injection
app.use(xss()); // sanitize user input against XSS
app.use(hpp()); // protect against HTTP parameter pollution
app.use('/api', apiLimiter); // global rate limiting on all API routes

// ---------- Core Middleware ----------
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(compression());
app.use(
  morgan('combined', {
    stream: { write: (message) => logger.info(message.trim()) },
  })
);

// Static file serving for uploaded documents/avatars
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ---------- Health Check ----------
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'BPO Management System API is running' });
});

// ---------- Routes ----------
app.use('/api/auth', require('./routes/auth.routes'));
// Phase 6 will add: users, employees, departments, attendance, leaves, payroll,
// projects, tasks, clients, chat, reports, settings routes here.

// ---------- 404 + Error Handling (must be last) ----------
app.use(notFound);
app.use(errorHandler);

module.exports = app;
