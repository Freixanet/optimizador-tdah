import "dotenv/config";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { fetchTranscript } from "youtube-transcript";
import { extractYouTubeVideoId } from "./youtube";
import type {
  ActionMapData,
  MapChatRequest,
  MapChatResponse,
  MapIntent,
  SourceReference,
  TransformRequest,
} from "./src/contracts";

type AuthenticatedRequest = express.Request & { userId?: string };

const MAX_UPLOAD_BYTES = Number(process.env.MAX_UPLOAD_BYTES ?? 15 * 1024 * 1024);
const RATE_LIMIT_MAX = Number(process.env.RATE_LIMIT_MAX ?? 10);
const RATE_LIMIT_WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS ?? 10 * 60 * 1000);
const requestBuckets = new Map<string, { count: number; resetAt: number }>();

function allowedOrigins() {
  return new Set(
    [
      process.env.APP_URL,
      ...(process.env.ALLOWED_ORIGINS ?? "").split(","),
      "https://optimizador-tdah-production.up.railway.app",
      "https://nucleo-comprension-production.up.railway.app",
      "capacitor://localhost",
      "http://localhost",
      "https://localhost",
    ]
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
const MAP_CACHE_LIMIT = 120;
const mapCache = new Map<string, ActionMapData>();

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

const sourceReferenceSchema = {
  type: Type.OBJECT,
  properties: {
    label: { type: Type.STRING },
    locator: { type: Type.STRING },
    locatorKind: { type: Type.STRING },
    excerpt: { type: Type.STRING },
    note: { type: Type.STRING },
  },
  required: ["label", "locator"],
};

const schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    category: { type: Type.STRING },
    intent: { type: Type.STRING, description: "Opciones: 'understand', 'study', 'apply'" },
    outputLanguage: { type: Type.STRING },
    mapVersion: { type: Type.INTEGER },
    sourceMetadata: {
      type: Type.OBJECT,
      properties: {
        kind: { type: Type.STRING, description: "Opciones: 'text', 'link', 'youtube', 'pdf', 'image', 'video', 'file'" },
        label: { type: Type.STRING },
        title: { type: Type.STRING },
        author: { type: Type.STRING },
        language: { type: Type.STRING },
        detected: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        limitations: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
      },
      required: ["kind", "label", "detected"],
    },
    coverage: {
      type: Type.OBJECT,
      properties: {
        summary: { type: Type.STRING },
        notes: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              label: { type: Type.STRING },
              detail: { type: Type.STRING },
              tone: { type: Type.STRING, description: "Opciones: 'neutral', 'warning'" },
            },
            required: ["label", "detail"],
          },
        },
      },
      required: ["summary", "notes"],
    },
    coreIdea: {
      type: Type.STRING,
      description:
        "La idea central del contenido. Debe ser precisa, adulta y breve, en una sola frase.",
    },
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
    knowledgeSections: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          summary: { type: Type.STRING },
          references: {
            type: Type.ARRAY,
            items: sourceReferenceSchema,
          },
        },
        required: ["title", "summary"],
      },
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
          purpose: { type: Type.STRING },
          content: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING, description: "Opciones: 'prose', 'callout', 'list'" },
                text: { type: Type.STRING, description: "CONTENIDO ESCRITO DEL BLOQUE. ESTO ES ESTRICTAMENTE OBLIGATORIO. NO LO DEJES VACÍO." },
                kind: { type: Type.STRING, description: "Opciones: 'action', 'info', 'alert'" },
                label: {
                  type: Type.STRING,
                  description:
                    "Para bloques callout. Opciones recomendadas: 'Idea clave', 'Matiz', 'Ejemplo', 'Precaución', 'Para aplicarlo'.",
                },
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
                },
                references: {
                  type: Type.ARRAY,
                  items: sourceReferenceSchema,
                },
              },
              required: ["type", "text"]
            }
          },
          references: {
            type: Type.ARRAY,
            items: sourceReferenceSchema,
          },
        },
        required: ["id", "shortNav", "title", "time", "content"]
      }
    },
    references: {
      type: Type.ARRAY,
      items: sourceReferenceSchema,
    },
    completionCard: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        summary: { type: Type.STRING },
        takeaways: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        promptQuestion: { type: Type.STRING },
      },
      required: ["title", "summary", "takeaways"],
    },
  },
  required: [
    "title",
    "intent",
    "sourceMetadata",
    "coverage",
    "coreIdea",
    "coreSupport",
    "tldr",
    "steps",
    "completionCard",
  ]
};

