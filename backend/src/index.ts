import Fastify from 'fastify';
import cors from '@fastify/cors';
import { authRoutes } from './routes/auth.js';
import { requestRoutes } from './routes/requests.js';

const PORT = parseInt(process.env.PORT || '5000', 10);

async function start() {
  const fastify = Fastify({
    logger: true,
  });

  // DELETE requests often send Content-Type: application/json with no body.
  // Without this, Fastify rejects them with 400 before the handler runs.
  fastify.addContentTypeParser(
    'application/json',
    { parseAs: 'string' },
    (_req, body, done) => {
      if (body === '' || body === undefined) return done(null, undefined);
      try {
        done(null, JSON.parse(body as string));
      } catch (err) {
        done(err as Error, undefined);
      }
    }
  );

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