import React, { useEffect, useState } from 'react';
import { AccessibilityInfo, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';
import ExactLiquidOrbWebView from './ExactLiquidOrbWebView';
import CompletionGlassButton from './CompletionGlassButton';

const PHASES = [
  'Leyendo la fuente',
  'Extrayendo señal',
  'Ordenando el mapa',
  'Preparando lectura',
] as const;

const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*+<>?';

function ScrambleText({ text, className }: { text: string; className?: string }) {
  const [state, setState] = useState({ currentTarget: text, display: text });

  // If prop changes, immediately set to a fully scrambled state to avoid flashing the answer
  if (state.currentTarget !== text) {
    const initialScramble = text
      .split('')
      .map((c) => (c === ' ' ? ' ' : SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)]))
      .join('');
    setState({ currentTarget: text, display: initialScramble });
  }

  useEffect(() => {
    let frameId: number;
    let index = 0;
    const originalText = text;

    const tick = () => {
      if (index >= originalText.length) {
        setState({ currentTarget: originalText, display: originalText });
        return;
      }

      setState((current) => {
        const nextChars = originalText.split('').map((char, i) => {
          if (i < index) return char;
          if (char === ' ') return ' ';
          return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
        });
        return { currentTarget: originalText, display: nextChars.join('') };
      });

      index += 1;
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [text]);

  return <Text className={className}>{state.display}</Text>;
}

function StepperDot({ active }: { active: boolean }) {
  const widthVal = useSharedValue(8);
  const opacityVal = useSharedValue(0.4);

  useEffect(() => {
    widthVal.value = withTiming(active ? 20 : 8, { duration: 250 });
    opacityVal.value = withTiming(active ? 1.0 : 0.4, { duration: 250 });
  }, [active, opacityVal, widthVal]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: widthVal.value,
    opacity: opacityVal.value,
  }));

  return (
    <Animated.View
      style={animatedStyle}
      className="h-2 rounded-full bg-indigo-600 dark:bg-indigo-400"
    />
  );
}

function PhaseStepper({ currentPhase, totalPhases }: { currentPhase: number; totalPhases: number }) {
  return (
    <View className="flex-row items-center justify-center gap-1.5 mt-4">
      {Array.from({ length: totalPhases }).map((_, i) => (
        <StepperDot key={i} active={i === currentPhase} />
      ))}
    </View>
  );
}

type LoadingStateProps = {
  onCancel: () => void;
};

export default function LoadingState({ onCancel }: LoadingStateProps) {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [delayStage, setDelayStage] = useState(0);

  useEffect(() => {
    void AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setPhaseIndex((current) => (current + 1) % PHASES.length);
    }, 3000); // Slightly longer interval so the scramble has time to shine
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setDelayStage(1);
    }, 10000);

    const timer2 = setTimeout(() => {
      setDelayStage(2);
    }, 18000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <View className="flex-1 justify-center px-6 pb-32 bg-neutral-50 dark:bg-neutral-900">
      <View className="w-full items-center mb-8">
        <View style={{ marginBottom: -30 }} className="z-10">
          <ExactLiquidOrbWebView size={96} reduceMotion={reduceMotion} />
        </View>
        <View className="z-20">
          <ScrambleText
            text={PHASES[phaseIndex]}
            className="text-sm font-semibold text-center text-indigo-600 dark:text-indigo-400 tracking-wider"
          />
          <PhaseStepper currentPhase={phaseIndex} totalPhases={PHASES.length} />

          <View style={{ height: 48, justifyContent: 'center', marginTop: 16 }} className="px-4">
            {delayStage === 1 && (
              <Text className="text-[12px] leading-[18px] text-center text-neutral-500 dark:text-neutral-400 font-medium">
                Está tardando un poco más de lo habitual. Puedes esperar unos segundos más.
              </Text>
            )}
            {delayStage === 2 && (
              <Text className="text-[12px] leading-[18px] text-center text-neutral-500 dark:text-neutral-400 font-medium">
                La fuente parece pesada. Núcleo sigue trabajando; también puedes cancelar e intentarlo con algo más breve.
              </Text>
            )}
          </View>
        </View>
      </View>

      <View className="w-40 self-center mt-4">
        <CompletionGlassButton
          label="Cancelar"
          onPress={onCancel}
          variant="neutral"
          accessibilityLabel="Cancelar carga"
        />
      </View>
    </View>
  );
}
