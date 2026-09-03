import { FastifyInstance } from 'fastify';
import { verifyToken } from '../middleware/auth.js';

export async function requestRoutes(fastify: FastifyInstance) {
  // Get all requests for user (protected)
  fastify.get(
    '/requests',
    { onRequest: [verifyToken] },
    async (request, reply) => {
      return { message: 'Get all requests - Coming soon' };
    }
  );

  // Create new request (protected)
  fastify.post(
    '/requests',
    { onRequest: [verifyToken] },
    async (request, reply) => {
      return { message: 'Create request - Coming soon' };
    }
  );

  // Get single request (protected)
  fastify.get(
    '/requests/:id',
    { onRequest: [verifyToken] },
    async (request, reply) => {
      return { message: 'Get request - Coming soon' };
    }
  );

  // Update request (protected)
  fastify.patch(
    '/requests/:id',
    { onRequest: [verifyToken] },
    async (request, reply) => {
      return { message: 'Update request - Coming soon' };
    }
  );
}