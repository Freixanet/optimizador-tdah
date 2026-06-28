import React from 'react';
import { Text, View } from 'react-native';
import { AlertTriangle, CheckCircle2, Info, type LucideIcon } from 'lucide-react-native';
import type { CalloutLabel, StepContentBlock } from '../logic/contracts';

const DEFAULT_CALLOUT_LABELS: Record<string, CalloutLabel> = {
  action: 'Para aplicarlo',
  info: 'Idea clave',
  alert: 'Precaución',
};

const CALLOUT_ICONS: Record<string, LucideIcon> = {
  action: CheckCircle2,
  info: Info,
  alert: AlertTriangle,
};

const CALLOUT_ICON_COLOR: Record<string, string> = {
  action: '#6366f1',
  info: '#a3a3a3',
  alert: '#d97706',
};

type StepContentBlocksProps = {
  blocks: StepContentBlock[];
};

function BlockReferences({ references }: { references?: StepContentBlock['references'] }) {
  if (!references?.length) return null;

  return (
    <View className="mt-3 flex-row flex-wrap gap-2">
      {references.slice(0, 3).map((reference, idx) => (
        <View
          key={`${reference.label}-${reference.locator}-${idx}`}
          className="rounded-full border border-neutral-300 dark:border-white/12 px-2.5 py-1"
        >
          <Text className="text-[11px] font-medium text-neutral-600 dark:text-neutral-300">
            <Text className="text-neutral-400 dark:text-neutral-500">{reference.label} </Text>
            {reference.locator}
          </Text>
        </View>
      ))}
    </View>
  );
}

function renderBlock(block: StepContentBlock, idx: number) {
  const type = String(block.type || 'prose').toLowerCase();
  const textContent = block.text || '';

  if (type === 'callout') {
    const kind = String(block.kind || 'info').toLowerCase();
    const label = String(block.label || DEFAULT_CALLOUT_LABELS[kind] || 'Idea clave');
    const Icon = CALLOUT_ICONS[kind] || Info;
    const iconColor = CALLOUT_ICON_COLOR[kind] || CALLOUT_ICON_COLOR.info;

    return (
      <View
        key={idx}
        className="my-6 rounded-2xl bg-neutral-100/80 dark:bg-white/[0.04] px-4 py-4"
      >
        <View className="flex-row items-center gap-2">
          <Icon size={14} color={iconColor} />
          <Text className="text-[11px] font-bold uppercase tracking-[0.16em] text-neutral-500 dark:text-neutral-400">
            {label}
          </Text>
        </View>
        {textContent ? (
          <Text className="mt-2 text-base leading-7 text-neutral-800 dark:text-neutral-200">{textContent}</Text>
        ) : null}
        <BlockReferences references={block.references} />
      </View>
    );
  }

  if (type === 'list') {
    return (
      <View key={idx} className="my-6">
        {textContent ? (
          <Text className="text-base leading-7 text-neutral-800 dark:text-neutral-200 mb-4">{textContent}</Text>
        ) : null}
        {block.items?.map((item, i) => (
          <View key={i} className="flex-row gap-3 items-start mb-4">
            <View className="w-2 h-2 rounded-full bg-indigo-500 mt-2.5 shrink-0" />
            <Text className="flex-1 text-base leading-7 text-neutral-800 dark:text-neutral-200">
              <Text className="font-bold text-neutral-900 dark:text-neutral-100">{item.strong}</Text>
              {item.span ? (
                <Text className="text-neutral-700 dark:text-neutral-300"> {item.span}</Text>
              ) : null}
            </Text>
          </View>
        ))}
        <BlockReferences references={block.references} />
      </View>
    );
  }

  if (!textContent.trim()) return null;

  return (
    <View key={idx} className="my-4">
      <Text className="text-base leading-7 text-neutral-800 dark:text-neutral-200">{textContent}</Text>
      <BlockReferences references={block.references} />
    </View>
  );
}

export default function StepContentBlocks({ blocks }: StepContentBlocksProps) {
  if (!blocks.length) return null;

  return <View>{blocks.map((block, idx) => renderBlock(block, idx))}</View>;
}
