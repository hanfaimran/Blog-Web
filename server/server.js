const dotenv = require('dotenv');

// Load .env BEFORE anything else
dotenv.config({ path: '../.env' });

const validateEnv = require('./config/env');
const connectDB = require('./config/db');
const app = require('./app');

// Validate all required env vars are present
validateEnv();

const PORT = process.env.PORT || 5000;

// ── Start Server ───────────────────────────────────────────────────────
const start = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
      console.log(`   API:    http://localhost:${PORT}/api`);
      console.log(`   Health: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

start();

// ── Handle unhandled rejections ────────────────────────────────────────
process.on('unhandledRejection', (err) => {
  console.error('💥 UNHANDLED REJECTION:', err.message);
  process.exit(1);
});

// ── Handle uncaught exceptions ─────────────────────────────────────────
process.on('uncaughtException', (err) => {
  console.error('💥 UNCAUGHT EXCEPTION:', err.message);
  process.exit(1);
});
