import { FastifyInstance } from 'fastify';
import { register, login, getMe } from '../controllers/authController.js';
import { verifyToken } from '../middleware/auth.js';

export async function authRoutes(fastify: FastifyInstance) {
  // Register
  fastify.post('/auth/register', register);

  // Login
  fastify.post('/auth/login', login);

  // Get current user (protected)
  fastify.get('/me', { onRequest: [verifyToken] }, getMe);
}