import pool from '../database/connection.js';
import { deleteFromStorage, thumbnailUrl } from './storageService.js';

export interface Attachment {
  id: string;
  request_id: string;
  user_id: string;
  original_filename: string;
  storage_key: string;
  storage_url: string;
  mime_type: string;
  file_size: number;
  created_at: Date;
  thumbnail_url?: string | null;
}

const withThumb = (row: Attachment): Attachment => ({
  ...row,
  file_size: Number(row.file_size),
  thumbnail_url: thumbnailUrl(row.storage_key, row.storage_url),
});

export const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB
export const MAX_FILES_PER_REQUEST = 10;

export const listAttachments = async (userId: string, requestId: string) => {
  const res = await pool.query(
    `SELECT * FROM request_attachments
     WHERE request_id = $1 AND user_id = $2
     ORDER BY created_at ASC`,
    [requestId, userId]
  );
  return res.rows.map(withThumb);
};

export const countAttachments = async (userId: string, requestId: string) => {
  const res = await pool.query(
    `SELECT COUNT(*)::int AS n FROM request_attachments
     WHERE request_id = $1 AND user_id = $2`,
    [requestId, userId]
  );
  return res.rows[0].n as number;
};

export const saveAttachment = async (input: {
  requestId: string;
  userId: string;
  originalFilename: string;
  storageKey: string;
  storageUrl: string;
  mimeType: string;
  fileSize: number;
}) => {
  const res = await pool.query(
    `INSERT INTO request_attachments
       (request_id, user_id, original_filename, storage_key, storage_url, mime_type, file_size, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
     RETURNING *`,
    [
      input.requestId, input.userId, input.originalFilename,
      input.storageKey, input.storageUrl, input.mimeType, input.fileSize,
    ]
  );
  return withThumb(res.rows[0]);
};

export const removeAttachment = async (userId: string, attachmentId: string) => {
  const found = await pool.query(
    'SELECT storage_key FROM request_attachments WHERE id = $1 AND user_id = $2',
    [attachmentId, userId]
  );
  if (found.rowCount === 0) return false;

  await pool.query(
    'DELETE FROM request_attachments WHERE id = $1 AND user_id = $2',
    [attachmentId, userId]
  );
  await deleteFromStorage(found.rows[0].storage_key);
  return true;
};