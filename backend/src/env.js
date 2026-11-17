import dns from 'node:dns';
import dotenv from 'dotenv';

// Loads backend/.env.local first (what you were using), then backend/.env. Real environment variables always win.
dotenv.config({ path: process.env.DOTENV_PATH || '.env.local' });
dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri: process.env.MONGODB_URI,
  // Comma-separated list of allowed frontend origins, e.g. http://localhost:3000,https://postmark.vercel.app
  clientUrls: (process.env.CLIENT_URL || 'http://localhost:3000').split(',').map((u) => u.trim()).filter(Boolean),
  llm: {
    provider: process.env.LLM_PROVIDER || 'gemini', // 'gemini' or 'openai' (any OpenAI-compatible API, e.g. Groq)
    apiKey: process.env.LLM_API_KEY,
    model: process.env.LLM_MODEL || 'gemini-flash-latest',
    baseUrl: process.env.LLM_BASE_URL || 'https://api.groq.com/openai/v1',
  },
};

// Some networks/ISPs block SRV lookups for Atlas (mongodb+srv://) and fail with `querySrv ECONNREFUSED`.
// Using public DNS fixes it. This lives here so the server AND the seed script both get it.
// Set USE_CUSTOM_DNS=false to turn it off.
if (process.env.USE_CUSTOM_DNS !== 'false' && String(config.mongodbUri || '').startsWith('mongodb+srv://')) {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
}
