import './global.css';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { bootstrapStorage } from './src/shims/localStorage';
import ComprensionApp from './src/screens/ComprensionApp';

export default function App() {
  const [ready, setReady] = useState(false);
  const [bootError, setBootError] = useState<string | null>(null);

  useEffect(() => {
    bootstrapStorage()
      .then(() => setReady(true))
      .catch((error) => {
        console.error(error);
        setBootError('No se pudo inicializar el almacenamiento local.');
        setReady(true);
      });
  }, []);

  if (!ready) {
    return (
      <View className="flex-1 bg-neutral-50 dark:bg-neutral-900 items-center justify-center">
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      {bootError ? (
        <View className="flex-1 items-center justify-center px-6 bg-neutral-50 dark:bg-neutral-900">
          <Text className="text-center text-neutral-700 dark:text-neutral-200">{bootError}</Text>
        </View>
      ) : (
        <ComprensionApp />
      )}
    </SafeAreaProvider>
  );
}
