'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, AlertCircle, Loader2 } from 'lucide-react';
import { createRequest, fetchMeta } from '@/lib/api';

export default function NewRequestPage() {
  const router = useRouter();
  const [meta, setMeta] = useState<{ priorities: string[]; categories: string[] } | null>(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'Medium',
    location: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchMeta()
      .then((m) => {
        setMeta(m);
        setForm((f) => ({ ...f, category: f.category || m.categories[0] }));
      })
      .catch(() => setApiError('Could not load form options. Is the backend running?'));
  }, []);

  const set = (key: string, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: '' }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = 'Title is required';
    else if (form.title.trim().length > 255) e.title = 'Title must be under 255 characters';
    if (!form.description.trim()) e.description = 'Description is required';
    else if (form.description.trim().length < 10) e.description = 'Please add a little more detail';
    if (!form.category) e.category = 'Category is required';
    if (!form.priority) e.priority = 'Priority is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setApiError('');
    if (!validate()) return;

    setSaving(true);
    try {
      const created = await createRequest({
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        priority: form.priority,
        location: form.location.trim() || undefined,
      });
      router.push(`/dashboard/requests/${created.id}`);
    } catch (err: any) {
      setApiError(err.message || 'Could not create the request');
      setSaving(false);
    }
  };

  const field = (hasError: boolean) =>
    `w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-smooth ${
      hasError
        ? 'border-red-300 focus:ring-red-500'
        : 'border-neutral-300 focus:ring-primary-600'
    }`;

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        href="/dashboard/requests"
        className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-primary-600 mb-6 transition-smooth"
      >
        <ArrowLeft size={16} />
        Back to requests
      </Link>

      <h1 className="text-2xl font-bold text-neutral-900">New Request</h1>
      <p className="text-neutral-600 text-sm mt-1 mb-6">
        Describe the issue and we&apos;ll track it through to completion.
      </p>

      {apiError && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-6">
          <AlertCircle size={18} className="text-red-600 mt-0.5 shrink-0" />
          <p className="text-sm text-red-700">{apiError}</p>
        </div>
      )}

      <form onSubmit={submit} noValidate className="bg-white border border-neutral-300 rounded-lg p-6 space-y-5">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-neutral-700 mb-1.5">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            type="text"
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            placeholder="Leaking pipe under the kitchen sink"
            className={field(!!errors.title)}
            disabled={saving}
          />
          {errors.title && <p className="text-xs text-red-600 mt-1.5">{errors.title}</p>}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-neutral-700 mb-1.5">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            rows={5}
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            placeholder="Water is pooling in the cabinet and it's getting worse each day. The leak seems to come from the joint behind the trap."
            className={`${field(!!errors.description)} resize-y`}
            disabled={saving}
          />
          {errors.description ? (
            <p className="text-xs text-red-600 mt-1.5">{errors.description}</p>
          ) : (
            <p className="text-xs text-neutral-500 mt-1.5">
              The more detail you give, the better the AI classification will be.
            </p>
          )}
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-neutral-700 mb-1.5">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              id="category"
              value={form.category}
              onChange={(e) => set('category', e.target.value)}
              className={`${field(!!errors.category)} bg-white`}
              disabled={saving || !meta}
            >
              {!meta && <option>Loading…</option>}
              {meta?.categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.category && <p className="text-xs text-red-600 mt-1.5">{errors.category}</p>}
          </div>

          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-neutral-700 mb-1.5">
              Priority <span className="text-red-500">*</span>
            </label>
            <select
              id="priority"
              value={form.priority}
              onChange={(e) => set('priority', e.target.value)}
              className={`${field(!!errors.priority)} bg-white`}
              disabled={saving || !meta}
            >
              {!meta && <option>Loading…</option>}
              {meta?.priorities.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
            {errors.priority && <p className="text-xs text-red-600 mt-1.5">{errors.priority}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium text-neutral-700 mb-1.5">
            Location <span className="text-neutral-400 font-normal">(optional)</span>
          </label>
          <input
            id="location"
            type="text"
            value={form.location}
            onChange={(e) => set('location', e.target.value)}
            placeholder="Building A, second floor kitchen"
            className={field(false)}
            disabled={saving}
          />
        </div>

        <div className="flex items-center gap-3 pt-2 border-t border-neutral-200">
          <button
            type="submit"
            disabled={saving || !meta}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-smooth"
          >
            {saving && <Loader2 size={16} className="animate-spin" />}
            {saving ? 'Creating…' : 'Create Request'}
          </button>
          <Link
            href="/dashboard/requests"
            className="px-5 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100 rounded-lg transition-smooth"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}