'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Plus, Search, ChevronLeft, ChevronRight, Inbox,
  AlertCircle, RefreshCw, X,
} from 'lucide-react';
import {
  fetchRequests, fetchMeta, ServiceRequest, Pagination,
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

export default function RequestsPage() {
  const [items, setItems] = useState<ServiceRequest[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [meta, setMeta] = useState<{ statuses: string[]; priorities: string[]; categories: string[] } | null>(null);

  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [category, setCategory] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Options come from the backend so the filters can never offer an invalid value
  useEffect(() => {
    fetchMeta().then(setMeta).catch(() => {});
  }, []);

  // Debounce the search box so we aren't firing a request per keystroke
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetchRequests({
        page, limit: 10, status, priority, category, search,
      });
      setItems(res.data);
      setPagination(res.pagination);
    } catch (err: any) {
      setError(err.message || 'Could not load requests');
    } finally {
      setLoading(false);
    }
  }, [page, status, priority, category, search]);

  useEffect(() => { load(); }, [load]);

  const activeFilters = [status, priority, category, search].filter(Boolean).length;

  const clearFilters = () => {
    setStatus(''); setPriority(''); setCategory('');
    setSearchInput(''); setSearch(''); setPage(1);
  };

  const selectClass =
    'px-3 py-2 border border-neutral-300 rounded-lg text-sm bg-white text-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-600';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Requests</h1>
          <p className="text-neutral-600 text-sm mt-1">
            {pagination ? `${pagination.total} total` : 'Loading…'}
          </p>
        </div>
        <Link
          href="/dashboard/requests/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-smooth shadow-sm"
        >
          <Plus size={16} />
          New Request
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white border border-neutral-300 rounded-lg p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search title or description…"
              className="w-full pl-9 pr-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-600"
            />
          </div>

          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className={selectClass}
            aria-label="Filter by status"
          >
            <option value="">All statuses</option>
            {meta?.statuses.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>

          <select
            value={priority}
            onChange={(e) => { setPriority(e.target.value); setPage(1); }}
            className={selectClass}
            aria-label="Filter by priority"
          >
            <option value="">All priorities</option>
            {meta?.priorities.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>

          <select
            value={category}
            onChange={(e) => { setCategory(e.target.value); setPage(1); }}
            className={selectClass}
            aria-label="Filter by category"
          >
            <option value="">All categories</option>
            {meta?.categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>

          {activeFilters > 0 && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-1 px-3 py-2 text-sm text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-smooth"
            >
              <X size={14} />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="bg-white border border-neutral-300 rounded-lg overflow-hidden">
        {error ? (
          <div className="px-5 py-16 text-center">
            <AlertCircle className="mx-auto text-red-500 mb-3" size={32} />
            <p className="text-neutral-900 font-medium mb-1">Something went wrong</p>
            <p className="text-neutral-600 text-sm mb-5">{error}</p>
            <button
              onClick={load}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-smooth"
            >
              <RefreshCw size={15} />
              Try again
            </button>
          </div>
        ) : loading ? (
          <div className="divide-y divide-neutral-200">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="px-5 py-4">
                <div className="h-4 w-1/3 bg-neutral-200 rounded animate-pulse mb-2" />
                <div className="h-3 w-1/4 bg-neutral-100 rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <Inbox className="mx-auto text-neutral-400 mb-3" size={36} />
            <p className="text-neutral-900 font-medium mb-1">
              {activeFilters > 0 ? 'No matching requests' : 'No requests yet'}
            </p>
            <p className="text-neutral-600 text-sm mb-5">
              {activeFilters > 0
                ? 'Try changing or clearing your filters.'
                : 'Create your first service request to get started.'}
            </p>
            {activeFilters > 0 ? (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-2 px-4 py-2 border border-neutral-300 text-neutral-700 text-sm font-medium rounded-lg hover:bg-neutral-50 transition-smooth"
              >
                <X size={15} />
                Clear filters
              </button>
            ) : (
              <Link
                href="/dashboard/requests/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-smooth"
              >
                <Plus size={16} />
                New Request
              </Link>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-neutral-200">
            {items.map((r) => (
              <li key={r.id}>
                <Link
                  href={`/dashboard/requests/${r.id}`}
                  className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-neutral-50 transition-smooth"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-neutral-900 truncate">{r.title}</p>
                    <p className="text-sm text-neutral-600 truncate mt-0.5">{r.description}</p>
                    <p className="text-xs text-neutral-500 mt-1">
                      {r.category}
                      {r.location ? ` · ${r.location}` : ''}
                      {' · '}
                      {new Date(r.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 shrink-0">
                    <span className={`px-2 py-1 text-xs font-medium rounded border ${PRIORITY_STYLES[r.priority] ?? PRIORITY_STYLES.Low}`}>
                      {r.priority}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded border ${STATUS_STYLES[r.status]}`}>
                      {r.status}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && !loading && !error && (
          <div className="px-5 py-3 border-t border-neutral-200 flex items-center justify-between">
            <p className="text-sm text-neutral-600">
              Page {pagination.page} of {pagination.totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => p - 1)}
                disabled={!pagination.hasPrev}
                className="inline-flex items-center gap-1 px-3 py-1.5 border border-neutral-300 rounded-lg text-sm text-neutral-700 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-smooth"
              >
                <ChevronLeft size={15} />
                Previous
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={!pagination.hasNext}
                className="inline-flex items-center gap-1 px-3 py-1.5 border border-neutral-300 rounded-lg text-sm text-neutral-700 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-smooth"
              >
                Next
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}