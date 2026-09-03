import Fastify from 'fastify';
import cors from '@fastify/cors';
import { authRoutes } from './routes/auth.js';
import { requestRoutes } from './routes/requests.js';

const PORT = parseInt(process.env.PORT || '5000', 10);

async function start() {
  const fastify = Fastify({
    logger: true,
  });

  // Register CORS
  await fastify.register(cors, {
    origin: ['http://localhost:3000', 'http://192.168.1.1:3000', '*'],
    credentials: true,
  });

  // Health check
  fastify.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  // API routes
  await fastify.register(authRoutes, { prefix: '/api' });
  await fastify.register(requestRoutes, { prefix: '/api' });

  try {
    await fastify.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`✅ API: http://localhost:${PORT}/api`);
    console.log(`✅ Health: http://localhost:${PORT}/health`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start().catch(console.error);