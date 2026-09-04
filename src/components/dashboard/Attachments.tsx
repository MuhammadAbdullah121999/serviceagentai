'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Upload, X, Trash2, Loader2, AlertCircle, Download,
  FileText, FileSpreadsheet, FileImage, FileVideo, FileAudio,
  FileArchive, File as FileIcon,
} from 'lucide-react';
import {
  Attachment, fetchAttachments, uploadAttachments, deleteAttachment,
} from '@/lib/api';

const MAX_BYTES = 10 * 1024 * 1024;
const MAX_FILES = 10;

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

const iconFor = (mime: string) => {
  if (mime.startsWith('image/')) return FileImage;
  if (mime.startsWith('video/')) return FileVideo;
  if (mime.startsWith('audio/')) return FileAudio;
  if (mime.includes('zip')) return FileArchive;
  if (mime.includes('sheet') || mime.includes('excel') || mime.includes('csv')) return FileSpreadsheet;
  if (mime.includes('pdf') || mime.includes('word') || mime.includes('text')) return FileText;
  return FileIcon;
};

interface Props {
  requestId: string;
  readOnly?: boolean;
}

export function Attachments({ requestId, readOnly = false }: Props) {
  const [items, setItems] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [rejected, setRejected] = useState<{ filename: string; error: string }[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    try {
      setItems(await fetchAttachments(requestId));
      setError('');
    } catch (err: any) {
      setError(err.message || 'Could not load attachments');
    } finally {
      setLoading(false);
    }
  }, [requestId]);

  useEffect(() => { load(); }, [load]);

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    const files = Array.from(fileList);
    const tooBig = files.filter((f) => f.size > MAX_BYTES);
    const ok = files.filter((f) => f.size <= MAX_BYTES);

    setRejected(tooBig.map((f) => ({ filename: f.name, error: 'Exceeds 10 MB' })));

    if (ok.length === 0) return;
    if (items.length + ok.length > MAX_FILES) {
      setRejected((r) => [...r, { filename: '', error: `Limit is ${MAX_FILES} files per request` }]);
      return;
    }

    setUploading(true);
    setProgress(0);
    setError('');

    try {
      const res = await uploadAttachments(requestId, ok, setProgress);
      setItems((prev) => [...prev, ...res.uploaded]);
      if (res.failed?.length) setRejected((r) => [...r, ...res.failed]);
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      setProgress(0);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const remove = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteAttachment(id);
      setItems((prev) => prev.filter((a) => a.id !== id));
    } catch (err: any) {
      setError(err.message || 'Could not delete the file');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="bg-white border border-neutral-300 rounded-lg p-6">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="font-semibold text-neutral-900">Attachments</h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            {items.length === 0 ? 'None yet' : `${items.length} of ${MAX_FILES}`}
            {!readOnly && ' · optional'}
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">
          <AlertCircle size={16} className="text-red-600 mt-0.5 shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {rejected.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">
          <div className="flex items-start justify-between gap-2">
            <div className="text-sm text-amber-800 space-y-0.5">
              {rejected.map((r, i) => (
                <p key={i}>
                  {r.filename && <span className="font-medium">{r.filename}</span>}
                  {r.filename && ' — '}
                  {r.error}
                </p>
              ))}
            </div>
            <button
              onClick={() => setRejected([])}
              className="text-amber-600 hover:text-amber-800 shrink-0"
            >
              <X size={15} />
            </button>
          </div>
        </div>
      )}

      {!readOnly && items.length < MAX_FILES && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            if (!uploading) handleFiles(e.dataTransfer.files);
          }}
          onClick={() => !uploading && inputRef.current?.click()}
          className={`rounded-lg border-2 border-dashed px-4 py-8 text-center cursor-pointer transition-smooth mb-4 ${
            dragging
              ? 'border-primary-500 bg-primary-50'
              : 'border-neutral-300 hover:border-primary-300 hover:bg-neutral-50'
          } ${uploading ? 'pointer-events-none opacity-60' : ''}`}
        >
          <input
            ref={inputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />

          {uploading ? (
            <div>
              <Loader2 size={24} className="mx-auto text-primary-600 animate-spin mb-3" />
              <p className="text-sm font-medium text-neutral-900 mb-2">
                Uploading… {progress}%
              </p>
              <div className="max-w-xs mx-auto h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-600 transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : (
            <>
              <Upload size={22} className="mx-auto text-neutral-400 mb-2" />
              <p className="text-sm text-neutral-700">
                Drag files here, or <span className="text-primary-600 font-medium">browse</span>
              </p>
              <p className="text-xs text-neutral-500 mt-1">
                Images, PDF, Word, Excel, PowerPoint, video, audio, ZIP · up to 10 MB each
              </p>
            </>
          )}
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          {[0, 1].map((i) => (
            <div key={i} className="h-14 bg-neutral-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        readOnly ? <p className="text-sm text-neutral-500">No files attached.</p> : null
      ) : (
        <ul className="space-y-2">
          {items.map((a) => {
            const Icon = iconFor(a.mime_type);
            return (
              <li
                key={a.id}
                className="flex items-center gap-3 border border-neutral-200 rounded-lg px-3 py-2.5 hover:bg-neutral-50 transition-smooth"
              >
                {a.thumbnail_url ? (
                  <img
                    src={a.thumbnail_url}
                    alt=""
                    className="w-10 h-10 rounded object-cover shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded bg-neutral-100 flex items-center justify-center shrink-0">
                    <Icon size={18} className="text-neutral-500" />
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-neutral-900 truncate">
                    {a.original_filename}
                  </p>
                  <p className="text-xs text-neutral-500">{formatSize(a.file_size)}</p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <a
                    href={a.storage_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Open"
                    className="p-2 text-neutral-500 hover:text-primary-600 hover:bg-neutral-100 rounded-lg transition-smooth"
                  >
                    <Download size={15} />
                  </a>
                  {!readOnly && (
                    <button
                      onClick={() => remove(a.id)}
                      disabled={deletingId === a.id}
                      title="Remove"
                      className="p-2 text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50 transition-smooth"
                    >
                      {deletingId === a.id
                        ? <Loader2 size={15} className="animate-spin" />
                        : <Trash2 size={15} />}
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
