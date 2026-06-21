import "dotenv/config";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { CATEGORIES, normalizeCategory } from "./src/categories";

type AuthenticatedRequest = express.Request & { userId?: string };

const MAX_UPLOAD_BYTES = Number(process.env.MAX_UPLOAD_BYTES ?? 15 * 1024 * 1024);
const RATE_LIMIT_MAX = Number(process.env.RATE_LIMIT_MAX ?? 10);
const RATE_LIMIT_WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS ?? 10 * 60 * 1000);
const requestBuckets = new Map<string, { count: number; resetAt: number }>();

function allowedOrigins() {
  return new Set(
    [process.env.APP_URL, ...(process.env.ALLOWED_ORIGINS ?? "").split(",")]
      .map((origin) => origin?.trim())
      .filter(Boolean)
  );
}

function isWithinRateLimit(ip: string) {
  const now = Date.now();
  const current = requestBuckets.get(ip);
  if (!current || current.resetAt <= now) {
    requestBuckets.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (current.count >= RATE_LIMIT_MAX) return false;
  current.count += 1;
  return true;
}

async function authenticateOptional(req: AuthenticatedRequest) {
  const token = req.header("authorization")?.replace(/^Bearer\s+/i, "");
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
  if (!token || !supabaseUrl || !supabaseAnonKey) return;

  const response = await fetch(`${supabaseUrl.replace(/\/$/, "")}/auth/v1/user`, {
    headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(5000),
  });
  if (!response.ok) return;
  const user = (await response.json()) as { id?: string };
  req.userId = user.id;
}

function base64Size(data: unknown) {
  if (typeof data !== "string") return 0;
  return Math.floor((data.length * 3) / 4);
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Models tried in order, best capability first. All of these have a Gemini API
// free tier, so the automatic fallback works without billing enabled. The model
// configured via GEMINI_MODEL (if any) is always tried first.
const DEFAULT_MODEL_CHAIN = [
  "gemini-3.5-flash",
  "gemini-3-flash-preview",
  "gemini-3.1-flash-lite",
];

const MODEL_CHAIN: string[] = (() => {
  const envChain = (process.env.GEMINI_MODEL ?? "")
    .split(",")
    .map((m) => m.trim())
    .filter(Boolean);
  return [...new Set([...envChain, ...DEFAULT_MODEL_CHAIN])];
})();

const MODEL = MODEL_CHAIN[0];

const ALLOWED_MODELS = new Set(DEFAULT_MODEL_CHAIN);

function resolveModelChain(preferred?: string): string[] {
  if (!preferred || preferred === "auto") return MODEL_CHAIN;
  if (preferred === "gemini-3.1-flash-lite") return ["gemini-3.1-flash-lite"];
  if (preferred === "gemini-3-flash-preview") {
    return ["gemini-3-flash-preview", "gemini-3.1-flash-lite"];
  }
  if (preferred === "gemini-3.5-flash") return MODEL_CHAIN;
  if (ALLOWED_MODELS.has(preferred)) return [preferred];
  return MODEL_CHAIN;
}

// Generate content, automatically falling back to the next model in the chain
// when the current one is out of quota (429) or temporarily overloaded (503).
async function generateWithFallback(
  params: Omit<Parameters<typeof ai.models.generateContent>[0], "model">,
  chain: string[] = MODEL_CHAIN
): Promise<{ response: Awaited<ReturnType<typeof ai.models.generateContent>>; model: string }> {
  let lastErr: any;

  for (const model of chain) {
    try {
      const response = await ai.models.generateContent({ model, ...params });
      return { response, model };
    } catch (err: any) {
      lastErr = err;
      const { statusCode } = describeGeminiError(err);
      if (statusCode === 429 || statusCode === 503) {
        console.warn(
          `Modelo "${model}" no disponible (estado ${statusCode}). Probando el siguiente modelo...`
        );
        continue;
      }
      throw err;
    }
  }

  throw lastErr;
}

const schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    category: {
      type: Type.STRING,
      description: `Categoría del contenido. DEBE ser EXACTAMENTE una de: ${CATEGORIES.join(", ")}. Si ninguna encaja, usa "Otros".`,
    },
    coreIdea: { type: Type.STRING, description: "La idea principal o el 'Núcleo' absoluto del contenido. (DEBE ser corta y concisa, alrededor de 10 a 15 palabras, 1 sola frase impactante)" },
    coreSupport: { type: Type.STRING },
    tldr: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          desc: { type: Type.STRING }
        },
        required: ["title", "desc"]
      }
    },
    steps: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          shortNav: { type: Type.STRING },
          title: { type: Type.STRING },
          time: { type: Type.STRING, description: "Tiempo ESTIMADO de lectura de este paso. Formato OBLIGATORIO exacto: '~N min' (ejemplo: '~3 min'). NUNCA uses un horario tipo reloj." },
          content: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING, description: "Opciones: 'prose', 'callout', 'list'" },
                text: { type: Type.STRING, description: "CONTENIDO ESCRITO DEL BLOQUE. ESTO ES ESTRICTAMENTE OBLIGATORIO. NO LO DEJES VACÍO." },
                kind: { type: Type.STRING, description: "Opciones: 'action', 'info', 'alert'" },
                items: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      strong: { type: Type.STRING },
                      span: { type: Type.STRING }
                    },
                    required: ["strong"]
                  }
                }
              },
              required: ["type", "text"]
            }
          }
        },
        required: ["id", "shortNav", "title", "time", "content"]
      }
    }
  },
  required: ["title", "category", "coreIdea", "coreSupport", "tldr", "steps"]
};

