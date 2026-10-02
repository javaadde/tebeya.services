import { createApp } from './app.js';
import { connectDB } from './config/db.js';
import { ENV } from './config/env.js';

async function bootstrap() {
  const app = createApp();

  if (process.env.NODE_ENV !== 'test') {
    await connectDB();
  }

  const port = Number(ENV.PORT);
  app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 [API] Server running locally at:   http://localhost:${port}`);
    console.log(`🌐 [API] Server running on network at: http://0.0.0.0:${port}`);
    console.log(`🩺 [API] Health check:                http://localhost:${port}/api/health`);
  });
}

bootstrap().catch((err) => {
  console.error('[API] Failed to start server:', err);
  process.exit(1);
});
