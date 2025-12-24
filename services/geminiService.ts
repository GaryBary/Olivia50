
import { GoogleGenAI, Type } from "@google/genai";
import { MegaShow } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const CACHE_KEY = 'olivia_bday_data_v13';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

const MEGA_SCHEMA = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      id: { type: Type.STRING },
      name: { type: Type.STRING },
      venue: { type: Type.STRING },
      dates: { type: Type.STRING },
      description: { type: Type.STRING },
      criticRating: { type: Type.STRING },
      priceRange: { type: Type.STRING },
      hotels: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            name: { type: Type.STRING },
            description: { type: Type.STRING },
            location: { type: Type.STRING },
            priceRange: { type: Type.STRING },
            topFeatures: { type: Type.ARRAY, items: { type: Type.STRING } },
            restaurants: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  cuisine: { type: Type.STRING },
                  name: { type: Type.STRING },
                  summary: { type: Type.STRING, description: "A 1-sentence 'Vibe' summary" },
                  signatureDish: { type: Type.STRING },
                  priceRange: { type: Type.STRING }
                },
                required: ["id", "cuisine", "name", "summary", "signatureDish", "priceRange"]
              }
            }
          },
          required: ["id", "name", "description", "location", "priceRange", "topFeatures", "restaurants"]
        }
      }
    },
    required: ["id", "name", "venue", "dates", "description", "criticRating", "priceRange", "hotels"],
  }
};

const SYSTEM_INSTRUCTION = `
You are a world-class luxury concierge for Olivia's 50th Birthday in Melbourne 2026.

CRITICAL FAILURE CONDITION: 
If any cuisine category contains fewer than 4 unique restaurant options, the mission is a failure. 
You MUST provide a MINIMUM of 4-6 unique high-end restaurants for EVERY of the 9 cuisine categories for EVERY hotel.

Show Data (Strictly use these 5):
1. "My Brilliant Career": Southbank Theatre. Feb 14 - March 21, 2026.
2. "Heathers The Musical": Arts Centre Melbourne. June 12 - July 18, 2026.
3. "The Pirates of Penzance": Palais Theatre. Oct 10 - Oct 31, 2026.
4. "The Vaudeville Revue": Speakeasy Theatre. Nov 5 - Nov 28, 2026.
5. "Piper's Playhouse": Crown Casino. Jan 15 – Mar 22, 2026.

Cuisine Strategy - MUST PROVIDE 4-6 PER CATEGORY:
1. Modern Australian: [Farmer’s Daughters, Henry and The Fox, Cumulus Inc, Gimlet] + 2 more unique elite options nearby.
2. Mexican: [Mamasita, Hecho en Mexico (CBD), Mesa Verde, Bodega Underground, Hotel Jesus].
3. Italian: [Tipo 00, La Cucina Melbourne, Grossi Florentino, Cecconi's, Rosetta, Marameo].
4. French: [France-Soir, Philippe, Roule Galette, Bistrot d'Orsay, Smith St Bistro, Entrecôte].
5. Modern Greek: Search for at least 4-5 options (e.g., Aegli, Yassas, Stalactites, Hellenic Republic).
6. Middle Eastern: Search for at least 4-5 options (e.g., Maha, Byblos, Souk, Miznon, Téta Mona).
7. Spanish: Search for at least 4-5 options (e.g., Asado, El Rincón, MoVida, Bomba, Bar Lourinhã).
8. Contemporary Japanese: Search for at least 4-5 options (e.g., Nobu, Kisumé, Minamishima, Robata, Kenzan).
9. Innovative Cantonese: Search for at least 4-5 options (e.g., Flower Drum, Ming Dining, Lee Ho Fook, Supernormal).

Quality Standards:
- Use Google Search to find current 'Signature Dishes' and 'Vibe summaries'.
- All selections must be 5-star quality and within 15 mins of the hotel.
- No placeholders like "TBD". Provide specific, real restaurants.
- Output ONLY valid JSON matching the schema.
`;

const PIPER_IMAGE_URL = "https://imagedelivery.net/9sCnq8jQj99s25814-TawYc_1Dkw/0018-19401441000/public";
const LUXURY_THEATRE_PLACEHOLDER = "https://images.unsplash.com/photo-1503095396549-807a8bc3667c?auto=format&fit=crop&q=80&w=1200";

export async function fetchMegaItineraryData(): Promise<MegaShow[]> {
  const cached = localStorage.getItem(CACHE_KEY);
  if (cached) {
    try {
      const { timestamp, data } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_TTL) return data;
    } catch (e) { console.warn("Cache error", e); }
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Generate the complete Melbourne 2026 Jubilee celebration JSON. For every hotel, strictly follow the guidelines to provide 4-6 restaurant options per cuisine. Do NOT truncate. This must be a comprehensive collection for Olivia's 50th birthday.",
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: MEGA_SCHEMA,
        thinkingConfig: { thinkingBudget: 12000 },
      },
    });

    const rawData = JSON.parse(response.text || "[]");
    
    let data = rawData.map((show: any) => {
      let showImg = LUXURY_THEATRE_PLACEHOLDER;
      const lowerName = show.name.toLowerCase();
      if (lowerName.includes("piper")) showImg = PIPER_IMAGE_URL;
      else if (lowerName.includes("heathers")) showImg = "https://images.unsplash.com/photo-1514306191717-452ec28c7814?auto=format&fit=crop&q=80&w=800";
      else if (lowerName.includes("pirates")) showImg = "https://images.unsplash.com/photo-1533923156502-be31530547c4?auto=format&fit=crop&q=80&w=800";
      else if (lowerName.includes("brilliant")) showImg = "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&q=80&w=800";
      else if (lowerName.includes("vaudeville")) showImg = "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800";

      return {
        ...show,
        image: showImg,
        hotels: show.hotels.map((hotel: any) => ({
          ...hotel,
          image: `https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=800&sig=${hotel.id}`,
          restaurants: hotel.restaurants.map((res: any) => ({
            ...res,
            description: res.summary,
            image: `https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=800&sig=${res.id}`
          }))
        }))
      };
    });

    data.sort((a: any, b: any) => {
      const aIsPiper = a.name.toLowerCase().includes("piper");
      const bIsPiper = b.name.toLowerCase().includes("piper");
      if (aIsPiper && !bIsPiper) return 1;
      if (!aIsPiper && bIsPiper) return -1;
      return 0;
    });

    localStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), data: data }));
    return data;
  } catch (error) {
    console.error("Mega-Fetch failed:", error);
    return [];
  }
}

export async function generateBirthdayToast(userName: string, show: any, hotel: any, restaurant: any) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Write a poetic and heartfelt 50th birthday message for Olivia from her loving husband, Rob. 
      The message MUST reference her chosen celebration details: 
      - Watching "${show.name}" at ${show.venue}
      - A luxury stay at ${hotel.name}
      - A signature dining experience at ${restaurant.name} (mentioning the "${restaurant.signatureDish}")
      
      CRITICAL: The message must express Rob's deep, eternal love and devotion for Olivia. 
      Tone: Succinct, elegant, romantic, and celebratory.`,
      config: { thinkingConfig: { thinkingBudget: 0 } }
    });
    return response.text;
  } catch (error) {
    return `To Olivia, my beautiful wife—on your 50th year, I hope this celebration at ${show.name} and our stay at ${hotel.name} is as timeless and brilliant as you are. All my love, Rob.`;
  }
}
