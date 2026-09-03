import { FastifyRequest, FastifyReply } from 'fastify';
import { registerUser, loginUser, getUserById } from '../services/authService.js';
import { UserRegisterInput, UserLoginInput } from '../types/index.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export const register = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { name, email, password } = request.body as UserRegisterInput;

    if (!name || !email || !password) {
      return reply.status(400).send({ error: 'Missing required fields' });
    }

    if (password.length < 6) {
      return reply.status(400).send({ error: 'Password must be at least 6 characters' });
    }

    const result = await registerUser({ name, email, password });
    return reply.status(201).send(result);
  } catch (error: any) {
    return reply.status(400).send({ error: error.message });
  }
};

export const login = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { email, password } = request.body as UserLoginInput;

    if (!email || !password) {
      return reply.status(400).send({ error: 'Missing email or password' });
    }

    const result = await loginUser({ email, password });
    return reply.send(result);
  } catch (error: any) {
    return reply.status(401).send({ error: error.message });
  }
};

export const getMe = async (request: AuthenticatedRequest, reply: FastifyReply) => {
  try {
    if (!request.user) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    const user = await getUserById(request.user.userId);
    return reply.send({
      id: user.id,
      name: user.name,
      email: user.email,
    });
  } catch (error: any) {
    return reply.status(400).send({ error: error.message });
  }
};