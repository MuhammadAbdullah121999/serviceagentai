'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Plus, ArrowRight, AlertCircle, RefreshCw, Inbox,
  Clock, CheckCircle2, Archive, LayoutList,
} from 'lucide-react';
import { fetchStats, fetchRequests, Stats, ServiceRequest } from '@/lib/api';

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

const CARDS = [
  { key: 'total', label: 'Total Requests', icon: LayoutList, tone: 'text-neutral-700 bg-neutral-100' },
  { key: 'New', label: 'New', icon: Inbox, tone: 'text-blue-700 bg-blue-50' },
  { key: 'In Progress', label: 'In Progress', icon: Clock, tone: 'text-amber-700 bg-amber-50' },
  { key: 'Completed', label: 'Completed', icon: CheckCircle2, tone: 'text-emerald-700 bg-emerald-50' },
  { key: 'Archived', label: 'Archived', icon: Archive, tone: 'text-neutral-600 bg-neutral-100' },
] as const;

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recent, setRecent] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [s, r] = await Promise.all([
        fetchStats(),
        fetchRequests({ page: 1, limit: 5 }),
      ]);
      setStats(s);
      setRecent(r.data);
    } catch (err: any) {
      setError(err.message || 'Could not load your dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (error) {
    return (
      <div className="bg-white border border-red-200 rounded-lg p-8 text-center">
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
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Overview</h1>
          <p className="text-neutral-600 text-sm mt-1">
            Your service requests at a glance.
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

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {CARDS.map(({ key, label, icon: Icon, tone }) => (
          <div key={key} className="bg-white border border-neutral-300 rounded-lg p-5">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-4 ${tone}`}>
              <Icon size={18} />
            </div>
            {loading ? (
              <div className="h-8 w-12 bg-neutral-200 rounded animate-pulse mb-1" />
            ) : (
              <div className="text-3xl font-bold text-neutral-900 leading-none mb-1">
                {stats?.[key as keyof Stats] ?? 0}
              </div>
            )}
            <div className="text-xs text-neutral-500">{label}</div>
          </div>
        ))}
      </div>

      {/* Recent requests */}
      <div className="bg-white border border-neutral-300 rounded-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-neutral-200 flex items-center justify-between">
          <h2 className="font-semibold text-neutral-900">Recent Requests</h2>
          <Link
            href="/dashboard/requests"
            className="text-sm text-primary-600 hover:text-primary-700 font-medium inline-flex items-center gap-1"
          >
            View all
            <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="divide-y divide-neutral-200">
            {[0, 1, 2].map((i) => (
              <div key={i} className="px-5 py-4">
                <div className="h-4 w-1/3 bg-neutral-200 rounded animate-pulse mb-2" />
                <div className="h-3 w-1/4 bg-neutral-100 rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : recent.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <Inbox className="mx-auto text-neutral-400 mb-3" size={36} />
            <p className="text-neutral-900 font-medium mb-1">No requests yet</p>
            <p className="text-neutral-600 text-sm mb-5">
              Create your first service request to get started.
            </p>
            <Link
              href="/dashboard/requests/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-smooth"
            >
              <Plus size={16} />
              New Request
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-neutral-200">
            {recent.map((r) => (
              <li key={r.id}>
                <Link
                  href={`/dashboard/requests/${r.id}`}
                  className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-neutral-50 transition-smooth"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-neutral-900 truncate">{r.title}</p>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      {r.category} · {new Date(r.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
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
      </div>
    </div>
  );
}