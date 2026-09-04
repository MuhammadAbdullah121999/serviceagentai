import { FastifyInstance } from 'fastify';
import { verifyToken } from '../middleware/auth.js';
import {
  list as listAttachments,
  upload as uploadAttachments,
  remove as removeAttachment,
} from '../controllers/attachmentController.js';
import {
  list, getOne, create, update, remove, stats, meta, analyse,
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
  fastify.post('/requests/:id/ai-analyse', analyse);
  fastify.get('/requests/:id/attachments', listAttachments);
  fastify.post('/requests/:id/attachments', uploadAttachments);
  fastify.delete('/attachments/:attachmentId', removeAttachment);
}