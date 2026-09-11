import express, { Request, Response } from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

// Generous body limit for image payloads (base64)
app.use(express.json({ limit: "15mb" }));

// Lazy getter for GoogleGenAI client with required header
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured in the environment.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health check
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", service: "Goose Lawyer Jurisprudence Engine" });
});

// Case Analysis Endpoint (Vision Multimodal + JSON mode)
app.post("/api/analyze-case", async (req: Request, res: Response): Promise<void> => {
  try {
    const { image, isAppeal, previousCase } = req.body;

    if (!image || !image.data) {
      res.status(400).json({
        error: "OBJECTION! No photographic exhibit was submitted to the bailiff.",
      });
      return;
    }

    const ai = getGenAI();

    // Clean base64 string
    let base64Data = String(image.data || "");
    let mimeType = image.mimeType || "image/jpeg";

    if (base64Data.includes(",")) {
      const parts = base64Data.split(",");
      base64Data = parts[1];
      const match = parts[0].match(/:(.*?);/);
      if (match && match[1]) {
        mimeType = match[1];
      }
    }
    // Remove whitespace/newlines from base64
    base64Data = base64Data.replace(/\s/g, "");

    const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      mimeType = "image/jpeg";
    }

    const systemInstruction = isAppeal
      ? `You are the Appellate Division of the Supreme Court of Avian Jurisprudence (Goose Court). 
The defendant is appealing their previous ruling:
- Prior Verdict: "${previousCase?.verdict || "Guilty"}"
- Prior Charge: "${previousCase?.charge || "Suspicious Conduct"}"
- Prior Suspicion: "${previousCase?.suspicion_percent || 75}%"

Re-examine this photographic exhibit of their face and deliver a wildly contradictory, comedic appellate ruling!
If they were previously guilty, overturn the conviction on an absurd technicality or cite an obscure avian statute (e.g. "Breadcrumb Habeas Corpus").
If they were previously acquitted or cleared, discover new, damning micro-expressions (e.g. "subconscious eyebrow twitching indicating premeditated bread-theft") and convict them!
Keep the tone funny, dry, mock-official, satirical, and thoroughly avian.
Always output valid JSON strictly conforming to the requested schema.`
      : `You are the Chief Magistrate of the Supreme Court of Avian Jurisprudence (the Goose Lawyer).
Analyze the submitted photographic exhibit showing the human subject's face.
Carefully examine their real facial expression, micro-expressions, posture, eye direction, smile or smirk, and general mood.
Formulate a satirical, fictional legal report:
1. "vibe": 2-5 descriptive words capturing the subject's exact facial expression and demeanor (e.g. "serious, mysterious, slightly smug", or "bright, unbothered, suspiciously cheerful").
2. "charge": A formal-sounding, hilarious fictional legal charge based directly on that vibe (e.g. "Aggravated Smugness in the First Degree", "Unlawful Concealment of a Chuckle", "Failure to Yield to Avian Superiority").
3. "evidence": A witty, razor-sharp 1-2 sentence legal observation citing specific visual cues from their face (e.g. "The defense's left eyebrow is raised at an unconstitutional 14-degree angle.", "Subject's mouth indicates suppressed amusement inconsistent with innocence.").
4. "suspicion_percent": Integer between 5 and 99.
5. "verdict": A dramatic, mock-official verdict (e.g. "Guilty of Vibes Only", "Acquitted on a Breadcrumb Technicality", "Held in Contempt of Honk", "Extremely Guilty of Being Interesting").
6. "stamp": A punchy 1-2 word stamp in all-caps (e.g. "GUILTY", "CLEARED", "FLAGGED", "INCONTEMPT", "OVERRULED", "ACQUITTED").
7. "lawyer_name": A distinguished, satirical goose legal counsel name (e.g. "Adv. Sir Reginald Honksworth III, KC", "Adv. Beatrice Quackwell", "Adv. Goose Wellington", "Barrister Archibald Gander, Esq.", "Adv. Marguerite Von Goosen").
8. "court_observations": 1-2 witty sentences of courtroom observations from the goose bailiffs, jury, or clerk.

Strictly fictional, playful, and dry. Do not be mean-spirited.`;

    const schema = {
      type: Type.OBJECT,
      properties: {
        vibe: {
          type: Type.STRING,
          description: "Descriptive words summarizing facial expression and demeanor.",
        },
        charge: {
          type: Type.STRING,
          description: "A satirical, formal fictional legal charge.",
        },
        evidence: {
          type: Type.STRING,
          description: "Witty one-liner citing specific facial cues from the photo.",
        },
        suspicion_percent: {
          type: Type.INTEGER,
          description: "Suspicion percentage from 5 to 99.",
        },
        verdict: {
          type: Type.STRING,
          description: "The court verdict.",
        },
        stamp: {
          type: Type.STRING,
          description: "1-2 word uppercase verdict stamp.",
        },
        lawyer_name: {
          type: Type.STRING,
          description: "Satirical goose lawyer name.",
        },
        court_observations: {
          type: Type.STRING,
          description: "Avian courtroom observation note.",
        },
      },
      required: [
        "vibe",
        "charge",
        "evidence",
        "suspicion_percent",
        "verdict",
        "stamp",
        "lawyer_name",
        "court_observations",
      ],
    };

    const imagePart = {
      inlineData: {
        mimeType: mimeType,
        data: base64Data,
      },
    };

    const textPart = {
      text: isAppeal
        ? "Review this photographic exhibit for the emergency appeal and deliver the contradictory appellate verdict."
        : "Analyze this photographic evidence and deliver the official legal case report.",
    };

    const PRIMARY_MODELS = ["gemini-2.5-flash", "gemini-flash-latest", "gemini-3.8-flash"];
    let rawText = "";
    let lastError: unknown = null;

    for (const modelName of PRIMARY_MODELS) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: { parts: [imagePart, textPart] },
          config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: schema,
            temperature: 0.9,
          },
        });

        if (response.text) {
          rawText = response.text;
          break;
        }
      } catch (modelErr) {
        console.warn(`Avian counsel using ${modelName} encountered difficulty, trying next bench:`, modelErr);
        lastError = modelErr;
      }
    }

    if (!rawText) {
      throw lastError || new Error("All avian jurisprudence models are currently in recess.");
    }

    const parsed = JSON.parse(rawText);

    // Add metadata
    const year = new Date().getFullYear();
    const randNum = Math.floor(1000 + Math.random() * 9000);
    const caseNumber = previousCase && isAppeal
      ? `${previousCase.case_number}-APP`
      : `GL-${year}-${randNum}`;

    const dateFiled = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    res.json({
      case_number: caseNumber,
      date_filed: dateFiled,
      vibe: parsed.vibe || "Enigmatic & Slightly Dubious",
      charge: parsed.charge || "Unlicensed Expression in a Public Forum",
      evidence: parsed.evidence || "The subject maintains an unreadable countenance under judicial scrutiny.",
      suspicion_percent: Number(parsed.suspicion_percent) || 72,
      verdict: parsed.verdict || "Guilty of Reckless Nonchalance",
      stamp: (parsed.stamp || "FLAGGED").toUpperCase(),
      lawyer_name: parsed.lawyer_name || "Adv. Goose Wellington",
      court_observations: parsed.court_observations || "The court recorder noted a suspicious silence in the gallery.",
      appeal_count: (previousCase?.appeal_count || 0) + (isAppeal ? 1 : 0),
    });
  } catch (err: unknown) {
    console.error("Error in /api/analyze-case:", err);
    const errorMsg = err instanceof Error ? err.message : String(err);
    res.status(500).json({
      error: "OBJECTION SUSTAINED: The court could not decipher this evidence into the official docket. Please furnish a clearer photograph.",
      details: errorMsg,
    });
  }
});

