import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Share } from 'react-native';
import {
  cacheDirectory,
  EncodingType,
  writeAsStringAsync,
} from 'expo-file-system/legacy';
import * as Haptics from 'expo-haptics';
import type { ActionMapData, MapIntent, SourceType, TransformRequest } from '../logic/contracts';
import {
  deleteCloudHistoryEntry,
  migrateLocalHistory,
  pullCloudHistory,
  pushHistoryEntry,
  signOut,
} from '../logic/cloudHistory';
import { toCloudUserProfile } from '../logic/cloudUserProfile';
import {
  createEntry,
  deleteEntry,
  getActiveEntry,
  loadHistory,
  renameEntry,
  saveHistory,
  setActiveId,
  togglePinEntry,
  updateActiveSession,
  updateEntryCategory,
  type HistoryEntry,
  type HistoryStore,
} from '../logic/history';
import { collectUserCategories } from '@shared/categories';
import { normalizeMapData } from '../logic/mapData';
import {
  getInitialModelPreference,
  saveModelPreference,
  type ModelPreference,
} from '../logic/modelPreference';
import {
  getInitialDepthPreference,
  saveDepthPreference,
  type DepthPreference,
} from '../logic/depthPreference';
import {
  pickFileAttachment,
  pickImageFromCamera,
  pickImageFromLibrary,
  type UploadedFile,
} from '../logic/attachments';
import { detectUrlInput, friendlyTransformError, type TransformSourceKind } from '../logic/urlInput';
import {
  fetchTransformWithProgress,
  TRANSFORM_IDLE_TIMEOUT_MESSAGE,
} from '../logic/transformStream';
import { apiUrl } from '../logic/apiBase';
import { isCloudSyncConfigured, supabase } from '../logic/supabase';

export type AppPhase = 'input' | 'loading' | 'result';

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

function resolveTransformSourceKind(
  _uploadedFile: UploadedFile | null,
  urlDetection: ReturnType<typeof detectUrlInput> | null
): TransformSourceKind {
  if (urlDetection?.kind === 'youtube') return 'youtube';
  if (urlDetection?.kind === 'link') return 'link';
  return 'text';
}

export function stepHaptic() {
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}

type AppSessionContextValue = {
  phase: AppPhase;
  setPhase: (phase: AppPhase) => void;
  inputText: string;
  setInputText: (text: string) => void;
  intent: MapIntent;
  setIntent: (intent: MapIntent) => void;
  error: string | null;
  setError: (error: string | null) => void;
  data: ActionMapData | null;
  historyStore: HistoryStore;
  currentStep: number;
  isComplete: boolean;
  viewAll: boolean;
  historyOpen: boolean;
  setHistoryOpen: (open: boolean) => void;
  openHistoryDrawer: () => void;
  closeHistoryDrawer: () => void;
  toggleHistoryDrawer: () => void;
  chatOpen: boolean;
  setChatOpen: (open: boolean) => void;
  authOpen: boolean;
  setAuthOpen: (open: boolean) => void;
  openAuthSheet: () => void;
  cloudUserEmail: string | null;
  cloudUserAvatarUrl: string | null;
  cloudSignedIn: boolean;
  isCloudSyncConfigured: boolean;
  uploadedFile: UploadedFile | null;
  attachMenuOpen: boolean;
  setAttachMenuOpen: (open: boolean) => void;
  modelPreference: ModelPreference;
  setModelPreference: (value: ModelPreference) => void;
  depthPreference: DepthPreference;
  setDepthPreference: (value: DepthPreference) => void;
  totalSteps: number;
  canSubmit: boolean;
  hideTextInput: boolean;
  composerPlaceholder: string;
  progressLabel: string;
  stepProgress: number;
  goToStep: (idx: number, fromViewAll?: boolean) => void;
  syncReadingStep: (step: number) => void;
  toggleViewMode: () => void;
  handleCancelLoading: () => void;
  handlePickImage: () => Promise<void>;
  handlePickCamera: () => Promise<void>;
  handlePickFile: () => Promise<void>;
  removeUploadedFile: () => void;
  handleTransform: () => Promise<void>;
  handleNewMap: () => void;
  handleSelectHistory: (id: string) => void;
  handleDeleteHistory: (id: string) => void;
  handleRenameHistory: (id: string, title: string) => void;
  handleUpdateCategory: (category: string) => void;
  handleUpdateEntryCategory: (id: string, category: string) => void;
  handlePinHistory: (id: string) => void;
  handleCompleteMap: () => void;
  essentialsReview: boolean;
  setEssentialsReview: (value: boolean) => void;
  handleDownloadPdf: () => Promise<void>;
  isStreamGenerating: boolean;
  transformIncomplete: boolean;
  dismissTransformIncomplete: () => void;
  handleSignOut: () => Promise<void>;
};

