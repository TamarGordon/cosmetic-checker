'use client';

import { useState } from 'react';

// Interfaces matching backend JSON contract
interface Ingredient {
  name: string;
  rating: 'Good' | 'Average' | 'Poor';
  purpose: string;
  safety: 'Low risk' | 'Medium risk' | 'High risk';
  description: string;
  isKeyActive: boolean;
}

interface AnalysisResultsProps {
  results: {
    productName: string;
    rating: 'Good' | 'Average' | 'Poor';
    score: number;
    summary: string;
    ingredients: Ingredient[];
    skinSuitability: {
      dry: 'Good' | 'Neutral' | 'Avoid';
      oily: 'Good' | 'Neutral' | 'Avoid';
      sensitive: 'Good' | 'Neutral' | 'Avoid';
    };
    flags: {
      hasParabens: boolean;
      hasSulfates: boolean;
      hasFragrance: boolean;
      hasSilicones: boolean;
    };
    source: 'ai' | 'mock';
  };
  onReset: () => void;
}

export default function AnalysisResults({ results, onReset }: AnalysisResultsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'actives' | 'risks'>('all');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const {
    productName,
    rating,
    score,
    summary,
    ingredients,
    skinSuitability,
    flags,
    source
  } = results;

  // Toggle ingredient expansion
  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  // Filter and search logic
  const filteredIngredients = ingredients.filter((ing) => {
    const matchesSearch = ing.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ing.purpose.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;

    if (filter === 'actives') return ing.isKeyActive;
    if (filter === 'risks') return ing.safety === 'Medium risk' || ing.safety === 'High risk';
    
    return true;
  });

  // Color mappings
  const ratingColors = {
    Good: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Average: 'bg-amber-50 text-amber-700 border-amber-200',
    Poor: 'bg-rose-50 text-rose-700 border-rose-200'
  };

  const safetyColors = {
    'Low risk': 'bg-emerald-100 text-emerald-800',
    'Medium risk': 'bg-amber-100 text-amber-800',
    'High risk': 'bg-rose-100 text-rose-800'
  };

  const suitabilityColors = {
    Good: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    Neutral: 'bg-slate-50 text-slate-600 border-slate-100',
    Avoid: 'bg-rose-50 text-rose-700 border-rose-100'
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      {/* 1. Header & Score */}
      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col items-center text-center sm:flex-row sm:items-center sm:text-left sm:justify-between gap-4">
          <div className="space-y-2">
            <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${ratingColors[rating]}`}>
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              {rating} Rating
            </span>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight leading-tight">
              {productName}
            </h2>
            <p className="text-xs text-slate-400">
              Analyzed using {source === 'ai' ? 'Gemini AI Vision' : 'Formulation Database'}
            </p>
          </div>

          {/* Radial/Score Badge */}
          <div className="relative flex h-24 w-24 shrink-0 items-center justify-center">
            {/* SVG circle track */}
            <svg className="absolute top-0 left-0 h-full w-full rotate-[-90deg]">
              <circle
                cx="48"
                cy="48"
                r="42"
                className="stroke-slate-100 fill-none"
                strokeWidth="6"
              />
              <circle
                cx="48"
                cy="48"
                r="42"
                className={`fill-none transition-all duration-1000 ${
                  score >= 85
                    ? 'stroke-emerald-500'
                    : score >= 70
                    ? 'stroke-amber-500'
                    : 'stroke-rose-500'
                }`}
                strokeWidth="6"
                strokeDasharray="264"
                strokeDashoffset={264 - (264 * score) / 100}
                strokeLinecap="round"
              />
            </svg>
            <div className="flex flex-col items-center">
              <span className="text-2xl font-black text-slate-800 tracking-tight">
                {score}
              </span>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Score
              </span>
            </div>
          </div>
        </div>

        {/* Product Summary */}
        <div className="mt-5 rounded-2xl bg-slate-50 p-4 border border-slate-100/50">
          <p className="text-sm leading-relaxed text-slate-600">
            {summary}
          </p>
        </div>
      </div>

      {/* 2. Skin Type Suitability */}
      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm space-y-4">
        <h3 className="font-semibold text-slate-800 text-sm tracking-tight flex items-center gap-1.5">
          👤 Skin Type Compatibility
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {Object.entries(skinSuitability).map(([skinType, suitability]) => (
            <div
              key={skinType}
              className={`rounded-2xl border px-3 py-3 text-center ${suitabilityColors[suitability]}`}
            >
              <span className="block text-xs font-semibold text-slate-400 capitalize mb-1">
                {skinType}
              </span>
              <span className="text-sm font-bold tracking-tight">
                {suitability === 'Good' ? 'Excellent' : suitability === 'Neutral' ? 'Safe' : 'Avoid'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Formulation Flags */}
      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm space-y-4">
        <h3 className="font-semibold text-slate-800 text-sm tracking-tight flex items-center gap-1.5">
          🧪 Free-From Checklist
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Parabens', detected: flags.hasParabens },
            { label: 'Sulfates', detected: flags.hasSulfates },
            { label: 'Fragrance', detected: flags.hasFragrance },
            { label: 'Silicones', detected: flags.hasSilicones }
          ].map((flag) => (
            <div
              key={flag.label}
              className={`flex items-center gap-2.5 rounded-2xl border px-4 py-3 text-xs font-medium ${
                flag.detected
                  ? 'bg-rose-50/50 border-rose-100/70 text-slate-700'
                  : 'bg-emerald-50/40 border-emerald-100/50 text-slate-600'
              }`}
            >
              {flag.detected ? (
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-700 font-bold text-xs">
                  ⚠️
                </span>
              ) : (
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-bold text-[10px]">
                  ✓
                </span>
              )}
              <div className="flex flex-col">
                <span className="font-semibold text-slate-800">{flag.label}</span>
                <span className="text-[10px] text-slate-400">
                  {flag.detected ? 'Detected' : 'Free of'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Full Ingredients List Analysis */}
      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="font-semibold text-slate-800 text-sm tracking-tight flex items-center gap-1.5">
            🔍 Ingredient Breakdown ({ingredients.length})
          </h3>
          {/* Quick Filters */}
          <div className="flex gap-1.5 rounded-xl bg-slate-50 p-1 self-start sm:self-auto border border-slate-100">
            {(['all', 'actives', 'risks'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => {
                  setFilter(mode);
                  setExpandedIndex(null);
                }}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold capitalize transition-all ${
                  filter === mode
                    ? 'bg-white text-indigo-600 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {mode === 'all' ? 'All' : mode === 'actives' ? 'Actives' : 'Alerts'}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search ingredients or benefits..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setExpandedIndex(null);
            }}
            className="w-full rounded-2xl border border-slate-100 bg-slate-50/50 py-3 pl-10 pr-4 text-xs font-medium text-slate-800 placeholder:text-slate-400 outline-none transition-all focus:border-indigo-200 focus:bg-white focus:ring-3 focus:ring-indigo-50/50"
          />
          <span className="absolute left-3.5 top-3.5 text-slate-400 text-xs">🔍</span>
        </div>

        {/* List items */}
        <div className="divide-y divide-slate-100 border-t border-slate-100 mt-2">
          {filteredIngredients.length > 0 ? (
            filteredIngredients.map((ing, idx) => {
              const originalIndex = ingredients.findIndex((item) => item.name === ing.name);
              const isExpanded = expandedIndex === originalIndex;

              return (
                <div key={ing.name} className="py-3 transition-colors duration-150">
                  <button
                    onClick={() => toggleExpand(originalIndex)}
                    className="flex w-full items-start justify-between text-left gap-3 focus:outline-none"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-xs text-slate-800 truncate">
                          {ing.name}
                        </span>
                        {ing.isKeyActive && (
                          <span className="inline-flex items-center gap-0.5 rounded-full bg-indigo-50 px-1.5 py-0.5 text-[9px] font-black text-indigo-600 uppercase">
                            ✨ Active
                          </span>
                        )}
                      </div>
                      <span className="block text-[10px] text-slate-400">
                        {ing.purpose}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${safetyColors[ing.safety]}`}>
                        {ing.safety}
                      </span>
                      <svg
                        className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                    </div>
                  </button>

                  {/* Expanded content */}
                  {isExpanded && (
                    <div className="mt-2.5 pl-0.5 pr-4 text-xs text-slate-500 leading-relaxed bg-slate-50/40 rounded-xl p-3 border border-slate-50/50 animate-in slide-in-from-top-1 duration-150">
                      <p>{ing.description}</p>
                      <div className="mt-2 flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Cosmetic Rating:</span>
                        <span className={`inline-flex h-2.5 w-2.5 rounded-full ${
                          ing.rating === 'Good' ? 'bg-emerald-500' : ing.rating === 'Average' ? 'bg-amber-500' : 'bg-rose-500'
                        }`} />
                        <span className="text-[10px] font-semibold text-slate-600 capitalize">{ing.rating} ingredient</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <p className="text-center py-8 text-xs text-slate-400">
              No ingredients match your filters or search.
            </p>
          )}
        </div>
      </div>

      {/* Reset button to scan another product */}
      <button
        onClick={onReset}
        className="w-full rounded-2xl border border-slate-200 bg-white py-4 text-sm font-semibold text-slate-700 shadow-xs transition-all active:scale-[0.98] hover:bg-slate-50"
      >
        Scan Another Product
      </button>
    </div>
  );
}
