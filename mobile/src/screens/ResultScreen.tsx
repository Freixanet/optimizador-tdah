import React, { useCallback, useEffect, useMemo } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeOut,
  runOnJS,
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';
import {
  CheckCircle2,
  Clock,
  Download,
  MessageSquareText,
  SquarePen,
} from 'lucide-react-native';
import AppIcon from '../components/AppIcon';
import CompletionGlassButton from '../components/CompletionGlassButton';
import IncompleteTransformBanner from '../components/IncompleteTransformBanner';
import SessionErrorBanner from '../components/SessionErrorBanner';
import MapChatSheet from '../components/MapChatSheet';
import ReadingProgressBar from '../components/ReadingProgressBar';
import SourceMetadataGlassCard from '../components/SourceMetadataGlassCard';
import StepContentBlocks from '../components/StepContentBlocks';
import StepFooterNav from '../components/StepFooterNav';
import TakeawaysGlassCard from '../components/TakeawaysGlassCard';
import { stepHaptic, useAppSession } from '../context/AppSessionContext';
import { useViewAllScrollSpy } from '../hooks/useViewAllScrollSpy';
import { getIntentLabel, getSourceTypeLabel } from '@shared/categories';
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

const VIEW_ALL_SECTION_DIVIDER = 'pb-8 mb-8 border-b border-neutral-200 dark:border-white/10';
const VIEW_ALL_SECTION_BEFORE_COMPLETION = 'pb-8';
const VIEW_ALL_COMPLETION_SECTION = 'pt-8 pb-8 border-t border-neutral-200 dark:border-white/10';

