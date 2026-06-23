const requiredVars = [
  'PORT',
  'MONGO_URI',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'CLIENT_URL',
  'NODE_ENV',
];

/**
 * Validates that all required environment variables are set.
 * Throws on startup if any are missing — fail fast.
 */
const validateEnv = () => {
  const missing = requiredVars.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `❌ Missing required environment variables:\n${missing
        .map((v) => `   • ${v}`)
        .join('\n')}\n\nCopy .env.example → .env and fill in all values.`
    );
  }
};

module.exports = validateEnv;
