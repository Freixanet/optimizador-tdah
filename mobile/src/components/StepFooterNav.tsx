import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowRight, Check } from 'lucide-react-native';
import StepFooterGlassButton from './StepFooterGlassButton';
import { useAppSession } from '../context/AppSessionContext';

type StepFooterNavProps = {
  completeLabel?: string;
};

export default function StepFooterNav({ completeLabel = 'Completar mapa' }: StepFooterNavProps) {
  const session = useAppSession();
  const showStepFooter = !session.viewAll && !session.isComplete;

  if (!showStepFooter) return null;

  return (
    <SafeAreaView
      edges={['bottom']}
      className="border-t border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-neutral-900"
    >
      <View className="py-4 px-7">
        {session.currentStep === 0 ? (
          <StepFooterGlassButton
            variant="primary"
            label="Empezar a leer"
            onPress={() => session.goToStep(1)}
            icon={<ArrowRight size={20} color="#fff" />}
          />
        ) : (
          <View className="flex-row gap-3" style={styles.row}>
            <View style={styles.backSlot}>
              <StepFooterGlassButton
                variant="secondary"
                label="Atrás"
                onPress={() => session.goToStep(session.currentStep - 1)}
              />
            </View>
            <View style={styles.forwardSlot}>
              {session.currentStep < session.totalSteps ? (
                <StepFooterGlassButton
                  variant="primary"
                  label="Siguiente"
                  onPress={() => session.goToStep(session.currentStep + 1)}
                  icon={<ArrowRight size={20} color="#fff" />}
                />
              ) : (
                <StepFooterGlassButton
                  variant="primary"
                  label={completeLabel}
                  onPress={session.handleCompleteMap}
                  icon={<Check size={20} color="#fff" />}
                  iconPlacement="leading"
                />
              )}
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  row: {
    width: '100%',
  },
  backSlot: {
    flex: 1,
    minWidth: 0,
  },
  forwardSlot: {
    flex: 2,
    minWidth: 0,
  },
});
