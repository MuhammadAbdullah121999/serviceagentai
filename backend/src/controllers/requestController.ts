import { FastifyReply } from 'fastify';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { analyzeRequest, isAiConfigured } from '../services/aiService.js';
import { saveAiAnalysis } from '../services/requestService.js';
import {
  listRequests, getRequestById, createRequest, updateRequest,
  deleteRequest, getStats, canTransition, allowedNextStatuses,
  STATUSES, PRIORITIES, CATEGORIES,
} from '../services/requestService.js';

const clampInt = (raw: unknown, fallback: number, min: number, max: number) => {
  const n = parseInt(String(raw ?? ''), 10);
  if (Number.isNaN(n)) return fallback;
  return Math.min(max, Math.max(min, n));
};

export const list = async (request: AuthenticatedRequest, reply: FastifyReply) => {
  try {
    const q = request.query as Record<string, string>;

    if (q.status && !STATUSES.includes(q.status as any)) {
      return reply.status(400).send({ error: `status must be one of: ${STATUSES.join(', ')}` });
    }
    if (q.priority && !PRIORITIES.includes(q.priority as any)) {
      return reply.status(400).send({ error: `priority must be one of: ${PRIORITIES.join(', ')}` });
    }

    const result = await listRequests(request.user!.userId, {
      page: clampInt(q.page, 1, 1, 10000),
      limit: clampInt(q.limit, 10, 1, 100),
      status: q.status,
      priority: q.priority,
      category: q.category,
      search: q.search?.trim() || undefined,
    });

    return reply.send(result);
  } catch (err: any) {
    request.log.error(err);
    return reply.status(500).send({ error: 'Failed to fetch requests' });
  }
};

export const getOne = async (request: AuthenticatedRequest, reply: FastifyReply) => {
  try {
    const { id } = request.params as { id: string };
    const found = await getRequestById(request.user!.userId, id);
    if (!found) return reply.status(404).send({ error: 'Request not found' });

    return reply.send({
      ...found,
      allowedTransitions: allowedNextStatuses(found.status),
    });
  } catch (err: any) {
    request.log.error(err);
    return reply.status(500).send({ error: 'Failed to fetch request' });
  }
};

export const create = async (request: AuthenticatedRequest, reply: FastifyReply) => {
  try {
    const body = request.body as any;
    const errors: string[] = [];

    if (!body.title?.trim()) errors.push('title is required');
    else if (body.title.trim().length > 255) errors.push('title must be under 255 characters');

    if (!body.description?.trim()) errors.push('description is required');
    if (!body.category) errors.push('category is required');
    else if (!CATEGORIES.includes(body.category)) errors.push('invalid category');

    if (!body.priority) errors.push('priority is required');
    else if (!PRIORITIES.includes(body.priority)) errors.push('invalid priority');

    if (errors.length) return reply.status(400).send({ error: errors.join('; ') });

    const created = await createRequest(request.user!.userId, body);
    return reply.status(201).send(created);
  } catch (err: any) {
    request.log.error(err);
    return reply.status(500).send({ error: 'Failed to create request' });
  }
};

export const update = async (request: AuthenticatedRequest, reply: FastifyReply) => {
  try {
    const { id } = request.params as { id: string };
    const body = request.body as any;

    const existing = await getRequestById(request.user!.userId, id);
    if (!existing) return reply.status(404).send({ error: 'Request not found' });

    // Content is locked once a request reaches a terminal state.
    // Status changes are still allowed so it can be reopened or archived.
    const LOCKED = ['Completed', 'Archived'];
    const editsContent = ['title', 'description', 'category', 'priority', 'location']
      .some((f) => body[f] !== undefined);

    if (editsContent && LOCKED.includes(existing.status)) {
      return reply.status(400).send({
        error: `A ${existing.status.toLowerCase()} request cannot be edited. Reopen it first.`,
      });
    }

    if (body.status !== undefined) {
      if (!STATUSES.includes(body.status)) {
        return reply.status(400).send({ error: `status must be one of: ${STATUSES.join(', ')}` });
      }
      if (!canTransition(existing.status, body.status)) {
        return reply.status(400).send({
          error: `Cannot move from "${existing.status}" to "${body.status}"`,
          allowedTransitions: allowedNextStatuses(existing.status),
        });
      }
    }

    if (body.priority !== undefined && !PRIORITIES.includes(body.priority)) {
      return reply.status(400).send({ error: 'invalid priority' });
    }
    if (body.category !== undefined && !CATEGORIES.includes(body.category)) {
      return reply.status(400).send({ error: 'invalid category' });
    }
    if (body.title !== undefined && !body.title.trim()) {
      return reply.status(400).send({ error: 'title cannot be empty' });
    }

    const updated = await updateRequest(request.user!.userId, id, body);
    return reply.send({
      ...updated,
      allowedTransitions: allowedNextStatuses(updated!.status),
    });
  } catch (err: any) {
    request.log.error(err);
    return reply.status(500).send({ error: 'Failed to update request' });
  }
};

export const remove = async (request: AuthenticatedRequest, reply: FastifyReply) => {
  try {
    const { id } = request.params as { id: string };
    const deleted = await deleteRequest(request.user!.userId, id);
    if (!deleted) return reply.status(404).send({ error: 'Request not found' });
    return reply.status(204).send();
  } catch (err: any) {
    request.log.error(err);
    return reply.status(500).send({ error: 'Failed to delete request' });
  }
};

export const stats = async (request: AuthenticatedRequest, reply: FastifyReply) => {
  try {
    return reply.send(await getStats(request.user!.userId));
  } catch (err: any) {
    request.log.error(err);
    return reply.status(500).send({ error: 'Failed to fetch stats' });
  }
};

export const meta = async (_request: AuthenticatedRequest, reply: FastifyReply) => {
  return reply.send({
    statuses: STATUSES,
    priorities: PRIORITIES,
    categories: CATEGORIES,
  });
};
export const analyse = async (request: AuthenticatedRequest, reply: FastifyReply) => {
  const { id } = request.params as { id: string };

  const existing = await getRequestById(request.user!.userId, id);
  if (!existing) return reply.status(404).send({ error: 'Request not found' });

  if (!isAiConfigured()) {
    return reply.status(503).send({
      error: 'AI analysis is not available right now.',
      retryable: false,
    });
  }

  try {
    const ai = await analyzeRequest(existing.title, existing.description);
    const updated = await saveAiAnalysis(request.user!.userId, id, ai);

    return reply.send({
      request: { ...updated, allowedTransitions: allowedNextStatuses(updated!.status) },
      suggestion: { category: ai.category, priority: ai.priority, confidence: ai.confidence },
    });
  } catch (err: any) {
    request.log.error({ err }, 'AI analysis failed');
    // The request itself is untouched — the client keeps everything it had
    return reply.status(502).send({
      error: err.message?.includes('timed out')
        ? 'The AI service took too long to respond. Please try again.'
        : 'AI analysis failed. Your request was not changed.',
      retryable: true,
    });
  }
};