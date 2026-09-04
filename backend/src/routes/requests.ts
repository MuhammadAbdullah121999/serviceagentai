import { FastifyInstance } from 'fastify';
import { verifyToken } from '../middleware/auth.js';
import {
  list, getOne, create, update, remove, stats, meta,
} from '../controllers/requestController.js';

export async function requestRoutes(fastify: FastifyInstance) {
  fastify.addHook('onRequest', verifyToken);

  fastify.get('/requests/meta', meta);
  fastify.get('/requests/stats', stats);

  fastify.get('/requests', list);
  fastify.post('/requests', create);
  fastify.get('/requests/:id', getOne);
  fastify.patch('/requests/:id', update);
  fastify.delete('/requests/:id', remove);
}