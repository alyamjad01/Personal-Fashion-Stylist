import "dotenv/config";
import express from "express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { GoogleGenAI, Type } from "@google/genai";
import type {
  PictureFitResponse,
  StylingReport,
  StylistFormInput,
  WardrobeTrack,
} from "./src/types/stylist.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

const STYLIST_SYSTEM_INSTRUCTION = `You are a professional fashion stylist who knows South Asian (Pakistani, Indian, Bangladeshi) and global fashion deeply across menswear, womenswear, and coordinated couple/dual wardrobes.

The user provides a client photo, optional reference garment/fit pictures, and their details (wardrobe track: Female, Male, or Both; height; usual size; optional partner height/size for Both; budget; occasion; style; and optional notes).

Perform these tasks with precision and warmth:
1) Judge skin undertone from the client photo (e.g., Warm, Cool, Neutral, Olive-Warm, Olive-Neutral) and recommend exactly 5 colours that flatter them, with accurate hex codes in "palette".
2) Give a rough body shape idea in kind, neutral, affirming words in "bodyShape".
3) Suggest exactly 3 complete outfits tailored to the wardrobe track, occasion, style, and budget, using authentic real garment names:
   - For Female: kurta, gharara, lehnga, saree, peshwas, anarkali, sharara, kaftan, tailored blazer, etc. Set "forWhom": "Female".
   - For Male: kurta pajama, sherwani, prince coat, bandhgala, waistcoat with shalwar kameez, pathani suit, tailored suit, etc. Set "forWhom": "Male".
   - For Both: provide 3 distinct outfits that cover Female, Male, and Both together:
     * Outfit 1: tailored Female ensemble ("forWhom": "Female")
     * Outfit 2: tailored Male ensemble ("forWhom": "Male")
     * Outfit 3: a coordinated His & Hers / Dual matching ensemble for Both ("forWhom": "Both") detailing pieces, sizes, and colours for both partners.
4) For each of the 3 outfits, provide:
   - "name": clear outfit title
   - "forWhom": "Female", "Male", or "Both"
   - "description": crisp styling description (fabric, cut, embroidery/detail, drape)
   - "pieces": list of individual garment pieces
   - "colours": list of specific shades used in this outfit
   - "overlayHexes": 2 to 3 valid 6-digit hex colour codes from the outfit's shades for visual draping over the client photo
   - "necklineCut": short label for the neckline or collar style (e.g., "Mandarin Collar", "V-Neck Embroidered Slit", "Sweetheart Choli", "Bandhgala")
   - "drapeFocus": 1 concise phrase explaining how this silhouette frames the client's photo posture/frame
   - "size": recommended size calibrated to the user's usual size and this garment's cut
   - "fitConfidence": strictly one of "High", "Medium", or "Low"
   - "fitReason": short, practical reason explaining the confidence level
   - "priceEstimatePKR": realistic estimate in PKR aligned with the user's stated budget
   - "whyItSuits": how the cut and colours complement their undertone, proportions, and occasion
   - "checkBeforeBuying": 2 to 3 specific measurements or details to check on the seller's size chart before buying so the customer avoids a return.
5) If reference outfit/fit pictures are attached after the client photo, inspect each reference picture and populate "pictureFitInsights" explaining what garment is shown, whether that cut suits the client's proportions and occasion, and any tailoring/size adjustments needed. If no reference pictures are attached, return an empty array for "pictureFitInsights".

NON-NEGOTIABLE RULES:
- Never guess height or weight from the photo. Use only the height, usual size, and measurements the user explicitly gave.
- Never say anything negative, critical, or judgmental about skin tone, weight, or body. Keep every phrase respectful, encouraging, and practical.
- If the client photo is unclear (dark lighting, heavy colour filter, blurry, cropped tightly, or body/face obscured), explicitly state that the photo is unclear in "undertoneNote" and/or "fitReason", and lower "fitConfidence" (to "Low" or "Medium").
- Output valid JSON matching the schema with no markdown fences or commentary.`;

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    undertone: {
      type: Type.STRING,
      description: "Detected skin undertone (e.g., Warm Golden, Cool Rosy, Neutral Olive).",
    },
    undertoneNote: {
      type: Type.STRING,
      description: "Brief explanation of the undertone observation, noting if lighting or photo clarity affected the read.",
    },
    palette: {
      type: Type.ARRAY,
      description: "Exactly 5 flattering colours with hex codes.",
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          hex: { type: Type.STRING },
        },
        required: ["name", "hex"],
      },
    },
    bodyShape: {
      type: Type.STRING,
      description: "Rough body shape observation phrased in kind, neutral, affirming words without guessing height or weight.",
    },
    outfits: {
      type: Type.ARRAY,
      description: "Exactly 3 curated outfits for the wardrobe track, occasion, style, and budget.",
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          forWhom: {
            type: Type.STRING,
            description: "Female, Male, or Both.",
          },
          description: { type: Type.STRING },
          pieces: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          colours: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          overlayHexes: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          necklineCut: { type: Type.STRING },
          drapeFocus: { type: Type.STRING },
          size: { type: Type.STRING },
          fitConfidence: {
            type: Type.STRING,
            description: "One of High, Medium, or Low.",
          },
          fitReason: { type: Type.STRING },
          priceEstimatePKR: { type: Type.STRING },
          whyItSuits: { type: Type.STRING },
          checkBeforeBuying: {
            type: Type.ARRAY,
            description: "2 to 3 specific seller size-chart checks before ordering.",
            items: { type: Type.STRING },
          },
        },
        required: [
          "name",
          "forWhom",
          "description",
          "pieces",
          "colours",
          "overlayHexes",
          "necklineCut",
          "drapeFocus",
          "size",
          "fitConfidence",
          "fitReason",
          "priceEstimatePKR",
          "whyItSuits",
          "checkBeforeBuying",
        ],
      },
    },
    pictureFitInsights: {
      type: Type.ARRAY,
      description: "Fit evaluations for each uploaded reference garment/outfit picture, or empty if none uploaded.",
      items: {
        type: Type.OBJECT,
        properties: {
          pictureNumber: { type: Type.INTEGER },
          garmentDetected: { type: Type.STRING },
          fitVerdict: { type: Type.STRING },
          adjustmentTip: { type: Type.STRING },
        },
        required: ["pictureNumber", "garmentDetected", "fitVerdict", "adjustmentTip"],
      },
    },
  },
  required: ["undertone", "undertoneNote", "palette", "bodyShape", "outfits", "pictureFitInsights"],
};

