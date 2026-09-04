import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { authRoutes } from './routes/auth.js';
import { requestRoutes } from './routes/requests.js';
import multipart from '@fastify/multipart';

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

  // CORS — explicit origins, no wildcard. Bearer tokens don't need credentials.
  const allowedOrigins = (process.env.CORS_ORIGINS ?? 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim());

  await fastify.register(cors, {
    origin: (origin, cb) => {
      // allow tools with no Origin header (curl, Postman, Android)
      if (!origin) return cb(null, true);
      cb(null, allowedOrigins.includes(origin));
    },
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false,
  });

  await fastify.register(multipart, {
    limits: {
      fileSize: 10 * 1024 * 1024,
      files: 10,
    },
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