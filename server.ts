import "dotenv/config";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
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
          time: { type: Type.STRING },
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
        required: ["id", "shortNav", "title", "content"]
      }
    }
  },
  required: ["title", "coreIdea", "coreSupport", "tldr", "steps"]
};

const SYSTEM_PROMPT = `Eres un "Optimizador TDAH". Tu objetivo es extraer, destilar y estructurar el conocimiento de CUALQUIER texto, nota caótica o transcripción cruda de YouTube.

REGLAS DE ORO ESTRICTAS:
1. ACEPTA EL CAOS: Vas a recibir textos sin puntuación, inconexos o mal formateados. Tu trabajo es encontrar el valor y darle sentido.
2. PROHIBIDO RENDIRSE: NUNCA devuelvas un JSON con mensajes de "Fallo en procesamiento". Siempre extrae el núcleo, haciendo tu mejor esfuerzo.
3. NO INVENTES: Basa tus deducciones exclusivamente en el texto proporcionado.
4. TEXTO OBLIGATORIO: El campo "text" dentro de los bloques de "content" NUNCA puede estar vacío. Debes rellenarlo siempre con información detallada.

ESTRUCTURA DE TU RESPUESTA:
Debes responder ÚNICAMENTE con un objeto JSON válido que cumpla esta estructura exacta.`;

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));

  app.post("/api/transform", async (req, res) => {
    try {
      const { text, type } = req.body;
      
      if (!text) {
        return res.status(400).json({ error: "No text provided" });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "API key is missing on the server." });
      }

      const prompt = type === 'link' 
        ? `Accede a este enlace web, extrae el conocimiento principal de su contenido y aplica tu framework paso a paso:\n\nURL: ${text}` 
        : `Extrae el conocimiento de este texto y aplica el framework paso a paso:\n\n${text}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_PROMPT,
          responseMimeType: "application/json",
          responseSchema: schema as any
        }
      });

      let jsonText = response.text || "{}";
      
      // Clean potential wrappers
      const backtickMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (backtickMatch) {
         jsonText = backtickMatch[1];
      }
      
      const parsedData = JSON.parse(jsonText);
      res.json(parsedData);
      
    } catch (err: any) {
      console.error(err);
      
      let errorMessage = err.message || "Failed to process content";
      
      let statusCode = 500;
      if (err.status === 429 || errorMessage.includes("429") || errorMessage.includes("Quota exceeded") || errorMessage.includes("RESOURCE_EXHAUSTED")) {
        errorMessage = "Has excedido el límite de peticiones de la API de Gemini (Error 429). Por favor, revisa tu cuota o inténtalo en un minuto.";
        statusCode = 429;
      }
      
      res.status(statusCode).json({ error: errorMessage });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
