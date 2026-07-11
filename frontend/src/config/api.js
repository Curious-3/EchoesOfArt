// Centralized API base URL - reads from environment variable
// In development: VITE_API_URL=http://localhost:8000 (from .env)
// In production: VITE_API_URL=https://your-backend.onrender.com (from .env.production or Vercel env vars)
const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default API;
