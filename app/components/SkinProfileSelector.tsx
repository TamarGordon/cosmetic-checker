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
  Venus,
  Mars,
  ToyBrick,
  Smile,
  PersonStanding,
  Slice,
  Snowflake,
  Brush,
  TrendingDown,
  Palette,
  Hourglass,
  Sprout,
  type LucideIcon,
} from 'lucide-react';

export type SkinType = 'normal' | 'dry' | 'oily' | 'combination';
export type Gender = 'female' | 'male' | 'unspecified';
export type AgeGroup = 'newborn' | 'child' | 'teen' | 'adult' | 'senior';
export type SpecialCondition =
  | 'sensitive'
  | 'acne-prone'
  | 'eczema'
  | 'rosacea'
  | 'pregnant'
  | 'breastfeeding'
  | 'shaving'
  | 'dandruff'
  | 'hair-care'
  | 'hair-loss'
  | 'color-treated'
  | 'anti-aging'
  | 'baby-gentle';

export interface SkinProfile {
  skinType: SkinType;
  gender: Gender;
  ageGroup: AgeGroup;
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
  { id: 'combination', label: 'Combination', icon: Contrast, description: 'Oily T-zone, dry cheeks' },
];

const GENDERS: { id: Gender; label: string; icon: LucideIcon }[] = [
  { id: 'female', label: 'Woman', icon: Venus },
  { id: 'male', label: 'Man', icon: Mars },
  { id: 'unspecified', label: 'Prefer not to say', icon: User },
];

const AGE_GROUPS: { id: AgeGroup; label: string; icon: LucideIcon; description: string }[] = [
  { id: 'newborn', label: 'Newborn', icon: Baby, description: '0–2 yrs' },
  { id: 'child', label: 'Child', icon: ToyBrick, description: '3–12 yrs' },
  { id: 'teen', label: 'Teen', icon: Smile, description: '13–17 yrs' },
  { id: 'adult', label: 'Adult', icon: User, description: '18–59 yrs' },
  { id: 'senior', label: 'Senior', icon: PersonStanding, description: '60+ yrs' },
];

// Conditions can be gated by gender and/or age group. When `genders` or
// `ageGroups` is omitted, the condition is shown for everyone.
interface ConditionMeta {
  id: SpecialCondition;
  label: string;
  icon: LucideIcon;
  description: string;
  genders?: Gender[];
  ageGroups?: AgeGroup[];
}

const CONDITIONS: ConditionMeta[] = [
  { id: 'sensitive', label: 'Sensitive', icon: Shield, description: 'Prone to redness, easily irritated' },
  { id: 'acne-prone', label: 'Acne-Prone', icon: Target, description: 'Avoids comedogenic (clogging) oils', ageGroups: ['teen', 'adult', 'senior'] },
  { id: 'eczema', label: 'Eczema-Prone', icon: Bandage, description: 'Avoids fragrances, drying alcohols' },
  { id: 'rosacea', label: 'Rosacea-Prone', icon: Flower2, description: 'Avoids heating or stimulating actives', ageGroups: ['teen', 'adult', 'senior'] },
  { id: 'pregnant', label: 'Pregnant', icon: Baby, description: 'Avoids retinoids, high salicylic acid', genders: ['female'], ageGroups: ['teen', 'adult'] },
  { id: 'breastfeeding', label: 'Breastfeeding', icon: Heart, description: 'Safe for nursing mothers', genders: ['female'], ageGroups: ['teen', 'adult'] },
  { id: 'shaving', label: 'Shaving', icon: Slice, description: 'Soothing, low-irritation for shaved skin', ageGroups: ['teen', 'adult', 'senior'] },
  { id: 'dandruff', label: 'Dandruff', icon: Snowflake, description: 'Anti-flaking, scalp-balancing care', ageGroups: ['child', 'teen', 'adult', 'senior'] },
  { id: 'hair-care', label: 'Hair & Scalp', icon: Brush, description: 'Gentle, scalp-friendly hair products', ageGroups: ['child', 'teen', 'adult', 'senior'] },
  { id: 'hair-loss', label: 'Hair Thinning', icon: TrendingDown, description: 'Supports thinning hair & scalp health', ageGroups: ['adult', 'senior'] },
  { id: 'color-treated', label: 'Color-Treated Hair', icon: Palette, description: 'Protects dyed or chemically treated hair', ageGroups: ['teen', 'adult', 'senior'] },
  { id: 'anti-aging', label: 'Mature Skin', icon: Hourglass, description: 'Targets fine lines & loss of firmness', ageGroups: ['adult', 'senior'] },
  { id: 'baby-gentle', label: 'Baby-Safe', icon: Sprout, description: 'Ultra-gentle, fragrance-free for infants', ageGroups: ['newborn', 'child'] },
];

