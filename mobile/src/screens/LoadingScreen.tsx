import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import LoadingState from '../components/LoadingState';
import { useAppSession } from '../context/AppSessionContext';

export default function LoadingScreen() {
  const { handleCancelLoading } = useAppSession();

  return (
    <SafeAreaView className="flex-1 bg-neutral-50 dark:bg-neutral-900">
      <LoadingState onCancel={handleCancelLoading} />
    </SafeAreaView>
  );
}
