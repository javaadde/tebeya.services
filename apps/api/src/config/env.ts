import dotenv from 'dotenv';

dotenv.config();

export const ENV = {
  PORT: process.env.PORT || '5000',
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/tebeya_services',
  JWT_SECRET: process.env.JWT_SECRET || 'dev_secret',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',

  // Admin web portal authorized emails (comma-separated list)
  ADMIN_WEB_CONTROL_EMAILS:
    process.env.admin_web_controll_emails ||
    process.env.ADMIN_WEB_CONTROLL_EMAILS ||
    process.env.admin_web_control_emails ||
    process.env.ADMIN_WEB_CONTROL_EMAILS ||
    'admin@tebeya.services',

  // SMTP configuration for Nodemailer
  SMTP_HOST: process.env.SMTP_HOST || '',
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587', 10),
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  SMTP_FROM: process.env.SMTP_FROM || 'Tebeya Services <noreply@tebeya.services>',
};

export function isAuthorizedAdminEmail(email: string): boolean {
  if (!email) return false;
  const cleanEmail = email.trim().toLowerCase();
  const allowed = (ENV.ADMIN_WEB_CONTROL_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return allowed.includes(cleanEmail);
}
