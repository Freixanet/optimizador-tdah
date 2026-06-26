import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import {
  ArrowRight,
  BookOpen,
  Check,
  File,
  GraduationCap,
  History,
  Layers,
  List,
  ListChecks,
  MessageSquareText,
  SquarePen,
  UserRound,
  X,
} from 'lucide-react-native';
import AttachMenu from '../components/AttachMenu';
import AtomCanvasIcon from '../components/AtomCanvasIcon';
import AuthSheet from '../components/AuthSheet';
import HistorySheet from '../components/HistorySheet';
import MapChatSheet from '../components/MapChatSheet';
import StepContentBlocks from '../components/StepContentBlocks';
import { apiUrl } from '../logic/apiBase';
import type { ActionMapData, MapIntent, SourceType, TransformRequest } from '../logic/contracts';
import {
  deleteCloudHistoryEntry,
  migrateLocalHistory,
  pullCloudHistory,
  pushHistoryEntry,
} from '../logic/cloudHistory';
import {
  createEntry,
  deleteEntry,
  getActiveEntry,
  loadHistory,
  saveHistory,
  setActiveId,
  updateActiveSession,
  type HistoryEntry,
  type HistoryStore,
} from '../logic/history';
import { normalizeMapData } from '../logic/mapData';
import { getInitialModelPreference } from '../logic/modelPreference';
import {
  pickImageFromCamera,
  pickImageFromLibrary,
  pickPdfAttachment,
  type UploadedFile,
} from '../logic/attachments';
import { detectUrlInput, friendlyTransformError } from '../logic/urlInput';
import { isCloudSyncConfigured, supabase } from '../logic/supabase';

type AppPhase = 'input' | 'loading' | 'result';

const TRANSFORM_TIMEOUT_MS = 150_000;
const MAX_SYNCED_ENTRIES = 30;

function mergeHistory(localEntries: HistoryEntry[], cloudEntries: HistoryEntry[]): HistoryEntry[] {
  const entries = new Map<string, HistoryEntry>();
  for (const entry of [...localEntries, ...cloudEntries]) {
    const existing = entries.get(entry.id);
    if (!existing || entry.updatedAt > existing.updatedAt) entries.set(entry.id, entry);
  }
  return [...entries.values()]
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, MAX_SYNCED_ENTRIES);
}

const INTENT_OPTIONS: Array<{
  id: MapIntent;
  title: string;
  icon: typeof BookOpen;
}> = [
  { id: 'understand', title: 'Comprender', icon: BookOpen },
  { id: 'study', title: 'Estudiar', icon: GraduationCap },
  { id: 'apply', title: 'Aplicar', icon: ListChecks },
];