const SYSTEM_PROMPT = `Eres Núcleo, una capa de comprensión fiel, adaptable y adulta.

Transformas cualquier fuente en una lectura clara para uno de estos objetivos:
- understand: comprender con contexto, tesis, argumentos, evidencias y matices.
- study: estudiar con conceptos, relaciones, preguntas de recuperación y repaso.
- apply: aplicar con decisiones, pasos, condiciones, riesgos y siguiente acción.

Reglas obligatorias:
1. No infantilices. Escribe con claridad adulta, no con tono de coach ni celebración exagerada.
2. No inventes. Toda inferencia debe estar apoyada por la fuente proporcionada.
3. No comprimas en exceso. Conserva matices, límites, condiciones y excepciones relevantes.
4. Cada bloque "text" debe contener contenido útil y específico.
5. La cantidad de pasos debe adaptarse al material. No fuerces un resumen corto si la fuente necesita más desarrollo.
6. Usa referencias siempre que puedas. Si la fuente no ofrece una ubicación exacta, usa el mejor localizador honesto disponible.
7. La capa "tldr" orienta; no sustituye la lectura completa.
8. Si falta parte del contenido, señálalo en "coverage" o "sourceMetadata.limitations" con honestidad.
9. Los bloques callout deben usar un label editorial sobrio: 'Idea clave', 'Matiz', 'Ejemplo', 'Precaución' o 'Para aplicarlo'.
10. Devuelve solo JSON válido compatible con el esquema pedido.`;

function intentLabel(intent: MapIntent) {
  if (intent === "study") return "Estudiar";
  if (intent === "apply") return "Aplicar";
  return "Comprender";
}

function cacheMap(mapId: string | undefined, map: ActionMapData) {
  if (!mapId) return;
  mapCache.set(mapId, map);
  if (mapCache.size <= MAP_CACHE_LIMIT) return;
  const oldestKey = mapCache.keys().next().value;
  if (oldestKey) mapCache.delete(oldestKey);
}

function normalizeReferences(input: unknown): SourceReference[] {
  if (!Array.isArray(input)) return [];
  return input
    .map((item) => {
      const ref = item as SourceReference;
      if (!ref?.label || !ref?.locator) return null;
      return {
        label: String(ref.label).trim(),
        locator: String(ref.locator).trim(),
        locatorKind: ref.locatorKind as SourceReference["locatorKind"],
        excerpt: ref.excerpt ? String(ref.excerpt).trim() : undefined,
        note: ref.note ? String(ref.note).trim() : undefined,
      } satisfies SourceReference;
    })
    .filter(Boolean) as SourceReference[];
}