const PICTURE_FIT_SYSTEM_INSTRUCTION = `You are a senior South Asian & global fashion patternmaker and stylist.
The user uploads 1 to 3 pictures of outfits, fabrics, or silhouettes (and optionally specifies Male, Female, or Both, plus their usual size and height).
For EACH uploaded picture:
1) Identify the garment/outfit accurately using real South Asian and global names (kurta, shalwar kameez, sherwani, prince coat, waistcoat, saree, lehnga, gharara, peshwas, blazer, etc.).
2) Classify which wardrobe section it belongs to ("Female", "Male", or "Both / Unisex").
3) Describe its silhouette cut and extract 3 to 4 dominant hex colours from the garment picture.
4) Suggest who it fits best and provide practical, tailored fit suggestions (drape, sleeve cut, hem length, waist structure, fabric behaviour) and 2–3 seller size-chart checks before buying.

Never guess weight or height from any person in a photo; rely only on user-provided numbers and use respectful, constructive, neutral phrasing.`;

const PICTURE_FIT_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    summary: {
      type: Type.STRING,
      description: "Concise overall styling takeaway across the uploaded pictures.",
    },
    fits: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          pictureNumber: { type: Type.INTEGER },
          garmentName: { type: Type.STRING },
          wardrobeSection: { type: Type.STRING },
          silhouetteCut: { type: Type.STRING },
          colourPalette: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                hex: { type: Type.STRING },
              },
              required: ["name", "hex"],
            },
          },
          recommendedFor: { type: Type.STRING },
          sizingAdvice: { type: Type.STRING },
          fitSuggestions: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          checkBeforeBuying: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
        required: [
          "pictureNumber",
          "garmentName",
          "wardrobeSection",
          "silhouetteCut",
          "colourPalette",
          "recommendedFor",
          "sizingAdvice",
          "fitSuggestions",
          "checkBeforeBuying",
        ],
      },
    },
  },
  required: ["summary", "fits"],
};

