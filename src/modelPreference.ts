export const MODEL_OPTIONS = [
  { id: 'auto', label: 'Automático', hint: 'Mejor disponible' },
  { id: 'gemini-3.5-flash', label: 'Flash 3.5', hint: 'Máxima calidad' },
  { id: 'gemini-3-flash-preview', label: 'Flash Preview', hint: 'Equilibrado' },
  { id: 'gemini-3.1-flash-lite', label: 'Flash Lite', hint: 'Pruebas' },
] as const;

export type ModelPreference = (typeof MODEL_OPTIONS)[number]['id'];

const STORAGE_KEY = 'tdah-model-preference';

export function getInitialModelPreference(): ModelPreference {
  if (typeof window === 'undefined') return 'auto';
  const stored = localStorage.getItem(STORAGE_KEY);
  if (MODEL_OPTIONS.some((option) => option.id === stored)) {
    return stored as ModelPreference;
  }
  return 'auto';
}

export function saveModelPreference(value: ModelPreference): void {
  localStorage.setItem(STORAGE_KEY, value);
}