const SYSTEM_PROMPT = `Eres un "Optimizador TDAH". Tu objetivo es extraer, destilar y estructurar el conocimiento de CUALQUIER texto, nota caótica o transcripción cruda de YouTube.

REGLAS DE ORO ESTRICTAS:
1. ACEPTA EL CAOS: Vas a recibir textos sin puntuación, inconexos o mal formateados. Tu trabajo es encontrar el valor y darle sentido.
2. PROHIBIDO RENDIRSE: NUNCA devuelvas un JSON con mensajes de "Fallo en procesamiento". Siempre extrae el núcleo, haciendo tu mejor esfuerzo.
3. NO INVENTES: Basa tus deducciones exclusivamente en el texto proporcionado.
4. TEXTO OBLIGATORIO: El campo "text" dentro de los bloques de "content" NUNCA puede estar vacío. Debes rellenarlo siempre con información detallada.

REGLAS DE CONSISTENCIA (MUY IMPORTANTES):
5. NÚMERO DE PASOS ADAPTATIVO: El número de pasos DEBE escalar con la extensión y complejidad del contenido. NO hay límite máximo: un texto corto puede necesitar 3-5 pasos, un artículo largo 6-12, y un libro o documento muy extenso puede requerir 15, 25 o más. La regla es: un paso por cada idea o sección principal con entidad propia. No fragmentes en exceso (no crees un paso por cada frase) ni comprimas de más (no metas temas independientes en un mismo paso). Cubre TODO el contenido relevante, sin dejar fuera secciones importantes por querer acortar.
6. CAMPO "time" OBLIGATORIO: CADA paso DEBE incluir "time" con el formato exacto "~N min" (por ejemplo "~3 min"), estimando el tiempo de lectura del paso. NUNCA uses horarios tipo reloj (nada de "08:00 - 09:00").
7. DETERMINISMO: Sé consistente. Ante el mismo texto, produce la misma cantidad de pasos y la misma estructura.
8. CATEGORÍA OBLIGATORIA: Asigna SIEMPRE el campo "category" eligiendo EXACTAMENTE una de esta lista: ${CATEGORIES.join(", ")}. Si ninguna encaja con el contenido, usa "Otros".

ESTRUCTURA DE TU RESPUESTA:
Debes responder ÚNICAMENTE con un objeto JSON válido que cumpla esta estructura exacta.`;

function htmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchUrlContent(url: string): Promise<string> {
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      throw new Error("Solo se permiten URLs http o https.");
    }
  } catch {
    throw new Error("URL inválida. Ingresa un enlace completo (https://...).");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(parsedUrl.toString(), {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; TDAH-Optimizer/1.0)",
        Accept: "text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.8",
      },
    });

    if (!response.ok) {
      throw new Error(
        `No se pudo acceder al enlace (${response.status}). Verifica que la URL sea pública.`
      );
    }

    const contentType = response.headers.get("content-type") || "";
    const body = await response.text();

    if (contentType.includes("text/html") || body.trim().startsWith("<")) {
      const text = htmlToText(body);
      if (text.length < 50) {
        throw new Error("La página no contiene suficiente texto legible para procesar.");
      }
      return text;
    }

    const plain = body.trim();
    if (plain.length < 50) {
      throw new Error("El enlace no contiene suficiente texto para procesar.");
    }
    return plain;
  } catch (err: any) {
    if (err.name === "AbortError") {
      throw new Error("La descarga del enlace tardó demasiado. Inténtalo de nuevo.");
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

function describeGeminiError(err: any): { statusCode: number; errorMessage: string } {
  let parsed: any = null;
  if (typeof err?.message === "string") {
    try {
      parsed = JSON.parse(err.message)?.error;
    } catch {
      // message is not JSON; ignore
    }
  }

  const rawMessage: string = parsed?.message || err?.message || "";
  const geminiStatus: string | undefined = parsed?.status;
  const code = err?.status ?? parsed?.code ?? 500;
  let statusCode = typeof code === "number" ? code : 500;

  const isQuota =
    statusCode === 429 ||
    geminiStatus === "RESOURCE_EXHAUSTED" ||
    /quota exceeded|RESOURCE_EXHAUSTED/i.test(rawMessage);

  if (isQuota) {
    const violations: any[] =
      parsed?.details?.find((d: any) => String(d?.["@type"]).includes("QuotaFailure"))
        ?.violations ?? [];
    const isDaily = violations.some((v) => /PerDay/i.test(v?.quotaId || ""));
    const limit = violations[0]?.quotaValue;
    const retryMatch = /retry in ([\d.]+)s/i.exec(rawMessage);
    const retrySeconds = retryMatch ? Math.ceil(parseFloat(retryMatch[1])) : null;

    let errorMessage: string;
    if (isDaily) {
      errorMessage = `Se ha agotado el límite DIARIO del plan gratuito de Gemini en todos los modelos disponibles (${MODEL_CHAIN.join(
        ", "
      )}). El cupo se reinicia cada día (medianoche hora del Pacífico); para más cuota, activa la facturación en Google AI Studio.`;
    } else {
      errorMessage = `Se ha excedido el límite de peticiones por minuto de Gemini en todos los modelos disponibles (Error 429).${
        retrySeconds ? ` Inténtalo de nuevo en ~${retrySeconds}s.` : " Inténtalo en un momento."
      }`;
    }
    return { statusCode: 429, errorMessage };
  }

  if (statusCode === 503 || geminiStatus === "UNAVAILABLE") {
    return {
      statusCode: 503,
      errorMessage:
        "El modelo de Gemini está saturado temporalmente (Error 503). Espera unos segundos e inténtalo de nuevo.",
    };
  }

  return {
    statusCode,
    errorMessage: rawMessage || "Failed to process content",
  };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));

  app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    const origin = req.header("origin");
    const origins = allowedOrigins();
    if (origin && origins.has(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Vary", "Origin");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
      res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    }
    if (req.method === "OPTIONS") return res.sendStatus(204);
    next();
  });

  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });

  app.post("/api/transform", async (req: AuthenticatedRequest, res) => {
    try {
      const ip = req.ip || req.socket.remoteAddress || "unknown";
      if (!isWithinRateLimit(ip)) {
        return res.status(429).json({ error: "Demasiadas solicitudes. Inténtalo de nuevo en unos minutos." });
      }
      await authenticateOptional(req);
      const { text, type, fileData, mimeType, preferredModel } = req.body;

      if (base64Size(fileData) > MAX_UPLOAD_BYTES) {
        return res.status(413).json({ error: "El archivo supera el tamaño permitido." });
      }

      if (type === "pdf" || type === "image") {
        if (!fileData || !mimeType) {
          return res
            .status(400)
            .json({ error: type === "image" ? "No image provided" : "No PDF provided" });
        }
      } else if (!text) {
        return res.status(400).json({ error: "No text provided" });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "API key is missing on the server." });
      }

      let contents: string | Array<{ inlineData?: { data: string; mimeType: string }; text?: string }>;

      if (type === "pdf") {
        contents = [
          { inlineData: { data: fileData, mimeType } },
          {
            text: "Extrae el conocimiento de este documento PDF y aplica el framework paso a paso.",
          },
        ];
      } else if (type === "image") {
        const userPrompt = typeof text === "string" && text.trim() ? `${text.trim()}\n\n` : "";
        contents = [
          { inlineData: { data: fileData, mimeType } },
          {
            text: `${userPrompt}Extrae el conocimiento de esta imagen (incluye TODO el texto visible y el contexto relevante) y aplica el framework paso a paso.`,
          },
        ];
      } else {
        let contentText = text as string;
        if (type === "link") {
          contentText = await fetchUrlContent(text);
        }
        contents = `Extrae el conocimiento de este texto y aplica el framework paso a paso:\n\n${contentText}`;
      }

      const modelChain = resolveModelChain(
        typeof preferredModel === "string" ? preferredModel : undefined
      );

      const { response, model: usedModel } = await generateWithFallback(
        {
          contents,
          config: {
            systemInstruction: SYSTEM_PROMPT,
            responseMimeType: "application/json",
            responseSchema: schema as any,
            temperature: 0.3,
            topP: 0.9,
          },
        },
        modelChain
      );

      res.setHeader("X-Gemini-Model-Used", usedModel);
      console.log(`Mapa generado con el modelo "${usedModel}".`);

      let jsonText = response.text || "{}";

      const backtickMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (backtickMatch) {
        jsonText = backtickMatch[1];
      }

      const parsedData = JSON.parse(jsonText);
      parsedData.category = normalizeCategory(parsedData.category);
      parsedData.modelUsed = usedModel;
      res.json(parsedData);
    } catch (err: any) {
      console.error(err);

      const { statusCode, errorMessage } = describeGeminiError(err);
      res.status(statusCode).json({ error: errorMessage });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true, allowedHosts: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