const AppSessionContext = createContext<AppSessionContextValue | null>(null);

export function AppSessionProvider({ children }: { children: React.ReactNode }) {
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
  const [transformIncomplete, setTransformIncomplete] = useState(false);
  const [data, setData] = useState<ActionMapData | null>(initialActiveData);
  const [historyStore, setHistoryStore] = useState<HistoryStore>(initialHistory);
  const [currentStep, setCurrentStep] = useState(initialActive?.session.currentStep ?? 0);
  const [isComplete, setIsComplete] = useState(initialActive?.session.isComplete ?? false);
  const [viewAll, setViewAll] = useState(initialActive?.session.viewAll ?? false);
  const [historyOpen, setHistoryOpenState] = useState(false);
  const historyOpenRef = useRef(false);

  const openHistoryDrawer = useCallback(() => {
    if (historyOpenRef.current) return;
    historyOpenRef.current = true;
    stepHaptic();
    setHistoryOpenState(true);
  }, []);

  const closeHistoryDrawer = useCallback(() => {
    if (!historyOpenRef.current) return;
    historyOpenRef.current = false;
    stepHaptic();
    setHistoryOpenState(false);
  }, []);

  const toggleHistoryDrawer = useCallback(() => {
    if (historyOpenRef.current) closeHistoryDrawer();
    else openHistoryDrawer();
  }, [closeHistoryDrawer, openHistoryDrawer]);

  const setHistoryOpen = useCallback(
    (open: boolean) => {
      if (open) openHistoryDrawer();
      else closeHistoryDrawer();
    },
    [closeHistoryDrawer, openHistoryDrawer]
  );
  const [chatOpen, setChatOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [cloudUserEmail, setCloudUserEmail] = useState<string | null>(null);
  const [cloudUserAvatarUrl, setCloudUserAvatarUrl] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [attachMenuOpen, setAttachMenuOpen] = useState(false);
  const [modelPreference, setModelPreferenceState] = useState<ModelPreference>(() =>
    getInitialModelPreference()
  );
  const [depthPreference, setDepthPreferenceState] = useState<DepthPreference>(() =>
    getInitialDepthPreference()
  );
  const [essentialsReview, setEssentialsReview] = useState(false);
  const [isStreamGenerating, setIsStreamGenerating] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const transformCancelledRef = useRef(false);
  const partialShownRef = useRef(false);
  const historyStoreRef = useRef(historyStore);

  const commitHistoryStore = useCallback((updatedStore: HistoryStore) => {
    historyStoreRef.current = updatedStore;
    saveHistory(updatedStore);
    setHistoryStore(updatedStore);
  }, []);

  const pendingAuthRef = useRef(false);
  const cloudSignedIn = Boolean(cloudUserEmail);

  const totalSteps = data?.steps.length ?? 0;
  const canSubmit = Boolean(inputText.trim() || uploadedFile);
  const hideTextInput = Boolean(uploadedFile?.isPdf || uploadedFile?.isVideo);
  const composerPlaceholder = uploadedFile?.isImage
    ? 'Añade una indicación (opcional)…'
    : uploadedFile?.isVideo
      ? 'Añade una indicación sobre el video (opcional)…'
      : uploadedFile
        ? 'Archivo adjunto listo para convertir'
        : 'Pega texto, un artículo, un enlace o una transcripción…';

  const progressLabel = useMemo(() => {
    if (isComplete) return 'Mapa completado';
    if (viewAll) return 'Vista completa';
    if (currentStep === 0) return 'Introducción';
    return `Paso ${currentStep} de ${totalSteps}`;
  }, [currentStep, isComplete, totalSteps, viewAll]);

  const stepProgress = useMemo(() => {
    if (isComplete || viewAll || !data || totalSteps === 0) return 0;
    if (currentStep === 0) return 0;
    return Math.round((currentStep / totalSteps) * 100);
  }, [currentStep, data, isComplete, totalSteps, viewAll]);

  const setModelPreference = useCallback((value: ModelPreference) => {
    setModelPreferenceState(value);
    saveModelPreference(value);
    stepHaptic();
  }, []);

  const setDepthPreference = useCallback((value: DepthPreference) => {
    setDepthPreferenceState(value);
    saveDepthPreference(value);
    stepHaptic();
  }, []);

  const saveStepTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  type PendingPersist = {
    id: string;
    step: number;
    isComplete: boolean;
    viewAll: boolean;
  };
  const pendingPersistRef = useRef<PendingPersist | null>(null);

  const syncCloudEntry = useCallback((entry: HistoryEntry) => {
    if (!supabase || !cloudSignedIn) return;
    void pushHistoryEntry(entry).catch((err) => {
      console.error(`Error al sincronizar el mapa ${entry.id} en la nube:`, err);
    });
  }, [cloudSignedIn]);

  const flushPendingSessionPersist = useCallback(() => {
    const pending = pendingPersistRef.current;
    if (!pending) return;

    if (saveStepTimerRef.current) {
      clearTimeout(saveStepTimerRef.current);
      saveStepTimerRef.current = null;
    }

    const currentStore = historyStoreRef.current;
    const entry = currentStore.entries.find((e) => e.id === pending.id);
    if (!entry) {
      pendingPersistRef.current = null;
      return;
    }

    if (
      entry.session.currentStep === pending.step &&
      entry.session.isComplete === pending.isComplete &&
      entry.session.viewAll === pending.viewAll
    ) {
      pendingPersistRef.current = null;
      return;
    }

    const now = Date.now();
    const entries = currentStore.entries.map((item) => {
      if (item.id !== pending.id) return item;

      const updatedSession = {
        ...item.session,
        currentStep: pending.step,
        isComplete: pending.isComplete,
        viewAll: pending.viewAll,
      };

      return {
        ...item,
        updatedAt: now,
        session: updatedSession,
      };
    });

    const updatedStore = {
      ...currentStore,
      entries,
    };

    commitHistoryStore(updatedStore);

    const updatedEntry = updatedStore.entries.find((e) => e.id === pending.id);
    if (updatedEntry) {
      syncCloudEntry(updatedEntry);
    }

    pendingPersistRef.current = null;
  }, [syncCloudEntry, commitHistoryStore]);

  const persistSessionState = useCallback((step: number, complete: boolean, viewAllMode: boolean) => {
    const scheduledActiveId = historyStoreRef.current.activeId;
    if (!scheduledActiveId) return;

    // Si hay una persistencia pendiente para otro mapa, la forzamos de inmediato
    if (pendingPersistRef.current && pendingPersistRef.current.id !== scheduledActiveId) {
      flushPendingSessionPersist();
    }

    pendingPersistRef.current = {
      id: scheduledActiveId,
      step,
      isComplete: complete,
      viewAll: viewAllMode,
    };

    if (saveStepTimerRef.current) {
      clearTimeout(saveStepTimerRef.current);
    }

    saveStepTimerRef.current = setTimeout(() => {
      flushPendingSessionPersist();
    }, 800);
  }, [flushPendingSessionPersist]);

  useEffect(() => {
    return () => {
      flushPendingSessionPersist();
    };
  }, [flushPendingSessionPersist]);

  useEffect(() => {
    historyStoreRef.current = historyStore;
  }, [historyStore]);

  const openAuthSheet = useCallback(() => {
    pendingAuthRef.current = true;
    setHistoryOpen(false);
  }, []);

  const revealPendingAuth = useCallback(() => {
    if (!pendingAuthRef.current) return;
    pendingAuthRef.current = false;
    setAuthOpen(true);
  }, []);

  useEffect(() => {
    if (historyOpen || !pendingAuthRef.current) return;
    revealPendingAuth();
  }, [historyOpen, revealPendingAuth]);

  useEffect(() => {
    if (!supabase) return;

    const hydrateCloudHistory = async (user: Parameters<typeof toCloudUserProfile>[0] | null) => {
      const profile = user ? toCloudUserProfile(user) : null;
      setCloudUserEmail(profile?.email ?? null);
      setCloudUserAvatarUrl(profile?.avatarUrl ?? null);
      if (!profile?.email) return;
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
        setError('No se pudo sincronizar el historial. Tus mapas locales siguen disponibles.');
      }
    };

    void supabase.auth
      .getSession()
      .then(({ data: sessionData }) => hydrateCloudHistory(sessionData.session?.user ?? null));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      void hydrateCloudHistory(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  // Eliminado el useEffect de sincronización global masiva para favorecer sync selectivo

  const goToStep = useCallback((idx: number, fromViewAll = false) => {
    setIsComplete(false);
    setCurrentStep(idx);
    const nextViewAll = fromViewAll ? false : viewAll;
    if (fromViewAll) setViewAll(false);
    persistSessionState(idx, false, nextViewAll);
    stepHaptic();
  }, [persistSessionState, viewAll]);

  const syncReadingStep = useCallback((step: number) => {
    setCurrentStep((prev) => {
      if (prev === step) return prev;
      persistSessionState(step, isComplete, viewAll);
      return step;
    });
  }, [persistSessionState, isComplete, viewAll]);

  const toggleViewMode = useCallback(() => {
    const nextViewAll = !viewAll;
    setViewAll(nextViewAll);
    setIsComplete(false);
    persistSessionState(currentStep, false, nextViewAll);
    stepHaptic();
  }, [currentStep, persistSessionState, viewAll]);

  const dismissTransformIncomplete = useCallback(() => {
    setTransformIncomplete(false);
  }, []);

  const failTransform = useCallback(
    (message: string, partialShown: boolean, sourceKind: TransformSourceKind) => {
      if (partialShown) {
        setTransformIncomplete(true);
        setPhase('result');
      } else {
        const friendly = friendlyTransformError(message, sourceKind);
        setError(friendly);
        setTransformIncomplete(false);
        setPhase('input');
      }

      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    },
    []
  );

  const handleCancelLoading = useCallback(() => {
    transformCancelledRef.current = true;
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setIsStreamGenerating(false);

    if (partialShownRef.current) {
      setTransformIncomplete(true);
      setPhase('result');
    } else {
      setData(null);
      setTransformIncomplete(false);
      setPhase('input');
    }

    partialShownRef.current = false;
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
      stepHaptic();
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
      stepHaptic();
    } catch (err) {
      handleAttachmentError(err);
    }
  }, [handleAttachmentError]);

  const handlePickFile = useCallback(async () => {
    setAttachMenuOpen(false);
    try {
      const result = await pickFileAttachment();
      if (!result) return;

      if ('textContent' in result) {
        setUploadedFile(result.file);
        setInputText(result.textContent);
      } else {
        setUploadedFile(result);
        if (result.isPdf || result.isVideo) setInputText('');
      }

      setError(null);
      stepHaptic();
    } catch (err) {
      handleAttachmentError(err);
    }
  }, [handleAttachmentError]);

  const removeUploadedFile = useCallback(() => {
    setUploadedFile(null);
    if (uploadedFile?.isPdf || uploadedFile?.isVideo) setInputText('');
  }, [uploadedFile?.isPdf, uploadedFile?.isVideo]);

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
    setTransformIncomplete(false);
    setAttachMenuOpen(false);
    transformCancelledRef.current = false;
    partialShownRef.current = false;

    const controller = new AbortController();
    abortControllerRef.current = controller;
    const sourceKind = resolveTransformSourceKind(uploadedFile, urlDetection);
    let hasShownPartial = false;

    try {
      const mapId = generateMapId();
      const existingCategories = collectUserCategories(historyStoreRef.current.entries);
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
          depth: depthPreference,
          outputLanguage: 'es',
          sourceLabel,
          mapId,
        };
      } else if (uploadedFile?.isVideo && uploadedFile.fileData) {
        body = {
          type: 'video',
          fileData: uploadedFile.fileData,
          mimeType: uploadedFile.mimeType || 'video/mp4',
          preferredModel: modelPreference,
          intent,
          depth: depthPreference,
          outputLanguage: 'es',
          sourceLabel,
          mapId,
        };
        if (inputText.trim()) body.text = inputText.trim();
      } else if (uploadedFile?.isImage && uploadedFile.fileData) {
        body = {
          type: 'image',
          fileData: uploadedFile.fileData,
          mimeType: uploadedFile.mimeType || 'image/jpeg',
          preferredModel: modelPreference,
          intent,
          depth: depthPreference,
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
          depth: depthPreference,
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
          depth: depthPreference,
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
          depth: depthPreference,
          outputLanguage: 'es',
          sourceLabel,
          mapId,
        };
      }

      body.existingCategories = existingCategories;

      const accessToken = supabase
        ? (await supabase.auth.getSession()).data.session?.access_token
        : undefined;
      const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined;

      setIsStreamGenerating(true);

      const saveCompletedMap = (normalized: ActionMapData) => {
        const session = {
          data: normalized,
          currentStep: 0,
          isComplete: false,
          viewAll: false,
        };

        const currentStore = historyStoreRef.current;
        const updatedStore = createEntry(currentStore, session, toSourceType(body.type), mapId);
        commitHistoryStore(updatedStore);

        const createdEntry = updatedStore.entries.find((item) => item.id === mapId);
        if (createdEntry) {
          syncCloudEntry(createdEntry);
        }

        setData(normalized);
        setCurrentStep(0);
        setIsComplete(false);
        setViewAll(false);
        setUploadedFile(null);
        setInputText('');
        setPhase('result');
        setTransformIncomplete(false);
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      };

      await fetchTransformWithProgress({
        streamUrl: apiUrl('/api/transform/stream'),
        fallbackUrl: apiUrl('/api/transform'),
        body,
        headers,
        signal: controller.signal,
        handlers: {
          onPartial: (partialMap) => {
            if (!hasShownPartial) {
              hasShownPartial = true;
              partialShownRef.current = true;
              setPhase('result');
              setCurrentStep(0);
              setIsComplete(false);
              setViewAll(false);
            }
            setData(partialMap);
          },
          onDone: (finalMap) => {
            saveCompletedMap(finalMap);
          },
          onError: (message) => {
            throw new Error(message);
          },
        },
      });
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        if (transformCancelledRef.current) {
          if (partialShownRef.current) {
            setTransformIncomplete(true);
            setPhase('result');
          } else {
            setData(null);
            setTransformIncomplete(false);
            setPhase('input');
          }
          partialShownRef.current = false;
          return;
        }
        failTransform(TRANSFORM_IDLE_TIMEOUT_MESSAGE, hasShownPartial, sourceKind);
        return;
      }

      const rawMessage =
        err instanceof Error ? err.message : 'No se pudo procesar el contenido.';
      failTransform(rawMessage, hasShownPartial, sourceKind);
    } finally {
      setIsStreamGenerating(false);
      abortControllerRef.current = null;
    }
  }, [depthPreference, failTransform, inputText, intent, modelPreference, uploadedFile, syncCloudEntry, commitHistoryStore]);

  const handleNewMap = useCallback(() => {
    flushPendingSessionPersist();
    const currentStore = historyStoreRef.current;
    const updatedStore = setActiveId(currentStore, null);
    commitHistoryStore(updatedStore);
    setInputText('');
    setUploadedFile(null);
    setAttachMenuOpen(false);
    setData(null);
    setError(null);
    setTransformIncomplete(false);
    setCurrentStep(0);
    setIsComplete(false);
    setViewAll(false);
    setHistoryOpen(false);
    setChatOpen(false);
    setEssentialsReview(false);
    setPhase('input');
  }, [commitHistoryStore, flushPendingSessionPersist]);

  const handleSignOut = useCallback(async () => {
    flushPendingSessionPersist();
    // 1. Cerrar drawers y overlays
    setHistoryOpen(false);
    setChatOpen(false);
    setAuthOpen(false);

    // 2. Limpiar estados del mapa y UI
    setData(null);
    setInputText('');
    setUploadedFile(null);
    setPhase('input');
    setError(null);
    setTransformIncomplete(false);
    setCurrentStep(0);
    setIsComplete(false);
    setViewAll(false);

    // 3. Limpiar variables de la nube
    setCloudUserEmail(null);
    setCloudUserAvatarUrl(null);

    // 4. Purgar historial local de mapas en disco y memoria de forma segura
    const emptyStore = { entries: [], activeId: null };
    commitHistoryStore(emptyStore);

    // 5. Ejecutar signOut remoto
    try {
      await signOut();
    } catch (err) {
      console.error('Error al cerrar sesión remota:', err);
      throw err;
    }
  }, [commitHistoryStore, flushPendingSessionPersist]);

  const handleSelectHistory = useCallback(
    (id: string) => {
      flushPendingSessionPersist();
      const currentStore = historyStoreRef.current;
      const entry = currentStore.entries.find((e) => e.id === id);
      if (!entry) return;

      const normalized = normalizeMapData(entry.session.data);
      if (!normalized) return;

      const updatedStore = setActiveId(currentStore, id);
      commitHistoryStore(updatedStore);

      setData(normalized);
      setIntent(normalized.intent ?? 'understand');
      setCurrentStep(entry.session.currentStep);
      setIsComplete(entry.session.isComplete ?? false);
      setViewAll(entry.session.viewAll ?? false);
      setHistoryOpen(false);
      setChatOpen(false);
      setEssentialsReview(false);
      setPhase('result');
      setError(null);
      setTransformIncomplete(false);
      stepHaptic();
    },
    [commitHistoryStore, flushPendingSessionPersist]
  );

  const handleDeleteHistory = useCallback(
    (id: string) => {
      const currentStore = historyStoreRef.current;
      const wasActive = currentStore.activeId === id;

      const updatedStore = deleteEntry(currentStore, id);
      commitHistoryStore(updatedStore);

      if (supabase && cloudSignedIn) {
        void deleteCloudHistoryEntry(id).catch((err) => {
          console.error('No se pudo eliminar el mapa en la nube.', err);
          setError('No se pudo eliminar el mapa en la nube.');
        });
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
    [commitHistoryStore, cloudSignedIn]
  );

  const handleRenameHistory = useCallback((id: string, title: string) => {
    const currentStore = historyStoreRef.current;
    const updatedStore = renameEntry(currentStore, id, title);
    commitHistoryStore(updatedStore);

    const updatedEntry = updatedStore.entries.find((item) => item.id === id);
    if (updatedEntry) {
      syncCloudEntry(updatedEntry);
    }

    stepHaptic();
  }, [syncCloudEntry, commitHistoryStore]);

  const handleUpdateEntryCategory = useCallback(
    (id: string, category: string) => {
      const currentStore = historyStoreRef.current;
      const updatedStore = updateEntryCategory(currentStore, id, category);
      commitHistoryStore(updatedStore);

      const updatedEntry = updatedStore.entries.find((item) => item.id === id);
      if (updatedEntry) {
        syncCloudEntry(updatedEntry);
      }

      if (historyStoreRef.current.activeId === id) {
        setData((current) => (current ? { ...current, category } : current));
      }
      stepHaptic();
    },
    [syncCloudEntry, commitHistoryStore]
  );

  const handleUpdateCategory = useCallback(
    (category: string) => {
      const activeId = historyStoreRef.current.activeId;
      if (!activeId) return;
      handleUpdateEntryCategory(activeId, category);
    },
    [handleUpdateEntryCategory]
  );

  const handlePinHistory = useCallback((id: string) => {
    const currentStore = historyStoreRef.current;
    const updatedStore = togglePinEntry(currentStore, id);
    commitHistoryStore(updatedStore);

    const updatedEntry = updatedStore.entries.find((item) => item.id === id);
    if (updatedEntry) {
      syncCloudEntry(updatedEntry);
    }

    stepHaptic();
  }, [syncCloudEntry, commitHistoryStore]);

  const handleCompleteMap = useCallback(() => {
    setIsComplete(true);
    setEssentialsReview(false);
    persistSessionState(currentStep, true, viewAll);
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    stepHaptic();
  }, [currentStep, persistSessionState, viewAll]);

  const handleDownloadPdf = useCallback(async () => {
    const mapId = historyStore.activeId;
    if (!data || !mapId) return;

    try {
      const response = await fetch(apiUrl(`/api/maps/${mapId}/cheatsheet.pdf`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ map: data }),
      });

      if (!response.ok) {
        const err = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(err?.error || 'No se pudo generar la ficha.');
      }

      const arrayBuffer = await response.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      let binary = '';
      const chunkSize = 0x8000;
      for (let i = 0; i < bytes.length; i += chunkSize) {
        binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
      }
      const base64 = globalThis.btoa(binary);
      const filename = `${data.title || 'nucleo-cheatsheet'}.pdf`.replace(/[^\w.-]+/g, '-');
      const directory = cacheDirectory;
      if (!directory) throw new Error('No se pudo acceder al almacenamiento local.');
      const uri = `${directory}${filename}`;
      await writeAsStringAsync(uri, base64, {
        encoding: EncodingType.Base64,
      });

      await Share.share({
        url: uri,
        title: filename,
        message: filename,
      });
      stepHaptic();
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'No se pudo generar la ficha PDF.');
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, [data, historyStore.activeId]);

  const value = useMemo(
    () => ({
      phase,
      setPhase,
      inputText,
      setInputText,
      intent,
      setIntent,
      error,
      setError,
      data,
      historyStore,
      currentStep,
      isComplete,
      viewAll,
      historyOpen,
      setHistoryOpen,
      openHistoryDrawer,
      closeHistoryDrawer,
      toggleHistoryDrawer,
      chatOpen,
      setChatOpen,
      authOpen,
      setAuthOpen,
      openAuthSheet,
      cloudUserEmail,
      cloudUserAvatarUrl,
      cloudSignedIn,
      isCloudSyncConfigured,
      uploadedFile,
      attachMenuOpen,
      setAttachMenuOpen,
      modelPreference,
      setModelPreference,
      depthPreference,
      setDepthPreference,
      totalSteps,
      canSubmit,
      hideTextInput,
      composerPlaceholder,
      progressLabel,
      stepProgress,
      goToStep,
      syncReadingStep,
      toggleViewMode,
      handleCancelLoading,
      handlePickImage,
      handlePickCamera,
      handlePickFile,
      removeUploadedFile,
      handleTransform,
      handleNewMap,
      handleSelectHistory,
      handleDeleteHistory,
      handleRenameHistory,
      handleUpdateCategory,
      handleUpdateEntryCategory,
      handlePinHistory,
      handleCompleteMap,
      essentialsReview,
      setEssentialsReview,
      handleDownloadPdf,
      isStreamGenerating,
      transformIncomplete,
      dismissTransformIncomplete,
      handleSignOut,
    }),
    [
      phase,
      inputText,
      intent,
      error,
      data,
      historyStore,
      currentStep,
      isComplete,
      viewAll,
      historyOpen,
      setHistoryOpen,
      openHistoryDrawer,
      closeHistoryDrawer,
      toggleHistoryDrawer,
      chatOpen,
      authOpen,
      openAuthSheet,
      cloudUserEmail,
      cloudUserAvatarUrl,
      cloudSignedIn,
      uploadedFile,
      attachMenuOpen,
      modelPreference,
      depthPreference,
      setDepthPreference,
      totalSteps,
      canSubmit,
      hideTextInput,
      composerPlaceholder,
      progressLabel,
      stepProgress,
      goToStep,
      syncReadingStep,
      toggleViewMode,
      handleCancelLoading,
      handlePickImage,
      handlePickCamera,
      handlePickFile,
      removeUploadedFile,
      handleTransform,
      handleNewMap,
      handleSelectHistory,
      handleDeleteHistory,
      handleRenameHistory,
      handleUpdateCategory,
      handleUpdateEntryCategory,
      handlePinHistory,
      handleCompleteMap,
      essentialsReview,
      handleDownloadPdf,
      isStreamGenerating,
      transformIncomplete,
      dismissTransformIncomplete,
      handleSignOut,
    ]
  );

  return <AppSessionContext.Provider value={value}>{children}</AppSessionContext.Provider>;
}

export function useAppSession() {
  const context = useContext(AppSessionContext);
  if (!context) throw new Error('useAppSession must be used within AppSessionProvider');
  return context;
}
