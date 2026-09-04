'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { AiPanel } from '@/components/dashboard/AiPanel';
import { Attachments } from '@/components/dashboard/Attachments';
import {
  ArrowLeft, AlertCircle, RefreshCw, Loader2, Pencil,
  Trash2, X, Check, MapPin, Calendar, Tag, Lock,
} from 'lucide-react';
import {
  fetchRequest, updateRequest, deleteRequest, fetchMeta, analyseRequest,
  ServiceRequest, AiSuggestion,
} from '@/lib/api';

const STATUS_STYLES: Record<string, string> = {
  'New': 'bg-blue-50 text-blue-700 border-blue-200',
  'In Progress': 'bg-amber-50 text-amber-700 border-amber-200',
  'Completed': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Archived': 'bg-neutral-100 text-neutral-600 border-neutral-300',
};

const PRIORITY_STYLES: Record<string, string> = {
  Urgent: 'bg-red-50 text-red-700 border-red-200',
  High: 'bg-orange-50 text-orange-700 border-orange-200',
  Medium: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  Low: 'bg-neutral-100 text-neutral-600 border-neutral-300',
};

export default function RequestDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [req, setReq] = useState<ServiceRequest | null>(null);
  const [meta, setMeta] = useState<{ priorities: string[]; categories: string[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ title: '', description: '', category: '', priority: '', location: '' });
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState('');
  const [toast, setToast] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [suggestion, setSuggestion] = useState<AiSuggestion | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [accepting, setAccepting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setReq(await fetchRequest(id));
    } catch (err: any) {
      setError(err.message || 'Could not load this request');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { fetchMeta().then(setMeta).catch(() => {}); }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  const changeStatus = async (next: string) => {
    if (!req) return;
    setSaving(true);
    setActionError('');
    try {
      const updated = await updateRequest(req.id, { status: next });
      setReq(updated);
      setToast(`Moved to ${next}`);
    } catch (err: any) {
      setActionError(err.message || 'Could not update status');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = () => {
    if (!req) return;
    setDraft({
      title: req.title,
      description: req.description,
      category: req.category,
      priority: req.priority,
      location: req.location ?? '',
    });
    setActionError('');
    setEditing(true);
  };

  const saveEdit = async () => {
    if (!req) return;
    if (!draft.title.trim() || !draft.description.trim()) {
      setActionError('Title and description cannot be empty');
      return;
    }
    setSaving(true);
    setActionError('');
    try {
      const updated = await updateRequest(req.id, {
        title: draft.title.trim(),
        description: draft.description.trim(),
        category: draft.category,
        priority: draft.priority,
        location: draft.location.trim(),
      });
      setReq(updated);
      setEditing(false);
      setToast('Changes saved');
    } catch (err: any) {
      setActionError(err.message || 'Could not save changes');
    } finally {
      setSaving(false);
    }
  };

  const doDelete = async () => {
    setDeleting(true);
    try {
      await deleteRequest(id);
      router.push('/dashboard/requests');
    } catch (err: any) {
      setActionError(err.message || 'Could not delete');
      setDeleting(false);
      setConfirmDelete(false);
    }
  };
 
   const runAnalysis = async () => {
    setAiLoading(true);
    setAiError('');
    try {
      const res = await analyseRequest(id);
      setReq(res.request);
      setSuggestion(res.suggestion);
      setToast('Analysis complete');
    } catch (err: any) {
      // The request itself is untouched — only the analysis failed
      setAiError(err.message || 'Something went wrong');
    } finally {
      setAiLoading(false);
    }
  };

  const acceptSuggestion = async (patch: { category?: string; priority?: string }) => {
    setAccepting(true);
    try {
      const updated = await updateRequest(id, patch);
      setReq(updated);
      setSuggestion(null);
      setToast('Suggestions applied');
    } catch (err: any) {
      setActionError(err.message || 'Could not apply suggestions');
    } finally {
      setAccepting(false);
    }
  };
  
  const field = 'w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-600';

  if (loading) {
    return (
      <div className="max-w-3xl space-y-4">
        <div className="h-4 w-32 bg-neutral-200 rounded animate-pulse" />
        <div className="bg-white border border-neutral-300 rounded-lg p-6 space-y-4">
          <div className="h-7 w-2/3 bg-neutral-200 rounded animate-pulse" />
          <div className="h-4 w-full bg-neutral-100 rounded animate-pulse" />
          <div className="h-4 w-4/5 bg-neutral-100 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !req) {
    return (
      <div className="max-w-3xl">
        <Link href="/dashboard/requests" className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-primary-600 mb-6 transition-smooth">
          <ArrowLeft size={16} />
          Back to requests
        </Link>
        <div className="bg-white border border-red-200 rounded-lg p-8 text-center">
          <AlertCircle className="mx-auto text-red-500 mb-3" size={32} />
          <p className="text-neutral-900 font-medium mb-1">Request not found</p>
          <p className="text-neutral-600 text-sm mb-5">{error || 'It may have been deleted.'}</p>
          <button onClick={load} className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-smooth">
            <RefreshCw size={15} />
            Try again
          </button>
        </div>
      </div>
    );
  }

  const transitions = req.allowedTransitions ?? [];
  const canEdit = !['Completed', 'Archived'].includes(req.status);
  return (
    <div className="max-w-3xl space-y-6">
      {toast && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 bg-neutral-900 text-white text-sm px-4 py-2.5 rounded-lg shadow-lg">
          <Check size={16} className="text-emerald-400" />
          {toast}
        </div>
      )}

      <div className="flex items-center justify-between gap-4">
        <Link href="/dashboard/requests" className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-primary-600 transition-smooth">
          <ArrowLeft size={16} />
          Back to requests
        </Link>
        <div className="flex items-center gap-2">
          {!editing && canEdit && (
            <button onClick={startEdit} className="inline-flex items-center gap-2 px-3 py-1.5 border border-neutral-300 text-neutral-700 text-sm font-medium rounded-lg hover:bg-neutral-50 transition-smooth">
              <Pencil size={14} />
              Edit
            </button>
          )}
          {!editing && !canEdit && (
            <span className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-neutral-500">
              <Lock size={14} />
              Locked
            </span>
          )}
          <button onClick={() => setConfirmDelete(true)} className="inline-flex items-center gap-2 px-3 py-1.5 border border-neutral-300 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 hover:border-red-200 transition-smooth">
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      </div>

      {actionError && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          <AlertCircle size={18} className="text-red-600 mt-0.5 shrink-0" />
          <p className="text-sm text-red-700">{actionError}</p>
        </div>
      )}

      {/* Main card */}
      <div className="bg-white border border-neutral-300 rounded-lg p-6">
        {editing ? (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Title</label>
              <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} className={field} disabled={saving} />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Description</label>
              <textarea rows={5} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} className={`${field} resize-y`} disabled={saving} />
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Category</label>
                <select value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} className={`${field} bg-white`} disabled={saving}>
                  {meta?.categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Priority</label>
                <select value={draft.priority} onChange={(e) => setDraft({ ...draft, priority: e.target.value })} className={`${field} bg-white`} disabled={saving}>
                  {meta?.priorities.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Location</label>
              <input value={draft.location} onChange={(e) => setDraft({ ...draft, location: e.target.value })} className={field} disabled={saving} />
            </div>
            <div className="flex items-center gap-3 pt-2 border-t border-neutral-200">
              <button onClick={saveEdit} disabled={saving} className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-smooth">
                {saving && <Loader2 size={15} className="animate-spin" />}
                {saving ? 'Saving…' : 'Save changes'}
              </button>
              <button onClick={() => setEditing(false)} disabled={saving} className="px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 rounded-lg transition-smooth">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
              <h1 className="text-xl font-bold text-neutral-900">{req.title}</h1>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`px-2.5 py-1 text-xs font-medium rounded border ${PRIORITY_STYLES[req.priority] ?? PRIORITY_STYLES.Low}`}>
                  {req.priority}
                </span>
                <span className={`px-2.5 py-1 text-xs font-medium rounded border ${STATUS_STYLES[req.status]}`}>
                  {req.status}
                </span>
              </div>
            </div>

            <p className="text-neutral-700 leading-relaxed whitespace-pre-wrap mb-6">
              {req.description}
            </p>

            <dl className="grid sm:grid-cols-3 gap-4 pt-5 border-t border-neutral-200 text-sm">
              <div>
                <dt className="flex items-center gap-1.5 text-xs text-neutral-500 mb-1">
                  <Tag size={13} /> Category
                </dt>
                <dd className="text-neutral-900">{req.category}</dd>
              </div>
              <div>
                <dt className="flex items-center gap-1.5 text-xs text-neutral-500 mb-1">
                  <MapPin size={13} /> Location
                </dt>
                <dd className="text-neutral-900">{req.location || '—'}</dd>
              </div>
              <div>
                <dt className="flex items-center gap-1.5 text-xs text-neutral-500 mb-1">
                  <Calendar size={13} /> Created
                </dt>
                <dd className="text-neutral-900">
                  {new Date(req.created_at).toLocaleDateString(undefined, {
                    day: 'numeric', month: 'short', year: 'numeric',
                  })}
                </dd>
              </div>
            </dl>
          </>
        )}
      </div>

      {/* Status transitions */}
      {!editing && (
        <div className="bg-white border border-neutral-300 rounded-lg p-6">
          <h2 className="font-semibold text-neutral-900 mb-1">Status</h2>
          <p className="text-sm text-neutral-600 mb-4">
            Currently <span className="font-medium text-neutral-900">{req.status}</span>.
            {transitions.length > 0 ? ' Move it to:' : ' No further transitions available.'}
          </p>
          {transitions.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {transitions.map((s) => {
                // Coming back from a terminal state reads better as an action
                const label =
                  (req.status === 'Archived' || req.status === 'Completed') && s === 'In Progress'
                    ? 'Reopen'
                    : s;
                return (
                  <button
                    key={s}
                    onClick={() => changeStatus(s)}
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-4 py-2 border border-neutral-300 text-neutral-700 text-sm font-medium rounded-lg hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 disabled:opacity-50 transition-smooth"
                  >
                    {saving && <Loader2 size={14} className="animate-spin" />}
                    {label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

        {!editing && <Attachments requestId={req.id} readOnly={!canEdit} />}

        {!editing && (
        <AiPanel
          request={req}
          suggestion={suggestion}
          loading={aiLoading}
          error={aiError}
          onAnalyse={runAnalysis}
          onAccept={acceptSuggestion}
          accepting={accepting}
        />
      )}

      {/* Delete confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/50 px-4">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full">
            <div className="flex items-start justify-between gap-4 mb-3">
              <h3 className="font-semibold text-neutral-900">Delete this request?</h3>
              <button onClick={() => setConfirmDelete(false)} className="text-neutral-400 hover:text-neutral-600">
                <X size={18} />
              </button>
            </div>
            <p className="text-sm text-neutral-600 mb-6">
              This permanently removes &ldquo;{req.title}&rdquo;. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={doDelete} disabled={deleting} className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 transition-smooth">
                {deleting && <Loader2 size={15} className="animate-spin" />}
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
              <button onClick={() => setConfirmDelete(false)} disabled={deleting} className="px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 rounded-lg transition-smooth">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}