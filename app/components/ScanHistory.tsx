'use client';

import { X, LoaderCircle, History, ChevronRight } from 'lucide-react';
import type { SavedScan } from '../lib/userData';

interface ScanHistoryProps {
  scans: SavedScan[];
  loading: boolean;
  onClose: () => void;
  onOpen: (scan: SavedScan) => void;
}

function formatDate(ms: number | null): string {
  if (!ms) return '';
  return new Date(ms).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function ratingColor(rating: string): string {
  if (rating === 'Good') return 'text-good';
  if (rating === 'Poor') return 'text-bad';
  return 'text-warn';
}

export default function ScanHistory({ scans, loading, onClose, onOpen }: ScanHistoryProps) {
  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-bone/95 backdrop-blur-sm animate-fade-in">
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col px-5 py-6">
        <div className="flex items-center justify-between border-b border-line pb-4">
          <div className="flex items-center gap-2.5">
            <History className="h-4 w-4 text-ink" strokeWidth={1.6} />
            <h2 className="font-display text-xl font-normal tracking-tight text-ink">Your scan history</h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center border border-line bg-paper text-stone transition-colors hover:border-ink hover:text-ink cursor-pointer rounded-md"
            aria-label="Close history"
          >
            <X className="h-4 w-4" strokeWidth={1.8} />
          </button>
        </div>

        <div className="mt-4 flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
              <LoaderCircle className="h-6 w-6 animate-spin text-ink" strokeWidth={1.6} />
              <p className="text-sm text-stone">Loading your scans…</p>
            </div>
          ) : scans.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-20 text-center">
              <p className="text-sm font-semibold text-ink">No scans yet</p>
              <p className="max-w-xs text-xs text-stone">
                Decode a product label and it will be saved here so you can revisit it anytime.
              </p>
            </div>
          ) : (
            <ul className="space-y-2.5">
              {scans.map((scan) => (
                <li key={scan.id}>
                  <button
                    onClick={() => onOpen(scan)}
                    className="group flex w-full items-center gap-3 border border-line bg-paper p-3.5 text-left transition-colors hover:border-ink cursor-pointer rounded-lg"
                  >
                    <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center border border-line rounded-md">
                      <span className="text-sm font-bold text-ink">{scan.score}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-ink">{scan.productName}</p>
                      <p className="text-xs text-mist">
                        <span className={`font-semibold ${ratingColor(scan.rating)}`}>{scan.rating}</span>
                        {scan.createdAt ? ` · ${formatDate(scan.createdAt)}` : ''}
                      </p>
                    </div>
                    <ChevronRight
                      className="h-4 w-4 shrink-0 text-mist transition-transform group-hover:translate-x-0.5 group-hover:text-ink"
                      strokeWidth={1.8}
                    />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
