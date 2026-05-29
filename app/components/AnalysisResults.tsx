'use client';

import { useState } from 'react';
import {
  Sparkles,
  Leaf,
  FlaskConical,
  Search,
  User,
  Pencil,
  ChevronDown,
  CircleCheck,
  CircleAlert,
  TriangleAlert,
  Check,
  type LucideIcon,
} from 'lucide-react';
import SkinProfileSelector, { SkinProfile, SkinType, SpecialCondition } from './SkinProfileSelector';

// Interfaces matching backend JSON contract
interface Ingredient {
  name: string;
  rating: 'Good' | 'Average' | 'Poor';
  purpose: string;
  safety: 'Low risk' | 'Medium risk' | 'High risk';
  description: string;
  isKeyActive: boolean;

  // Personalized fields from backend
  personalVerdict?: 'Safe' | 'Caution' | 'Avoid';
  personalExplanation?: string;
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
  currentProfile: SkinProfile;
  onReAnalyze: (profile: SkinProfile) => void;
  onReset: () => void;
}

const SKIN_TYPE_LABELS: Record<SkinType, string> = {
  normal: 'Normal Skin',
  dry: 'Dry Skin',
  oily: 'Oily Skin',
  sensitive: 'Sensitive Skin',
  combination: 'Combination Skin',
};

const CONDITION_LABELS: Record<SpecialCondition, string> = {
  pregnant: 'Pregnant',
  breastfeeding: 'Breastfeeding',
  eczema: 'Eczema-Prone',
  rosacea: 'Rosacea-Prone',
  'acne-prone': 'Acne-Prone',
};

const VERDICT_ICONS: Record<'Safe' | 'Caution' | 'Avoid', LucideIcon> = {
  Safe: CircleCheck,
  Caution: CircleAlert,
  Avoid: TriangleAlert,
};

