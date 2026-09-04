const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface AuthResponse {
  user: { id: string; name: string; email: string };
  token: string;
}
export interface LoginInput { email: string; password: string }
export interface RegisterInput { name: string; email: string; password: string }

export interface ServiceRequest {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: 'New' | 'In Progress' | 'Completed' | 'Archived';
  location: string | null;
  created_at: string;
  updated_at: string;
  ai_summary?: string | null;
  ai_next_action?: string | null;
  ai_confidence?: number | null;
  ai_analyzed_at?: string | null;
  ai_model?: string | null;
  allowedTransitions?: string[];
}

export interface Pagination {
  page: number; limit: number; total: number;
  totalPages: number; hasNext: boolean; hasPrev: boolean;
}

export interface RequestListResponse {
  data: ServiceRequest[];
  pagination: Pagination;
}

export interface Stats {
  total: number;
  New: number;
  'In Progress': number;
  Completed: number;
  Archived: number;
}

export interface ListFilters {
  page?: number; limit?: number; status?: string;
  priority?: string; category?: string; search?: string;
}

const getToken = () =>
  typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = { ...(options.headers as Record<string, string>) };
  if (options.body) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, { ...options, headers });
  } catch {
    throw new Error('Cannot reach the server. Is the backend running?');
  }

  if (res.status === 401 && typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    window.location.href = '/auth/login';
    throw new Error('Session expired');
  }

  if (res.status === 204) return undefined as T;

  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((body as any).error || 'Something went wrong');
  return body as T;
}

export const registerUser = (input: RegisterInput) =>
  request<AuthResponse>('/auth/register', { method: 'POST', body: JSON.stringify(input) });

export const loginUser = (input: LoginInput) =>
  request<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify(input) });

export const getMe = () => request<{ id: string; name: string; email: string }>('/me');

export const fetchRequests = (filters: ListFilters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== '' && v !== null) params.set(k, String(v));
  });
  const qs = params.toString();
  return request<RequestListResponse>(`/requests${qs ? `?${qs}` : ''}`);
};

export const fetchRequest = (id: string) => request<ServiceRequest>(`/requests/${id}`);

export const createRequest = (input: {
  title: string; description: string; category: string;
  priority: string; location?: string;
}) => request<ServiceRequest>('/requests', { method: 'POST', body: JSON.stringify(input) });

export const updateRequest = (id: string, input: Partial<{
  title: string; description: string; category: string;
  priority: string; status: string; location: string;
}>) => request<ServiceRequest>(`/requests/${id}`, { method: 'PATCH', body: JSON.stringify(input) });

export const deleteRequest = (id: string) =>
  request<void>(`/requests/${id}`, { method: 'DELETE' });

export const fetchStats = () => request<Stats>('/requests/stats');

export const fetchMeta = () =>
  request<{ statuses: string[]; priorities: string[]; categories: string[] }>('/requests/meta');
export interface AiSuggestion {
  category: string;
  priority: string;
  confidence: number;
}

export interface AnalyseResponse {
  request: ServiceRequest;
  suggestion: AiSuggestion;
}

export const analyseRequest = (id: string) =>
  request<AnalyseResponse>(`/requests/${id}/ai-analyse`, { method: 'POST' });

export interface Attachment {
  id: string;
  request_id: string;
  original_filename: string;
  storage_url: string;
  mime_type: string;
  file_size: number;
  created_at: string;
  thumbnail_url?: string | null;
}

export interface UploadResult {
  uploaded: Attachment[];
  failed: { filename: string; error: string }[];
}

export const fetchAttachments = (requestId: string) =>
  request<Attachment[]>(`/requests/${requestId}/attachments`);

export const deleteAttachment = (attachmentId: string) =>
  request<void>(`/attachments/${attachmentId}`, { method: 'DELETE' });

/**
 * Uses XMLHttpRequest rather than fetch — fetch has no upload progress events,
 * and per-file progress is part of the required upload UX.
 */
export const uploadAttachments = (
  requestId: string,
  files: File[],
  onProgress?: (percent: number) => void
): Promise<UploadResult> =>
  new Promise((resolve, reject) => {
    const token = getToken();
    const form = new FormData();
    files.forEach((f) => form.append('files', f));

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API_URL}/requests/${requestId}/attachments`);
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      let body: any = {};
      try { body = JSON.parse(xhr.responseText); } catch { /* keep {} */ }

      if (xhr.status >= 200 && xhr.status < 300) return resolve(body);
      reject(new Error(body.error || `Upload failed (${xhr.status})`));
    };

    xhr.onerror = () => reject(new Error('Network error during upload'));
    xhr.ontimeout = () => reject(new Error('Upload timed out'));
    xhr.timeout = 120000;

    xhr.send(form);
  });