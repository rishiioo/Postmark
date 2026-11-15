import dotenv from 'dotenv';
// Configure environment variables
// Add environment-specific configurations here
// This file can be expanded to include:
// - API keys for external services
// - database connection strings
// - feature flags
// - app configuration

dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri: process.env.MONGODB_URI,
};
