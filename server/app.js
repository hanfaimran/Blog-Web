const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

const errorHandler = require('./middleware/errorHandler');
const authRoutes = require('./routes/auth.routes');
const blogRoutes = require('./routes/blog.routes');
const userRoutes = require('./routes/user.routes');

const app = express();

// ── Security Headers ───────────────────────────────────────────────────
app.use(helmet());

// ── CORS — allow only the frontend origin ──────────────────────────────
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true, // Allow cookies
  })
);

// ── HTTP Request Logging ───────────────────────────────────────────────
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ── Body Parsers ───────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ── Rate Limiting — auth routes ────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 500 : 10, // Higher limit for development
  message: {
    success: false,
    error: 'Too many requests from this IP. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ── API Routes ─────────────────────────────────────────────────────────
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/admin/users', userRoutes);

// ── Health Check ───────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    data: { status: 'ok', timestamp: new Date().toISOString() },
    message: 'Server is running.',
  });
});

// ── 404 Handler ────────────────────────────────────────────────────────
app.all('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.originalUrl} not found.`,
  });
});

// ── Global Error Handler ───────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
