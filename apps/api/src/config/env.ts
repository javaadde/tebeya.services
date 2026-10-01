import dotenv from 'dotenv';

dotenv.config();

export const ENV = {
  PORT: process.env.PORT || '5000',
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/tebeya_services',
  JWT_SECRET: process.env.JWT_SECRET || 'dev_secret',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
};
