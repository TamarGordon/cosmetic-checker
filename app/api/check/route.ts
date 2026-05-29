import { NextRequest, NextResponse } from 'next/server';

// Type definitions for our structured API response
interface Ingredient {
  name: string;
  rating: 'Good' | 'Average' | 'Poor';
  purpose: string;
  safety: 'Low risk' | 'Medium risk' | 'High risk';
  description: string;
  isKeyActive: boolean;
  
  // Personalized fields
  personalVerdict: 'Safe' | 'Caution' | 'Avoid';
  personalExplanation: string;
}

interface AnalysisResponse {
  success: boolean;
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
  profile?: {
    skinType: string;
    conditions: string[];
  };
}

// Highly realistic mock data for local testing
const MOCK_PRODUCTS: Record<string, Omit<AnalysisResponse, 'success' | 'source' | 'profile'>> = {
  cerave: {
    productName: 'CeraVe Hydrating Cleanser',
    rating: 'Good',
    score: 95,
    summary: 'An exceptionally gentle, non-foaming cleanser. Formulated with three essential ceramides and hyaluronic acid to cleanse and hydrate without disrupting the protective skin barrier.',
    ingredients: [
      {
        name: 'Purified Water',
        rating: 'Good',
        purpose: 'Solvent',
        safety: 'Low risk',
        description: 'Main liquid ingredient used to dissolve and blend other cosmetic ingredients.',
        isKeyActive: false,
        personalVerdict: 'Safe',
        personalExplanation: 'Safe formulation base.'
      },
      {
        name: 'Glycerin',
        rating: 'Good',
        purpose: 'Humectant',
        safety: 'Low risk',
        description: 'A skin-natural moisturizer that pulls water into the upper layers of skin, keeping it hydrated.',
        isKeyActive: true,
        personalVerdict: 'Safe',
        personalExplanation: 'Safe, standard skin-identical hydration.'
      },
      {
        name: 'Cetearyl Alcohol',
        rating: 'Good',
        purpose: 'Emollient / Emulsifier',
        safety: 'Low risk',
        description: 'A "fatty alcohol" that is non-drying and extremely safe. It softens skin and helps stabilize the formula.',
        isKeyActive: false,
        personalVerdict: 'Safe',
        personalExplanation: 'A non-drying fatty alcohol that is perfectly safe.'
      },
      {
        name: 'Ceramide NP',
        rating: 'Good',
        purpose: 'Skin-Identical Ingredient',
        safety: 'Low risk',
        description: 'An essential lipid that makes up about 50% of the skin barrier. Crucial for retaining skin moisture and strength.',
        isKeyActive: true,
        personalVerdict: 'Safe',
        personalExplanation: 'Essential barrier lipid that protects and hydrates.'
      },
      {
        name: 'Ceramide AP',
        rating: 'Good',
        purpose: 'Skin-Identical Ingredient',
        safety: 'Low risk',
        description: 'Works synergistically with other ceramides to maintain, restore, and protect the skin barrier.',
        isKeyActive: true,
        personalVerdict: 'Safe',
        personalExplanation: 'Crucial for maintaining a healthy skin barrier.'
      },
      {
        name: 'Ceramide EOP',
        rating: 'Good',
        purpose: 'Skin-Identical Ingredient',
        safety: 'Low risk',
        description: 'Important ceramide that binds skin cells together, forming a protective barrier against environmental damage.',
        isKeyActive: true,
        personalVerdict: 'Safe',
        personalExplanation: 'Binds skin cells to protect against moisture loss.'
      },
      {
        name: 'Hyaluronic Acid',
        rating: 'Good',
        purpose: 'Humectant / Skin-identical',
        safety: 'Low risk',
        description: 'A powerhouse hydrator that holds up to 1000 times its weight in water, plumping and hydrating the skin.',
        isKeyActive: true,
        personalVerdict: 'Safe',
        personalExplanation: 'Holds moisture in the skin, plump and hydrate.'
      },
      {
        name: 'Cholesterol',
        rating: 'Good',
        purpose: 'Emollient',
        safety: 'Low risk',
        description: 'A lipids compound that naturally occurs in the skin barrier. Works with ceramides to restore suppleness.',
        isKeyActive: false,
        personalVerdict: 'Safe',
        personalExplanation: 'Helps restore natural skin barrier lipids.'
      },
      {
        name: 'Phytosphingosine',
        rating: 'Good',
        purpose: 'Skin-conditioning',
        safety: 'Low risk',
        description: 'A lipid component that has water-binding and mild anti-inflammatory/anti-microbial properties.',
        isKeyActive: false,
        personalVerdict: 'Safe',
        personalExplanation: 'Nourishes the skin and supports barrier repair.'
      },
      {
        name: 'Phenoxyethanol',
        rating: 'Average',
        purpose: 'Preservative',
        safety: 'Low risk',
        description: 'A widely used safe preservative that prevents bacterial growth. Irritating only in highly sensitive individuals or very high concentrations.',
        isKeyActive: false,
        personalVerdict: 'Safe',
        personalExplanation: 'Standard, gentle cosmetic preservative.'
      }
    ],
    skinSuitability: {
      dry: 'Good',
      oily: 'Neutral',
      sensitive: 'Good'
    },
    flags: {
      hasParabens: false,
      hasSulfates: false,
      hasFragrance: false,
      hasSilicones: false
    }
  },
  ordinary: {
    productName: 'The Ordinary Niacinamide 10% + Zinc 1%',
    rating: 'Good',
    score: 88,
    summary: 'A high-strength vitamin and mineral formula. Excellent for reducing the appearance of skin blemishes, congestion, and balancing visible sebum activity.',
    ingredients: [
      {
        name: 'Aqua (Water)',
        rating: 'Good',
        purpose: 'Solvent',
        safety: 'Low risk',
        description: 'Pure water used as a formulation base.',
        isKeyActive: false,
        personalVerdict: 'Safe',
        personalExplanation: 'Pure water base.'
      },
      {
        name: 'Niacinamide',
        rating: 'Good',
        purpose: 'Skin-Restoring / Multi-functional',
        safety: 'Low risk',
        description: 'Vitamin B3. Superbly regulates oil production, minimizes pore appearance, improves skin tone unevenness, and strengthens skin barrier.',
        isKeyActive: true,
        personalVerdict: 'Safe',
        personalExplanation: 'Excellent multi-tasker that regulates oil and strengthens the barrier.'
      },
      {
        name: 'Zinc PCA',
        rating: 'Good',
        purpose: 'Sebum Regulator / Anti-bacterial',
        safety: 'Low risk',
        description: 'An excellent molecule for oily and acne-prone skin. Controls sebum secretion and inhibits bacterial growth that causes breakouts.',
        isKeyActive: true,
        personalVerdict: 'Safe',
        personalExplanation: 'Great for regulating sebum and combating acne bacteria.'
      },
      {
        name: 'Tamarindus Indica Seed Gum',
        rating: 'Good',
        purpose: 'Humectant / Texture',
        safety: 'Low risk',
        description: 'A plant-derived polysaccharide that hydrates skin and improves the texture and spreadability of the serum.',
        isKeyActive: false,
        personalVerdict: 'Safe',
        personalExplanation: 'Soothing natural hydration.'
      },
      {
        name: 'Pentylene Glycol',
        rating: 'Good',
        purpose: 'Humectant / Solvent',
        safety: 'Low risk',
        description: 'Moisturizes skin and helps other ingredients penetrate deeper. Also acts as a mild booster for preservatives.',
        isKeyActive: false,
        personalVerdict: 'Safe',
        personalExplanation: 'Hydrates and aids the penetration of active ingredients.'
      },
      {
        name: 'Xanthan Gum',
        rating: 'Good',
        purpose: 'Thickener',
        safety: 'Low risk',
        description: 'A natural, food-grade thickener used to create a silky, serum-like gel texture.',
        isKeyActive: false,
        personalVerdict: 'Safe',
        personalExplanation: 'Safe natural thickening agent.'
      },
      {
        name: 'Ethoxydiglycol',
        rating: 'Average',
        purpose: 'Solvent / Penetration Enhancer',
        safety: 'Low risk',
        description: 'Improves the solubility and delivery of active ingredients (like Niacinamide) deep into the skin layers.',
        isKeyActive: false,
        personalVerdict: 'Safe',
        personalExplanation: 'Helps key actives absorb efficiently.'
      },
      {
        name: 'Phenoxyethanol',
        rating: 'Average',
        purpose: 'Preservative',
        safety: 'Low risk',
        description: 'Prevents mold and bacterial contamination in water-based cosmetics.',
        isKeyActive: false,
        personalVerdict: 'Safe',
        personalExplanation: 'Keeps water-based formula fresh and free from microbes.'
      },
      {
        name: 'Chlorphenesin',
        rating: 'Average',
        purpose: 'Preservative',
        safety: 'Medium risk',
        description: 'An antimicrobial preservative. Can cause mild contact irritation in exceptionally sensitive skin types.',
        isKeyActive: false,
        personalVerdict: 'Safe',
        personalExplanation: 'Preservative that is generally safe for normal skin.'
      }
    ],
    skinSuitability: {
      dry: 'Neutral',
      oily: 'Good',
      sensitive: 'Neutral'
    },
    flags: {
      hasParabens: false,
      hasSulfates: false,
      hasFragrance: false,
      hasSilicones: false
    }
  },
  default: {
    productName: 'Hydrating Daily Moisturizer (Standard)',
    rating: 'Average',
    score: 72,
    summary: 'A decent standard moisturizer that provides good basic hydration. However, it contains synthetic fragrance and silicones which may trigger sensitive skin or clog pores in acne-prone individuals.',
    ingredients: [
      {
        name: 'Water',
        rating: 'Good',
        purpose: 'Solvent',
        safety: 'Low risk',
        description: 'Formulation base.',
        isKeyActive: false,
        personalVerdict: 'Safe',
        personalExplanation: 'Standard base.'
      },
      {
        name: 'Glycerin',
        rating: 'Good',
        purpose: 'Humectant',
        safety: 'Low risk',
        description: 'Classic humectant that hydrates the skin deeply.',
        isKeyActive: true,
        personalVerdict: 'Safe',
        personalExplanation: 'Provides excellent basic hydration.'
      },
      {
        name: 'Dimethicone',
        rating: 'Average',
        purpose: 'Silicone / Occlusive',
        safety: 'Low risk',
        description: 'A synthetic silicone that creates a smooth, silky barrier on the skin, preventing moisture loss. Can sometimes feel heavy or trap oil.',
        isKeyActive: false,
        personalVerdict: 'Safe',
        personalExplanation: 'Silicone that helps retain moisture.'
      },
      {
        name: 'Isopropyl Myristate',
        rating: 'Poor',
        purpose: 'Emollient / Texture',
        safety: 'Medium risk',
        description: 'Highly comedogenic (pore-clogging) ingredient used to make creams feel less greasy. Avoid if you have oily or acne-prone skin.',
        isKeyActive: false,
        personalVerdict: 'Safe',
        personalExplanation: 'Softens skin texture but can clog pores.'
      },
      {
        name: 'Stearic Acid',
        rating: 'Average',
        purpose: 'Emulsion Stabilizer',
        safety: 'Low risk',
        description: 'A fatty acid that cleanses and softens skin, also helps thicken the cream.',
        isKeyActive: false,
        personalVerdict: 'Safe',
        personalExplanation: 'Softens skin and stabilizes cream texture.'
      },
      {
        name: 'Tocopheryl Acetate',
        rating: 'Good',
        purpose: 'Antioxidant (Vitamin E)',
        safety: 'Low risk',
        description: 'Protects the skin cells from free radicals and environmental stressors while offering conditioning.',
        isKeyActive: true,
        personalVerdict: 'Safe',
        personalExplanation: 'Provides beneficial antioxidant defense.'
      },
      {
        name: 'Fragrance / Parfum',
        rating: 'Poor',
        purpose: 'Fragrance',
        safety: 'High risk',
        description: 'Synthetic scent compounds. A leading cause of allergic contact dermatitis, redness, and irritation in sensitive skin.',
        isKeyActive: false,
        personalVerdict: 'Safe',
        personalExplanation: 'Adds a pleasant scent but has potential to sensitize.'
      },
      {
        name: 'Methylparaben',
        rating: 'Average',
        purpose: 'Preservative',
        safety: 'Medium risk',
        description: 'A paraben preservative. Highly effective at preventing bacteria but often avoided by consumers due to historical, controversial environmental/hormonal discussions.',
        isKeyActive: false,
        personalVerdict: 'Safe',
        personalExplanation: 'Highly effective antimicrobial preservative.'
      },
      {
        name: 'Triethanolamine',
        rating: 'Average',
        purpose: 'pH Adjuster',
        safety: 'Medium risk',
        description: 'Used to neutralize acidity and balance formulation pH. Can cause skin and eye irritation if left on in high amounts.',
        isKeyActive: false,
        personalVerdict: 'Safe',
        personalExplanation: 'Maintains optimal formula pH.'
      }
    ],
    skinSuitability: {
      dry: 'Good',
      oily: 'Avoid',
      sensitive: 'Avoid'
    },
    flags: {
      hasParabens: true,
      hasSulfates: false,
      hasFragrance: true,
      hasSilicones: true
    }
  }
};

