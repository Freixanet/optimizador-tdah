import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { MessageSquareText, X } from 'lucide-react-native';
import { apiUrl } from '../logic/apiBase';
import type { ActionMapData, ChatTurn, MapChatResponse } from '../logic/contracts';
import { supabase } from '../logic/supabase';
import GlassSurface from './GlassSurface';
import { fetchWithTimeout } from '../logic/network';

type MapChatSheetProps = {
  visible: boolean;
  onClose: () => void;
  mapId: string;
  mapData: ActionMapData;
};

type ParsedAssistantTurn = {
  answer: string;
  citations: MapChatResponse['citations'];
  limitations: MapChatResponse['limitations'];
};

function parseStoredAssistantText(text: string): ParsedAssistantTurn {
  const sourcesIndex = text.indexOf('\n\nFuentes:');
  const limitsIndex = text.indexOf('\n\nLímites:');

  if (sourcesIndex === -1 && limitsIndex === -1) {
    return { answer: text, citations: [], limitations: [] };
  }

  const answerEnd = [sourcesIndex, limitsIndex].filter((index) => index >= 0).sort((a, b) => a - b)[0] ?? text.length;
  const answer = text.slice(0, answerEnd).trim();
  const citations: NonNullable<MapChatResponse['citations']> = [];
  const limitations: string[] = [];

  if (sourcesIndex >= 0) {
    const sourcesBlock = text.slice(
      sourcesIndex + '\n\nFuentes:'.length,
      limitsIndex >= 0 ? limitsIndex : undefined
    );
    for (const line of sourcesBlock.split('\n')) {
      const trimmed = line.replace(/^-\s*/, '').trim();
      if (!trimmed) continue;
      const [labelPart, rest] = trimmed.split(':');
      const label = labelPart?.trim() || 'Fuente';
      const locator = rest?.trim() || '';
      const excerptIndex = locator.indexOf(' — ');
      if (excerptIndex >= 0) {
        citations.push({
          label,
          locator: locator.slice(0, excerptIndex).trim(),
          excerpt: locator.slice(excerptIndex + 3).trim(),
        });
      } else {
        citations.push({ label, locator });
      }
    }
  }

  if (limitsIndex >= 0) {
    const limitsBlock = text.slice(limitsIndex + '\n\nLímites:'.length);
    for (const line of limitsBlock.split('\n')) {
      const trimmed = line.replace(/^-\s*/, '').trim();
      if (trimmed) limitations.push(trimmed);
    }
  }

  return { answer, citations, limitations };
}

function formatAssistantText(reply: MapChatResponse): string {
  const citationText = reply.citations?.length
    ? `\n\nFuentes:\n${reply.citations
        .map(
          (citation) =>
            `- ${citation.label}: ${citation.locator}${citation.excerpt ? ` — ${citation.excerpt}` : ''}`
        )
        .join('\n')}`
    : '';
  const limitationsText = reply.limitations?.length
    ? `\n\nLímites:\n${reply.limitations.map((item) => `- ${item}`).join('\n')}`
    : '';

  return `${reply.answer}${citationText}${limitationsText}`.trim();
}

function AssistantBubble({ text }: { text: string }) {
  const parsed = parseStoredAssistantText(text);

  return (
    <View className="self-start max-w-[92%] mb-4 rounded-[20px] px-4 py-3 bg-neutral-100 dark:bg-white/5">
      <Text className="text-sm leading-relaxed text-neutral-800 dark:text-neutral-200">{parsed.answer}</Text>
      {parsed.citations?.length ? (
        <View className="mt-3 pt-3 border-t border-neutral-200/80 dark:border-white/10">
          <Text className="text-[11px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-2">
            Fuentes
          </Text>
          {parsed.citations.map((citation, index) => (
            <View
              key={`${citation.label}-${citation.locator}-${index}`}
              className="mb-2 rounded-[20px] border border-neutral-200 dark:border-white/10 px-3 py-2"
            >
              <Text className="text-xs font-semibold text-neutral-700 dark:text-neutral-200">
                {citation.label}: {citation.locator}
              </Text>
              {citation.excerpt ? (
                <Text className="mt-1 text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
                  {citation.excerpt}
                </Text>
              ) : null}
            </View>
          ))}
        </View>
      ) : null}
      {parsed.limitations?.length ? (
        <View className="mt-3 pt-3 border-t border-neutral-200/80 dark:border-white/10">
          <Text className="text-[11px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-2">
            Límites
          </Text>
          {parsed.limitations.map((item, index) => (
            <Text key={`${item}-${index}`} className="text-xs leading-relaxed text-neutral-600 dark:text-neutral-400 mb-1">
              • {item}
            </Text>
          ))}
        </View>
      ) : null}
    </View>
  );
}

