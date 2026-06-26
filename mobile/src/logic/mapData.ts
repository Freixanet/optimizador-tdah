import type { ActionMapData, CalloutLabel, MapStep, SourceReference, StepListItem } from './contracts';

const DEFAULT_CALLOUT_LABELS: Record<string, CalloutLabel> = {
  action: 'Para aplicarlo',
  info: 'Idea clave',
  alert: 'Precaución',
};

function normalizeReferences(input: unknown): SourceReference[] | undefined {
  if (!Array.isArray(input)) return undefined;

  const refs = input
    .map((ref) => {
      const r = ref as SourceReference;
      if (!r?.label || !r?.locator) return null;
      return {
        label: String(r.label),
        locator: String(r.locator),
        locatorKind: r.locatorKind,
        excerpt: r.excerpt ? String(r.excerpt) : undefined,
        note: r.note ? String(r.note) : undefined,
      };
    })
    .filter(Boolean) as SourceReference[];

  return refs.length ? refs : undefined;
}

export function normalizeMapData(input: unknown): ActionMapData | null {
  const raw = input as ActionMapData;
  if (!raw?.title || !Array.isArray(raw?.steps) || !Array.isArray(raw?.tldr)) return null;

  const normalizedSteps: MapStep[] = raw.steps.map((step, index) => ({
    id: String(step?.id || `step-${index + 1}`),
    shortNav: String(step?.shortNav || step?.title || `Paso ${index + 1}`),
    title: String(step?.title || `Paso ${index + 1}`),
    time: String(step?.time || '~3 min'),
    purpose: step?.purpose ? String(step.purpose) : undefined,
    content: Array.isArray(step?.content)
      ? step.content
          .map((block) => {
            const kindRaw = block?.kind ? String(block.kind) : undefined;
            const kind: 'action' | 'info' | 'alert' | undefined =
              kindRaw === 'action' || kindRaw === 'info' || kindRaw === 'alert' ? kindRaw : undefined;
            const items: StepListItem[] | undefined = Array.isArray(block?.items)
              ? (block.items
                  .map((item) =>
                    item?.strong
                      ? {
                          strong: String(item.strong),
                          span: item?.span ? String(item.span) : undefined,
                        }
                      : null
                  )
                  .filter(Boolean) as StepListItem[])
              : undefined;

            return {
              type: String(block?.type || 'prose') as 'prose' | 'callout' | 'list',
              text: String(block?.text || '').trim(),
              kind,
              label: block?.label
                ? (String(block.label) as CalloutLabel)
                : DEFAULT_CALLOUT_LABELS[String(block?.kind || 'info')] || 'Idea clave',
              items,
              references: normalizeReferences(block?.references),
            };
          })
          .filter((block) => block.text || block.items?.length)
      : [],
    references: normalizeReferences(step?.references),
  }));

  return {
    title: String(raw.title),
    category: raw.category ? String(raw.category) : undefined,
    intent: raw.intent === 'study' || raw.intent === 'apply' ? raw.intent : 'understand',
    outputLanguage: raw.outputLanguage ? String(raw.outputLanguage) : 'es',
    mapVersion: Number.isFinite(raw.mapVersion) ? Number(raw.mapVersion) : 2,
    sourceMetadata: raw.sourceMetadata,
    coverage: raw.coverage,
    coreIdea: String(raw.coreIdea || ''),
    coreSupport: String(raw.coreSupport || ''),
    tldr: raw.tldr.map((item) => ({
      title: String(item?.title || ''),
      desc: String(item?.desc || ''),
    })),
    knowledgeSections: raw.knowledgeSections,
    steps: normalizedSteps,
    references: normalizeReferences(raw.references),
    completionCard: raw.completionCard,
    modelUsed: raw.modelUsed,
  };
}

export function isValidMap(data: unknown): data is ActionMapData {
  return normalizeMapData(data) !== null;
}
