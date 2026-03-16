import app from './app.js';

// Catch-all handler for Vercel serverless functions under /api/*
// Export the Express app directly so Vercel forwards requests.
export default app;