function normalizeMapData(
  parsed: any,
  fallback: { intent: MapIntent; outputLanguage: string; sourceKind: string; sourceLabel: string }
): ActionMapData {
  const normalizedSteps = Array.isArray(parsed?.steps)
    ? parsed.steps.map((step: any, index: number) => ({
        id: String(step?.id || `step-${index + 1}`),
        shortNav: String(step?.shortNav || step?.title || `Paso ${index + 1}`),
        title: String(step?.title || `Paso ${index + 1}`),
        time: String(step?.time || "~3 min"),
        purpose: step?.purpose ? String(step.purpose) : undefined,
        content: Array.isArray(step?.content)
          ? step.content.map((block: any) => ({
              type: String(block?.type || "prose"),
              text: String(block?.text || "").trim(),
              kind: block?.kind ? String(block.kind) : undefined,
              label: block?.label ? String(block.label) : undefined,
              items: Array.isArray(block?.items)
                ? block.items
                    .map((item: any) =>
                      item?.strong
                        ? {
                            strong: String(item.strong),
                            span: item?.span ? String(item.span) : undefined,
                          }
                        : null
                    )
                    .filter(Boolean)
                : undefined,
              references: normalizeReferences(block?.references),
            }))
          : [],
        references: normalizeReferences(step?.references),
      }))
    : [];

  const normalized: ActionMapData = {
    title: String(parsed?.title || "Mapa sin título"),
    category: parsed?.category ? String(parsed.category) : undefined,
    intent: parsed?.intent === "study" || parsed?.intent === "apply" ? parsed.intent : fallback.intent,
    outputLanguage: String(parsed?.outputLanguage || fallback.outputLanguage),
    mapVersion: Number.isFinite(parsed?.mapVersion) ? Number(parsed.mapVersion) : 2,
    sourceMetadata: {
      kind: String(parsed?.sourceMetadata?.kind || fallback.sourceKind) as any,
      label: String(parsed?.sourceMetadata?.label || fallback.sourceLabel),
      title: parsed?.sourceMetadata?.title ? String(parsed.sourceMetadata.title) : undefined,
      author: parsed?.sourceMetadata?.author ? String(parsed.sourceMetadata.author) : undefined,
      language: parsed?.sourceMetadata?.language
        ? String(parsed.sourceMetadata.language)
        : undefined,
      detected: Array.isArray(parsed?.sourceMetadata?.detected)
        ? parsed.sourceMetadata.detected.map((item: unknown) => String(item))
        : [],
      limitations: Array.isArray(parsed?.sourceMetadata?.limitations)
        ? parsed.sourceMetadata.limitations.map((item: unknown) => String(item))
        : [],
    },
    coverage: {
      summary: String(parsed?.coverage?.summary || "Cobertura generada a partir del material disponible."),
      notes: Array.isArray(parsed?.coverage?.notes)
        ? parsed.coverage.notes
            .map((note: any) =>
              note?.label && note?.detail
                ? {
                    label: String(note.label),
                    detail: String(note.detail),
                    tone: note?.tone === "warning" ? "warning" : "neutral",
                  }
                : null
            )
            .filter(Boolean)
        : [],
    },
    coreIdea: String(parsed?.coreIdea || ""),
    coreSupport: String(parsed?.coreSupport || ""),
    tldr: Array.isArray(parsed?.tldr)
      ? parsed.tldr
          .map((item: any) =>
            item?.title && item?.desc
              ? { title: String(item.title), desc: String(item.desc) }
              : null
          )
          .filter(Boolean)
      : [],
    knowledgeSections: Array.isArray(parsed?.knowledgeSections)
      ? parsed.knowledgeSections
          .map((section: any) =>
            section?.title && section?.summary
              ? {
                  title: String(section.title),
                  summary: String(section.summary),
                  references: normalizeReferences(section.references),
                }
              : null
          )
          .filter(Boolean)
      : [],
    steps: normalizedSteps,
    references: normalizeReferences(parsed?.references),
    completionCard: {
      title: String(parsed?.completionCard?.title || "Mapa completado"),
      summary: String(
        parsed?.completionCard?.summary ||
          "Aquí tienes lo esencial para recordar y volver sobre ello cuando lo necesites."
      ),
      takeaways: Array.isArray(parsed?.completionCard?.takeaways)
        ? parsed.completionCard.takeaways.map((item: unknown) => String(item)).filter(Boolean)
        : [],
      promptQuestion: parsed?.completionCard?.promptQuestion
        ? String(parsed.completionCard.promptQuestion)
        : undefined,
    },
  };

  if (normalized.references.length === 0) {
    normalized.references = normalizedSteps.flatMap((step) => step.references ?? []).slice(0, 8);
  }
  if (!normalized.sourceMetadata.detected.length) {
    normalized.sourceMetadata.detected = [normalized.sourceMetadata.label];
  }
  if (!normalized.completionCard.takeaways.length) {
    normalized.completionCard.takeaways = normalized.tldr
      .slice(0, 5)
      .map((item) => `${item.title}: ${item.desc}`);
  }

  return normalized;
}

