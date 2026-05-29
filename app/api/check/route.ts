import { NextRequest, NextResponse } from 'next/server';

// Type definitions for our structured API response
interface Ingredient {
  name: string;
  rating: 'Good' | 'Average' | 'Poor';
  purpose: string;
  safety: 'Low risk' | 'Medium risk' | 'High risk';
  description: string;
  isKeyActive: boolean;
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
}

// Highly realistic mock data for local testing
const MOCK_PRODUCTS: Record<string, Omit<AnalysisResponse, 'success' | 'source'>> = {
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
        isKeyActive: false
      },
      {
        name: 'Glycerin',
        rating: 'Good',
        purpose: 'Humectant',
        safety: 'Low risk',
        description: 'A skin-natural moisturizer that pulls water into the upper layers of skin, keeping it hydrated.',
        isKeyActive: true
      },
      {
        name: 'Cetearyl Alcohol',
        rating: 'Good',
        purpose: 'Emollient / Emulsifier',
        safety: 'Low risk',
        description: 'A "fatty alcohol" that is non-drying and extremely safe. It softens skin and helps stabilize the formula.',
        isKeyActive: false
      },
      {
        name: 'Ceramide NP',
        rating: 'Good',
        purpose: 'Skin-Identical Ingredient',
        safety: 'Low risk',
        description: 'An essential lipid that makes up about 50% of the skin barrier. Crucial for retaining skin moisture and strength.',
        isKeyActive: true
      },
      {
        name: 'Ceramide AP',
        rating: 'Good',
        purpose: 'Skin-Identical Ingredient',
        safety: 'Low risk',
        description: 'Works synergistically with other ceramides to maintain, restore, and protect the skin barrier.',
        isKeyActive: true
      },
      {
        name: 'Ceramide EOP',
        rating: 'Good',
        purpose: 'Skin-Identical Ingredient',
        safety: 'Low risk',
        description: 'Important ceramide that binds skin cells together, forming a protective barrier against environmental damage.',
        isKeyActive: true
      },
      {
        name: 'Hyaluronic Acid',
        rating: 'Good',
        purpose: 'Humectant / Skin-identical',
        safety: 'Low risk',
        description: 'A powerhouse hydrator that holds up to 1000 times its weight in water, plumping and hydrating the skin.',
        isKeyActive: true
      },
      {
        name: 'Cholesterol',
        rating: 'Good',
        purpose: 'Emollient',
        safety: 'Low risk',
        description: 'A lipids compound that naturally occurs in the skin barrier. Works with ceramides to restore suppleness.',
        isKeyActive: false
      },
      {
        name: 'Phytosphingosine',
        rating: 'Good',
        purpose: 'Skin-conditioning',
        safety: 'Low risk',
        description: 'A lipid component that has water-binding and mild anti-inflammatory/anti-microbial properties.',
        isKeyActive: false
      },
      {
        name: 'Phenoxyethanol',
        rating: 'Average',
        purpose: 'Preservative',
        safety: 'Low risk',
        description: 'A widely used safe preservative that prevents bacterial growth. Irritating only in highly sensitive individuals or very high concentrations.',
        isKeyActive: false
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
        isKeyActive: false
      },
      {
        name: 'Niacinamide',
        rating: 'Good',
        purpose: 'Skin-Restoring / Multi-functional',
        safety: 'Low risk',
        description: 'Vitamin B3. Superbly regulates oil production, minimizes pore appearance, improves skin tone unevenness, and strengthens skin barrier.',
        isKeyActive: true
      },
      {
        name: 'Zinc PCA',
        rating: 'Good',
        purpose: 'Sebum Regulator / Anti-bacterial',
        safety: 'Low risk',
        description: 'An excellent molecule for oily and acne-prone skin. Controls sebum secretion and inhibits bacterial growth that causes breakouts.',
        isKeyActive: true
      },
      {
        name: 'Tamarindus Indica Seed Gum',
        rating: 'Good',
        purpose: 'Humectant / Texture',
        safety: 'Low risk',
        description: 'A plant-derived polysaccharide that hydrates skin and improves the texture and spreadability of the serum.',
        isKeyActive: false
      },
      {
        name: 'Pentylene Glycol',
        rating: 'Good',
        purpose: 'Humectant / Solvent',
        safety: 'Low risk',
        description: 'Moisturizes skin and helps other ingredients penetrate deeper. Also acts as a mild booster for preservatives.',
        isKeyActive: false
      },
      {
        name: 'Xanthan Gum',
        rating: 'Good',
        purpose: 'Thickener',
        safety: 'Low risk',
        description: 'A natural, food-grade thickener used to create a silky, serum-like gel texture.',
        isKeyActive: false
      },
      {
        name: 'Ethoxydiglycol',
        rating: 'Average',
        purpose: 'Solvent / Penetration Enhancer',
        safety: 'Low risk',
        description: 'Improves the solubility and delivery of active ingredients (like Niacinamide) deep into the skin layers.',
        isKeyActive: false
      },
      {
        name: 'Phenoxyethanol',
        rating: 'Average',
        purpose: 'Preservative',
        safety: 'Low risk',
        description: 'Prevents mold and bacterial contamination in water-based cosmetics.',
        isKeyActive: false
      },
      {
        name: 'Chlorphenesin',
        rating: 'Average',
        purpose: 'Preservative',
        safety: 'Medium risk',
        description: 'An antimicrobial preservative. Can cause mild contact irritation in exceptionally sensitive skin types.',
        isKeyActive: false
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
        isKeyActive: false
      },
      {
        name: 'Glycerin',
        rating: 'Good',
        purpose: 'Humectant',
        safety: 'Low risk',
        description: 'Classic humectant that hydrates the skin deeply.',
        isKeyActive: true
      },
      {
        name: 'Dimethicone',
        rating: 'Average',
        purpose: 'Silicone / Occlusive',
        safety: 'Low risk',
        description: 'A synthetic silicone that creates a smooth, silky barrier on the skin, preventing moisture loss. Can sometimes feel heavy or trap oil.',
        isKeyActive: false
      },
      {
        name: 'Isopropyl Myristate',
        rating: 'Poor',
        purpose: 'Emollient / Texture',
        safety: 'Medium risk',
        description: 'Highly comedogenic (pore-clogging) ingredient used to make creams feel less greasy. Avoid if you have oily or acne-prone skin.',
        isKeyActive: false
      },
      {
        name: 'Stearic Acid',
        rating: 'Average',
        purpose: 'Emulsion Stabilizer',
        safety: 'Low risk',
        description: 'A fatty acid that cleanses and softens skin, also helps thicken the cream.',
        isKeyActive: false
      },
      {
        name: 'Tocopheryl Acetate',
        rating: 'Good',
        purpose: 'Antioxidant (Vitamin E)',
        safety: 'Low risk',
        description: 'Protects the skin cells from free radicals and environmental stressors while offering conditioning.',
        isKeyActive: true
      },
      {
        name: 'Fragrance / Parfum',
        rating: 'Poor',
        purpose: 'Fragrance',
        safety: 'High risk',
        description: 'Synthetic scent compounds. A leading cause of allergic contact dermatitis, redness, and irritation in sensitive skin.',
        isKeyActive: false
      },
      {
        name: 'Methylparaben',
        rating: 'Average',
        purpose: 'Preservative',
        safety: 'Medium risk',
        description: 'A paraben preservative. Highly effective at preventing bacteria but often avoided by consumers due to historical, controversial environmental/hormonal discussions.',
        isKeyActive: false
      },
      {
        name: 'Triethanolamine',
        rating: 'Average',
        purpose: 'pH Adjuster',
        safety: 'Medium risk',
        description: 'Used to neutralize acidity and balance formulation pH. Can cause skin and eye irritation if left on in high amounts.',
        isKeyActive: false
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

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const image = formData.get('image') as File | null;

    if (!image) {
      return NextResponse.json(
        { success: false, error: 'No image file was provided' },
        { status: 400 }
      );
    }

    const filename = image.name.toLowerCase();

    // Check if Anthropic API key is configured
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (apiKey) {
      try {
        const imageBuffer = Buffer.from(await image.arrayBuffer());
        const base64Image = imageBuffer.toString('base64');
        
        let mediaType = image.type || 'image/jpeg';
        if (mediaType === 'image/jpg') mediaType = 'image/jpeg';
        
        // Ensure the media type is supported by Claude's Vision API
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(mediaType)) {
          mediaType = 'image/jpeg';
        }

        const systemPrompt = `
You are a professional skincare formulation scientist and dermatologist assistant.
Analyze this cosmetic product ingredient label image.
Perform the following steps:
1. Extract the full ingredient list (INCI names) from the image.
2. Determine the product name if visible, or give it a descriptive name (e.g., "Niacinamide Serum").
3. Rate the overall product safety and formulation quality ("Good", "Average", or "Poor").
4. Assign an overall safety/formulation score from 0 to 100.
5. Create a professional, concise summary (2-3 sentences) summarizing the key active ingredients, what they do, and any potential irritants/safety concerns.
6. For each extracted ingredient:
   - Provide the correct INCI name.
   - Rate it as "Good", "Average", or "Poor" based on cosmetic science guidelines.
   - List its primary function/purpose (e.g., Humectant, Preservative, Surfactant, Skin-Restoring).
   - Rate its safety risk ("Low risk", "Medium risk", "High risk").
   - Give a brief, consumer-friendly description of what it does and if there are any cautions.
   - Identify if it is a "key active" ingredient (like Vitamin C, Retinol, Ceramides, Salicylic Acid, Niacinamide, Hyaluronic Acid, etc.).
7. Evaluate suitability ("Good", "Neutral", or "Avoid") for three major skin categories:
   - dry
   - oily
   - sensitive
8. Determine if the formula contains any of these specific ingredient classes:
   - parabens (e.g., methylparaben, propylparaben)
   - sulfates (e.g., sodium lauryl sulfate, SLS, SLES)
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
      "isKeyActive": boolean
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

        const userPrompt = "Analyze this ingredients list image and return the structured JSON analysis.";

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
            messages: [
              {
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
              },
            ],
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
          source: 'ai'
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
    let selectedMock = MOCK_PRODUCTS.default;
    if (filename.includes('cerave') || filename.includes('cleanser')) {
      selectedMock = MOCK_PRODUCTS.cerave;
    } else if (filename.includes('ordinary') || filename.includes('niacinamide') || filename.includes('zinc')) {
      selectedMock = MOCK_PRODUCTS.ordinary;
    }

    return NextResponse.json({
      success: true,
      ...selectedMock,
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
