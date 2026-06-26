import React from 'react';
import { View, useColorScheme } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Haptics from 'expo-haptics';

type NucleoIconProps = {
  className?: string;
  energized?: boolean;
  interactive?: boolean;
};

export default function NucleoIcon({
  energized = false,
  interactive = true,
}: NucleoIconProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleMessage = (event: any) => {
    if (event.nativeEvent.data === 'burst') {
      // Activa una respuesta táctica nativa (Haptics) al pulsar
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }
  };

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          -webkit-user-select: none;
          user-select: none;
        }
        body {
          background: transparent;
          overflow: hidden;
          width: 100vw;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          color: ${isDark ? '#EDEDED' : '#1A1A1A'};
        }
        .nucleo-wrapper {
          display: inline-flex;
          justify-content: center;
          align-items: center;
          width: 72px;
          height: 72px;
          padding: 8px;
          border: 0;
          background: transparent;
          color: currentColor;
          cursor: pointer;
          -webkit-tap-highlight-color: transparent;
          transition: transform 700ms cubic-bezier(0.16, 1, 0.3, 1);
        }
        .nucleo-wrapper.is-bursting {
          transform: scale(1.12);
        }
        .nucleo-wrapper.is-static {
          cursor: default;
          pointer-events: none;
        }
        .nucleo-svg {
          width: 56px;
          height: 56px;
          overflow: visible;
        }
        .nucleo-halo {
          fill: currentColor;
          opacity: 0.1;
        }
        .nucleo-core {
          fill: currentColor;
          animation: nucleo-core-pulse 2.8s ease-in-out infinite;
        }
        .nucleo-orbit {
          fill: none;
          stroke: currentColor;
          stroke-width: 3;
          stroke-linecap: round;
          opacity: 0.28;
        }
        .nucleo-energy-glow,
        .nucleo-energy {
          fill: none;
          stroke: currentColor;
          stroke-linecap: round;
          stroke-linejoin: round;
          stroke-dasharray: 2 1 4 1 6 1 6 1 4 1 2 162;
          animation-name: nucleo-energy-flow;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        .nucleo-energy-glow {
          stroke-width: 11;
          opacity: 0.22;
          filter: url(#energy-soft);
        }
        .nucleo-energy {
          stroke-width: 1.8;
          opacity: 0.62;
          filter: url(#energy-light);
        }
        .energy-1 .nucleo-energy,
        .energy-1 .nucleo-energy-glow {
          animation-duration: 3.9s;
        }
        .energy-2 .nucleo-energy,
        .energy-2 .nucleo-energy-glow {
          animation-duration: 5.4s;
          animation-delay: -1.1s;
        }
        .energy-2 .nucleo-energy-glow {
          opacity: 0.18;
        }
        .energy-3 .nucleo-energy,
        .energy-3 .nucleo-energy-glow {
          animation-duration: 6.8s;
          animation-delay: -2.2s;
          animation-direction: reverse;
        }
        .energy-3 .nucleo-energy-glow {
          opacity: 0.15;
        }
        .nucleo-wrapper.is-energized .nucleo-energy,
        .nucleo-wrapper.is-energized .nucleo-energy-glow {
          animation-duration: 1.15s;
        }
        .nucleo-burst-ring {
          fill: none;
          stroke: currentColor;
          stroke-width: 2;
          opacity: 0;
        }
        .nucleo-wrapper.is-bursting .nucleo-burst-ring {
          animation: nucleo-burst-ring 700ms cubic-bezier(0.16, 1, 0.3, 1);
        }
        .nucleo-wrapper.is-bursting .nucleo-core {
          animation: nucleo-core-burst 700ms cubic-bezier(0.16, 1, 0.3, 1);
        }
        .nucleo-wrapper.is-bursting .nucleo-energy,
        .nucleo-wrapper.is-bursting .nucleo-energy-glow {
          animation-duration: 1.15s;
        }
        @keyframes nucleo-core-pulse {
          0%, 100% { opacity: 0.72; }
          50% { opacity: 1; }
        }
        @keyframes nucleo-core-burst {
          0% { opacity: 0.84; }
          34% { opacity: 1; }
          100% { opacity: 0.84; }
        }
        @keyframes nucleo-energy-flow {
          from { stroke-dashoffset: 0; }
          to { stroke-dashoffset: -192; }
        }
        @keyframes nucleo-burst-ring {
          0% {
            opacity: 0.38;
            stroke-width: 2;
          }
          100% {
            opacity: 0;
            stroke-width: 0.75;
          }
        }
      </style>
    </head>
    <body>
      <div
        id="wrapper"
        class="nucleo-wrapper ${energized ? 'is-energized' : ''} ${interactive ? '' : 'is-static'}"
      >
        <svg viewBox="0 0 100 100" class="nucleo-svg" aria-hidden="true">
          <defs>
            <filter id="nucleo-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="2.2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="energy-soft" x="-120%" y="-120%" width="340%" height="340%">
              <feGaussianBlur stdDeviation="4.2" />
            </filter>
            <filter id="energy-light" x="-120%" y="-120%" width="340%" height="340%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="2.4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <circle cx="50" cy="50" r="18" class="nucleo-halo" />
          <circle cx="50" cy="50" r="25" class="nucleo-burst-ring" />

          <g>
            <ellipse cx="50" cy="50" rx="42" ry="14" class="nucleo-orbit" />
          </g>
          <g transform="rotate(60 50 50)">
            <ellipse cx="50" cy="50" rx="42" ry="14" class="nucleo-orbit" />
          </g>
          <g transform="rotate(120 50 50)">
            <ellipse cx="50" cy="50" rx="42" ry="14" class="nucleo-orbit" />
          </g>

          <g class="energy-1">
            <ellipse cx="50" cy="50" rx="42" ry="14" class="nucleo-energy-glow" />
            <ellipse cx="50" cy="50" rx="42" ry="14" class="nucleo-energy" />
          </g>
          <g class="energy-2" transform="rotate(60 50 50)">
            <ellipse cx="50" cy="50" rx="42" ry="14" class="nucleo-energy-glow" />
            <ellipse cx="50" cy="50" rx="42" ry="14" class="nucleo-energy" />
          </g>
          <g class="energy-3" transform="rotate(120 50 50)">
            <ellipse cx="50" cy="50" rx="42" ry="14" class="nucleo-energy-glow" />
            <ellipse cx="50" cy="50" rx="42" ry="14" class="nucleo-energy" />
          </g>

          <circle cx="50" cy="50" r="7" class="nucleo-core" filter="url(#nucleo-glow)" />
        </svg>
      </div>

      <script>
        const wrapper = document.getElementById('wrapper');
        let timeout = null;

        if (${interactive}) {
          wrapper.addEventListener('click', () => {
            if (timeout) clearTimeout(timeout);
            wrapper.classList.add('is-bursting');
            
            // Notify React Native to trigger haptics
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage('burst');
            }

            timeout = setTimeout(() => {
              wrapper.classList.remove('is-bursting');
            }, 700);
          });
        }
      </script>
    </body>
    </html>
  `;

  return (
    <View style={{ width: 72, height: 72 }}>
      <WebView
        originWhitelist={['*']}
        source={{ html }}
        style={{ backgroundColor: 'transparent' }}
        scrollEnabled={false}
        overScrollMode="never"
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        onMessage={handleMessage}
      />
    </View>
  );
}