function buildTransformPrompt({
  type,
  intent,
  outputLanguage,
  sourceLabel,
}: {
  type: TransformRequest["type"];
  intent: MapIntent;
  outputLanguage: string;
  sourceLabel?: string;
}) {
  const formatGuide =
    type === "youtube"
      ? "Si es un video, identifica capítulos, bloques temáticos, ejemplos y momentos relevantes."
      : type === "pdf"
        ? "Si es un PDF, conserva estructura, secciones, tablas, diagramas y referencias por página cuando sea posible."
        : type === "image"
          ? "Si es una imagen, incluye todo el texto visible, señales visuales relevantes y límites del OCR."
          : type === "video"
            ? "Si es un video local, conserva secuencia, momentos importantes y referencias temporales cuando sea posible."
            : type === "link"
              ? "Si es una página web, conserva tesis, encabezados, evidencias, tablas y citas relevantes."
              : "Si es texto o archivo textual, detecta estructura, bloques temáticos y relaciones entre ideas.";

  return [
    `Objetivo del lector: ${intentLabel(intent)} (${intent}).`,
    `Idioma de salida: ${outputLanguage}.`,
    outputLanguage === "es"
      ? "Debes escribir TODO el mapa en español: title, coreIdea, coreSupport, tldr, knowledgeSections, shortNav, steps, completionCard y labels editoriales. Solo puedes dejar una cita textual en otro idioma si es imprescindible y debe ir claramente marcada como cita."
      : "",
    sourceLabel ? `Etiqueta visible de la fuente: ${sourceLabel}.` : "",
    formatGuide,
    "Genera una lectura fiel, útil a la primera y sin tono infantil.",
    "En 'tldr' entrega de 3 a 6 puntos.",
    "En 'knowledgeSections' resume las secciones mayores.",
    "En 'steps' organiza el recorrido completo de lectura.",
    "Usa 'completionCard' para una ficha final recordable y descargable.",
  ]
    .filter(Boolean)
    .join("\n");
}

const chatResponseSchema = {
  type: Type.OBJECT,
  properties: {
    answer: { type: Type.STRING },
    followUps: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    citations: {
      type: Type.ARRAY,
      items: sourceReferenceSchema,
    },
    limitations: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
  },
  required: ["answer", "followUps", "citations"],
};

const CHAT_SYSTEM_PROMPT = `Respondes preguntas únicamente con la información contenida en el mapa y sus referencias.

Reglas:
1. Si el mapa no contiene la respuesta suficiente, dilo con claridad.
2. No completes huecos con conocimiento externo.
3. Responde con lenguaje directo y útil.
4. Devuelve solo JSON válido.
5. Incluye citas solo si están realmente respaldadas por el mapa recibido.`;

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

async function fetchYouTubeTranscript(url: string): Promise<string> {
  const videoId = extractYouTubeVideoId(url);
  if (!videoId) {
    throw new Error("URL de YouTube inválida. Usa un enlace completo al video.");
  }

  let segments;
  try {
    segments = await fetchTranscript(url, { lang: "es" });
  } catch {
    try {
      segments = await fetchTranscript(url);
    } catch {
      throw new Error(
        "Este video no tiene subtítulos disponibles. Copia la transcripción de YouTube y pégala aquí."
      );
    }
  }

  const text = segments
    .map((segment) => segment.text)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  if (text.length < 50) {
    throw new Error(
      "Los subtítulos de este video son demasiado cortos para generar un mapa útil."
    );
  }

  return text;
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

function wrapPdfText(text: string, maxChars = 88) {
  const words = text.replace(/\s+/g, " ").trim().split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    if (!word) continue;
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxChars) {
      current = candidate;
      continue;
    }
    if (current) lines.push(current);
    current = word;
  }

  if (current) lines.push(current);
  return lines;
}

function escapePdfText(text: string) {
  return text
    .normalize("NFC")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/[^\x20-\xFF]/g, "?");
}

function buildCheatsheetLines(map: ActionMapData) {
  const lines = [
    map.title,
    "",
    `Modo: ${intentLabel(map.intent ?? "understand")}`,
    map.sourceMetadata?.label ? `Fuente: ${map.sourceMetadata.label}` : "",
    "",
    "Idea central",
    map.coreIdea,
    "",
    "Resumen util",
    ...(map.completionCard?.takeaways?.length
      ? map.completionCard.takeaways.flatMap((item) => [`- ${item}`])
      : map.tldr.slice(0, 5).flatMap((item) => [`- ${item.title}: ${item.desc}`])),
    "",
    "Guia de repaso",
    map.completionCard?.summary || map.coreSupport,
    map.completionCard?.promptQuestion ? "" : "",
    map.completionCard?.promptQuestion ? "Pregunta para volver a pensar" : "",
    map.completionCard?.promptQuestion || "",
    "",
    "Referencias",
    ...(map.references?.length
      ? map.references.slice(0, 6).flatMap((ref) => [
          `- ${ref.label}: ${ref.locator}${ref.excerpt ? ` — ${ref.excerpt}` : ""}`,
        ])
      : ["- El mapa no incluye referencias más específicas."]),
  ].filter(Boolean);

  return lines.flatMap((line) => (line ? wrapPdfText(line, 86) : [""]));
}

