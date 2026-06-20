import React, { useState, useRef, useMemo } from 'react';
import { 
  Sparkles, 
  Wand2, 
  Brain, 
  ArrowRight, 
  Check, 
  AlertTriangle, 
  Info, 
  ChevronRight,
  RefreshCcw,
  CheckCircle2,
  FileText,
  Map,
  Youtube,
  Upload,
  X,
  File,
  Link2,
  Moon,
  Sun
} from 'lucide-react';

const SYSTEM_PROMPT = `Eres un "Optimizador TDAH". Tu objetivo es extraer, destilar y estructurar el conocimiento de CUALQUIER texto, nota caótica o transcripción cruda de YouTube.

REGLAS DE ORO ESTRICTAS:
1. ACEPTA EL CAOS: Vas a recibir textos sin puntuación, inconexos o mal formateados. Tu trabajo es encontrar el valor y darle sentido.
2. PROHIBIDO RENDIRSE: NUNCA devuelvas un JSON con mensajes de "Fallo en procesamiento". Siempre extrae el núcleo, haciendo tu mejor esfuerzo.
3. NO INVENTES: Basa tus deducciones exclusivamente en el texto proporcionado.
4. TEXTO OBLIGATORIO: El campo "text" dentro de los bloques de "content" NUNCA puede estar vacío. Debes rellenarlo siempre con información detallada.

ESTRUCTURA DE TU RESPUESTA:
Debes responder ÚNICAMENTE con un objeto JSON válido que cumpla esta estructura exacta:

{
  "title": "Un título MUY corto y directo (max 5 palabras)",
  "coreIdea": "La idea principal o el 'Núcleo' absoluto del contenido. (1 frase impactante)",
  "coreSupport": "Contexto breve que apoya el núcleo. (Máximo 2 frases)",
  "tldr": [
    { "title": "Concepto 1", "desc": "Explicación en 1 línea" },
    { "title": "Concepto 2", "desc": "Explicación en 1 línea" },
    { "title": "Concepto 3", "desc": "Explicación en 1 línea" }
  ],
  "steps": [
    {
      "id": "paso-1",
      "shortNav": "Etiqueta Corta",
      "title": "Título de la sección o paso",
      "time": "Tiempo est. (ej: 2 min)",
      "content": [
        { "type": "prose", "text": "Párrafo OBLIGATORIO de explicación directa y detallada." },
        { "type": "callout", "kind": "action", "text": "Mensaje OBLIGATORIO destacado de acción." },
        { "type": "list", "text": "Resumen de la lista OBLIGATORIO", "items": [{"strong": "Punto clave", "span": "Detalle secundario"}] }
      ]
    }
  ]
}

No incluyas markdown, ni comentarios, solo el JSON puro.`;

