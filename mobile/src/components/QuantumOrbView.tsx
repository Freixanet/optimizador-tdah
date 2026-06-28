import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Platform, StyleSheet, View, type ViewStyle } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import { Asset } from 'expo-asset';

/** Bump when orb.html is rebuilt so WebView reloads fresh content. */
const ORB_HTML_VERSION = 7;

type QuantumOrbViewProps = {
  size?: number;
  interactive?: boolean;
  style?: ViewStyle;
};

async function resolveOrbSource(interactive: boolean): Promise<{ uri: string; readAccessDir?: string }> {
  const asset = Asset.fromModule(require('../../assets/orb/orb.html'));
  await asset.downloadAsync();
  const baseUri = asset.localUri ?? asset.uri;
  if (!baseUri) {
    throw new Error('Quantum orb HTML asset is missing.');
  }
  const params = new URLSearchParams({ v: String(ORB_HTML_VERSION) });
  if (interactive) params.set('interactive', '1');
  const uri = `${baseUri}${baseUri.includes('?') ? '&' : '?'}${params.toString()}`;
  const readAccessDir =
    Platform.OS === 'ios' && baseUri.startsWith('file://')
      ? baseUri.slice(0, baseUri.lastIndexOf('/') + 1)
      : undefined;
  return { uri, readAccessDir };
}

export function QuantumOrbView({ size = 220, interactive = false, style }: QuantumOrbViewProps) {
  const webRef = useRef<WebView>(null);
  const [orbUri, setOrbUri] = useState<string | null>(null);
  const [readAccessDir, setReadAccessDir] = useState<string | undefined>();
  const [loadError, setLoadError] = useState(false);
  const pointerEvents = interactive ? 'box-none' : 'none';

  useEffect(() => {
    let mounted = true;
    void resolveOrbSource(interactive)
      .then(({ uri, readAccessDir: dir }) => {
        if (mounted) {
          setOrbUri(uri);
          setReadAccessDir(dir);
        }
      })
      .catch(() => {
        if (mounted) setLoadError(true);
      });
    return () => {
      mounted = false;
    };
  }, [interactive]);

  const setPaused = useCallback((paused: boolean) => {
    webRef.current?.injectJavaScript(`window.__setOrbPaused?.(${paused}); true;`);
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      setPaused(state !== 'active');
    });
    return () => {
      subscription.remove();
      setPaused(true);
    };
  }, [setPaused]);

  const onLoadEnd = useCallback(() => {
    if (AppState.currentState === 'active') {
      setPaused(false);
    }
  }, [setPaused]);

  const onMessage = useCallback((_event: WebViewMessageEvent) => {
    // Reserved for future orb ↔ native bridge; no navigation or remote calls.
  }, []);

  if (loadError || !orbUri) {
    return <View style={[styles.shell, { width: size, height: size }, style]} />;
  }

  return (
    <View
      style={[styles.shell, { width: size, height: size }, style]}
      pointerEvents={pointerEvents}
      collapsable={false}
    >
      <WebView
        key={`orb-${ORB_HTML_VERSION}-${interactive ? 'on' : 'off'}`}
        ref={webRef}
        source={{ uri: orbUri }}
        style={[styles.webview, { width: size, height: size }]}
        scrollEnabled={false}
        bounces={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        originWhitelist={['*']}
        javaScriptEnabled
        domStorageEnabled={false}
        incognito
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        androidLayerType="hardware"
        setSupportMultipleWindows={false}
        overScrollMode="never"
        nestedScrollEnabled={false}
        pointerEvents="auto"
        allowingReadAccessToURL={readAccessDir}
        onLoadEnd={onLoadEnd}
        onError={() => setLoadError(true)}
        onMessage={onMessage}
        allowsBackForwardNavigationGestures={false}
        {...(Platform.OS === 'ios'
          ? {
              dataDetectorTypes: 'none' as const,
              allowsLinkPreview: false,
              contentInsetAdjustmentBehavior: 'never' as const,
            }
          : null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  webview: {
    backgroundColor: 'transparent',
  },
});

export default QuantumOrbView;
