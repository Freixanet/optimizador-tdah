import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LoadingState from '../components/LoadingState';
import SessionErrorBanner from '../components/SessionErrorBanner';
import { useAppSession } from '../context/AppSessionContext';

export default function LoadingScreen() {
  const { handleCancelLoading, depthPreference } = useAppSession();

  return (
    <SafeAreaView className="flex-1 bg-neutral-50 dark:bg-neutral-900">
      <View className="px-4 pt-2">
        <SessionErrorBanner />
      </View>
      <LoadingState onCancel={handleCancelLoading} depth={depthPreference} />
    </SafeAreaView>
  );
}