export default function MapChatSheet({ visible, onClose, mapId, mapData }: MapChatSheetProps) {
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatTurn[]>([]);
  const [chatBusy, setChatBusy] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    setChatHistory([]);
    setChatInput('');
    setChatError(null);
    setChatBusy(false);
  }, [mapId]);

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 80);
    return () => clearTimeout(timer);
  }, [chatHistory, chatBusy, visible]);

  const suggestedQuestions = [
    mapData.completionCard?.promptQuestion,
    '¿Qué no debería pasar por alto?',
    '¿Qué partes están más conectadas entre sí?',
  ]
    .filter(Boolean)
    .slice(0, 3) as string[];

  const handleSubmit = useCallback(
    async (presetQuestion?: string) => {
      const question = (presetQuestion || chatInput).trim();
      if (!question || chatBusy) return;

      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      const optimisticHistory: ChatTurn[] = [...chatHistory, { role: 'user', text: question }];
      setChatHistory(optimisticHistory);
      setChatInput('');
      setChatBusy(true);
      setChatError(null);

      try {
        const accessToken = supabase
          ? (await supabase.auth.getSession()).data.session?.access_token
          : undefined;

        const response = await fetchWithTimeout(
          apiUrl(`/api/maps/${mapId}/chat`),
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
            },
            body: JSON.stringify({
              map: mapData,
              question,
              history: optimisticHistory,
            }),
          },
          {
            timeoutMs: 25000,
            timeoutMessage: 'La respuesta está tardando demasiado. Inténtalo de nuevo.',
          }
        );

        const parsed = (await response.json()) as MapChatResponse & { error?: string };
        if (!response.ok) {
          throw new Error(parsed?.error || 'No se pudo responder a esta pregunta.');
        }

        setChatHistory((previous) => [
          ...previous,
          {
            role: 'assistant',
            text: formatAssistantText(parsed),
          },
        ]);
      } catch (err) {
        console.error(err);
        setChatError(err instanceof Error ? err.message : 'No se pudo responder a esta pregunta.');
      } finally {
        setChatBusy(false);
      }
    },
    [chatBusy, chatHistory, chatInput, mapData, mapId]
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1 bg-neutral-50 dark:bg-neutral-900" edges={['top', 'left', 'right']}>
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
        >
          <GlassSurface liquid borderRadius={0} liquidBorder="bottom">
            <View className="flex-row items-center justify-between px-5 py-4">
              <View className="flex-1 pr-3">
                <Text className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                  Preguntar sobre este mapa
                </Text>
                <Text className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
                  Responde solo con el contenido de esta lectura y sus referencias.
                </Text>
              </View>
              <Pressable
                onPress={onClose}
                className="w-9 h-9 rounded-full items-center justify-center bg-neutral-200/80 dark:bg-white/10"
                accessibilityLabel="Cerrar chat"
              >
                <X size={18} color="#737373" />
              </Pressable>
            </View>
          </GlassSurface>

          {suggestedQuestions.length > 0 ? (
            <View className="px-5 py-3 border-b border-neutral-200 dark:border-white/10">
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2">
                {suggestedQuestions.map((question) => (
                  <Pressable
                    key={question}
                    onPress={() => void handleSubmit(question)}
                    disabled={chatBusy}
                    className="rounded-full border border-neutral-200 dark:border-white/10 px-3 py-1.5 active:border-indigo-300 dark:active:border-indigo-500/40"
                  >
                    <Text className="text-sm text-neutral-700 dark:text-neutral-200">{question}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          ) : null}

          <ScrollView
            ref={scrollRef}
            className="flex-1"
            contentContainerClassName="px-5 py-5 pb-4"
            keyboardShouldPersistTaps="handled"
          >
            {chatHistory.length === 0 ? (
              <Text className="text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
                Puedes pedir una aclaración, una lectura más sintética o una explicación de un bloque
                concreto.
              </Text>
            ) : (
              chatHistory.map((turn, index) =>
                turn.role === 'user' ? (
                  <View
                    key={`${turn.role}-${index}`}
                    className="mb-4 self-end max-w-[85%] rounded-[20px] px-4 py-3 bg-indigo-600"
                  >
                    <Text className="text-sm leading-relaxed text-white">{turn.text}</Text>
                  </View>
                ) : (
                  <AssistantBubble key={`${turn.role}-${index}`} text={turn.text} />
                )
              )
            )}

            {chatBusy ? (
              <View className="self-start max-w-[92%] mb-4 rounded-[20px] px-4 py-3 bg-neutral-100 dark:bg-white/5 flex-row items-center gap-2">
                <ActivityIndicator size="small" color="#4f46e5" />
                <Text className="text-sm text-neutral-600 dark:text-neutral-300">Pensando…</Text>
              </View>
            ) : null}
          </ScrollView>

          <View className="px-5 py-4">
            <GlassSurface liquid borderRadius={20} className="rounded-[20px]">
              <View className="flex-row gap-3 items-end px-3 py-3">
                <TextInput
                  value={chatInput}
                  onChangeText={setChatInput}
                  placeholder="Haz una pregunta sobre este mapa…"
                  placeholderTextColor="#a3a3a3"
                  multiline
                  textAlignVertical="top"
                  editable={!chatBusy}
                  className="flex-1 min-h-[72px] max-h-32 rounded-[20px] border border-neutral-200/80 dark:border-white/10 px-4 py-3 text-sm text-neutral-900 dark:text-neutral-100 bg-white/70 dark:bg-neutral-900/40"
                />
                <Pressable
                  onPress={() => void handleSubmit()}
                  disabled={chatBusy || !chatInput.trim()}
                  className={`rounded-[20px] px-4 py-3 flex-row items-center gap-2 ${
                    chatBusy || !chatInput.trim()
                      ? 'bg-indigo-600/40'
                      : 'bg-indigo-600 active:bg-indigo-700'
                  }`}
                  accessibilityLabel="Enviar pregunta"
                >
                  <MessageSquareText size={16} color="#fff" />
                  <Text className="text-sm font-semibold text-white">
                    {chatBusy ? 'Pensando…' : 'Preguntar'}
                  </Text>
                </Pressable>
              </View>
              {chatError ? (
                <Text className="px-3 pb-3 text-sm text-amber-700 dark:text-amber-300">{chatError}</Text>
              ) : null}
            </GlassSurface>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}