// Helper to dynamically personalize mock data based on the selected skin profile
function personalizeMockData(mockKey: string, profile: { skinType: string; conditions: string[] }) {
  const baseMock = JSON.parse(JSON.stringify(MOCK_PRODUCTS[mockKey] || MOCK_PRODUCTS.default));
  const { skinType, conditions } = profile;

  const ingredients = baseMock.ingredients.map((ing: any) => {
    let personalVerdict: 'Safe' | 'Caution' | 'Avoid' = 'Safe';
    let personalExplanation = `Safe for your profile. Provides ${ing.purpose.toLowerCase()} benefits.`;

    const nameLower = ing.name.toLowerCase();

    // 1. Check pregnancy / breastfeeding
    if (conditions.includes('pregnant') || conditions.includes('breastfeeding')) {
      if (nameLower.includes('paraben')) {
        personalVerdict = 'Caution';
        personalExplanation = 'Caution: Parabens have controversial historical research regarding hormone activity. Many pregnant/nursing mothers choose to limit exposure.';
      } else if (nameLower.includes('salicylic') || nameLower.includes('retin') || nameLower.includes('vitamin a') || nameLower.includes('benzoyl')) {
        personalVerdict = 'Avoid';
        personalExplanation = 'Avoid: Retinoids, benzoyl peroxide, and high-strength salicylic acid are clinically recommended to be avoided during pregnancy and breastfeeding.';
      }
    }

    // 2. Check oily / acne-prone
    if (conditions.includes('acne-prone') || skinType === 'oily') {
      if (nameLower.includes('isopropyl myristate')) {
        personalVerdict = 'Avoid';
        personalExplanation = 'Avoid: Isopropyl Myristate is highly comedogenic (pore-clogging) and is extremely likely to trigger breakouts and acne congestion.';
      } else if (nameLower.includes('dimethicone') || nameLower.includes('silicone') || nameLower.includes('stearic acid')) {
        personalVerdict = 'Caution';
        personalExplanation = 'Caution: Heavy silicones or fatty acids can form an occlusive barrier that traps sebum and sweat, occasionally triggering acne.';
      } else if (nameLower.includes('zinc') || nameLower.includes('niacinamide')) {
        personalVerdict = 'Safe';
        personalExplanation = 'Highly recommended! Excellent for your profile. Actively regulates oil secretion, reduces inflammation, and clears breakouts.';
      }
    }

    // 3. Check sensitive / eczema / rosacea
    if (conditions.includes('eczema') || conditions.includes('rosacea') || skinType === 'sensitive') {
      if (nameLower.includes('fragrance') || nameLower.includes('parfum') || nameLower.includes('essential oil') || nameLower.includes('limonene') || nameLower.includes('linalool')) {
        personalVerdict = 'Avoid';
        personalExplanation = 'Avoid: Synthetic fragrances and essential oils are highly sensitizing allergens and are the number-one trigger for eczema, rosacea flare-ups, and hives.';
      } else if (nameLower.includes('chlorphenesin') || nameLower.includes('phenoxyethanol') || nameLower.includes('triethanolamine')) {
        personalVerdict = 'Caution';
        personalExplanation = 'Caution: This preservative or adjuster is safe for general skin but can cause burning, stinging, or contact dermatitis on a compromised skin barrier.';
      } else if (nameLower.includes('ceramide') || nameLower.includes('hyaluronic') || nameLower.includes('glycerin')) {
        personalVerdict = 'Safe';
        personalExplanation = 'Highly recommended! Safe and deeply soothing. Ideal for calming flare-ups, repairing the skin barrier, and providing gentle, irritation-free hydration.';
      }
    }

    // 4. Check dry skin
    if (skinType === 'dry') {
      if (nameLower.includes('zinc')) {
        personalVerdict = 'Caution';
        personalExplanation = 'Caution: Zinc PCA has astringent and drying properties. It is safe to use but you should ensure you layer a rich moisturizer over it.';
      } else if (nameLower.includes('ceramide') || nameLower.includes('hyaluronic') || nameLower.includes('glycerin')) {
        personalVerdict = 'Safe';
        personalExplanation = 'Excellent for dry skin! Effectively locks in hydration, plumping the skin and soothing any dry, flaky patches.';
      }
    }

    return {
      ...ing,
      personalVerdict,
      personalExplanation
    };
  });

  // Calculate score adjustments
  let adjustedScore = baseMock.score;
  let summary = baseMock.summary;

  if (skinType === 'sensitive' || conditions.includes('eczema') || conditions.includes('rosacea')) {
    if (baseMock.flags.hasFragrance) {
      adjustedScore = Math.max(30, adjustedScore - 20);
      summary += " Warning: This formula contains synthetic fragrance, which is highly discouraged for your sensitive skin profile as it can trigger severe irritation.";
    }
  }
  if (conditions.includes('acne-prone') || skinType === 'oily') {
    if (baseMock.ingredients.some((ing: any) => ing.name.toLowerCase().includes('isopropyl myristate'))) {
      adjustedScore = Math.max(35, adjustedScore - 25);
      summary += " Warning: This product contains isopropyl myristate, which is highly pore-clogging and should be avoided to prevent acne flares.";
    }
  }

  const rating = adjustedScore >= 85 ? 'Good' : adjustedScore >= 70 ? 'Average' : 'Poor';

  return {
    ...baseMock,
    score: adjustedScore,
    rating,
    summary,
    ingredients,
    profile
  };
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const image = formData.get('image') as File | null;
    const profileStr = formData.get('profile') as string | null;
    const ingredientsStr = formData.get('ingredients') as string | null;
    const filenameStr = formData.get('filename') as string | null;

    const profile = profileStr ? JSON.parse(profileStr) : { skinType: 'normal', conditions: [] };
    const parsedIngredients = ingredientsStr ? JSON.parse(ingredientsStr) : null;
    const filename = (image?.name || filenameStr || '').toLowerCase();

    // Verify input
    if (!image && !parsedIngredients) {
      return NextResponse.json(
        { success: false, error: 'No image file or ingredients list was provided' },
        { status: 400 }
      );
    }

    // Check if Anthropic API key is configured
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (apiKey) {
      try {
        let systemPrompt = '';
        let userPrompt = '';
        let mediaType = 'image/jpeg';
        let base64Image = '';

        const profileText = `
The user has the following Skin Profile:
- Skin Type: ${profile.skinType.toUpperCase()}
- Special Conditions: ${profile.conditions.length > 0 ? profile.conditions.map((c: string) => c.toUpperCase()).join(', ') : 'NONE'}
`;

        if (image) {
          const imageBuffer = Buffer.from(await image.arrayBuffer());
          base64Image = imageBuffer.toString('base64');
          
          mediaType = image.type || 'image/jpeg';
          if (mediaType === 'image/jpg') mediaType = 'image/jpeg';
          
          // Ensure the media type is supported by Claude's Vision API
          const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
          if (!allowedTypes.includes(mediaType)) {
            mediaType = 'image/jpeg';
          }

          systemPrompt = `
You are an expert cosmetic formulation scientist, skincare safety specialist, and dermatologist assistant.
Your task is to analyze the uploaded cosmetic product label image.

${profileText}

Follow these instructions strictly:
1. Extract the full ingredient list (INCI names) from the image.
2. Determine the product name if visible, or give it a highly descriptive name.
3. Rate the overall product safety and formulation quality ("Good", "Average", or "Poor") considering both general safety and the user's skin profile.
4. Assign an overall safety/formulation score from 0 to 100. Lower the score if there are ingredients harmful to the user's specific skin profile.
5. Create a concise, professional summary (2-3 sentences) explaining the key actives, and outlining why it is safe, cautionable, or should be avoided given the user's skin profile.
6. For each extracted ingredient:
   - Provide the correct INCI name.
   - Rate it as "Good", "Average", or "Poor" based on standard cosmetic science.
   - List its primary function/purpose (e.g., Humectant, Preservative, Surfactant, Skin-Restoring, Silicone, Solvent, Emollient).
   - Rate its general safety risk ("Low risk", "Medium risk", "High risk").
   - Give a brief, consumer-friendly description of what it does.
   - Identify if it is a "key active" ingredient.
   - Provide a personalized safety verdict ("Safe", "Caution", "Avoid") specifically for the user's skin profile.
   - Provide a brief personalized explanation (1-2 sentences) of why it has this verdict for their specific skin type and conditions. Reference safety considerations from authoritative cosmetic literature like INCI Decoder (incidecoder.com), PubMed (pubmed.ncbi.nlm.nih.gov), and The Dekel (thedekel.co.il) where applicable. For example, explain why a pregnant user must avoid retinoids, why an eczema user must avoid synthetic fragrances, or why a dry skin user should exercise caution with oil-absorbing zinc.
7. Evaluate suitability ("Good", "Neutral", or "Avoid") for three major skin categories:
   - dry
   - oily
   - sensitive
8. Determine if the formula contains any of these specific ingredient classes:
   - parabens (e.g., methylparaben, propylparaben)
   - sulfates (e.g., SLS, SLES)
   - synthetic fragrances (e.g., fragrance, parfum, linalool, limonene, citronellol, geraniol)
   - silicones (e.g., dimethicone, cyclopentasiloxane)

You MUST respond with a single, valid JSON object matching this schema EXACTLY:
{
  "productName": "string",
  "rating": "Good" | "Average" | "Poor",
  "score": number,
  "summary": "string",
  "ingredients": [
    {
      "name": "string",
      "rating": "Good" | "Average" | "Poor",
      "purpose": "string",
      "safety": "Low risk" | "Medium risk" | "High risk",
      "description": "string",
      "isKeyActive": boolean,
      "personalVerdict": "Safe" | "Caution" | "Avoid",
      "personalExplanation": "string"
    }
  ],
  "skinSuitability": {
    "dry": "Good" | "Neutral" | "Avoid",
    "oily": "Good" | "Neutral" | "Avoid",
    "sensitive": "Good" | "Neutral" | "Avoid"
  },
  "flags": {
    "hasParabens": boolean,
    "hasSulfates": boolean,
    "hasFragrance": boolean,
    "hasSilicones": boolean
  }
}

Do not include any markdown styling, HTML formatting, code fences like \`\`\`json, or extraneous text. Only return the raw, valid JSON string.
`;

          userPrompt = "Analyze this ingredients list image and return the structured JSON analysis.";
        } else {
          // Analysis only, we have pre-extracted ingredients!
          systemPrompt = `
You are an expert cosmetic formulation scientist, skincare safety specialist, and dermatologist assistant.
Your task is to analyze a provided list of cosmetic ingredients.

${profileText}

Follow these instructions strictly:
1. Determine a descriptive name for the product based on the ingredients list (e.g., "Hyaluronic Acid & Ceramide Moisturizer").
2. Rate the overall product safety and formulation quality ("Good", "Average", or "Poor") considering both general safety and the user's skin profile.
3. Assign an overall safety/formulation score from 0 to 100. Lower the score if there are ingredients harmful to the user's specific skin profile.
4. Create a concise, professional summary (2-3 sentences) explaining the key actives, and outlining why it is safe, cautionable, or should be avoided given the user's skin profile.
5. For each provided ingredient in the input list:
   - Provide its INCI name.
   - Rate it as "Good", "Average", or "Poor" based on standard cosmetic science.
   - List its primary function/purpose (e.g., Humectant, Preservative, Surfactant, Skin-Restoring, Silicone, Solvent, Emollient).
   - Rate its general safety risk ("Low risk", "Medium risk", "High risk").
   - Give a brief, consumer-friendly description of what it does.
   - Identify if it is a "key active" ingredient.
   - Provide a personalized safety verdict ("Safe", "Caution", "Avoid") specifically for the user's skin profile.
   - Provide a brief personalized explanation (1-2 sentences) of why it has this verdict for their specific skin type and conditions. Reference safety considerations from authoritative cosmetic literature like INCI Decoder (incidecoder.com), PubMed (pubmed.ncbi.nlm.nih.gov), and The Dekel (thedekel.co.il) where applicable. For example, explain why a pregnant user must avoid retinoids, why an eczema user must avoid synthetic fragrances, or why a dry skin user should exercise caution with oil-absorbing zinc.
6. Evaluate suitability ("Good", "Neutral", or "Avoid") for three major skin categories:
   - dry
   - oily
   - sensitive
7. Determine if the formula contains any of these specific ingredient classes:
   - parabens (e.g., methylparaben, propylparaben)
   - sulfates (e.g., SLS, SLES)
   - synthetic fragrances (e.g., fragrance, parfum, linalool, limonene, citronellol, geraniol)
   - silicones (e.g., dimethicone, cyclopentasiloxane)

You MUST respond with a single, valid JSON object matching this schema EXACTLY:
{
  "productName": "string",
  "rating": "Good" | "Average" | "Poor",
  "score": number,
  "summary": "string",
  "ingredients": [
    {
      "name": "string",
      "rating": "Good" | "Average" | "Poor",
      "purpose": "string",
      "safety": "Low risk" | "Medium risk" | "High risk",
      "description": "string",
      "isKeyActive": boolean,
      "personalVerdict": "Safe" | "Caution" | "Avoid",
      "personalExplanation": "string"
    }
  ],
  "skinSuitability": {
    "dry": "Good" | "Neutral" | "Avoid",
    "oily": "Good" | "Neutral" | "Avoid",
    "sensitive": "Good" | "Neutral" | "Avoid"
  },
  "flags": {
    "hasParabens": boolean,
    "hasSulfates": boolean,
    "hasFragrance": boolean,
    "hasSilicones": boolean
  }
}

Do not include any markdown styling, HTML formatting, code fences like \`\`\`json, or extraneous text. Only return the raw, valid JSON string.
`;

          userPrompt = `Analyze the following ingredients list: ${parsedIngredients.join(', ')}`;
        }

        const messages: any[] = [];
        if (image) {
          messages.push({
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mediaType,
                  data: base64Image,
                },
              },
              {
                type: 'text',
                text: userPrompt,
              },
            ],
          });
        } else {
          messages.push({
            role: 'user',
            content: [
              {
                type: 'text',
                text: userPrompt,
              },
            ],
          });
        }

        // Call Anthropic Messages API with Vision payload
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-6',
            max_tokens: 4000,
            system: systemPrompt,
            messages,
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`Claude API error: ${response.status} - ${errText}`);
        }

        const resData = await response.json();
        const textResult = resData.content?.[0]?.text;
        
        if (!textResult) {
          throw new Error('Claude API returned an empty response');
        }

        const cleanJsonText = textResult.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsedAnalysis = JSON.parse(cleanJsonText);

        return NextResponse.json({
          success: true,
          ...parsedAnalysis,
          source: 'ai',
          profile
        });

      } catch (aiError: any) {
        console.error('Claude Analysis failed:', aiError);
        return NextResponse.json(
          { success: false, error: aiError.message || 'Claude analysis failed' },
          { status: 500 }
        );
      }
    }

    // --- MOCK FALLBACK (If no API Key or if AI parsing fails) ---
    // Simulate real network delay for a authentic loading experience (1.5 seconds)
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Choose mock profile based on filename matching keywords
    let mockKey = 'default';
    if (filename.includes('cerave') || filename.includes('cleanser')) {
      mockKey = 'cerave';
    } else if (filename.includes('ordinary') || filename.includes('niacinamide') || filename.includes('zinc')) {
      mockKey = 'ordinary';
    }

    const personalized = personalizeMockData(mockKey, profile);

    return NextResponse.json({
      success: true,
      ...personalized,
      source: 'mock'
    });

  } catch (err: any) {
    console.error('Server side error checking ingredients:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
