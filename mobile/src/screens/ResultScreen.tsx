import React, { useMemo, useState } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import {
  ArrowRight,
  Check,
  CheckCircle2,
  CircleAlert,
  Clock,
  Download,
  MessageSquareText,
  SquarePen,
} from 'lucide-react-native';
import AppIcon from '../components/AppIcon';
import MapChatSheet from '../components/MapChatSheet';
import ReadingProgressBar from '../components/ReadingProgressBar';
import StepContentBlocks from '../components/StepContentBlocks';
import { stepHaptic, useAppSession } from '../context/AppSessionContext';
import type { SourceReference } from '../logic/contracts';

function parseTotalMinutes(steps: Array<{ time?: string }> | undefined): number | null {
  if (!steps?.length) return null;
  let total = 0;
  let found = false;
  for (const step of steps) {
    const match = String(step.time || '').match(/(\d+)\s*min/i);
    if (match) {
      total += parseInt(match[1] ?? '0', 10);
      found = true;
    }
  }
  return found ? total : null;
}

function ReferencesChips({ references }: { references?: SourceReference[] }) {
  if (!references?.length) return null;

  return (
    <View className="mt-4 flex-row flex-wrap gap-2">
      {references.slice(0, 3).map((reference, idx) => (
        <View
          key={`${reference.label}-${reference.locator}-${idx}`}
          className="flex-row items-center gap-1.5 rounded-full border border-neutral-300 dark:border-white/12 px-2.5 py-1"
        >
          <Text className="text-[11px] font-medium text-neutral-400 dark:text-neutral-500">
            {reference.label}
          </Text>
          <Text className="text-[11px] font-medium text-neutral-600 dark:text-neutral-300">
            {reference.locator}
          </Text>
        </View>
      ))}
    </View>
  );
}