export default function AnalysisResults({ results, currentProfile, onReAnalyze, onReset }: AnalysisResultsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'actives' | 'risks' | 'avoid'>('all');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [tempProfile, setTempProfile] = useState<SkinProfile>(currentProfile);

  const {
    productName,
    rating,
    score,
    summary,
    ingredients,
    skinSuitability,
    flags,
    source,
  } = results;

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const filteredIngredients = ingredients.filter((ing) => {
    const matchesSearch =
      ing.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ing.purpose.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (filter === 'actives') return ing.isKeyActive;
    if (filter === 'risks') return ing.personalVerdict === 'Caution' || ing.personalVerdict === 'Avoid';
    if (filter === 'avoid') return ing.personalVerdict === 'Avoid';

    return true;
  });

  const ratingColors = {
    Good: 'bg-good-bg text-good',
    Average: 'bg-warn-bg text-warn',
    Poor: 'bg-bad-bg text-bad',
  };

  const verdictColors = {
    Safe: 'border-good/25 bg-good-bg/60',
    Caution: 'border-warn/25 bg-warn-bg/60',
    Avoid: 'border-bad/25 bg-bad-bg/60',
  };

  const verdictTagColors = {
    Safe: 'bg-good-bg text-good',
    Caution: 'bg-warn-bg text-warn',
    Avoid: 'bg-bad-bg text-bad',
  };

  const verdictTextColor = {
    Safe: 'text-good',
    Caution: 'text-warn',
    Avoid: 'text-bad',
  };

  const suitabilityColors = {
    Good: 'border-good/25 bg-good-bg text-good',
    Neutral: 'border-line bg-bone text-stone',
    Avoid: 'border-bad/25 bg-bad-bg text-bad',
  };

  const handleUpdateProfile = () => {
    onReAnalyze(tempProfile);
    setIsEditingProfile(false);
  };

  const scoreStroke = score >= 85 ? 'stroke-good' : score >= 70 ? 'stroke-warn' : 'stroke-bad';

  return (
    <div className="space-y-4 animate-fade-up">
      {/* 1. Profile Banner & Edit */}
      <div className="border border-line bg-paper p-5 rounded-lg">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-stone">
              <User className="h-3.5 w-3.5" strokeWidth={1.6} />
              Personalized for
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center border border-ink bg-ink px-2.5 py-1 text-xs font-semibold text-bone rounded-md">
                {SKIN_TYPE_LABELS[currentProfile.skinType]}
              </span>
              {currentProfile.conditions.map((cond) => (
                <span
                  key={cond}
                  className="inline-flex items-center border border-line bg-bone px-2.5 py-1 text-xs font-semibold text-ink-soft rounded-md"
                >
                  {CONDITION_LABELS[cond]}
                </span>
              ))}
              {currentProfile.conditions.length === 0 && (
                <span className="text-xs font-medium text-mist">No special conditions</span>
              )}
            </div>
          </div>
          <button
            onClick={() => {
              setTempProfile(currentProfile);
              setIsEditingProfile(!isEditingProfile);
            }}
            className="flex shrink-0 items-center gap-1.5 border border-line bg-paper px-2.5 py-1.5 text-xs font-semibold text-stone transition-colors hover:border-ink hover:text-ink rounded-md cursor-pointer"
          >
            <Pencil className="h-3 w-3" strokeWidth={1.8} />
            {isEditingProfile ? 'Cancel' : 'Edit'}
          </button>
        </div>

        {isEditingProfile && (
          <div className="mt-4 space-y-3 border-t border-line pt-4 animate-expand">
            <SkinProfileSelector profile={tempProfile} onChange={setTempProfile} />
            <button
              onClick={handleUpdateProfile}
              className="w-full bg-ink py-3 text-sm font-semibold tracking-wide text-bone transition-colors hover:bg-ink-soft rounded-lg cursor-pointer"
            >
              Re-analyze with new profile
            </button>
          </div>
        )}
      </div>

      {/* 2. Header & Score */}
      <div className="border border-line bg-paper p-6 rounded-lg">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2.5">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-md ${ratingColors[rating]}`}>
              {rating} rating
            </span>
            <h2 className="font-display text-[1.7rem] font-normal leading-tight tracking-tight text-ink">
              {productName}
            </h2>
            <p className="text-xs text-mist">
              Analyzed with {source === 'ai' ? 'Claude 4.6 Vision' : 'Lumi formulation database'}
            </p>
          </div>

          {/* Score */}
          <div className="relative flex h-24 w-24 shrink-0 items-center justify-center">
            <svg className="absolute left-0 top-0 h-full w-full -rotate-90">
              <circle cx="48" cy="48" r="42" className="fill-none stroke-line" strokeWidth="5" />
              <circle
                cx="48"
                cy="48"
                r="42"
                className={`fill-none transition-all duration-700 ${scoreStroke}`}
                strokeWidth="5"
                strokeDasharray="263.9"
                strokeDashoffset={263.9 - (263.9 * score) / 100}
                strokeLinecap="butt"
              />
            </svg>
            <div className="flex flex-col items-center">
              <span className="font-display text-2xl font-medium text-ink">{score}</span>
              <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-mist">Score</span>
            </div>
          </div>
        </div>

        <p className="mt-5 border-t border-line pt-4 text-sm leading-relaxed text-stone">{summary}</p>
      </div>

      {/* 3. Skin Type Suitability */}
      <div className="border border-line bg-paper p-6 rounded-lg">
        <h3 className="flex items-center gap-2 text-sm font-bold tracking-tight text-ink">
          <Leaf className="h-4 w-4 text-stone" strokeWidth={1.6} />
          General skin suitability
        </h3>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {Object.entries(skinSuitability).map(([skinType, suitability]) => (
            <div
              key={skinType}
              className={`border px-3 py-3 text-center rounded-md ${suitabilityColors[suitability]}`}
            >
              <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider capitalize text-mist">
                {skinType}
              </span>
              <span className="text-sm font-bold tracking-tight">
                {suitability === 'Good' ? 'Great' : suitability === 'Neutral' ? 'Fine' : 'Avoid'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Formulation Flags */}
      <div className="border border-line bg-paper p-6 rounded-lg">
        <h3 className="flex items-center gap-2 text-sm font-bold tracking-tight text-ink">
          <FlaskConical className="h-4 w-4 text-stone" strokeWidth={1.6} />
          Free-from checklist
        </h3>
        <div className="mt-4 grid grid-cols-2 gap-2">
          {[
            { label: 'Parabens', detected: flags.hasParabens },
            { label: 'Sulfates', detected: flags.hasSulfates },
            { label: 'Fragrance', detected: flags.hasFragrance },
            { label: 'Silicones', detected: flags.hasSilicones },
          ].map((flag) => (
            <div
              key={flag.label}
              className={`flex items-center gap-2.5 border px-3 py-2.5 rounded-md ${
                flag.detected ? 'border-bad/20 bg-bad-bg/50' : 'border-good/20 bg-good-bg/50'
              }`}
            >
              {flag.detected ? (
                <TriangleAlert className="h-4 w-4 shrink-0 text-bad" strokeWidth={1.6} />
              ) : (
                <Check className="h-4 w-4 shrink-0 text-good" strokeWidth={2} />
              )}
              <div className="flex flex-col">
                <span className="text-xs font-bold text-ink">{flag.label}</span>
                <span className="text-[10px] text-mist">{flag.detected ? 'Detected' : 'Free of'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Full Ingredients List */}
      <div className="border border-line bg-paper p-6 rounded-lg">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="flex items-center gap-2 text-sm font-bold tracking-tight text-ink">
            <Search className="h-4 w-4 text-stone" strokeWidth={1.6} />
            Ingredients <span className="font-medium text-mist">({ingredients.length})</span>
          </h3>
          <div className="flex self-start border border-line rounded-md sm:self-auto">
            {([
              { id: 'all', label: 'All' },
              { id: 'actives', label: 'Actives' },
              { id: 'risks', label: 'Alerts' },
              { id: 'avoid', label: 'Avoid' },
            ] as const).map((mode, i) => (
              <button
                key={mode.id}
                onClick={() => {
                  setFilter(mode.id);
                  setExpandedIndex(null);
                }}
                className={`px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${i > 0 ? 'border-l border-line' : ''} ${
                  filter === mode.id ? 'bg-ink text-bone' : 'text-stone hover:text-ink'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mist" strokeWidth={1.6} />
          <input
            type="text"
            placeholder="Search ingredients or benefits…"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setExpandedIndex(null);
            }}
            className="w-full border border-line bg-bone py-2.5 pl-9 pr-4 text-sm font-medium text-ink placeholder:text-mist outline-none transition-colors focus:border-ink rounded-md"
          />
        </div>

        {/* List items */}
        <div className="mt-2 divide-y divide-line">
          {filteredIngredients.length > 0 ? (
            filteredIngredients.map((ing) => {
              const originalIndex = ingredients.findIndex((item) => item.name === ing.name);
              const isExpanded = expandedIndex === originalIndex;

              const verdict: 'Safe' | 'Caution' | 'Avoid' =
                ing.personalVerdict ||
                (ing.safety === 'High risk' ? 'Avoid' : ing.safety === 'Medium risk' ? 'Caution' : 'Safe');
              const VerdictIcon = VERDICT_ICONS[verdict];

              return (
                <div key={ing.name} className="py-3">
                  <button
                    onClick={() => toggleExpand(originalIndex)}
                    className="flex w-full items-start justify-between gap-3 text-left focus:outline-none cursor-pointer"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="truncate text-sm font-bold text-ink">{ing.name}</span>
                        {ing.isKeyActive && (
                          <span className="inline-flex items-center gap-1 border border-line px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-stone rounded-sm">
                            <Sparkles className="h-2.5 w-2.5" strokeWidth={1.8} />
                            Active
                          </span>
                        )}
                      </div>
                      <span className="block text-xs text-mist">{ing.purpose}</span>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-sm ${verdictTagColors[verdict]}`}>
                        <VerdictIcon className="h-3 w-3" strokeWidth={2} />
                        {verdict}
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 text-mist transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                        strokeWidth={1.8}
                      />
                    </div>
                  </button>

                  {isExpanded && (
                    <div className={`mt-3 border p-4 text-sm leading-relaxed text-stone animate-expand rounded-md ${verdictColors[verdict]}`}>
                      {ing.personalExplanation ? (
                        <div className="mb-3 space-y-1.5">
                          <span className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider ${verdictTextColor[verdict]}`}>
                            <VerdictIcon className="h-3.5 w-3.5" strokeWidth={1.8} />
                            Verdict for your profile
                          </span>
                          <p className="border border-line bg-paper p-2.5 font-semibold text-ink rounded-md">
                            {ing.personalExplanation}
                          </p>
                        </div>
                      ) : null}

                      <div className="space-y-1">
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-mist">
                          What it is &amp; does
                        </span>
                        <p className="text-stone">{ing.description}</p>
                      </div>

                      <div className="mt-3.5 flex flex-wrap gap-x-4 gap-y-2 border-t border-line/70 pt-3 text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold uppercase text-mist">Rating:</span>
                          <span
                            className={`inline-flex h-1.5 w-1.5 rounded-full ${
                              ing.rating === 'Good' ? 'bg-good' : ing.rating === 'Average' ? 'bg-warn' : 'bg-bad'
                            }`}
                          />
                          <span className="font-semibold capitalize text-stone">{ing.rating}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold uppercase text-mist">Safety:</span>
                          <span className="font-semibold capitalize text-stone">{ing.safety}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <p className="py-8 text-center text-sm text-mist">No ingredients match your filters.</p>
          )}
        </div>
      </div>

      {/* Reset */}
      <button
        onClick={onReset}
        className="w-full border border-line bg-paper py-3.5 text-sm font-semibold text-stone transition-colors hover:border-ink hover:text-ink rounded-lg cursor-pointer"
      >
        Scan another product
      </button>

      <p className="text-left text-[11px] leading-relaxed text-mist">
        Lumi offers general guidance and isn&apos;t a substitute for professional medical or
        dermatological advice.
      </p>
    </div>
  );
}