// Cross-examination streaming endpoint (SSE / Chunked stream)
app.post("/api/cross-examine", async (req: Request, res: Response): Promise<void> => {
  try {
    const { question, caseReport, chatHistory } = req.body;

    if (!question || !caseReport) {
      res.status(400).json({ error: "A question and active case report are required for cross-examination." });
      return;
    }

    const ai = getGenAI();

    // Prepare streaming response
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Transfer-Encoding", "chunked");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const systemInstruction = `You are ${caseReport.lawyer_name}, Chief Avian Litigator of the Honorable Court of Feathers.
Case Details:
- Case No: ${caseReport.case_number}
- Detected Vibe: ${caseReport.vibe}
- Charge: ${caseReport.charge}
- Court Evidence: "${caseReport.evidence}"
- Suspicion Level: ${caseReport.suspicion_percent}%
- Court Verdict: ${caseReport.verdict}

The defendant (the user) is actively cross-examining you regarding this ruling.
Respond in first person as the Goose Lawyer:
- You are haughty, fiercely confident, legally pedantic, and undeniably a goose.
- You occasionally make dry waterfowl references (the Migratory Bird Treaty Act of 1918, breadcrumbs as retainer fees, hissing at the opposition, plumage inspections, the sacred Bill of Rights).
- If the user argues they look innocent, counter-argue with microscopic absurd observations of their face or demeanor.
- Keep your answers sharp, witty, punchy (2 to 4 sentences max). Do NOT break character.`;

    let conversationPrompt = "";
    if (chatHistory && Array.isArray(chatHistory)) {
      conversationPrompt += "Prior exchanges in this cross-examination:\n";
      for (const msg of chatHistory.slice(-4)) {
        conversationPrompt += `${msg.role === "user" ? "Defendant" : caseReport.lawyer_name}: ${msg.content}\n`;
      }
    }
    conversationPrompt += `Defendant's Cross-Examination Question: "${question}"\n${caseReport.lawyer_name}'s retort:`;

    const STREAM_MODELS = ["gemini-2.5-flash", "gemini-flash-latest", "gemini-3.8-flash"];
    let streamSuccess = false;
    let streamError: unknown = null;

    for (const modelName of STREAM_MODELS) {
      try {
        const stream = await ai.models.generateContentStream({
          model: modelName,
          contents: conversationPrompt,
          config: {
            systemInstruction,
            temperature: 0.9,
          },
        });

        for await (const chunk of stream) {
          if (chunk.text) {
            res.write(chunk.text);
          }
        }
        res.end();
        streamSuccess = true;
        break;
      } catch (err) {
        console.warn(`Stream with ${modelName} failed, attempting next model:`, err);
        streamError = err;
      }
    }

    if (!streamSuccess) {
      throw streamError || new Error("Avian stream unavailable.");
    }
  } catch (err: unknown) {
    console.error("Error in /api/cross-examine:", err);
    if (!res.headersSent) {
      res.status(500).json({
        error: "COUNSEL IS TEMPORARILY PREENING: Unable to answer cross-examination at this moment.",
      });
    } else {
      res.write("\n\n*HONK!* [Counsel flaps wings vigorously and calls for a sudden 5-minute recess.]");
      res.end();
    }
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Goose Lawyer court in session at http://0.0.0.0:${PORT}`);
  });
}

startServer();