function createSimplePdfBuffer(lines: string[]) {
  const linesPerPage = 46;
  const pages = [];
  for (let i = 0; i < lines.length; i += linesPerPage) {
    pages.push(lines.slice(i, i + linesPerPage));
  }

  const objects: string[] = [];
  const pageObjectIds: number[] = [];
  const contentObjectIds: number[] = [];

  objects.push("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");
  objects.push("2 0 obj\n<< /Type /Pages /Kids [] /Count 0 >>\nendobj\n");
  objects.push("3 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n");
  objects.push("4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n");

  let nextId = 5;
  for (const pageLines of pages) {
    const pageObjectId = nextId++;
    const contentObjectId = nextId++;
    pageObjectIds.push(pageObjectId);
    contentObjectIds.push(contentObjectId);

    const textLines = pageLines
      .map((line, index) => {
        const font = index === 0 ? "/F2 18 Tf" : "/F1 11 Tf";
        const y = index === 0 ? 760 : 738 - (index - 1) * 15;
        return `${font} 1 0 0 1 56 ${y} Tm (${escapePdfText(line)}) Tj`;
      })
      .join("\n");

    const stream = `BT\n${textLines}\nET`;
    objects.push(
      `${pageObjectId} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentObjectId} 0 R >>\nendobj\n`
    );
    objects.push(
      `${contentObjectId} 0 obj\n<< /Length ${Buffer.byteLength(stream, "latin1")} >>\nstream\n${stream}\nendstream\nendobj\n`
    );
  }

  const kids = pageObjectIds.map((id) => `${id} 0 R`).join(" ");
  objects[1] = `2 0 obj\n<< /Type /Pages /Kids [${kids}] /Count ${pageObjectIds.length} >>\nendobj\n`;

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  for (const object of objects) {
    offsets.push(Buffer.byteLength(pdf, "latin1"));
    pdf += object;
  }

  const xrefOffset = Buffer.byteLength(pdf, "latin1");
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i < offsets.length; i += 1) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return Buffer.from(pdf, "latin1");
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT ?? 3000);

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
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
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
      const {
        text,
        type,
        fileData,
        mimeType,
        preferredModel,
        intent,
        outputLanguage,
        sourceLabel,
        mapId,
      } = req.body as TransformRequest;
      const resolvedIntent: MapIntent =
        intent === "study" || intent === "apply" ? intent : "understand";
      const resolvedOutputLanguage =
        typeof outputLanguage === "string" && outputLanguage.trim() ? outputLanguage.trim() : "es";

      if (base64Size(fileData) > MAX_UPLOAD_BYTES) {
        return res.status(413).json({ error: "El archivo supera el tamaño permitido." });
      }

      if (type === "pdf" || type === "image" || type === "video") {
        if (!fileData || !mimeType) {
          return res
            .status(400)
            .json({
              error:
                type === "image"
                  ? "No image provided"
                  : type === "video"
                    ? "No video provided"
                    : "No PDF provided",
            });
        }
      } else if (!text) {
        return res.status(400).json({ error: "No text provided" });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "API key is missing on the server." });
      }

      let contents: string | Array<{ inlineData?: { data: string; mimeType: string }; text?: string }>;

      const transformPrompt = buildTransformPrompt({
        type,
        intent: resolvedIntent,
        outputLanguage: resolvedOutputLanguage,
        sourceLabel,
      });

      if (type === "pdf") {
        contents = [
          { inlineData: { data: fileData, mimeType } },
          {
            text: transformPrompt,
          },
        ];
      } else if (type === "image") {
        const userPrompt = typeof text === "string" && text.trim() ? `${text.trim()}\n\n` : "";
        contents = [
          { inlineData: { data: fileData, mimeType } },
          {
            text: `${userPrompt}${transformPrompt}`,
          },
        ];
      } else if (type === "video") {
        const userPrompt = typeof text === "string" && text.trim() ? `${text.trim()}\n\n` : "";
        contents = [
          { inlineData: { data: fileData, mimeType } },
          {
            text: `${userPrompt}${transformPrompt}`,
          },
        ];
      } else {
        let contentText = text as string;
        if (type === "youtube") {
          contentText = await fetchYouTubeTranscript(text);
        } else if (type === "link") {
          contentText = await fetchUrlContent(text);
        }
        contents = `${transformPrompt}\n\nContenido fuente:\n${contentText}`;
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
      const normalized = normalizeMapData(parsedData, {
        intent: resolvedIntent,
        outputLanguage: resolvedOutputLanguage,
        sourceKind: type,
        sourceLabel: sourceLabel || "Fuente analizada",
      });
      normalized.modelUsed = usedModel;
      cacheMap(mapId, normalized);
      res.json(normalized);
    } catch (err: any) {
      console.error(err);

      const { statusCode, errorMessage } = describeGeminiError(err);
      res.status(statusCode).json({ error: errorMessage });
    }
  });

  app.post("/api/maps/:id/chat", async (req, res) => {
    try {
      const ip = req.ip || req.socket.remoteAddress || "unknown";
      if (!isWithinRateLimit(ip)) {
        return res.status(429).json({ error: "Demasiadas solicitudes. Inténtalo de nuevo en unos minutos." });
      }

      const mapId = req.params.id;
      const payload = req.body as MapChatRequest;
      const map = payload.map || mapCache.get(mapId);
      if (!map) {
        return res.status(404).json({ error: "Este mapa ya no está disponible en el servidor. Vuelve a abrirlo o regénéralo." });
      }
      if (!payload?.question?.trim()) {
        return res.status(400).json({ error: "Escribe una pregunta para continuar." });
      }

      const historyText = Array.isArray(payload.history)
        ? payload.history
            .slice(-6)
            .map((turn) => `${turn.role === "assistant" ? "Asistente" : "Usuario"}: ${turn.text}`)
            .join("\n")
        : "";

      const prompt = [
        `Pregunta actual: ${payload.question.trim()}`,
        historyText ? `Historial reciente:\n${historyText}` : "",
        "Mapa disponible en JSON:",
        JSON.stringify(map),
      ]
        .filter(Boolean)
        .join("\n\n");

      const { response } = await generateWithFallback({
        contents: prompt,
        config: {
          systemInstruction: CHAT_SYSTEM_PROMPT,
          responseMimeType: "application/json",
          responseSchema: chatResponseSchema as any,
          temperature: 0.2,
          topP: 0.85,
        },
      });

      const parsed = JSON.parse(response.text || "{}") as MapChatResponse;
      res.json({
        answer: parsed.answer || "No tengo suficiente información en este mapa para responder con rigor.",
        followUps: Array.isArray(parsed.followUps) ? parsed.followUps : [],
        citations: normalizeReferences(parsed.citations),
        limitations: Array.isArray(parsed.limitations)
          ? parsed.limitations.map((item) => String(item))
          : [],
      } satisfies MapChatResponse);
    } catch (err: any) {
      console.error(err);
      const { statusCode, errorMessage } = describeGeminiError(err);
      res.status(statusCode).json({ error: errorMessage });
    }
  });

  app.get("/api/maps/:id/cheatsheet.pdf", (req, res) => {
    const map = mapCache.get(req.params.id);
    if (!map) {
      return res.status(404).json({ error: "La ficha ya no está disponible en el servidor." });
    }
    const pdf = createSimplePdfBuffer(buildCheatsheetLines(map));
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="nucleo-cheatsheet-${req.params.id}.pdf"`);
    res.send(pdf);
  });

  app.post("/api/maps/:id/cheatsheet.pdf", (req, res) => {
    const payload = req.body as { map?: ActionMapData };
    const map = payload.map || mapCache.get(req.params.id);
    if (!map) {
      return res.status(404).json({ error: "La ficha ya no está disponible en el servidor." });
    }
    const pdf = createSimplePdfBuffer(buildCheatsheetLines(map));
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="nucleo-cheatsheet-${req.params.id}.pdf"`);
    res.send(pdf);
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
