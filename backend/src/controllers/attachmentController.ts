import { FastifyReply } from 'fastify';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { getRequestById } from '../services/requestService.js';
import { uploadBuffer, isStorageConfigured } from '../services/storageService.js';
import {
  listAttachments, saveAttachment, removeAttachment,
  countAttachments, MAX_FILE_BYTES, MAX_FILES_PER_REQUEST,
} from '../services/attachmentService.js';

/**
 * Allowlist, not a blocklist. Anything not named here is rejected, so a new
 * executable format can't slip through by virtue of not being on a ban list.
 */
const ALLOWED: Record<string, string[]> = {
  // images
  'image/jpeg': ['jpg', 'jpeg'],
  'image/png': ['png'],
  'image/webp': ['webp'],
  'image/gif': ['gif'],
  // documents
  'application/pdf': ['pdf'],
  'text/plain': ['txt'],
  'text/csv': ['csv'],
  'application/rtf': ['rtf'],
  'application/msword': ['doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['docx'],
  'application/vnd.ms-excel': ['xls'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['xlsx'],
  'application/vnd.ms-powerpoint': ['ppt'],
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['pptx'],
  // media
  'video/mp4': ['mp4'],
  'video/quicktime': ['mov'],
  'video/webm': ['webm'],
  'audio/mpeg': ['mp3'],
  'audio/wav': ['wav'],
  'audio/mp4': ['m4a'],
  // archives
  'application/zip': ['zip'],
};

const extensionOf = (name: string) =>
  (name.split('.').pop() ?? '').toLowerCase();

/** Strip directory traversal and control characters from a client-supplied name. */
const safeFilename = (name: string) =>
  name.replace(/[/\\]/g, '_').replace(/[\x00-\x1f]/g, '').trim().slice(0, 255) || 'file';

export const list = async (request: AuthenticatedRequest, reply: FastifyReply) => {
  const { id } = request.params as { id: string };
  const parent = await getRequestById(request.user!.userId, id);
  if (!parent) return reply.status(404).send({ error: 'Request not found' });

  return reply.send(await listAttachments(request.user!.userId, id));
};

export const upload = async (request: AuthenticatedRequest, reply: FastifyReply) => {
  const { id } = request.params as { id: string };
  const userId = request.user!.userId;

  // Ownership first — never touch storage for a request the user doesn't own
  const parent = await getRequestById(userId, id);
  if (!parent) return reply.status(404).send({ error: 'Request not found' });

  if (!isStorageConfigured()) {
    return reply.status(503).send({ error: 'File storage is not available right now.' });
  }

  const existing = await countAttachments(userId, id);
  const saved: any[] = [];
  const failed: { filename: string; error: string }[] = [];

  try {
    const parts = request.files({ limits: { fileSize: MAX_FILE_BYTES } });

    for await (const part of parts) {
      const filename = safeFilename(part.filename);

      if (existing + saved.length >= MAX_FILES_PER_REQUEST) {
        await part.toBuffer().catch(() => {});
        failed.push({ filename, error: `Limit of ${MAX_FILES_PER_REQUEST} files reached` });
        continue;
      }

      const ext = extensionOf(filename);
      const allowedExts = ALLOWED[part.mimetype];

      // Both must agree. A .exe renamed to .pdf fails the MIME check;
      // a real PDF with a tampered extension fails the extension check.
      if (!allowedExts || !allowedExts.includes(ext)) {
        await part.toBuffer().catch(() => {});
        failed.push({ filename, error: 'File type not allowed' });
        continue;
      }

      let buffer: Buffer;
      try {
        buffer = await part.toBuffer();
      } catch {
        failed.push({ filename, error: `File exceeds ${MAX_FILE_BYTES / 1024 / 1024}MB` });
        continue;
      }

      if (part.file.truncated || buffer.length > MAX_FILE_BYTES) {
        failed.push({ filename, error: `File exceeds ${MAX_FILE_BYTES / 1024 / 1024}MB` });
        continue;
      }

      try {
        const stored = await uploadBuffer(buffer, {
          userId, requestId: id, filename, mimeType: part.mimetype,
        });
        saved.push(
          await saveAttachment({
            requestId: id,
            userId,
            originalFilename: filename,
            storageKey: stored.storageKey,
            storageUrl: stored.url,
            mimeType: part.mimetype,
            fileSize: stored.bytes || buffer.length,
          })
        );
      } catch (err: any) {
        request.log.error({ err }, 'Attachment upload failed');
        failed.push({ filename, error: 'Upload failed. Please try again.' });
      }
    }
  } catch (err: any) {
    request.log.error({ err }, 'Multipart parse failed');
    return reply.status(400).send({ error: 'Could not read the uploaded files' });
  }

  if (saved.length === 0 && failed.length > 0) {
    return reply.status(400).send({ error: failed[0].error, uploaded: [], failed });
  }

  return reply.status(201).send({ uploaded: saved, failed });
};

export const remove = async (request: AuthenticatedRequest, reply: FastifyReply) => {
  const { attachmentId } = request.params as { attachmentId: string };
  const ok = await removeAttachment(request.user!.userId, attachmentId);
  if (!ok) return reply.status(404).send({ error: 'Attachment not found' });
  return reply.status(204).send();
};