function isConditionVisible(cond: ConditionMeta, gender: Gender, ageGroup: AgeGroup): boolean {
  if (cond.genders && !cond.genders.includes(gender)) return false;
  if (cond.ageGroups && !cond.ageGroups.includes(ageGroup)) return false;
  return true;
}

export default function SkinProfileSelector({ profile, onChange }: SkinProfileSelectorProps) {
  const visibleConditions = CONDITIONS.filter((c) => isConditionVisible(c, profile.gender, profile.ageGroup));

  // Drop any selected conditions that are no longer relevant for the new gender/age.
  const pruneConditions = (gender: Gender, ageGroup: AgeGroup): SpecialCondition[] => {
    const allowed = new Set(
      CONDITIONS.filter((c) => isConditionVisible(c, gender, ageGroup)).map((c) => c.id)
    );
    return profile.conditions.filter((c) => allowed.has(c));
  };

  const handleTypeChange = (type: SkinType) => {
    onChange({ ...profile, skinType: type });
  };

  const handleGenderChange = (gender: Gender) => {
    onChange({ ...profile, gender, conditions: pruneConditions(gender, profile.ageGroup) });
  };

  const handleAgeChange = (ageGroup: AgeGroup) => {
    onChange({ ...profile, ageGroup, conditions: pruneConditions(profile.gender, ageGroup) });
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
          <h3 className="text-sm font-bold tracking-tight text-ink">Your profile</h3>
          <p className="text-xs text-mist">Personalizes every ingredient verdict</p>
        </div>
      </div>

      {/* Gender Selection */}
      <div className="mt-5 space-y-2.5">
        <span className="block text-[11px] font-bold uppercase tracking-[0.12em] text-stone">
          Gender
        </span>
        <div className="grid grid-cols-3 gap-2">
          {GENDERS.map((g) => {
            const isSelected = profile.gender === g.id;
            const Icon = g.icon;
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => handleGenderChange(g.id)}
                aria-pressed={isSelected}
                className={`flex flex-col items-center gap-1.5 border p-3 text-center transition-colors duration-150 cursor-pointer rounded-md ${
                  isSelected
                    ? 'border-ink bg-fill text-ink'
                    : 'border-line bg-paper text-stone hover:border-mist'
                }`}
              >
                <Icon className={`h-[18px] w-[18px] ${isSelected ? 'text-ink' : 'text-mist'}`} strokeWidth={1.6} />
                <span className={`text-xs font-bold leading-tight tracking-tight ${isSelected ? 'text-ink' : 'text-ink-soft'}`}>
                  {g.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Life Stage Selection */}
      <div className="mt-5 space-y-2.5">
        <span className="block text-[11px] font-bold uppercase tracking-[0.12em] text-stone">
          Life stage
        </span>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {AGE_GROUPS.map((age) => {
            const isSelected = profile.ageGroup === age.id;
            const Icon = age.icon;
            return (
              <button
                key={age.id}
                type="button"
                onClick={() => handleAgeChange(age.id)}
                aria-pressed={isSelected}
                className={`flex flex-col items-center gap-1 border p-2.5 text-center transition-colors duration-150 cursor-pointer rounded-md ${
                  isSelected
                    ? 'border-ink bg-fill text-ink'
                    : 'border-line bg-paper text-stone hover:border-mist'
                }`}
              >
                <Icon className={`h-[18px] w-[18px] ${isSelected ? 'text-ink' : 'text-mist'}`} strokeWidth={1.6} />
                <span className={`text-xs font-bold leading-tight tracking-tight ${isSelected ? 'text-ink' : 'text-ink-soft'}`}>
                  {age.label}
                </span>
                <span className="text-[9px] leading-tight text-mist">{age.description}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Skin Type Selection */}
      <div className="mt-5 space-y-2.5">
        <span className="block text-[11px] font-bold uppercase tracking-[0.12em] text-stone">
          Skin type
        </span>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
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
          {visibleConditions.map((cond) => {
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
