'use client';

import React from 'react';
import {
  Sparkles,
  Sun,
  Droplets,
  Shield,
  Contrast,
  Baby,
  Heart,
  Target,
  Bandage,
  Flower2,
  User,
  type LucideIcon,
} from 'lucide-react';

export type SkinType = 'normal' | 'dry' | 'oily' | 'sensitive' | 'combination';
export type SpecialCondition = 'pregnant' | 'breastfeeding' | 'eczema' | 'rosacea' | 'acne-prone';

export interface SkinProfile {
  skinType: SkinType;
  conditions: SpecialCondition[];
}

interface SkinProfileSelectorProps {
  profile: SkinProfile;
  onChange: (profile: SkinProfile) => void;
}

const SKIN_TYPES: { id: SkinType; label: string; icon: LucideIcon; description: string }[] = [
  { id: 'normal', label: 'Normal', icon: Sparkles, description: 'Balanced, low sensitivity' },
  { id: 'dry', label: 'Dry', icon: Sun, description: 'Tight, flaky, needs hydration' },
  { id: 'oily', label: 'Oily', icon: Droplets, description: 'Excess sebum, shiny' },
  { id: 'sensitive', label: 'Sensitive', icon: Shield, description: 'Prone to redness' },
  { id: 'combination', label: 'Combination', icon: Contrast, description: 'Oily T-zone, dry cheeks' },
];

const CONDITIONS: { id: SpecialCondition; label: string; icon: LucideIcon; description: string }[] = [
  { id: 'pregnant', label: 'Pregnant', icon: Baby, description: 'Avoids retinoids, high salicylic acid' },
  { id: 'breastfeeding', label: 'Breastfeeding', icon: Heart, description: 'Safe for nursing mothers' },
  { id: 'acne-prone', label: 'Acne-Prone', icon: Target, description: 'Avoids comedogenic (clogging) oils' },
  { id: 'eczema', label: 'Eczema-Prone', icon: Bandage, description: 'Avoids fragrances, drying alcohols' },
  { id: 'rosacea', label: 'Rosacea-Prone', icon: Flower2, description: 'Avoids heating or stimulating actives' },
];

export default function SkinProfileSelector({ profile, onChange }: SkinProfileSelectorProps) {
  const handleTypeChange = (type: SkinType) => {
    onChange({ ...profile, skinType: type });
  };

  const handleConditionToggle = (condition: SpecialCondition) => {
    const isSelected = profile.conditions.includes(condition);
    const newConditions = isSelected
      ? profile.conditions.filter((c) => c !== condition)
      : [...profile.conditions, condition];

    onChange({ ...profile, conditions: newConditions });
  };

  return (
    <div className="border border-line bg-paper p-5 rounded-lg sm:p-6">
      {/* Title */}
      <div className="flex items-center gap-2.5 border-b border-line pb-4">
        <User className="h-4 w-4 text-ink" strokeWidth={1.6} />
        <div>
          <h3 className="text-sm font-bold tracking-tight text-ink">Your skin profile</h3>
          <p className="text-xs text-mist">Personalizes every ingredient verdict</p>
        </div>
      </div>

      {/* Skin Type Selection */}
      <div className="mt-5 space-y-2.5">
        <span className="block text-[11px] font-bold uppercase tracking-[0.12em] text-stone">
          Skin type
        </span>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {SKIN_TYPES.map((type) => {
            const isSelected = profile.skinType === type.id;
            const Icon = type.icon;
            return (
              <button
                key={type.id}
                type="button"
                onClick={() => handleTypeChange(type.id)}
                aria-pressed={isSelected}
                className={`flex flex-col gap-1.5 border p-3 text-left transition-colors duration-150 cursor-pointer rounded-md ${
                  isSelected
                    ? 'border-ink bg-fill text-ink'
                    : 'border-line bg-paper text-stone hover:border-mist'
                }`}
              >
                <Icon className={`h-[18px] w-[18px] ${isSelected ? 'text-ink' : 'text-mist'}`} strokeWidth={1.6} />
                <span className={`text-sm font-bold tracking-tight ${isSelected ? 'text-ink' : 'text-ink-soft'}`}>
                  {type.label}
                </span>
                <span className="text-[10px] leading-tight text-mist">{type.description}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Conditions Selection */}
      <div className="mt-5 space-y-2.5">
        <span className="block text-[11px] font-bold uppercase tracking-[0.12em] text-stone">
          Special needs <span className="font-medium normal-case tracking-normal text-mist">· select any</span>
        </span>
        <div className="flex flex-wrap gap-2">
          {CONDITIONS.map((cond) => {
            const isSelected = profile.conditions.includes(cond.id);
            const Icon = cond.icon;
            return (
              <button
                key={cond.id}
                type="button"
                onClick={() => handleConditionToggle(cond.id)}
                aria-pressed={isSelected}
                className={`flex items-center gap-1.5 border px-3 py-2 text-xs font-semibold transition-colors duration-150 cursor-pointer rounded-md ${
                  isSelected
                    ? 'border-ink bg-ink text-bone'
                    : 'border-line bg-paper text-stone hover:border-mist'
                }`}
                title={cond.description}
              >
                <Icon className="h-3.5 w-3.5" strokeWidth={1.6} />
                {cond.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
