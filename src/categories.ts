export const CATEGORIES = [
  'Tecnología',
  'Negocios',
  'Productividad',
  'Ciencia',
  'Salud',
  'Finanzas',
  'Educación',
  'Desarrollo personal',
  'Otros',
] as const;

export type Category = (typeof CATEGORIES)[number];

export const DEFAULT_CATEGORY: Category = 'Otros';

export function normalizeCategory(value: unknown): Category {
  if (typeof value === 'string' && (CATEGORIES as readonly string[]).includes(value)) {
    return value as Category;
  }
  return DEFAULT_CATEGORY;
}