function generateMapId(): string {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
  } catch {
    // ignore
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function toSourceType(requestType: TransformRequest['type']): SourceType {
  if (requestType === 'image' || requestType === 'video') return 'file';
  return requestType;
}

function stepHaptic() {
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

export default function ComprensionApp() {
  const initialHistory = useMemo(() => loadHistory(), []);
  const initialActive = useMemo(() => getActiveEntry(initialHistory), [initialHistory]);
  const initialActiveData = useMemo(
    () => (initialActive ? normalizeMapData(initialActive.session.data) : null),
    [initialActive]
  );

  const [phase, setPhase] = useState<AppPhase>(initialActiveData ? 'result' : 'input');
  const [inputText, setInputText] = useState('');
  const [intent, setIntent] = useState<MapIntent>(initialActiveData?.intent ?? 'understand');
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ActionMapData | null>(initialActiveData);
  const [historyStore, setHistoryStore] = useState<HistoryStore>(initialHistory);
  const [currentStep, setCurrentStep] = useState(initialActive?.session.currentStep ?? 0);
  const [isComplete, setIsComplete] = useState(initialActive?.session.isComplete ?? false);
  const [viewAll, setViewAll] = useState(initialActive?.session.viewAll ?? false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [cloudUserEmail, setCloudUserEmail] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [attachMenuOpen, setAttachMenuOpen] = useState(false);

  const modelPreference = useMemo(() => getInitialModelPreference(), []);
  const abortControllerRef = useRef<AbortController | null>(null);
  const transformCancelledRef = useRef(false);
  const historyStoreRef = useRef(historyStore);
  const cloudSignedIn = Boolean(cloudUserEmail);

  const totalSteps = data?.steps.length ?? 0;
  const canSubmit = Boolean(inputText.trim() || uploadedFile);
  const hideTextInput = Boolean(uploadedFile?.isPdf);
  const composerPlaceholder = uploadedFile?.isImage
    ? 'Añade una indicación (opcional)…'
    : uploadedFile
      ? 'Archivo adjunto listo para convertir'
      : 'Pega texto, un artículo, un enlace o una transcripción…';

  const progressLabel = useMemo(() => {
    if (isComplete) return 'Mapa completado';
    if (viewAll) return 'Lectura completa';
    if (currentStep === 0) return 'Introducción';
    return `Paso ${currentStep} de ${totalSteps}`;
  }, [currentStep, isComplete, totalSteps, viewAll]);

  useEffect(() => {
    if (phase !== 'result' || !data || !historyStore.activeId) return;

    setHistoryStore((prev) => {
      const updated = updateActiveSession(prev, {
        data,
        currentStep,
        isComplete,
        viewAll,
      });
      saveHistory(updated);
      return updated;
    });
  }, [phase, data, currentStep, isComplete, viewAll, historyStore.activeId]);

  useEffect(() => {
    historyStoreRef.current = historyStore;
  }, [historyStore]);

  useEffect(() => {
    if (!supabase) return;

    const hydrateCloudHistory = async (email: string | null) => {
      setCloudUserEmail(email);
      if (!email) return;
      try {
        await migrateLocalHistory(historyStoreRef.current);
        const remoteEntries = await pullCloudHistory();
        setHistoryStore((previous) => {
          const merged = { ...previous, entries: mergeHistory(previous.entries, remoteEntries) };
          saveHistory(merged);
          return merged;
        });
      } catch (err) {
        console.error('No se pudo sincronizar el historial.', err);
      }
    };

    void supabase.auth
      .getSession()
      .then(({ data }) => hydrateCloudHistory(data.session?.user?.email ?? null));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      void hydrateCloudHistory(session?.user?.email ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!supabase || !cloudSignedIn) return;
    const timer = setTimeout(() => {
      void Promise.all(historyStore.entries.map(pushHistoryEntry)).catch((err) => {
        console.error('Los cambios se sincronizarán más tarde.', err);
      });
    }, 700);
    return () => clearTimeout(timer);
  }, [historyStore, cloudSignedIn]);

  const goToStep = useCallback((idx: number, fromViewAll = false) => {
    setIsComplete(false);
    setCurrentStep(idx);
    if (fromViewAll) setViewAll(false);
    stepHaptic();
  }, []);

  const toggleViewMode = useCallback(() => {
    setViewAll((v) => !v);
    setIsComplete(false);
    stepHaptic();
  }, []);

  const handleCancelLoading = useCallback(() => {
    transformCancelledRef.current = true;
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setPhase('input');
  }, []);

  const handleAttachmentError = useCallback((err: unknown) => {
    const message = err instanceof Error ? err.message : 'No se pudo adjuntar el archivo.';
    setError(message);
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  }, []);

  const handlePickImage = useCallback(async () => {
    setAttachMenuOpen(false);
    try {
      const file = await pickImageFromLibrary();
      if (!file) return;
      setUploadedFile(file);
      setError(null);
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (err) {
      handleAttachmentError(err);
    }
  }, [handleAttachmentError]);

  const handlePickCamera = useCallback(async () => {
    setAttachMenuOpen(false);
    try {
      const file = await pickImageFromCamera();
      if (!file) return;
      setUploadedFile(file);
      setError(null);
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (err) {
      handleAttachmentError(err);
    }
  }, [handleAttachmentError]);

  const handlePickPdf = useCallback(async () => {
    setAttachMenuOpen(false);
    try {
      const file = await pickPdfAttachment();
      if (!file) return;
      setUploadedFile(file);
      setInputText('');
      setError(null);
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (err) {
      handleAttachmentError(err);
    }
  }, [handleAttachmentError]);

  const removeUploadedFile = useCallback(() => {
    setUploadedFile(null);
    if (uploadedFile?.isPdf) setInputText('');
  }, [uploadedFile?.isPdf]);

  const handleTransform = useCallback(async () => {
    if (!inputText.trim() && !uploadedFile) return;

    let urlDetection: ReturnType<typeof detectUrlInput> | null = null;
    if (!uploadedFile && inputText.trim()) {
      urlDetection = detectUrlInput(inputText);
      if (urlDetection.kind === 'invalid') {
        setError(urlDetection.message);
        return;
      }
    }

    setPhase('loading');
    setError(null);
    setAttachMenuOpen(false);
    transformCancelledRef.current = false;

    const controller = new AbortController();
    abortControllerRef.current = controller;
    const timeoutId = setTimeout(() => controller.abort(), TRANSFORM_TIMEOUT_MS);

    try {
      const mapId = generateMapId();
      const sourceLabel =
        uploadedFile?.name || inputText.trim().split('\n')[0]?.slice(0, 80) || 'Fuente analizada';

      let body: TransformRequest;
      if (uploadedFile?.isPdf && uploadedFile.fileData) {
        body = {
          type: 'pdf',
          fileData: uploadedFile.fileData,
          mimeType: uploadedFile.mimeType || 'application/pdf',
          preferredModel: modelPreference,
          intent,
          outputLanguage: 'es',
          sourceLabel,
          mapId,
        };
      } else if (uploadedFile?.isImage && uploadedFile.fileData) {
        body = {
          type: 'image',
          fileData: uploadedFile.fileData,
          mimeType: uploadedFile.mimeType || 'image/jpeg',
          preferredModel: modelPreference,
          intent,
          outputLanguage: 'es',
          sourceLabel,
          mapId,
        };
        if (inputText.trim()) body.text = inputText.trim();
      } else if (urlDetection?.kind === 'youtube') {
        body = {
          text: urlDetection.url,
          type: 'youtube',
          preferredModel: modelPreference,
          intent,
          outputLanguage: 'es',
          sourceLabel: urlDetection.url,
          mapId,
        };
      } else if (urlDetection?.kind === 'link') {
        body = {
          text: urlDetection.url,
          type: 'link',
          preferredModel: modelPreference,
          intent,
          outputLanguage: 'es',
          sourceLabel: urlDetection.url,
          mapId,
        };
      } else {
        body = {
          text: inputText.trim(),
          type: 'text',
          preferredModel: modelPreference,
          intent,
          outputLanguage: 'es',
          sourceLabel,
          mapId,
        };
      }

      const accessToken = supabase
        ? (await supabase.auth.getSession()).data.session?.access_token
        : undefined;

      const response = await fetch(apiUrl('/api/transform'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      const parsed = (await response.json()) as ActionMapData & { error?: string };
      if (!response.ok || parsed.error) {
        throw new Error(parsed.error || `Error del servidor (${response.status})`);
      }

      const normalized = normalizeMapData(parsed);
      if (!normalized) {
        throw new Error('No se pudo interpretar el mapa generado.');
      }

      const session = {
        data: normalized,
        currentStep: 0,
        isComplete: false,
        viewAll: false,
      };

      setHistoryStore((prev) => {
        const updated = createEntry(prev, session, toSourceType(body.type), mapId);
        saveHistory(updated);
        return updated;
      });

      setData(normalized);
      setCurrentStep(0);
      setIsComplete(false);
      setViewAll(false);
      setUploadedFile(null);
      setInputText('');
      setPhase('result');
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        if (transformCancelledRef.current) {
          setPhase('input');
          return;
        }
        setError(
          'La generación está tardando demasiado. Comprueba tu conexión e inténtalo de nuevo.'
        );
        setPhase('input');
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        return;
      }

      const rawMessage =
        err instanceof Error ? err.message : 'No se pudo procesar el contenido.';
      setError(friendlyTransformError(rawMessage));
      setPhase('input');
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      clearTimeout(timeoutId);
      abortControllerRef.current = null;
    }
  }, [inputText, intent, modelPreference, uploadedFile]);

  const handleNewMap = useCallback(() => {
    setHistoryStore((prev) => {
      const updated = setActiveId(prev, null);
      saveHistory(updated);
      return updated;
    });
    setInputText('');
    setUploadedFile(null);
    setAttachMenuOpen(false);
    setData(null);
    setError(null);
    setCurrentStep(0);
    setIsComplete(false);
    setViewAll(false);
    setHistoryOpen(false);
    setChatOpen(false);
    setPhase('input');
  }, []);

  const handleSelectHistory = useCallback(
    (id: string) => {
      const entry = historyStore.entries.find((e) => e.id === id);
      if (!entry) return;

      const normalized = normalizeMapData(entry.session.data);
      if (!normalized) return;

      setHistoryStore((prev) => {
        const updated = setActiveId(prev, id);
        saveHistory(updated);
        return updated;
      });

      setData(normalized);
      setIntent(normalized.intent ?? 'understand');
      setCurrentStep(entry.session.currentStep);
      setIsComplete(entry.session.isComplete ?? false);
      setViewAll(entry.session.viewAll ?? false);
      setHistoryOpen(false);
      setChatOpen(false);
      setPhase('result');
      setError(null);
      stepHaptic();
    },
    [historyStore.entries]
  );

  const handleDeleteHistory = useCallback(
    (id: string) => {
      const wasActive = historyStore.activeId === id;

      setHistoryStore((prev) => {
        const updated = deleteEntry(prev, id);
        saveHistory(updated);
        return updated;
      });

      if (supabase && cloudSignedIn) {
        void deleteCloudHistoryEntry(id).catch((err) =>
          console.error('No se pudo eliminar el mapa en la nube.', err)
        );
      }

      if (wasActive) {
        setData(null);
        setCurrentStep(0);
        setIsComplete(false);
        setViewAll(false);
        setError(null);
        setPhase('input');
      }

      stepHaptic();
    },
    [historyStore.activeId, cloudSignedIn]
  );

  const renderResultHeader = () => (
    <View className="flex-row items-center justify-between gap-3 mb-4">
      <View className="flex-1">
        <Text className="text-xs font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
          {data?.title}
        </Text>
        <Text className="mt-1 text-sm font-semibold text-indigo-600 dark:text-indigo-400">
          {progressLabel}
        </Text>
      </View>
      <View className="flex-row items-center gap-2">
        <Pressable
          onPress={() => setHistoryOpen(true)}
          className="w-10 h-10 rounded-full items-center justify-center border border-neutral-200 dark:border-white/10 bg-white/80 dark:bg-neutral-800/80"
          accessibilityLabel="Abrir historial"
        >
          <History size={18} color="#4f46e5" />
        </Pressable>
        <Pressable
          onPress={handleNewMap}
          className="w-10 h-10 rounded-full items-center justify-center border border-neutral-200 dark:border-white/10 bg-white/80 dark:bg-neutral-800/80"
          accessibilityLabel="Nuevo mapa"
        >
          <SquarePen size={18} color="#525252" />
        </Pressable>
        {renderAccountButton()}
      </View>
    </View>
  );

  const renderAccountButton = () => {
    if (!isCloudSyncConfigured) return null;
    return (
      <Pressable
        onPress={() => {
          setAuthOpen(true);
          stepHaptic();
        }}
        className={`w-10 h-10 rounded-full items-center justify-center border ${
          cloudSignedIn
            ? 'border-indigo-300 dark:border-indigo-500/40 bg-indigo-600'
            : 'border-neutral-200 dark:border-white/10 bg-white/80 dark:bg-neutral-800/80'
        }`}
        accessibilityLabel={cloudSignedIn ? 'Tu cuenta' : 'Iniciar sesión'}
      >
        <UserRound size={18} color={cloudSignedIn ? '#ffffff' : '#525252'} />
      </Pressable>
    );
  };

  const renderViewModeToggle = () => (
    <Pressable
      onPress={toggleViewMode}
      className={`flex-row items-center justify-center gap-2 px-3 py-2.5 rounded-xl border mb-4 ${
        viewAll
          ? 'bg-indigo-100 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/20'
          : 'border-neutral-200 dark:border-white/10 bg-white/60 dark:bg-neutral-800/60'
      }`}
    >
      {viewAll ? <List size={16} color="#4f46e5" /> : <Layers size={16} color="#737373" />}
      <Text
        className={`text-sm font-semibold ${
          viewAll ? 'text-indigo-700 dark:text-indigo-300' : 'text-neutral-600 dark:text-neutral-300'
        }`}
      >
        {viewAll ? 'Paso a paso' : 'Lectura completa'}
      </Text>
    </Pressable>
  );

  const renderIntro = (interactive = false) => (
    <Pressable
      disabled={!interactive}
      onPress={interactive ? () => goToStep(0, true) : undefined}
      className={interactive ? 'mb-8 pb-8 border-b border-neutral-200 dark:border-white/10' : 'mb-8'}
    >
      <Text className="text-xs font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-3">
        Idea central
      </Text>
      <Text className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 leading-9">
        {data?.coreIdea}
      </Text>
      {data?.coreSupport ? (
        <Text className="mt-4 text-lg leading-7 text-neutral-700 dark:text-neutral-300">
          {data.coreSupport}
        </Text>
      ) : null}

      {data?.tldr?.length ? (
        <View className="mt-8 pt-8 border-t border-neutral-200 dark:border-white/10">
          <Text className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-6">
            En 60 segundos
          </Text>
          {data.tldr.map((item, i) => (
            <View key={i} className="flex-row gap-4 items-start mb-6">
              <View className="w-7 h-7 rounded-full border-2 border-neutral-200 dark:border-white/10 items-center justify-center">
                <Text className="text-xs font-bold text-neutral-400">{i + 1}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-base font-bold text-neutral-900 dark:text-neutral-100 mb-1">
                  {item.title}
                </Text>
                <Text className="text-base leading-6 text-neutral-700 dark:text-neutral-300">
                  {item.desc}
                </Text>
              </View>
            </View>
          ))}
        </View>
      ) : null}
    </Pressable>
  );

  const renderStep = (stepIndex: number, interactive = false) => {
    const step = data?.steps[stepIndex - 1];
    if (!step) return null;

    return (
      <Pressable
        key={step.id || stepIndex}
        disabled={!interactive}
        onPress={interactive ? () => goToStep(stepIndex, true) : undefined}
        className={
          interactive ? 'mb-8 pb-8 border-b border-neutral-200 dark:border-white/10 last:border-0' : ''
        }
      >
        <View className="flex-row flex-wrap items-center gap-2 mb-4">
          <Text className="text-sm font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
            Paso {stepIndex} de {totalSteps}
          </Text>
          {step.time ? (
            <Text className="text-sm text-neutral-500 dark:text-neutral-400">{step.time}</Text>
          ) : null}
        </View>
        <Text className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 leading-9 mb-4">
          {step.title}
        </Text>
        {step.purpose ? (
          <Text className="text-base leading-7 text-neutral-600 dark:text-neutral-300 mb-4">
            {step.purpose}
          </Text>
        ) : null}
        <StepContentBlocks blocks={step.content} />
      </Pressable>
    );
  };

  const renderCompletion = () => (
    <View className="py-6">
      <View className="flex-row items-center gap-2 mb-4">
        <Check size={16} color="#4f46e5" />
        <Text className="text-xs font-bold uppercase tracking-widest text-neutral-400">
          Mapa completado
        </Text>
      </View>
      <Text className="text-3xl font-extrabold text-neutral-900 dark:text-neutral-100">
        {data?.completionCard?.title || 'Has terminado esta lectura'}
      </Text>
      <Text className="mt-4 text-lg leading-7 text-neutral-600 dark:text-neutral-300">
        {data?.completionCard?.summary || 'Aquí tienes lo esencial para retomarlo con rapidez.'}
      </Text>

      {data?.completionCard?.takeaways?.length ? (
        <View className="mt-8 rounded-3xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-white/[0.03] px-5 py-5">
          <Text className="text-[11px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
            Para recordar
          </Text>
          {data.completionCard.takeaways.slice(0, 7).map((item, index) => (
            <View key={`${item}-${index}`} className="flex-row gap-3 mt-4">
              <View className="mt-2 h-1.5 w-1.5 rounded-full bg-indigo-500" />
              <Text className="flex-1 text-base leading-6 text-neutral-700 dark:text-neutral-200">
                {item}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      <Pressable
        onPress={() => {
          setIsComplete(false);
          goToStep(0);
        }}
        className="mt-8 px-5 py-4 rounded-2xl border border-neutral-200 dark:border-white/10 items-center"
      >
        <Text className="font-semibold text-neutral-700 dark:text-neutral-300">Repasar lo esencial</Text>
      </Pressable>
    </View>
  );

  const renderStepNavFooter = () => {
    if (viewAll || isComplete) return null;

    if (currentStep === 0) {
      return (
        <View className="border-t border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-neutral-900 px-4 pt-4 pb-2">
          <Pressable
            onPress={() => goToStep(1)}
            className="w-full bg-indigo-600 active:bg-indigo-700 py-4 rounded-xl flex-row items-center justify-center gap-2"
          >
            <Text className="text-white font-bold text-lg">Empezar a leer</Text>
            <ArrowRight size={20} color="#fff" />
          </Pressable>
        </View>
      );
    }

    return (
      <View className="border-t border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-neutral-900 px-4 pt-4 pb-2">
        <View className="flex-row gap-3">
          <Pressable
            onPress={() => goToStep(currentStep - 1)}
            className="flex-1 py-4 rounded-xl border border-neutral-200 dark:border-white/10 items-center justify-center"
          >
            <Text className="font-bold text-neutral-700 dark:text-neutral-300">Atrás</Text>
          </Pressable>

          {currentStep < totalSteps ? (
            <Pressable
              onPress={() => goToStep(currentStep + 1)}
              className="flex-[2] bg-indigo-600 active:bg-indigo-700 py-4 rounded-xl flex-row items-center justify-center gap-2"
            >
              <Text className="text-white font-bold text-lg">Siguiente</Text>
              <ArrowRight size={20} color="#fff" />
            </Pressable>
          ) : (
            <Pressable
              onPress={() => {
                setIsComplete(true);
                void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }}
              className="flex-[2] bg-indigo-600 active:bg-indigo-700 py-4 rounded-xl flex-row items-center justify-center gap-2"
            >
              <Check size={20} color="#fff" />
              <Text className="text-white font-bold text-lg">Completar mapa</Text>
            </Pressable>
          )}
        </View>
      </View>
    );
  };

  if (phase === 'loading') {
    return (
      <SafeAreaView className="flex-1 bg-neutral-50 dark:bg-neutral-900 items-center justify-center px-6">
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text className="mt-4 text-base font-medium text-neutral-600 dark:text-neutral-300">
          Generando lectura…
        </Text>
        <Pressable
          onPress={handleCancelLoading}
          className="mt-8 px-5 py-3 rounded-xl border border-neutral-200 dark:border-white/10"
        >
          <Text className="text-neutral-700 dark:text-neutral-300 font-semibold">Cancelar</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  if (phase === 'result' && data) {
    const showStepFooter = !viewAll && !isComplete;
    const chatFabBottom = showStepFooter ? 88 : 24;

    return (
      <SafeAreaView className="flex-1 bg-neutral-50 dark:bg-neutral-900" edges={['top', 'left', 'right']}>
        <View className="flex-1">
          <ScrollView
            className="flex-1"
            contentContainerClassName="px-5 py-5 pb-8"
            keyboardShouldPersistTaps="handled"
          >
            {renderResultHeader()}
            {!isComplete ? renderViewModeToggle() : null}

            {isComplete ? (
              renderCompletion()
            ) : viewAll ? (
              <>
                {renderIntro(true)}
                {data.steps.map((_, idx) => renderStep(idx + 1, true))}
              </>
            ) : currentStep === 0 ? (
              renderIntro(false)
            ) : (
              renderStep(currentStep, false)
            )}
          </ScrollView>

          {renderStepNavFooter()}

          <Pressable
            onPress={() => {
              setChatOpen(true);
              stepHaptic();
            }}
            style={{ bottom: chatFabBottom }}
            className="absolute right-4 w-12 h-12 rounded-full bg-indigo-600 active:bg-indigo-700 items-center justify-center shadow-lg"
            accessibilityLabel="Preguntar sobre este mapa"
          >
            <MessageSquareText size={22} color="#fff" />
          </Pressable>
        </View>

        {historyStore.activeId ? (
          <MapChatSheet
            visible={chatOpen}
            onClose={() => setChatOpen(false)}
            mapId={historyStore.activeId}
            mapData={data}
          />
        ) : null}

        <HistorySheet
          visible={historyOpen}
          entries={historyStore.entries}
          activeId={historyStore.activeId}
          onClose={() => setHistoryOpen(false)}
          onSelect={handleSelectHistory}
          onDelete={handleDeleteHistory}
        />

        <AuthSheet
          visible={authOpen}
          userEmail={cloudUserEmail}
          onClose={() => setAuthOpen(false)}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-neutral-50 dark:bg-neutral-900">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <View className="flex-1 justify-between px-4 pb-4">
          <View className="flex-row justify-end items-center gap-2 pt-2">
            <Pressable
              onPress={() => setHistoryOpen(true)}
              className="w-10 h-10 rounded-full items-center justify-center border border-neutral-200 dark:border-white/10 bg-white/80 dark:bg-neutral-800/80"
              accessibilityLabel="Abrir historial"
            >
              <History size={18} color="#4f46e5" />
            </Pressable>
            {renderAccountButton()}
          </View>

          <View className="flex-1 items-center justify-center px-2">
            <AtomCanvasIcon size={112} />
            <Text className="mt-4 text-3xl font-black tracking-tight text-neutral-900 dark:text-neutral-100 text-center">
              ¿Qué quieres entender?
            </Text>
            <Text className="mt-3 text-base text-neutral-600 dark:text-neutral-300 text-center leading-6 max-w-md">
              Pega, adjunta o enlaza una fuente. La convertiré en una lectura clara y hecha para tu
              objetivo.
            </Text>
            {error ? (
              <View className="mt-5 w-full max-w-xl rounded-2xl border border-neutral-200 dark:border-white/10 bg-white/80 dark:bg-neutral-800/80 px-4 py-3">
                <Text className="text-sm font-medium text-neutral-800 dark:text-neutral-100">
                  {error}
                </Text>
              </View>
            ) : null}
          </View>

          <View className="rounded-[28px] border border-black/5 dark:border-white/10 bg-white/90 dark:bg-neutral-800/90 overflow-hidden shadow-lg px-3 py-3">
            <View className="flex-row gap-2 mb-3">
              {INTENT_OPTIONS.map((option) => {
                const isActive = intent === option.id;
                const Icon = option.icon;
                return (
                  <Pressable
                    key={option.id}
                    onPress={() => {
                      setIntent(option.id);
                      stepHaptic();
                    }}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isActive }}
                    className={`flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-xl border ${
                      isActive
                        ? 'border-indigo-300 dark:border-indigo-500/40 bg-indigo-50 dark:bg-indigo-500/10'
                        : 'border-neutral-200 dark:border-white/10 bg-white/60 dark:bg-neutral-800/60'
                    }`}
                  >
                    <Icon size={14} color={isActive ? '#4f46e5' : '#737373'} />
                    <Text
                      className={`text-xs font-semibold ${
                        isActive
                          ? 'text-indigo-700 dark:text-indigo-300'
                          : 'text-neutral-600 dark:text-neutral-300'
                      }`}
                    >
                      {option.title}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            {uploadedFile ? (
              <View className="px-2 pt-1 pb-2">
                {uploadedFile.isImage && uploadedFile.previewUri ? (
                  <View className="relative self-start">
                    <Image
                      source={{ uri: uploadedFile.previewUri }}
                      accessibilityLabel={uploadedFile.name}
                      className="w-16 h-16 rounded-xl border border-neutral-200 dark:border-white/10"
                    />
                    <Pressable
                      onPress={removeUploadedFile}
                      accessibilityLabel="Quitar imagen"
                      className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-neutral-800 items-center justify-center"
                    >
                      <X size={12} color="#fff" />
                    </Pressable>
                  </View>
                ) : (
                  <View className="flex-row items-center gap-2 self-start max-w-full px-3 py-1.5 rounded-full bg-neutral-100 dark:bg-white/5">
                    <File size={16} color="#737373" />
                    <Text
                      className="text-sm text-neutral-700 dark:text-neutral-300 flex-shrink"
                      numberOfLines={1}
                    >
                      {uploadedFile.name}
                    </Text>
                    <Pressable
                      onPress={removeUploadedFile}
                      accessibilityLabel="Quitar archivo"
                      className="p-0.5 rounded-full active:bg-neutral-200 dark:active:bg-white/10"
                    >
                      <X size={14} color="#737373" />
                    </Pressable>
                  </View>
                )}
              </View>
            ) : null}

            {!hideTextInput ? (
              <TextInput
                value={inputText}
                onChangeText={setInputText}
                placeholder={composerPlaceholder}
                placeholderTextColor="#a3a3a3"
                multiline
                textAlignVertical="top"
                className="min-h-[88px] max-h-40 px-2 py-2 text-base text-neutral-900 dark:text-neutral-100"
              />
            ) : null}

            <View className="flex-row items-center justify-between mt-2">
              <AttachMenu
                open={attachMenuOpen}
                onToggle={() => setAttachMenuOpen((open) => !open)}
                onPickImage={() => void handlePickImage()}
                onPickCamera={() => void handlePickCamera()}
                onPickPdf={() => void handlePickPdf()}
              />
              <Pressable
                onPress={() => void handleTransform()}
                disabled={!canSubmit}
                className={`w-10 h-10 rounded-full items-center justify-center ${
                  canSubmit ? 'bg-indigo-600 active:bg-indigo-700' : 'bg-indigo-600/40'
                }`}
              >
                <Text className="text-white text-lg font-bold">↑</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>

      <HistorySheet
        visible={historyOpen}
        entries={historyStore.entries}
        activeId={historyStore.activeId}
        onClose={() => setHistoryOpen(false)}
        onSelect={handleSelectHistory}
        onDelete={handleDeleteHistory}
      />

      <AuthSheet
        visible={authOpen}
        userEmail={cloudUserEmail}
        onClose={() => setAuthOpen(false)}
      />
    </SafeAreaView>
  );
}
