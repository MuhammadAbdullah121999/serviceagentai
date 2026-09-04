'use client';

import { Sparkles, AlertTriangle, RefreshCw, Loader2, Check } from 'lucide-react';
import { ServiceRequest, AiSuggestion } from '@/lib/api';

interface Props {
  request: ServiceRequest;
  suggestion: AiSuggestion | null;
  loading: boolean;
  error: string;
  onAnalyse: () => void;
  onAccept: (patch: { category?: string; priority?: string }) => void;
  accepting: boolean;
}

export function AiPanel({
  request, suggestion, loading, error, onAnalyse, onAccept, accepting,
}: Props) {
  const hasAnalysis = Boolean(request.ai_summary);

  const confidenceLabel = (c: number) =>
    c >= 0.8 ? 'High confidence' : c >= 0.5 ? 'Moderate confidence' : 'Low confidence';

  const confidenceTone = (c: number) =>
    c >= 0.8 ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
      : c >= 0.5 ? 'text-amber-700 bg-amber-50 border-amber-200'
      : 'text-neutral-600 bg-neutral-100 border-neutral-300';

  const differsCategory = suggestion && suggestion.category !== request.category;
  const differsPriority = suggestion && suggestion.priority !== request.priority;

  return (
    <div className="rounded-lg border border-primary-200 bg-primary-50/40 overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-5 py-3 bg-primary-50 border-b border-primary-200">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-primary-700" />
          <h2 className="font-semibold text-primary-900 text-sm">AI Analysis</h2>
        </div>
        {hasAnalysis && !loading && (
          <button
            onClick={onAnalyse}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-primary-700 hover:text-primary-800 transition-smooth"
          >
            <RefreshCw size={13} />
            Re-analyse
          </button>
        )}
      </div>

      <div className="p-5">
        {loading ? (
          <div className="flex items-center gap-3 py-4">
            <Loader2 size={18} className="animate-spin text-primary-600 shrink-0" />
            <div>
              <p className="text-sm font-medium text-neutral-900">Analysing this request…</p>
              <p className="text-xs text-neutral-600 mt-0.5">
                This usually takes a few seconds.
              </p>
            </div>
          </div>
        ) : error ? (
          <div>
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle size={18} className="text-amber-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-neutral-900">
                  AI analysis could not be completed
                </p>
                <p className="text-sm text-neutral-600 mt-1">{error}</p>
                <p className="text-xs text-neutral-500 mt-2">
                  Your request is unchanged. Nothing was lost.
                </p>
              </div>
            </div>
            <button
              onClick={onAnalyse}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-smooth"
            >
              <RefreshCw size={15} />
              Try again
            </button>
          </div>
        ) : !hasAnalysis ? (
          <div className="text-center py-4">
            <p className="text-sm text-neutral-700 mb-1">
              Let AI classify this request and suggest a next step.
            </p>
            <p className="text-xs text-neutral-500 mb-5">
              Your own category and priority stay as they are unless you accept a suggestion.
            </p>
            <button
              onClick={onAnalyse}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-smooth"
            >
              <Sparkles size={15} />
              Run AI Analysis
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-primary-800 mb-1.5">
                Summary
              </h3>
              <p className="text-sm text-neutral-800 leading-relaxed">{request.ai_summary}</p>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-primary-800 mb-1.5">
                Recommended next action
              </h3>
              <p className="text-sm text-neutral-800 leading-relaxed">{request.ai_next_action}</p>
            </div>

            {suggestion && (differsCategory || differsPriority) && (
              <div className="rounded-lg border border-primary-200 bg-white p-4">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-primary-800 mb-3">
                  Suggested changes
                </h3>
                <div className="space-y-2 mb-4 text-sm">
                  {differsCategory && (
                    <div className="flex items-center gap-2">
                      <span className="text-neutral-500 w-16 shrink-0">Category</span>
                      <span className="text-neutral-500 line-through">{request.category}</span>
                      <span className="text-neutral-400">→</span>
                      <span className="font-medium text-neutral-900">{suggestion.category}</span>
                    </div>
                  )}
                  {differsPriority && (
                    <div className="flex items-center gap-2">
                      <span className="text-neutral-500 w-16 shrink-0">Priority</span>
                      <span className="text-neutral-500 line-through">{request.priority}</span>
                      <span className="text-neutral-400">→</span>
                      <span className="font-medium text-neutral-900">{suggestion.priority}</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() =>
                    onAccept({
                      ...(differsCategory ? { category: suggestion.category } : {}),
                      ...(differsPriority ? { priority: suggestion.priority } : {}),
                    })
                  }
                  disabled={accepting}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-smooth"
                >
                  {accepting ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                  {accepting ? 'Applying…' : 'Accept suggestions'}
                </button>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-primary-200 text-xs">
              {typeof request.ai_confidence === 'number' && (
                <span className={`px-2 py-1 rounded border font-medium ${confidenceTone(request.ai_confidence)}`}>
                  {confidenceLabel(request.ai_confidence)} · {Math.round(request.ai_confidence * 100)}%
                </span>
              )}
              <span className="text-neutral-500">
                Generated by {request.ai_model ?? 'AI'}
                {request.ai_analyzed_at &&
                  ` · ${new Date(request.ai_analyzed_at).toLocaleString()}`}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}