export default function ResultScreen() {
  const session = useAppSession();
  const { data } = session;
  const scrollProgress = useSharedValue(0);
  const syncReadingStep = useCallback(
    (step: number) => session.syncReadingStep(step),
    [session]
  );
  const { registerSectionLayout, handleScrollViewLayout, handleScroll, resetSpy } = useViewAllScrollSpy({
    enabled: session.viewAll && !session.isComplete,
    totalSteps: session.totalSteps,
    onStepChange: syncReadingStep,
  });

  useEffect(() => {
    if (!session.viewAll) resetSpy();
  }, [resetSpy, session.viewAll]);

  useEffect(() => {
    if (!session.viewAll) {
      scrollProgress.value = 0;
    }
  }, [scrollProgress, session.viewAll]);

  const totalMinutes = useMemo(() => parseTotalMinutes(data?.steps), [data?.steps]);

  const reportScrollSpy = useCallback(
    (scrollY: number, contentHeight: number) => {
      if (!session.viewAll) return;
      handleScroll({
        nativeEvent: {
          contentOffset: { y: scrollY, x: 0 },
          contentSize: { height: contentHeight, width: 0 },
          layoutMeasurement: { height: 0, width: 0 },
        },
      } as NativeSyntheticEvent<NativeScrollEvent>);
    },
    [handleScroll, session.viewAll]
  );

  const scrollHandler = useAnimatedScrollHandler(
    {
      onScroll: (event) => {
        const maxScroll = event.contentSize.height - event.layoutMeasurement.height;
        scrollProgress.value =
          maxScroll <= 0 ? 1 : Math.min(1, Math.max(0, event.contentOffset.y / maxScroll));
        runOnJS(reportScrollSpy)(event.contentOffset.y, event.contentSize.height);
      },
    },
    [reportScrollSpy]
  );

  const stepKey = useMemo(() => {
    const parts = [
      session.viewAll ? 'view-all' : 'step-mode',
      session.isComplete ? 'complete' : 'active',
      session.essentialsReview ? 'essentials' : 'content',
      session.isStreamGenerating ? 'stream' : 'idle',
    ];
    // Step-by-step only: remount for fade between steps. View-all keeps one tree so
    // scroll-spy index updates do not remount liquid-glass surfaces.
    if (!session.viewAll && !session.isComplete) {
      parts.push(String(session.currentStep));
    }
    return parts.join(':');
  }, [
    session.currentStep,
    session.essentialsReview,
    session.isComplete,
    session.isStreamGenerating,
    session.viewAll,
  ]);

  if (!data) return null;

  const isIntroStep = !session.isComplete && !session.viewAll && session.currentStep === 0;

  const renderResumen = (interactive = false) => (
    <Pressable
      disabled={!interactive}
      onPress={interactive ? () => session.goToStep(0, true) : undefined}
      className={interactive ? VIEW_ALL_SECTION_DIVIDER : 'mb-8'}
    >
      <View className="flex-row items-center flex-wrap gap-x-3 gap-y-2 mb-4">
        <View className="flex-row items-center gap-2">
          <AppIcon size={20} />
          <Text className="text-sm font-bold tracking-widest uppercase text-neutral-900 dark:text-neutral-100">
            Idea central
          </Text>
        </View>
        {!session.isComplete && totalMinutes !== null ? (
          <View className="flex-row items-center gap-1.5">
            <Clock size={16} color="#4338ca" />
            <Text className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">
              ~{totalMinutes} min
            </Text>
          </View>
        ) : null}
      </View>
      <Text className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 leading-9">{data.coreIdea}</Text>
      {data.coreSupport ? (
        <Text className="mt-4 text-lg leading-7 text-neutral-700 dark:text-neutral-400">{data.coreSupport}</Text>
      ) : null}

      {data.sourceMetadata ? (
        <SourceMetadataGlassCard sourceMetadata={data.sourceMetadata} coverage={data.coverage} />
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

  const renderStep = (stepIndex: number, interactive = false, isLastStep = false) => {
    const step = data.steps[stepIndex - 1];
    if (!step) return null;

    const stepDividerClass = interactive
      ? isLastStep
        ? VIEW_ALL_SECTION_BEFORE_COMPLETION
        : VIEW_ALL_SECTION_DIVIDER
      : '';

    return (
      <Pressable
        key={step.id || stepIndex}
        disabled={!interactive}
        onPress={interactive ? () => session.goToStep(stepIndex, true) : undefined}
        className={stepDividerClass}
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
        {takeaways.length ? <TakeawaysGlassCard items={takeaways} /> : null}
        <View className="mt-10 flex-row flex-wrap gap-3" style={styles.completionActions}>
          <View style={styles.completionActionFullWidthSlot}>
            <CompletionGlassButton
              label="Volver al mapa completado"
              onPress={() => session.setEssentialsReview(false)}
            />
          </View>
          <View style={styles.completionActionFullWidthSlot}>
            <CompletionGlassButton
              label="Volver al inicio"
              onPress={() => {
                session.setEssentialsReview(false);
                session.goToStep(0);
              }}
            />
          </View>
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
      <TakeawaysGlassCard items={data.completionCard?.takeaways ?? []} />

      <View className="mt-10 flex-row flex-wrap gap-3" style={styles.completionActions}>
        {[
          {
            label: 'Repasar lo esencial',
            onPress: () => session.setEssentialsReview(true),
            fullWidth: true,
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
            label: 'Guardar ficha PDF',
            icon: Download,
            onPress: () => void session.handleDownloadPdf(),
          },
          {
            label: 'Volver al inicio',
            onPress: () => {
              session.setEssentialsReview(false);
              session.goToStep(0);
            },
          },
          {
            label: 'Nuevo mapa',
            icon: SquarePen,
            variant: 'accent' as const,
            onPress: session.handleNewMap,
            fullWidth: true,
          },
        ].map((action) => {
          const Icon = action.icon;
          return (
            <View
              key={action.label}
              style={action.fullWidth ? styles.completionActionFullWidthSlot : styles.completionActionSlot}
            >
              <CompletionGlassButton
                label={action.label}
                onPress={action.onPress}
                icon={Icon ? <Icon size={16} color={action.variant === 'accent' ? '#fff' : '#525252'} /> : undefined}
                variant={action.variant ?? 'neutral'}
              />
            </View>
          );
        })}
      </View>
    </View>
  );

  const renderViewAllCompletion = () => (
    <View className={VIEW_ALL_COMPLETION_SECTION}>
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
      <TakeawaysGlassCard items={data.completionCard?.takeaways ?? []} />
      <View className="mt-10" style={styles.completionActions}>
        <CompletionGlassButton
          label="Completar mapa"
          onPress={session.handleCompleteMap}
          icon={<CheckCircle2 size={16} color="#fff" />}
          variant="accent"
        />
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
        scrollProgressShared={scrollProgress}
        onToggleSidebar={() => session.toggleHistoryDrawer()}
        onToggleViewMode={session.isComplete ? undefined : session.toggleViewMode}
      />

      <SessionErrorBanner className="px-5" />

      <IncompleteTransformBanner />

      <View className="flex-1">
        <Animated.ScrollView
          className="flex-1"
          contentContainerClassName="px-5 py-5 pb-8"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={!isIntroStep}
          scrollEnabled={!session.historyOpen}
          onLayout={handleScrollViewLayout}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
        >
          <View className="mb-12">
            <Text className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500 dark:text-neutral-300">
              {data.title}
            </Text>
            <Text className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
              {[
                getSourceTypeLabel(
                  session.historyStore.entries.find(
                    (entry) => entry.id === session.historyStore.activeId
                  )?.sourceType ?? 'text',
                  data.sourceMetadata?.kind
                ),
                data.intent ? getIntentLabel(data.intent) : null,
              ]
                .filter(Boolean)
                .join(' · ')}
            </Text>
            {session.isStreamGenerating ? (
              <Text className="mt-2 text-xs font-semibold text-indigo-600 dark:text-indigo-300">
                Generando mapa…
              </Text>
            ) : null}
          </View>

          <Animated.View
            key={stepKey}
            entering={
              session.isStreamGenerating || session.viewAll ? undefined : FadeIn.duration(220)
            }
            exiting={session.viewAll ? undefined : FadeOut.duration(180)}
          >
            {session.isComplete ? (
              session.essentialsReview ? renderEssentialsReview() : renderCompletion()
            ) : session.viewAll ? (
              <>
                <View onLayout={(event) => registerSectionLayout(0, event)}>
                  {renderResumen(true)}
                </View>
                {data.steps.map((_, idx) => {
                  const stepIndex = idx + 1;
                  const isLastStep = stepIndex === session.totalSteps;
                  return (
                    <View
                      key={data.steps[idx]?.id ?? stepIndex}
                      onLayout={(event) => registerSectionLayout(stepIndex, event)}
                    >
                      {renderStep(stepIndex, true, isLastStep)}
                    </View>
                  );
                })}
                {renderViewAllCompletion()}
              </>
            ) : session.currentStep === 0 ? (
              renderResumen(false)
            ) : (
              renderStep(session.currentStep, false)
            )}
          </Animated.View>
        </Animated.ScrollView>

        <StepFooterNav />
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

const styles = StyleSheet.create({
  completionActions: {
    width: '100%',
  },
  completionActionSlot: {
    flexGrow: 1,
    flexShrink: 1,
    minWidth: '45%',
  },
  completionActionFullWidthSlot: {
    width: '100%',
  },
});
