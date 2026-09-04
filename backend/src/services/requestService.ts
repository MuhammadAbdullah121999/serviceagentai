import pool from '../database/connection.js';
import {
  ServiceRequest,
  CreateRequestInput,
  UpdateRequestInput,
} from '../types/index.js';

export const STATUSES = ['New', 'In Progress', 'Completed', 'Archived'] as const;
export const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'] as const;

export const CATEGORIES = [
  'Plumbing', 'Electrical', 'HVAC', 'Roofing', 'Carpentry',
  'Painting', 'Flooring', 'Landscaping', 'Cleaning',
  'General Maintenance', 'Other',
] as const;

// Which statuses a request may move to from its current one
const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  'New':         ['In Progress', 'Archived'],
  'In Progress': ['Completed', 'New', 'Archived'],
  'Completed':   ['Archived', 'In Progress'],
  'Archived':    ['New'],
};

export const canTransition = (from: string, to: string): boolean => {
  if (from === to) return true;
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
};

export const allowedNextStatuses = (current: string): string[] =>
  ALLOWED_TRANSITIONS[current] ?? [];

interface ListOptions {
  page: number;
  limit: number;
  status?: string;
  priority?: string;
  category?: string;
  search?: string;
}

export const listRequests = async (userId: string, opts: ListOptions) => {
  const where: string[] = ['user_id = $1'];
  const values: any[] = [userId];

  if (opts.status) {
    values.push(opts.status);
    where.push(`status = $${values.length}`);
  }
  if (opts.priority) {
    values.push(opts.priority);
    where.push(`priority = $${values.length}`);
  }
  if (opts.category) {
    values.push(opts.category);
    where.push(`category = $${values.length}`);
  }
  if (opts.search) {
    values.push(`%${opts.search}%`);
    where.push(`(title ILIKE $${values.length} OR description ILIKE $${values.length})`);
  }

  const whereSql = where.join(' AND ');

  const countResult = await pool.query(
    `SELECT COUNT(*)::int AS total FROM service_requests WHERE ${whereSql}`,
    values
  );
  const total = countResult.rows[0].total;

  const offset = (opts.page - 1) * opts.limit;
  values.push(opts.limit, offset);

  const result = await pool.query(
    `SELECT * FROM service_requests
     WHERE ${whereSql}
     ORDER BY created_at DESC
     LIMIT $${values.length - 1} OFFSET $${values.length}`,
    values
  );

  return {
    data: result.rows as ServiceRequest[],
    pagination: {
      page: opts.page,
      limit: opts.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / opts.limit)),
      hasNext: opts.page * opts.limit < total,
      hasPrev: opts.page > 1,
    },
  };
};

export const getRequestById = async (userId: string, id: string) => {
  const result = await pool.query(
    'SELECT * FROM service_requests WHERE id = $1 AND user_id = $2',
    [id, userId]
  );
  return (result.rows[0] as ServiceRequest) ?? null;
};

export const createRequest = async (userId: string, input: CreateRequestInput) => {
  const result = await pool.query(
    `INSERT INTO service_requests
       (user_id, title, description, category, priority, status, location, photo_url, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, 'New', $6, $7, NOW(), NOW())
     RETURNING *`,
    [
      userId,
      input.title.trim(),
      input.description.trim(),
      input.category,
      input.priority,
      input.location?.trim() ?? null,
      input.photo_url ?? null,
    ]
  );
  return result.rows[0] as ServiceRequest;
};

export const updateRequest = async (
  userId: string,
  id: string,
  input: UpdateRequestInput
) => {
  const sets: string[] = [];
  const values: any[] = [];

  const assign = (column: string, value: any) => {
    values.push(value);
    sets.push(`${column} = $${values.length}`);
  };

  if (input.title !== undefined) assign('title', input.title.trim());
  if (input.description !== undefined) assign('description', input.description.trim());
  if (input.category !== undefined) assign('category', input.category);
  if (input.priority !== undefined) assign('priority', input.priority);
  if (input.status !== undefined) assign('status', input.status);
  if (input.location !== undefined) assign('location', input.location?.trim() ?? null);

  if (sets.length === 0) return getRequestById(userId, id);

  sets.push('updated_at = NOW()');
  values.push(id, userId);

  const result = await pool.query(
    `UPDATE service_requests SET ${sets.join(', ')}
     WHERE id = $${values.length - 1} AND user_id = $${values.length}
     RETURNING *`,
    values
  );
  return (result.rows[0] as ServiceRequest) ?? null;
};

export const deleteRequest = async (userId: string, id: string) => {
  const result = await pool.query(
    'DELETE FROM service_requests WHERE id = $1 AND user_id = $2 RETURNING id',
    [id, userId]
  );
  return result.rowCount! > 0;
};

export const getStats = async (userId: string) => {
  const result = await pool.query(
    `SELECT status, COUNT(*)::int AS count
     FROM service_requests WHERE user_id = $1 GROUP BY status`,
    [userId]
  );

  const stats: Record<string, number> = {
    total: 0, New: 0, 'In Progress': 0, Completed: 0, Archived: 0,
  };
  result.rows.forEach((r) => {
    stats[r.status] = r.count;
    stats.total += r.count;
  });
  return stats;
};