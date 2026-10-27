import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { SECTORS, SectorType } from "@/config/sectors";

// Zod schema for input validation
const HazardRequestSchema = z.object({
  descriptionRaw: z.string().min(3).max(2000),
  sector: z.enum(["construction", "hospital", "college", "factory"] as const),
  language: z.enum(["en", "hi", "te", "ta"] as const).optional(),
});

// Simple in-memory rate limiting (15 requests per minute per IP)
const rateLimitMap = new Map<string, { count: number; expiresAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.expiresAt) {
    rateLimitMap.set(ip, { count: 1, expiresAt: now + 60 * 1000 });
    return true;
  }

  if (entry.count >= 15) {
    return false;
  }

  entry.count++;
  return true;
}

// Sanitization helper
function sanitizeText(input: string): string {
  return input
    .replace(/<[^>]*>/g, "") // strip HTML tags
    .replace(/[^\w\s\u0900-\u097F\u0C00-\u0C7F\u0B80-\u0BFF.,!?-]/g, " ") // retain Indic scripts & basic punctuation
    .trim();
}

// Rule-based classification fallback
function classifyByKeywords(rawText: string, sector: SectorType) {
  const lower = rawText.toLowerCase();
  const sectorConfig = SECTORS[sector] || SECTORS.construction;
  const categories = sectorConfig.hazardCategories;

  let matchedCategory = categories[0]?.id || "general_hazard";
  let suggestedSeverity: "low" | "medium" | "high" | "critical" = "medium";
  let translatedEn = rawText;

  // Keyword rules across languages (EN, Hindi, Telugu, Tamil)
  if (
    lower.includes("fall") ||
    lower.includes("height") ||
    lower.includes("scaffold") ||
    rawText.includes("पరంజా") ||
    rawText.includes("పడిపో") ||
    rawText.includes("गिरने") ||
    rawText.includes("விழு") ||
    rawText.includes("சாரக்கட்டு")
  ) {
    matchedCategory = "scaffolding_fall";
    suggestedSeverity = "critical";
    translatedEn = `Scaffolding stability or height fall hazard reported: "${rawText}"`;
  } else if (
    lower.includes("electric") ||
    lower.includes("wire") ||
    lower.includes("current") ||
    lower.includes("shock") ||
    rawText.includes("కరెంట్") ||
    rawText.includes("విధ్యుత్") ||
    rawText.includes("करंट") ||
    rawText.includes("बिजली") ||
    rawText.includes("மின்சாரம்") ||
    rawText.includes("மின்னழுத்தம்")
  ) {
    matchedCategory = sector === "college" ? "high_voltage_lab" : "electrical_wire";
    suggestedSeverity = "high";
    translatedEn = `Electrical hazard / exposed cable reported: "${rawText}"`;
  } else if (
    lower.includes("needle") ||
    lower.includes("syringe") ||
    lower.includes("sharp") ||
    rawText.includes("సూది") ||
    rawText.includes("సుయి") ||
    rawText.includes("सुई") ||
    rawText.includes("ஊசி")
  ) {
    matchedCategory = "needle_stick";
    suggestedSeverity = "critical";
    translatedEn = `Uncapped syringe needle / sharps disposal hazard: "${rawText}"`;
  } else if (
    lower.includes("blood") ||
    lower.includes("biohazard") ||
    lower.includes("spill") ||
    rawText.includes("రక్తం") ||
    rawText.includes("रक्त") ||
    rawText.includes("खून") ||
    rawText.includes("இரத்தம்")
  ) {
    matchedCategory = "biohazard_spill";
    suggestedSeverity = "high";
    translatedEn = `Biohazard / fluid spill reported on ward floor: "${rawText}"`;
  } else if (
    lower.includes("chemical") ||
    lower.includes("acid") ||
    lower.includes("gas") ||
    lower.includes("smell") ||
    lower.includes("fume") ||
    rawText.includes("గ్యాస్") ||
    rawText.includes("వాసన") ||
    rawText.includes("गैस") ||
    rawText.includes("बदबू") ||
    rawText.includes("வாயு") ||
    rawText.includes("கசிவு")
  ) {
    matchedCategory = sector === "college" ? "lab_chemical" : sector === "hospital" ? "chemical_sanitizer" : "machine_guard";
    suggestedSeverity = "critical";
    translatedEn = `Chemical vapor / toxic gas leak reported: "${rawText}"`;
  } else if (
    lower.includes("water") ||
    lower.includes("heat") ||
    lower.includes("sun") ||
    rawText.includes("నీళ్లు") ||
    rawText.includes("ఎండ") ||
    rawText.includes("पानी") ||
    rawText.includes("धूप") ||
    rawText.includes("தண்ணீர்")
  ) {
    matchedCategory = sector === "construction" ? "heat_exhaustion" : "water_tank";
    suggestedSeverity = "medium";
    translatedEn = `Drinking water shortage or heat exposure reported: "${rawText}"`;
  } else if (
    lower.includes("helmet") ||
    lower.includes("shoe") ||
    lower.includes("boot") ||
    lower.includes("mask") ||
    lower.includes("glove") ||
    lower.includes("ppe") ||
    rawText.includes("హెల్మెట్") ||
    rawText.includes("ग्लव्स") ||
    rawText.includes("முகக்கவசம்")
  ) {
    matchedCategory = sector === "hospital" ? "ppe_shortage" : "ppe_deficiency";
    suggestedSeverity = "medium";
    translatedEn = `Missing or damaged Personal Protective Equipment (PPE): "${rawText}"`;
  }

  // Ensure category matches sector available categories
  const validCategory = categories.find((c) => c.id === matchedCategory);
  if (validCategory) {
    suggestedSeverity = validCategory.suggestedSeverity;
  } else {
    matchedCategory = categories[0].id;
  }

  return {
    category: matchedCategory,
    severity: suggestedSeverity,
    descriptionEn: translatedEn,
    source: "rules",
  };
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again in a minute." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = HazardRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request payload", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const sanitized = sanitizeText(parsed.data.descriptionRaw);
    const sector = parsed.data.sector;
    const apiKey = process.env.GEMINI_API_KEY;

    // Optional Gemini classification
    if (apiKey) {
      try {
        const sectorConfig = SECTORS[sector];
        const categoryOptions = sectorConfig.hazardCategories
          .map((c) => `"${c.id}" (${c.label})`)
          .join(", ");

        const prompt = `You are a workplace health and safety triage AI for UN SDG 8.
Sector: "${sectorConfig.title}".
Available hazard categories: [${categoryOptions}].
Worker reported the following hazard (which may be in English, Hindi, Telugu, or Tamil):
"${sanitized}"

Return a valid JSON object with:
1. "category": must be one of [${sectorConfig.hazardCategories.map((c) => `"${c.id}"`).join(", ")}]
2. "severity": one of ["low", "medium", "high", "critical"]
3. "descriptionEn": A clear, professional 1-2 sentence English translation and description of the hazard for the supervisor.

Return ONLY the raw JSON object, no markdown, no backticks.`;

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.2,
                responseMimeType: "application/json",
              },
            }),
          }
        );

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const textResponse =
            geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (textResponse) {
            const parsedJson = JSON.parse(textResponse);
            return NextResponse.json({
              category: parsedJson.category || sectorConfig.hazardCategories[0].id,
              severity: parsedJson.severity || "medium",
              descriptionEn: parsedJson.descriptionEn || sanitized,
              source: "gemini",
            });
          }
        }
      } catch (geminiError) {
        console.warn("Gemini API call failed, falling back to rule engine:", geminiError);
      }
    }

    // Keyword rule-based fallback
    const ruleResult = classifyByKeywords(sanitized, sector);
    return NextResponse.json(ruleResult);
  } catch (err: unknown) {
    console.error("Error in classify-hazard API:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
