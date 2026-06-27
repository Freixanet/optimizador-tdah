import React, { useMemo, useState } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  SquarePen,
} from 'lucide-react-native';
import AppIcon from '../../components/AppIcon';
import ReadingProgressBar from '../../components/ReadingProgressBar';
import StepContentBlocks from '../../components/StepContentBlocks';
import { useAppSession } from '../../context/AppSessionContext';

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

export default function ClassicResultScreen() {
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
    () => `${session.currentStep}-${session.viewAll}-${session.isComplete}`,
    [session.currentStep, session.isComplete, session.viewAll]
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
          El Nucleo
        </Text>
      </View>
      <Text className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 leading-9">{data.coreIdea}</Text>
      {data.coreSupport ? (
        <Text className="mt-4 text-lg leading-7 text-neutral-700 dark:text-neutral-400">{data.coreSupport}</Text>
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
      <View className="mt-10 w-full gap-3">
        <Pressable
          onPress={() => session.goToStep(0)}
          className="px-6 py-4 rounded-xl border border-neutral-200 dark:border-white/10 items-center"
        >
          <Text className="font-bold text-neutral-700 dark:text-neutral-300">Repasar desde el inicio</Text>
        </Pressable>
        <Pressable
          onPress={session.handleNewMap}
          className="px-6 py-4 rounded-xl bg-indigo-600 active:bg-indigo-700 flex-row items-center justify-center gap-2"
        >
          <SquarePen size={20} color="#fff" />
          <Text className="font-bold text-white">Nuevo mapa</Text>
        </Pressable>
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
            <Text className="text-xs font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
              {data.title}
            </Text>
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
              renderCompletion()
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
                    <Text className="text-white font-bold text-lg">Finalizar</Text>
                  </Pressable>
                )}
              </View>
            )}
            </View>
          </SafeAreaView>
        ) : null}
      </View>
    </SafeAreaView>
  );
}
