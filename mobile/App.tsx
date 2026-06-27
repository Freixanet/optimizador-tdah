import './global.css';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Linking, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import AuthSheet from './src/components/AuthSheet';
import { AppSessionProvider, useAppSession } from './src/context/AppSessionContext';
import { AppVariantProvider } from './src/context/AppVariantContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { bootstrapStorage } from './src/shims/localStorage';
import { getAppVariant, switchAppVariant, type AppVariant } from './src/logic/appVariant';
import { completeOAuthRedirect } from './src/logic/cloudHistory';
import ComprensionApp from './src/screens/ComprensionApp';
import ClassicShell from './src/screens/classic/ClassicShell';

function AuthHost() {
  const session = useAppSession();

  return (
    <AuthSheet
      visible={session.authOpen}
      userEmail={session.cloudUserEmail}
      onClose={() => session.setAuthOpen(false)}
    />
  );
}

function AppShell() {
  const { isDark } = useTheme();
  const [appVariant, setAppVariant] = useState<AppVariant>(() => getAppVariant());

  const handleAuthRedirect = useCallback((url: string) => {
    void completeOAuthRedirect(url).catch((err) => {
      console.error('OAuth redirect failed', err);
    });
  }, []);

  useEffect(() => {
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleAuthRedirect(url);
    });
    void Linking.getInitialURL().then((url) => {
      if (url) handleAuthRedirect(url);
    });
    return () => subscription.remove();
  }, [handleAuthRedirect]);

  const handleVariantChange = useCallback((next: AppVariant) => {
    switchAppVariant(next, () => setAppVariant(next));
  }, []);

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <AppVariantProvider onVariantChange={handleVariantChange}>
        <AppSessionProvider key={appVariant}>
          {appVariant === 'classic' ? <ClassicShell /> : <ComprensionApp />}
          <AuthHost />
        </AppSessionProvider>
      </AppVariantProvider>
    </>
  );
}

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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        {bootError ? (
          <View className="flex-1 items-center justify-center px-6 bg-neutral-50 dark:bg-neutral-900">
            <Text className="text-center text-neutral-700 dark:text-neutral-200">{bootError}</Text>
          </View>
        ) : (
          <ThemeProvider>
            <AppShell />
          </ThemeProvider>
        )}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