interface ReferenceImagePayload {
  base64: string;
  mimeType: string;
}

interface ConsultationRequestBody {
  imageBase64?: string;
  mimeType?: string;
  referenceImages?: ReferenceImagePayload[];
  details?: StylistFormInput;
}

interface PictureFitRequestBody {
  pictures?: ReferenceImagePayload[];
  wardrobeTrack?: WardrobeTrack;
  height?: string;
  usualSize?: string;
  occasion?: string;
}

function normalizeHex(hex: string): string {
  const cleaned = hex.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(cleaned)) {
    return cleaned.toUpperCase();
  }
  if (/^[0-9a-fA-F]{6}$/.test(cleaned)) {
    return `#${cleaned.toUpperCase()}`;
  }
  return "#6B1D2F";
}

function safeMimeType(mime: string | undefined): string {
  const allowed = ["image/jpeg", "image/png", "image/webp"];
  return mime && allowed.includes(mime) ? mime : "image/jpeg";
}

function stripDataUrlPrefix(b64: string): string {
  return b64.includes(",") ? b64.split(",")[1] : b64;
}

function normalizeReport(raw: StylingReport, track: WardrobeTrack): StylingReport {
  return {
    wardrobeTrack: track,
    undertone: raw.undertone || "Neutral",
    undertoneNote: raw.undertoneNote || "",
    palette: (Array.isArray(raw.palette) ? raw.palette : []).slice(0, 5).map((item) => ({
      name: item.name || "Shade",
      hex: normalizeHex(item.hex || "#6B1D2F"),
    })),
    bodyShape: raw.bodyShape || "",
    outfits: (Array.isArray(raw.outfits) ? raw.outfits : []).slice(0, 3).map((outfit) => {
      const conf = (outfit.fitConfidence || "Medium").trim();
      const normalizedConf =
        conf.toLowerCase() === "high"
          ? "High"
          : conf.toLowerCase() === "low"
            ? "Low"
            : "Medium";

      return {
        name: outfit.name || "Curated Ensemble",
        forWhom: outfit.forWhom || track,
        description: outfit.description || "",
        pieces: Array.isArray(outfit.pieces) ? outfit.pieces : [],
        colours: Array.isArray(outfit.colours) ? outfit.colours : [],
        overlayHexes: Array.isArray(outfit.overlayHexes)
          ? outfit.overlayHexes.slice(0, 3).map((h) => normalizeHex(h))
          : [],
        necklineCut: outfit.necklineCut || "",
        drapeFocus: outfit.drapeFocus || "",
        size: outfit.size || "",
        fitConfidence: normalizedConf,
        fitReason: outfit.fitReason || "",
        priceEstimatePKR: outfit.priceEstimatePKR || "",
        whyItSuits: outfit.whyItSuits || "",
        checkBeforeBuying: Array.isArray(outfit.checkBeforeBuying)
          ? outfit.checkBeforeBuying.slice(0, 3)
          : [],
      };
    }),
    pictureFitInsights: Array.isArray(raw.pictureFitInsights)
      ? raw.pictureFitInsights
      : [],
  };
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "25mb" }));

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.post("/api/style-consultation", async (req, res) => {
    try {
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({
          error:
            "Gemini API key is not configured on the server. Please add GEMINI_API_KEY in Settings > Secrets.",
        });
      }

      const body = req.body as ConsultationRequestBody;
      const { imageBase64, mimeType, referenceImages, details } = body;

      if (!imageBase64 || !mimeType) {
        return res.status(400).json({
          error: "Please upload a clear client photo before requesting a styling report.",
        });
      }

      if (
        !details ||
        !details.height?.trim() ||
        !details.usualSize?.trim() ||
        !details.budget?.trim() ||
        !details.occasion?.trim() ||
        !details.style?.trim()
      ) {
        return res.status(400).json({
          error: "Please complete height, usual size, budget, occasion, and style preferences.",
        });
      }

      const track: WardrobeTrack =
        details.wardrobeTrack === "Male" || details.wardrobeTrack === "Both"
          ? details.wardrobeTrack
          : "Female";

      const parts: Array<{ inlineData: { mimeType: string; data: string } } | { text: string }> = [
        {
          inlineData: {
            mimeType: safeMimeType(mimeType),
            data: stripDataUrlPrefix(imageBase64),
          },
        },
      ];

      const validRefs = Array.isArray(referenceImages) ? referenceImages.slice(0, 3) : [];
      validRefs.forEach((ref) => {
        if (ref?.base64) {
          parts.push({
            inlineData: {
              mimeType: safeMimeType(ref.mimeType),
              data: stripDataUrlPrefix(ref.base64),
            },
          });
        }
      });

      const userPrompt = [
        `Wardrobe Section Selected: ${track}`,
        "Client Details (use only these numbers; never guess height or weight from any photo):",
        `- Primary Height: ${details.height.trim()}`,
        `- Primary Usual Size: ${details.usualSize.trim()}`,
        track === "Both" && details.partnerHeight?.trim()
          ? `- Partner / Second Person Height: ${details.partnerHeight.trim()}`
          : "",
        track === "Both" && details.partnerUsualSize?.trim()
          ? `- Partner / Second Person Usual Size: ${details.partnerUsualSize.trim()}`
          : "",
        `- Budget: ${details.budget.trim()}`,
        `- Occasion: ${details.occasion.trim()}`,
        `- Preferred Style: ${details.style.trim()}`,
        details.notes?.trim() ? `- Additional Notes: ${details.notes.trim()}` : "",
        validRefs.length > 0
          ? `- Reference Outfit/Fit Pictures Attached: ${validRefs.length} picture(s) following the client photo. Evaluate each picture in pictureFitInsights.`
          : "- Reference Outfit/Fit Pictures Attached: 0.",
        "",
        track === "Both"
          ? "Return 3 outfits where Outfit 1 is tailored for Female, Outfit 2 is tailored for Male, and Outfit 3 is a coordinated outfit set for Both together."
          : `Return 3 outfits strictly tailored for the ${track} wardrobe section.`,
      ]
        .filter(Boolean)
        .join("\n");

      parts.push({ text: userPrompt });

      const response = await ai.models.generateContent({
        model: "gemini-4-hydrogen",
        contents: { parts },
        config: {
          systemInstruction: STYLIST_SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          responseSchema: RESPONSE_SCHEMA,
        },
      });

      const rawText = (response.text ?? "").trim();
      if (!rawText) {
        return res.status(502).json({
          error: "The stylist model returned an empty response. Please try again.",
        });
      }

      let parsed: StylingReport;
      try {
        parsed = JSON.parse(rawText) as StylingReport;
      } catch {
        return res.status(502).json({
          error: "Received an invalid response format from the styling engine. Please try again.",
        });
      }

      return res.json(normalizeReport(parsed, track));
    } catch (error) {
      const err = error as { status?: number; message?: string };
      console.error("Styling consultation error:", err?.message || error);

      if (err?.status === 403 || err?.status === 400) {
        return res.status(err.status).json({
          error:
            err.message ||
            "API authorization or request error. Please verify your API key in Settings > Secrets.",
        });
      }
      if (err?.status === 429) {
        return res.status(429).json({
          error: "Rate limit reached on the styling service. Please wait a moment and try again.",
        });
      }

      return res.status(500).json({
        error: err?.message || "Unable to complete styling analysis right now. Please try again.",
      });
    }
  });

  app.post("/api/suggest-fits-from-pictures", async (req, res) => {
    try {
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({
          error:
            "Gemini API key is not configured on the server. Please add GEMINI_API_KEY in Settings > Secrets.",
        });
      }

      const body = req.body as PictureFitRequestBody;
      const pictures = Array.isArray(body.pictures) ? body.pictures.slice(0, 3) : [];

      if (pictures.length === 0) {
        return res.status(400).json({
          error: "Please upload at least 1 outfit or garment picture to receive fit suggestions.",
        });
      }

      const parts: Array<{ inlineData: { mimeType: string; data: string } } | { text: string }> =
        pictures.map((pic) => ({
          inlineData: {
            mimeType: safeMimeType(pic.mimeType),
            data: stripDataUrlPrefix(pic.base64),
          },
        }));

      const contextLines = [
        `Analyze the ${pictures.length} attached outfit/garment picture(s) and suggest tailored fits for each.`,
        body.wardrobeTrack ? `- Preferred Wardrobe Track: ${body.wardrobeTrack}` : "",
        body.height?.trim() ? `- Client Height: ${body.height.trim()}` : "",
        body.usualSize?.trim() ? `- Client Usual Size: ${body.usualSize.trim()}` : "",
        body.occasion?.trim() ? `- Occasion: ${body.occasion.trim()}` : "",
      ]
        .filter(Boolean)
        .join("\n");

      parts.push({ text: contextLines });

      const response = await ai.models.generateContent({
        model: "gemini-4-hydrogen",
        contents: { parts },
        config: {
          systemInstruction: PICTURE_FIT_SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          responseSchema: PICTURE_FIT_SCHEMA,
        },
      });

      const rawText = (response.text ?? "").trim();
      if (!rawText) {
        return res.status(502).json({
          error: "The stylist model returned an empty response. Please try again.",
        });
      }

      const parsed = JSON.parse(rawText) as PictureFitResponse;
      const normalized: PictureFitResponse = {
        summary: parsed.summary || "",
        fits: (Array.isArray(parsed.fits) ? parsed.fits : []).map((fit, idx) => ({
          pictureNumber: fit.pictureNumber || idx + 1,
          garmentName: fit.garmentName || `Look ${idx + 1}`,
          wardrobeSection: fit.wardrobeSection || body.wardrobeTrack || "Both",
          silhouetteCut: fit.silhouetteCut || "",
          colourPalette: (Array.isArray(fit.colourPalette) ? fit.colourPalette : [])
            .slice(0, 4)
            .map((c) => ({
              name: c.name || "Shade",
              hex: normalizeHex(c.hex || "#6B1D2F"),
            })),
          recommendedFor: fit.recommendedFor || "",
          sizingAdvice: fit.sizingAdvice || "",
          fitSuggestions: Array.isArray(fit.fitSuggestions) ? fit.fitSuggestions : [],
          checkBeforeBuying: Array.isArray(fit.checkBeforeBuying)
            ? fit.checkBeforeBuying.slice(0, 3)
            : [],
        })),
      };

      return res.json(normalized);
    } catch (error) {
      const err = error as { status?: number; message?: string };
      console.error("Picture fit suggestion error:", err?.message || error);
      return res.status(err?.status && err.status >= 400 ? err.status : 500).json({
        error: err?.message || "Unable to analyze pictures right now. Please try again.",
      });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, "dist");
    if (fs.existsSync(distDir)) {
      app.use(express.static(distDir));
      app.get("*", (_req, res) => {
        res.sendFile(path.join(distDir, "index.html"));
      });
    }
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Khaas Atelier server listening on http://localhost:${PORT}`);
  });
}

startServer();
