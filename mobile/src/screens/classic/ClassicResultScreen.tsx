import React, { useCallback, useEffect, useMemo } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeOut,
  useSharedValue,
} from 'react-native-reanimated';
import {
  CheckCircle2,
  Clock,
  SquarePen,
} from 'lucide-react-native';
import AppIcon from '../../components/AppIcon';
import FloatingGlassButton from '../../components/FloatingGlassButton';
import ReadingProgressBar, { mapContentTopPadding } from '../../components/ReadingProgressBar';
import { useMapHeaderAutoHide } from '../../hooks/useMapHeaderAutoHide';
import SourceMetadataGlassCard from '../../components/SourceMetadataGlassCard';
import StepContentBlocks from '../../components/StepContentBlocks';
import StepFooterNav from '../../components/StepFooterNav';
import SourceCoverageCard from '../../components/SourceCoverageCard';
import KnowledgeSectionsList from '../../components/KnowledgeSectionsList';
import { useAppSession } from '../../context/AppSessionContext';
import { useViewAllScrollSpy } from '../../hooks/useViewAllScrollSpy';

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

const VIEW_ALL_SECTION_DIVIDER = 'pb-8 mb-8 border-b border-neutral-200 dark:border-white/10';
const VIEW_ALL_SECTION_BEFORE_COMPLETION = 'pb-8';
const VIEW_ALL_COMPLETION_SECTION = 'pt-8 pb-8 border-t border-neutral-200 dark:border-white/10';

export default function ClassicResultScreen() {
  const session = useAppSession();
  const { data } = session;

  const scrollProgress = useSharedValue(0);

  const hideProgressLine =
    !session.viewAll && !session.isComplete && session.currentStep === 0;

  const mapHeaderResetKey = session.viewAll
    ? `${session.viewAll}:${session.isComplete}`
    : `${session.viewAll}:${session.currentStep}:${session.isComplete}`;

  const syncReadingStep = useCallback(
    (step: number) => session.syncReadingStep(step),
    [session]
  );
  const { registerSectionLayout, handleScrollViewLayout, handleScroll, resetSpy } = useViewAllScrollSpy({
    enabled: session.viewAll && !session.isComplete,
    totalSteps: session.totalSteps,
    onStepChange: syncReadingStep,
  });

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

  const { scrollRef, headerVisible, handleMapMetaAnchorLayout, scrollHandler } = useMapHeaderAutoHide({
    hideProgressLine,
    mapKey: session.historyStore.activeId ?? 'none',
    resetKey: mapHeaderResetKey,
    scrollProgress,
    onScrollReport: reportScrollSpy,
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

  const stepKey = useMemo(() => {
    const parts = [
      session.viewAll ? 'view-all' : 'step-mode',
      session.isComplete ? 'complete' : 'active',
      session.isStreamGenerating ? 'stream' : 'idle',
    ];
    if (!session.viewAll && !session.isComplete) {
      parts.push(String(session.currentStep));
    }
    return parts.join(':');
  }, [session.currentStep, session.isComplete, session.isStreamGenerating, session.viewAll]);

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
            Núcleo
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

      {data.tldr?.length ? (
        <View className="mt-8 pt-8 border-t border-neutral-200 dark:border-white/10">
          <Text className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-6">
            Desglose Rápido (TL;DR)
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
        <StepContentBlocks blocks={step.content} />
      </Pressable>
    );
  };

  const renderCompletion = () => (
    <View className="py-10 items-center">
      <View className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-500/15 items-center justify-center mb-8">
        <CheckCircle2 size={40} color="#059669" />
      </View>
      <Text className="text-3xl font-extrabold text-neutral-900 dark:text-neutral-100 text-center">
        ¡Lo lograste!
      </Text>
      <Text className="mt-4 text-lg text-neutral-600 dark:text-neutral-400 text-center leading-7 px-4">
        Has completado los {session.totalSteps} pasos de este mapa de acción.
      </Text>
      <SourceCoverageCard
        coverage={data.coverage}
        limitations={data.sourceMetadata?.limitations}
        knowledgeSectionsCount={data.knowledgeSections?.length}
        className="mt-6 w-full"
      />
      <KnowledgeSectionsList sections={data.knowledgeSections} className="mt-6 w-full" />
      <View className="mt-10 w-full gap-3">
        <Pressable
          onPress={() => session.goToStep(0)}
          className="px-6 py-4 rounded-xl border border-neutral-200 dark:border-white/10 items-center"
        >
          <Text className="font-bold text-neutral-700 dark:text-neutral-300">Repasar desde el inicio</Text>
        </Pressable>
        <View className="items-center">
          <FloatingGlassButton
            onPress={session.handleNewMap}
            accessibilityLabel="Crear mapa"
            shape="pill"
            tone="accent"
          >
            <SquarePen size={18} color="#fff" />
            <Text className="text-[15px] font-bold text-white">Crear mapa</Text>
          </FloatingGlassButton>
        </View>
      </View>
    </View>
  );

  const renderViewAllCompletion = () => (
    <View className={`items-center ${VIEW_ALL_COMPLETION_SECTION}`}>
      <View className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-500/15 items-center justify-center mb-8">
        <CheckCircle2 size={40} color="#059669" />
      </View>
      <Text className="text-3xl font-extrabold text-neutral-900 dark:text-neutral-100 text-center">
        ¡Lo lograste!
      </Text>
      <Text className="mt-4 text-lg text-neutral-600 dark:text-neutral-400 text-center leading-7 px-4">
        Has completado los {session.totalSteps} pasos de este mapa de acción.
      </Text>
      <View className="mt-10 w-full items-center">
        <FloatingGlassButton
          onPress={session.handleCompleteMap}
          accessibilityLabel="Completar mapa"
          shape="pill"
          tone="accent"
        >
          <CheckCircle2 size={18} color="#fff" />
          <Text className="text-[15px] font-bold text-white">Completar mapa</Text>
        </FloatingGlassButton>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-neutral-50 dark:bg-neutral-900" edges={['top', 'left', 'right']}>
      <View className="flex-1 relative overflow-hidden">
      <ReadingProgressBar
        viewAll={session.viewAll}
        isComplete={session.isComplete}
        stepProgress={session.stepProgress}
        progressLabel={session.progressLabel}
        scrollProgressShared={scrollProgress}
        headerVisibleShared={headerVisible}
        hideProgressLine={hideProgressLine}
        onToggleSidebar={() => session.toggleHistoryDrawer()}
        onToggleViewMode={session.isComplete ? undefined : session.toggleViewMode}
      />

      <View className="flex-1">
        <Animated.ScrollView
          ref={scrollRef}
          className="flex-1"
          contentContainerClassName="px-5 pb-32"
          contentContainerStyle={{ paddingTop: mapContentTopPadding(hideProgressLine) }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={!isIntroStep}
          scrollEnabled={!session.historyOpen}
          onLayout={handleScrollViewLayout}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
        >
          <View className="mb-12">
            <View onLayout={handleMapMetaAnchorLayout} collapsable={false}>
              <Text className="text-xs font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                {data.title}
              </Text>
            </View>
          </View>

          <Animated.View
            key={stepKey}
            className="flex-1"
            entering={
              session.isStreamGenerating || session.viewAll ? undefined : FadeIn.duration(220)
            }
            exiting={session.viewAll ? undefined : FadeOut.duration(180)}
          >
            {session.isComplete ? (
              renderCompletion()
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

        <StepFooterNav completeLabel="Finalizar" />
      </View>
    </View>
    </SafeAreaView>
  );
}