const schema = {
  type: "OBJECT",
  properties: {
    title: { type: "STRING" },
    coreIdea: { type: "STRING" },
    coreSupport: { type: "STRING" },
    tldr: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          title: { type: "STRING" },
          desc: { type: "STRING" }
        },
        required: ["title", "desc"]
      }
    },
    steps: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          id: { type: "STRING" },
          shortNav: { type: "STRING" },
          title: { type: "STRING" },
          time: { type: "STRING" },
          content: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                type: { type: "STRING", description: "Opciones: 'prose', 'callout', 'list'" },
                text: { type: "STRING", description: "CONTENIDO ESCRITO DEL BLOQUE. ESTO ES ESTRICTAMENTE OBLIGATORIO. NO LO DEJES VACÍO." },
                kind: { type: "STRING", description: "Opciones: 'action', 'info', 'alert'" },
                items: {
                  type: "ARRAY",
                  items: {
                    type: "OBJECT",
                    properties: {
                      strong: { type: "STRING" },
                      span: { type: "STRING" }
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

export default function App() {
  const [inputText, setInputText] = useState("");
  const [inputType, setInputType] = useState("text"); 
  const [appState, setAppState] = useState("input"); 
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0); 
  const [isMapOpen, setIsMapOpen] = useState(window.innerWidth >= 1024);
  const [uploadedFile, setUploadedFile] = useState<{name: string, size: number} | null>(null); 
  const [theme, setTheme] = useState<'light'|'dark'>('dark');
  
  const contentRef = useRef<HTMLElement>(null);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(isDark ? 'dark' : 'light');
    }
  }, []);

  React.useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setInputText(event.target?.result as string);
      setUploadedFile({ name: file.name, size: file.size });
      setInputType("file"); 
    };
    reader.readAsText(file);
    e.target.value = ''; 
  };

  const removeFile = () => {
    setUploadedFile(null);
    setInputText("");
    setInputType("text");
  };

  const fetchWithRetry = async (url: string, options: any, retries = 5) => {
    const delays = [1000, 2000, 4000, 8000, 16000];
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, options);
        if (!response.ok) {
          let serverErrorMsg = "";
          try {
            const errData = await response.json();
            if (errData && errData.error) serverErrorMsg = errData.error;
          } catch (e) {
             // Ignore JSON parse errors
          }
          
          if (serverErrorMsg) {
             const customError = new Error(serverErrorMsg);
             (customError as any).status = response.status;
             throw customError;
          } else {
             const customError = new Error(`HTTP error! status: ${response.status}`);
             (customError as any).status = response.status;
             throw customError;
          }
        }
        return response;
      } catch (error: any) {
        if (i === retries - 1 || error.status === 429) throw error;
        await new Promise(res => setTimeout(res, delays[i]));
      }
    }
  };

  const cleanTranscript = (text: string) => {
    return text
      .replace(/\[?\d{1,2}:\d{2}(:\d{2})?\]?/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const handleTransform = async () => {
    if (!inputText.trim()) return;

    setAppState("loading");
    setError(null);

    const cleanText = cleanTranscript(inputText);

    try {
      const response = await fetchWithRetry("/api/transform", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputType === 'link' ? inputText : cleanText, type: inputType })
      }) as Response;
      
      const parsedData = await response.json();
      
      if (parsedData.error) throw new Error(parsedData.error);
      
      setData(parsedData);
      setAppState("result");
      setCurrentStep(0);
      setIsMapOpen(window.innerWidth >= 1024);
      
    } catch (err: any) {
      console.error(err);
      setError(err.message || "No se pudo procesar el contenido. Revisa tu conexión o asegúrate de haber proveido una API KEY correcta en las variables de entorno.");
      setAppState("input");
    }
  };

  const progress = useMemo(() => {
    if (!data) return 0;
    const totalSteps = data.steps.length + 1;
    return (currentStep / (totalSteps - 1)) * 100;
  }, [currentStep, data]);

  const resetApp = () => {
    setInputText("");
    setUploadedFile(null);
    setData(null);
    setAppState("input");
    setInputType("text");
  };

  const handleStepClick = (idx: number) => {
    setCurrentStep(idx);
    if (window.innerWidth < 1024) setIsMapOpen(false);
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderContentBlock = (block: any, idx: number) => {
    const type = String(block.type || 'prose').toLowerCase();
    const textContent = block.text || block.description || block.content || '';

    switch (type) {
      case 'callout':
        const kind = String(block.kind || 'info').toLowerCase();
        const colors: Record<string, string> = {
          action: 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10 text-emerald-900 dark:text-emerald-100',
          info: 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/10 text-blue-900 dark:text-blue-100',
          alert: 'border-amber-500 bg-amber-50/50 dark:bg-amber-900/10 text-amber-900 dark:text-amber-100'
        };
        const Icons: Record<string, any> = { action: CheckCircle2, info: Info, alert: AlertTriangle };
        const Icon = Icons[kind] || Info;
        return (
          <div key={idx} className={`pl-5 py-4 border-l-4 my-8 flex gap-4 items-start ${colors[kind] || colors.info}`}>
            <Icon className="w-6 h-6 shrink-0 mt-0.5 opacity-80" />
            <p className="font-medium text-lg m-0 leading-relaxed">{textContent || "Presta atención a este punto clave."}</p>
          </div>
        );
      case 'list':
        return (
          <div key={idx} className="my-10 max-w-[70ch]">
            {textContent && <p className="text-neutral-800 dark:text-neutral-200 text-lg sm:text-xl leading-[1.65] mb-8">{textContent}</p>}
            {block.items && block.items.length > 0 && (
              <ul className="space-y-6">
                {block.items.map((item: any, i: number) => (
                  <li key={i} className="flex gap-4 items-start">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2.5 shrink-0" />
                    <div className="text-lg sm:text-xl leading-[1.65]">
                      <strong className="text-[#1A1A1A] dark:text-[#EDEDED] font-bold">{item.strong}</strong>
                      {item.span && <span className="text-neutral-700 dark:text-neutral-300 ml-2">{item.span}</span>}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      case 'prose':
      default:
        if (!textContent.trim()) return null; 
        return <p key={idx} className="text-neutral-800 dark:text-neutral-200 text-lg sm:text-xl leading-[1.65] my-8 max-w-[70ch]">{textContent}</p>;
    }
  };

  if (appState === "input") {
    return (
      <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#121212] flex flex-col items-center justify-center p-4 sm:p-8 transition-colors duration-300">
        <button 
          onClick={toggleTheme}
          className="fixed top-6 right-6 z-[100] p-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors bg-white/50 dark:bg-transparent rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800/50"
          title="Alternar tema"
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>
        <div className="w-full max-w-3xl space-y-8">
          
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center p-3 bg-neutral-100 dark:bg-white/5 rounded-2xl mb-2 text-[#1A1A1A] dark:text-[#EDEDED]">
              <Brain className="w-8 h-8" />
            </div>
            <h1 className="text-5xl sm:text-6xl font-black tracking-tighter text-[#1A1A1A] dark:text-[#EDEDED] leading-[1.1]">
              TDAH Optimizer
            </h1>
            <p className=" text-xl text-neutral-600 dark:text-neutral-400 max-w-lg mx-auto leading-relaxed">
              Convierte <strong className="text-[#1A1A1A] dark:text-[#EDEDED]">caos en mapas de acción</strong>. Directo al punto, <strong className="text-[#1A1A1A] dark:text-[#EDEDED]">sin distracciones</strong>.
            </p>
          </div>

          <div className="bg-neutral-50 dark:bg-[#1C1C1C] p-2 rounded-3xl border border-neutral-200 dark:border-transparent transition-colors">
            
            <div className="flex flex-wrap sm:flex-nowrap gap-2 p-2 mb-2 border-b border-neutral-200 dark:border-transparent">
              <button 
                onClick={() => { setInputType('text'); if(uploadedFile) removeFile(); }} 
                className={`flex-1 min-w-[80px] flex items-center justify-center gap-2 py-2.5 px-2 rounded-xl font-bold transition-all duration-200 text-sm sm:text-base ${inputType === 'text' ? 'bg-white text-indigo-600 dark:bg-[#2A2A2A] dark:text-indigo-500 shadow-sm border border-neutral-200 dark:border-white/5' : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-[#1C1C1C]'}`}
              >
                <FileText className="w-4 h-4 sm:w-5 sm:h-5" /> Texto
              </button>
              <button 
                onClick={() => { setInputType('link'); if(uploadedFile) removeFile(); }} 
                className={`flex-1 min-w-[80px] flex items-center justify-center gap-2 py-2.5 px-2 rounded-xl font-bold transition-all duration-200 text-sm sm:text-base ${inputType === 'link' ? 'bg-white text-indigo-600 dark:bg-[#1C1C1C] dark:text-indigo-400 shadow-sm' : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-[#1C1C1C]'}`}
              >
                <Link2 className="w-4 h-4 sm:w-5 sm:h-5" /> Enlace
              </button>
              <button 
                onClick={() => { setInputType('youtube'); if(uploadedFile) removeFile(); }} 
                className={`flex-1 min-w-[120px] flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl font-bold transition-all duration-200 text-sm sm:text-base ${inputType === 'youtube' ? 'bg-white text-indigo-600 dark:bg-[#2A2A2A] dark:text-indigo-500 shadow-sm border border-neutral-200 dark:border-white/5' : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-[#1C1C1C]'}`}
              >
                <Youtube className="w-4 h-4 sm:w-5 sm:h-5" /> 
                <span className="truncate">Transcripción</span>
                <div className="relative flex items-center group/tooltip">
                  <Info className="w-4 h-4 opacity-60 hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 p-3 bg-[#1A1A1A] dark:bg-[#F5F5F5] text-[#EDEDED] dark:text-[#1A1A1A] text-xs font-medium rounded-xl shadow-xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-50 pointer-events-none text-center leading-relaxed normal-case tracking-normal">
                    Ve a YouTube {">"} Clic en "...más" {">"} Mostrar transcripción {">"} Cópiala y pégala abajo.<br/><strong className="text-[#EDEDED] dark:text-[#1A1A1A] font-bold mt-1 block">Los tiempos [00:00] se limpiarán solos.</strong>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-neutral-800 dark:border-t-neutral-200"></div>
                  </div>
                </div>
              </button>
              <div className="flex-1 min-w-[80px] relative group">
                <input 
                  type="file" 
                  accept=".txt,.md,.csv" 
                  onChange={handleFileUpload} 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                  title="Subir archivo de texto" 
                />
                <button className={`w-full h-full flex items-center justify-center gap-2 py-2.5 px-2 rounded-xl font-bold transition-all duration-200 text-sm sm:text-base ${inputType === 'file' ? 'bg-white text-indigo-600 dark:bg-[#1C1C1C] dark:text-indigo-400 shadow-sm' : 'text-neutral-500 group-hover:bg-neutral-100 dark:group-hover:bg-[#1C1C1C]'}`}>
                  <Upload className="w-4 h-4 sm:w-5 sm:h-5" /> Archivo
                </button>
              </div>
            </div>

            {inputType === 'file' && uploadedFile ? (
              <div className="w-full h-64 p-6 flex flex-col items-center justify-center gap-4 bg-white/50 dark:bg-[#1C1C1C] rounded-xl border-2 border-dashed border-neutral-300 dark:border-white/10">
                <div className="w-20 h-20 bg-neutral-100 dark:bg-white/5 text-[#1A1A1A] dark:text-[#EDEDED] rounded-3xl flex items-center justify-center relative">
                  <File className="w-10 h-10" />
                  <div className="absolute -bottom-2 -right-2 bg-indigo-600 dark:bg-indigo-500 text-white p-1.5 rounded-full border-4 border-neutral-50 dark:border-neutral-900">
                    <Check className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-bold text-neutral-800 dark:text-neutral-200 truncate max-w-[250px]">
                    {uploadedFile.name}
                  </h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                    {(uploadedFile.size / 1024).toFixed(1)} KB • Listo para procesar
                  </p>
                </div>
                <button 
                  onClick={removeFile}
                  className="mt-2 text-sm font-semibold text-neutral-500 hover:text-[#1A1A1A] dark:hover:text-[#EDEDED] hover:bg-neutral-100 dark:hover:bg-white/5 px-4 py-2 rounded-lg transition-colors flex items-center gap-1"
                >
                  <X className="w-4 h-4" /> Quitar archivo
                </button>
              </div>
            ) : inputType === 'link' ? (
              <div className="w-full h-64 p-6 flex flex-col items-center justify-center gap-6">
                <div className="w-20 h-20 bg-neutral-100 dark:bg-white/5 text-[#1A1A1A] dark:text-[#EDEDED] rounded-3xl flex items-center justify-center">
                  <Link2 className="w-10 h-10" />
                </div>
                <div className="w-full max-w-lg relative">
                  <input
                    type="url"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="https://ejemplo.com/articulo..."
                    className="w-full p-4 pl-12 text-center bg-white dark:bg-[#1C1C1C] border border-neutral-200 dark:border-white\/10 rounded-2xl outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all text-neutral-800 dark:text-neutral-200 font-medium"
                  />
                  <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                </div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 text-center max-w-sm font-medium">
                  Pega un enlace web. La IA buscará la página y extraerá el contenido.
                </p>
              </div>
            ) : (
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={inputType === 'youtube' ? "Pega aquí todo el bloque de texto de la transcripción..." : "Pega tu muro de texto denso aquí..."}
                className="w-full h-64 p-5 bg-transparent resize-none outline-none text-neutral-800 dark:text-neutral-200 placeholder:text-neutral-400 text-lg leading-relaxed rounded-xl focus:ring-2 focus:ring-indigo-500/20"
              />
            )}

            <div className="p-2 flex justify-between items-center bg-white dark:bg-neutral-900 rounded-2xl mt-2 border border-neutral-200 dark:border-transparent">
              <span className="text-xs font-semibold text-neutral-500 px-3 uppercase tracking-wider">
                {uploadedFile ? "1 Archivo cargado" : inputType === 'link' ? (inputText.length > 5 ? "Enlace listo" : "Esperando enlace") : `${inputText.length} caracteres`}
              </span>
              <button
                onClick={handleTransform}
                disabled={!inputText.trim() && !uploadedFile}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all active:scale-95"
              >
                <Wand2 className="w-5 h-5" />
                Transformar
              </button>
            </div>
          </div>
          
          {error && (
            <div className="p-4 bg-neutral-50 dark:bg-neutral-900/50 text-[#1A1A1A] dark:text-[#EDEDED] rounded-2xl border border-neutral-200 dark:border-white/5 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <p className="font-medium">{error}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (appState === "loading") {
    return (
      <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#121212] flex flex-col items-center justify-center p-8 text-center space-y-6 transition-colors duration-300">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-neutral-200 dark:border-[#1C1C1C] rounded-full animate-pulse"></div>
          <div className="w-20 h-20 border-4 border-[#1A1A1A] dark:border-[#EDEDED] rounded-full border-t-transparent animate-spin absolute inset-0"></div>
          <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-[#1A1A1A] dark:text-[#EDEDED] animate-bounce" />
        </div>
        <div className="space-y-4 max-w-sm">
          <h2 className="text-3xl font-bold tracking-tight text-[#1A1A1A] dark:text-[#EDEDED]">Destilando conocimiento...</h2>
          <p className="text-xl text-neutral-500 dark:text-neutral-400 leading-relaxed">Eliminando el ruido y estructurando lo esencial.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#121212] flex overflow-hidden transition-colors duration-300">
      
      {/* ProgressBar Top */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-neutral-100 dark:bg-[#1C1C1C] z-50">
        <div 
          className="h-full bg-indigo-600 dark:bg-indigo-500 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Sidebar Mapa (Minimalista) */}
      <aside className={`fixed lg:static inset-y-0 left-0 w-72 bg-neutral-50 dark:bg-[#1C1C1C] border-r border-neutral-200 dark:border-transparent/50 z-40 transform transition-transform duration-300 ease-in-out ${isMapOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-0 lg:border-none'}`}>
        <div className="h-full flex flex-col overflow-y-auto p-6 pt-10">
          
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-xs font-bold tracking-widest uppercase text-neutral-400 dark:text-neutral-500">
              Índice
            </h2>
            <button onClick={() => setIsMapOpen(false)} className="lg:hidden text-neutral-400 hover:text-neutral-600 p-2">
              <ChevronRight className="w-5 h-5 rotate-180" />
            </button>
          </div>

          <nav className="flex flex-col gap-1">
            <button
              onClick={() => handleStepClick(0)}
              className={`text-left px-4 py-3 rounded-lg font-semibold transition-all flex items-center justify-between group ${currentStep === 0 ? 'bg-indigo-100/50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400' : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/50 dark:hover:bg-[#1C1C1C]/50'}`}
            >
              <span>Resumen</span>
              {currentStep > 0 && <CheckCircle2 className="w-4 h-4 text-neutral-400" />}
            </button>
            
            <div className="w-px h-6 bg-neutral-200 dark:bg-[#1C1C1C] ml-8 my-1" />

            {data?.steps?.map((step: any, idx: number) => {
              const isActive = currentStep === idx + 1;
              const isPast = currentStep > idx + 1;
              return (
                <button
                  key={step.id}
                  onClick={() => handleStepClick(idx + 1)}
                  className={`text-left px-4 py-3 rounded-lg font-semibold transition-all flex items-center justify-between group ${isActive ? 'bg-indigo-100/50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400' : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/50 dark:hover:bg-[#1C1C1C]/50'}`}
                >
                  <span className="truncate pr-2">{step.shortNav}</span>
                  {isPast ? <CheckCircle2 className="w-4 h-4 text-neutral-400 shrink-0" /> : <ChevronRight className={`w-4 h-4 shrink-0 transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`} />}
                </button>
              );
            })}
          </nav>

          <div className="mt-auto pt-8">
            <button
              onClick={resetApp}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold text-neutral-500 hover:text-[#1A1A1A] hover:bg-neutral-200/50 dark:hover:bg-[#1C1C1C]/50 dark:hover:text-neutral-200 transition-all"
            >
              <RefreshCcw className="w-4 h-4" />
              Nuevo Documento
            </button>
          </div>
        </div>
      </aside>

      {/* Area Principal (Editorial) */}
      <main ref={contentRef} className="flex-1 h-screen overflow-y-auto scroll-smooth pt-8 lg:pt-16">
        <button 
          onClick={toggleTheme}
          className="fixed top-6 right-6 z-[100] p-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors bg-white/50 dark:bg-transparent rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800/50"
          title="Alternar tema"
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>
        <div className="max-w-3xl mx-auto px-6 py-8 pb-32">
          
          <div className="flex items-center gap-4 mb-16">
            {(!isMapOpen || window.innerWidth < 1024) && (
              <button 
                onClick={() => setIsMapOpen(true)}
                className="p-2.5 bg-neutral-50 dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-transparent text-neutral-500 hover:bg-neutral-100 transition-colors"
                title="Abrir índice"
              >
                <Map className="w-5 h-5" />
              </button>
            )}
            <h1 className="text-lg font-bold text-neutral-400 dark:text-neutral-500 truncate flex-1 uppercase tracking-widest">
              {data?.title}
            </h1>
          </div>

          {currentStep === 0 && (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 max-w-2xl">
              
              <div className="mb-16">
                <div className="flex items-center gap-2 mb-6">
                  <Brain className="w-5 h-5 text-[#1A1A1A] dark:text-[#EDEDED]" />
                  <span className="text-sm font-bold tracking-widest uppercase text-[#1A1A1A] dark:text-[#EDEDED]">El Núcleo</span>
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#1A1A1A] dark:text-[#EDEDED] leading-tight mb-6 text-balance">
                  {data?.coreIdea}
                </h2>
                <p className="text-xl sm:text-2xl leading-[1.65] text-neutral-700 dark:text-neutral-400 max-w-[50ch]">
                  {data?.coreSupport}
                </p>
              </div>

              <div className="border-t border-neutral-200 dark:border-transparent/50 pt-12 pb-8">
                <h3 className="text-xs font-bold tracking-widest uppercase text-neutral-400 mb-10">Desglose Rápido (TL;DR)</h3>
                <div className="grid gap-10">
                  {data?.tldr?.map((item: any, i: number) => (
                    <div key={i} className="flex gap-6 items-start group">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full border-2 border-neutral-200 dark:border-transparent flex items-center justify-center text-sm font-bold text-neutral-400 group-hover:border-indigo-500 group-hover:text-indigo-500 transition-colors">
                        {i + 1}
                      </div>
                      <div>
                        <strong className="block text-[#1A1A1A] dark:text-[#EDEDED] text-lg sm:text-xl font-bold mb-3">{item.title}</strong>
                        <p className="text-neutral-700 dark:text-neutral-300 text-base sm:text-lg leading-[1.65] max-w-[65ch]">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-12 mt-12">
                <button
                  onClick={() => handleStepClick(1)}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white p-5 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-transform active:scale-[0.98]"
                >
                  Empezar a leer <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {currentStep > 0 && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500 max-w-2xl">
              
              <div className="mb-12">
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold tracking-widest uppercase text-sm">Paso {currentStep}</span>
                  {data?.steps[currentStep - 1]?.time && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-neutral-300 dark:bg-neutral-700" />
                      <span className="text-neutral-500 dark:bg-neutral-400 dark:text-neutral-400 font-medium text-sm">
                        {data.steps[currentStep - 1].time}
                      </span>
                    </>
                  )}
                </div>

                <h2 className="text-4xl sm:text-[3.5rem] font-extrabold tracking-tight text-[#1A1A1A] dark:text-[#EDEDED] mb-12 leading-[1.1] max-w-[20ch]">
                  {data?.steps[currentStep - 1]?.title}
                </h2>

                <div className="mt-8">
                  {data?.steps[currentStep - 1]?.content?.map((block: any, idx: number) => renderContentBlock(block, idx))}
                </div>
              </div>

              <div className="mt-20 pt-8 border-t border-neutral-200 dark:border-transparent/50 flex gap-4">
                <button
                  onClick={() => handleStepClick(currentStep - 1)}
                  className="flex-1 bg-transparent text-neutral-600 dark:text-neutral-400 p-4 rounded-xl font-bold border border-neutral-200 dark:border-transparent hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors flex justify-center"
                >
                  Atrás
                </button>
                
                {currentStep < data?.steps.length ? (
                  <button
                    onClick={() => handleStepClick(currentStep + 1)}
                    className="flex-[2] bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white p-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-transform active:scale-[0.98]"
                  >
                    Siguiente <ArrowRight className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setCurrentStep(0);
                      alert("¡Has llegado al final del contenido!");
                    }}
                    className="flex-[2] bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white p-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-transform active:scale-[0.98]"
                  >
                    <Check className="w-6 h-6" /> Finalizar
                  </button>
                )}
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