export default function ResultScreen() {
  const session = useAppSession();
  const { data } = session;
  const [scrollProgress, setScrollProgress] = useState(0);

  const showStepFooter = !session.viewAll && !session.isComplete;
  const totalMinutes = useMemo(() => parseTotalMinutes(data?.steps), [data?.steps]);

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!session.viewAll) return;
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const maxScroll = contentSize.height - layoutMeasurement.height;
    const ratio = maxScroll <= 0 ? 1 : Math.min(1, Math.max(0, contentOffset.y / maxScroll));
    setScrollProgress(ratio);
  };

  const stepKey = useMemo(
    () => `${session.currentStep}-${session.viewAll}-${session.isComplete}-${session.essentialsReview}`,
    [session.currentStep, session.essentialsReview, session.isComplete, session.viewAll]
  );

  if (!data) return null;

  const renderResumen = (interactive = false) => (
    <Pressable
      disabled={!interactive}
      onPress={interactive ? () => session.goToStep(0, true) : undefined}
      className={interactive ? 'mb-8 pb-8 border-b border-neutral-200 dark:border-white/10' : 'mb-8'}
    >
      <View className="flex-row items-center gap-2 mb-4">
        <AppIcon size={20} color="#1A1A1A" />
        <Text className="text-sm font-bold tracking-widest uppercase text-neutral-900 dark:text-neutral-100">
          Idea central
        </Text>
      </View>
      <Text className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 leading-9">{data.coreIdea}</Text>
      {data.coreSupport ? (
        <Text className="mt-4 text-lg leading-7 text-neutral-700 dark:text-neutral-400">{data.coreSupport}</Text>
      ) : null}

      {data.sourceMetadata ? (
        <View className="mt-8 rounded-2xl border border-neutral-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] px-5 py-4">
          <View className="flex-row flex-wrap items-center gap-2">
            <Text className="text-[11px] font-bold uppercase tracking-[0.16em] text-neutral-500 dark:text-neutral-400">
              Fuente detectada
            </Text>
            <Text className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
              {data.sourceMetadata.label}
            </Text>
          </View>
          {data.sourceMetadata.detected?.length ? (
            <View className="mt-3 flex-row flex-wrap gap-2">
              {data.sourceMetadata.detected.map((item, index) => (
                <View
                  key={`${item}-${index}`}
                  className="rounded-full bg-neutral-100 dark:bg-white/[0.05] px-2.5 py-1"
                >
                  <Text className="text-xs text-neutral-600 dark:text-neutral-300">{item}</Text>
                </View>
              ))}
            </View>
          ) : null}
          {data.coverage?.summary ? (
            <Text className="mt-3 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
              {data.coverage.summary}
            </Text>
          ) : null}
          {data.coverage?.notes?.length ? (
            <View className="mt-3 gap-2">
              {data.coverage.notes.slice(0, 3).map((note, index) => (
                <View key={`${note.label}-${index}`} className="flex-row gap-2">
                  <CircleAlert
                    size={16}
                    color={note.tone === 'warning' ? '#d97706' : '#a3a3a3'}
                    style={{ marginTop: 2 }}
                  />
                  <Text className="flex-1 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
                    <Text className="font-semibold text-neutral-800 dark:text-neutral-100">
                      {note.label}.{' '}
                    </Text>
                    {note.detail}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>
      ) : null}

      {data.references?.length ? (
        <View className="mt-6">
          <Text className="text-[11px] font-bold uppercase tracking-[0.16em] text-neutral-500 dark:text-neutral-400">
            Referencias visibles
          </Text>
          <ReferencesChips references={data.references} />
        </View>
      ) : null}

      {data.tldr?.length ? (
        <View className="mt-8 pt-8 border-t border-neutral-200 dark:border-white/10">
          <Text className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-6">
            En 60 segundos
          </Text>
          {data.tldr.map((item, i) => (
            <View key={i} className="flex-row gap-4 items-start mb-6">
              <View className="w-8 h-8 rounded-full border-2 border-neutral-200 dark:border-white/10 items-center justify-center">
                <Text className="text-sm font-bold text-neutral-400">{i + 1}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mb-2">
                  {item.title}
                </Text>
                <Text className="text-base leading-6 text-neutral-700 dark:text-neutral-300">{item.desc}</Text>
              </View>
            </View>
          ))}
        </View>
      ) : null}
    </Pressable>
  );

  const renderStep = (stepIndex: number, interactive = false) => {
    const step = data.steps[stepIndex - 1];
    if (!step) return null;

    return (
      <Pressable
        key={step.id || stepIndex}
        disabled={!interactive}
        onPress={interactive ? () => session.goToStep(stepIndex, true) : undefined}
        className={interactive ? 'mb-8 pb-8 border-b border-neutral-200 dark:border-white/10 last:border-0' : ''}
      >
        <View className="flex-row flex-wrap items-center gap-2 mb-4">
          <Text className="text-sm font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
            Paso {stepIndex} de {session.totalSteps}
          </Text>
          {step.time ? <Text className="text-sm text-neutral-500 dark:text-neutral-400">{step.time}</Text> : null}
        </View>
        <Text className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 leading-9 mb-4">{step.title}</Text>
        {step.purpose ? (
          <Text className="text-base leading-7 text-neutral-600 dark:text-neutral-300 mb-4">{step.purpose}</Text>
        ) : null}
        <StepContentBlocks blocks={step.content} />
        <ReferencesChips references={step.references} />
      </Pressable>
    );
  };

  const renderEssentialsReview = () => {
    const takeaways =
      data.completionCard?.takeaways?.length
        ? data.completionCard.takeaways
        : data.tldr?.map((item) => `${item.title}: ${item.desc}`) ?? [];

    return (
      <View className="py-6">
        <Text className="text-xs font-bold uppercase tracking-widest text-neutral-400">Repaso esencial</Text>
        <Text className="mt-6 text-2xl font-extrabold text-neutral-900 dark:text-neutral-100">{data.coreIdea}</Text>
        {takeaways.length ? (
          <View className="mt-8 rounded-3xl bg-white dark:bg-white/[0.03] px-5 py-5">
            <Text className="text-[11px] font-bold uppercase tracking-[0.16em] text-neutral-500 dark:text-neutral-400">
              Para recordar
            </Text>
            {takeaways.slice(0, 7).map((item, index) => (
              <View key={`${item}-${index}`} className="flex-row gap-3 mt-4">
                <View className="mt-2 h-1.5 w-1.5 rounded-full bg-indigo-500" />
                <Text className="flex-1 text-base leading-6 text-neutral-700 dark:text-neutral-200">{item}</Text>
              </View>
            ))}
          </View>
        ) : null}
        <View className="mt-10 flex-row flex-wrap gap-3">
          <Pressable
            onPress={() => session.setEssentialsReview(false)}
            className="px-5 py-3 rounded-2xl border border-neutral-200 dark:border-white/10"
          >
            <Text className="font-semibold text-neutral-700 dark:text-neutral-300">Volver al mapa completado</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              session.setEssentialsReview(false);
              session.goToStep(0);
            }}
            className="px-5 py-3 rounded-2xl border border-neutral-200 dark:border-white/10"
          >
            <Text className="font-semibold text-neutral-700 dark:text-neutral-300">Volver al inicio</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  const renderCompletion = () => (
    <View className="py-6">
      <View className="flex-row items-center gap-2 mb-4">
        <CheckCircle2 size={16} color="#4f46e5" />
        <Text className="text-xs font-bold uppercase tracking-widest text-neutral-400">Mapa completado</Text>
      </View>
      <Text className="text-3xl font-extrabold text-neutral-900 dark:text-neutral-100">
        {data.completionCard?.title || 'Has terminado esta lectura'}
      </Text>
      <Text className="mt-4 text-lg leading-7 text-neutral-600 dark:text-neutral-300">
        {data.completionCard?.summary || 'Aquí tienes lo esencial para retomarlo con rapidez.'}
      </Text>
      {data.completionCard?.takeaways?.length ? (
        <View className="mt-8 rounded-3xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-white/[0.03] px-5 py-5">
          <Text className="text-[11px] font-bold uppercase tracking-[0.16em] text-neutral-500 dark:text-neutral-400">
            Para recordar
          </Text>
          {data.completionCard.takeaways.slice(0, 7).map((item, index) => (
            <View key={`${item}-${index}`} className="flex-row gap-3 mt-4">
              <View className="mt-2 h-1.5 w-1.5 rounded-full bg-indigo-500" />
              <Text className="flex-1 text-base leading-6 text-neutral-700 dark:text-neutral-200">{item}</Text>
            </View>
          ))}
        </View>
      ) : null}

      <View className="mt-10 flex-row flex-wrap gap-3">
        {[
          {
            label: 'Repasar lo esencial',
            onPress: () => session.setEssentialsReview(true),
          },
          {
            label: 'Volver al inicio',
            onPress: () => {
              session.setEssentialsReview(false);
              session.goToStep(0);
            },
          },
          {
            label: 'Guardar ficha PDF',
            icon: Download,
            onPress: () => void session.handleDownloadPdf(),
          },
          {
            label: 'Preguntar',
            icon: MessageSquareText,
            onPress: () => {
              session.setChatOpen(true);
              stepHaptic();
            },
          },
          {
            label: 'Nuevo mapa',
            icon: SquarePen,
            primary: true,
            onPress: session.handleNewMap,
          },
        ].map((action) => {
          const Icon = action.icon;
          return (
            <Pressable
              key={action.label}
              onPress={action.onPress}
              className={`w-[48%] px-4 py-4 rounded-2xl flex-row items-center justify-center gap-2 ${
                action.primary
                  ? 'bg-indigo-600 active:bg-indigo-700'
                  : 'border border-neutral-200 dark:border-white/10'
              }`}
            >
              {Icon ? <Icon size={16} color={action.primary ? '#fff' : '#525252'} /> : null}
              <Text
                className={`font-semibold text-center ${
                  action.primary ? 'text-white' : 'text-neutral-700 dark:text-neutral-300'
                }`}
              >
                {action.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-neutral-50 dark:bg-neutral-900" edges={['top', 'left', 'right']}>
      <ReadingProgressBar
        viewAll={session.viewAll}
        isComplete={session.isComplete}
        stepProgress={session.stepProgress}
        progressLabel={session.progressLabel}
        scrollProgress={scrollProgress}
        onToggleSidebar={() => session.setHistoryOpen(true)}
        onToggleViewMode={session.isComplete ? undefined : session.toggleViewMode}
      />

      <View className="flex-1">
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-5 py-5 pb-8"
          keyboardShouldPersistTaps="handled"
          onScroll={onScroll}
          scrollEventThrottle={16}
        >
          <View className="mb-4">
            <Text className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500 dark:text-neutral-300">
              {data.title}
            </Text>
            {session.isStreamGenerating ? (
              <Text className="mt-2 text-xs font-semibold text-indigo-600 dark:text-indigo-300">
                Generando mapa…
              </Text>
            ) : null}
            {!session.isComplete && totalMinutes !== null ? (
              <View className="mt-2 flex-row items-center gap-1.5">
                <Clock size={16} color="#4338ca" />
                <Text className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">
                  ~{totalMinutes} min
                </Text>
              </View>
            ) : null}
          </View>

          <Animated.View key={stepKey} entering={FadeIn.duration(220)} exiting={FadeOut.duration(180)}>
            {session.isComplete ? (
              session.essentialsReview ? renderEssentialsReview() : renderCompletion()
            ) : session.viewAll ? (
              <>
                {renderResumen(true)}
                {data.steps.map((_, idx) => renderStep(idx + 1, true))}
              </>
            ) : session.currentStep === 0 ? (
              renderResumen(false)
            ) : (
              renderStep(session.currentStep, false)
            )}
          </Animated.View>
        </ScrollView>

        {showStepFooter ? (
          <SafeAreaView
            edges={['bottom']}
            className="border-t border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-neutral-900"
          >
            <View className="px-4 pt-4">
            {session.currentStep === 0 ? (
              <Pressable
                onPress={() => session.goToStep(1)}
                className="w-full bg-indigo-600 active:bg-indigo-700 py-4 rounded-xl flex-row items-center justify-center gap-2"
              >
                <Text className="text-white font-bold text-lg">Empezar a leer</Text>
                <ArrowRight size={20} color="#fff" />
              </Pressable>
            ) : (
              <View className="flex-row gap-3">
                <Pressable
                  onPress={() => session.goToStep(session.currentStep - 1)}
                  className="flex-1 py-4 rounded-xl border border-neutral-200 dark:border-white/10 items-center justify-center"
                >
                  <Text className="font-bold text-neutral-700 dark:text-neutral-300">Atrás</Text>
                </Pressable>
                {session.currentStep < session.totalSteps ? (
                  <Pressable
                    onPress={() => session.goToStep(session.currentStep + 1)}
                    className="flex-[2] bg-indigo-600 active:bg-indigo-700 py-4 rounded-xl flex-row items-center justify-center gap-2"
                  >
                    <Text className="text-white font-bold text-lg">Siguiente</Text>
                    <ArrowRight size={20} color="#fff" />
                  </Pressable>
                ) : (
                  <Pressable
                    onPress={session.handleCompleteMap}
                    className="flex-[2] bg-indigo-600 active:bg-indigo-700 py-4 rounded-xl flex-row items-center justify-center gap-2"
                  >
                    <Check size={20} color="#fff" />
                    <Text className="text-white font-bold text-lg">Completar mapa</Text>
                  </Pressable>
                )}
              </View>
            )}
            </View>
          </SafeAreaView>
        ) : null}
      </View>

      {session.historyStore.activeId ? (
        <MapChatSheet
          visible={session.chatOpen}
          onClose={() => session.setChatOpen(false)}
          mapId={session.historyStore.activeId}
          mapData={data}
        />
      ) : null}
    </SafeAreaView>
  );
}
