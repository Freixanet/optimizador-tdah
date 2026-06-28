import React, { useMemo } from 'react';
import { View } from 'react-native';
import {
  Blur,
  Canvas,
  Circle,
  Group,
  LinearGradient,
  Path,
  RadialGradient,
  Skia,
  vec,
} from '@shopify/react-native-skia';
import type { SkPath } from '@shopify/react-native-skia';
import {
  getLiquidGlassOrbIntensityScale,
  getLiquidGlassOrbPalette,
  type LiquidGlassOrbProps,
} from './liquidGlassOrbShared';

export type LiquidGlassOrbSkiaProps = LiquidGlassOrbProps;

function makeOvalPath(centerX: number, centerY: number, width: number, height: number): SkPath {
  const path = Skia.Path.Make();
  path.addOval({
    x: centerX - width / 2,
    y: centerY - height / 2,
    width,
    height,
  });
  return path;
}

function rotatePath(path: SkPath, centerX: number, centerY: number, rotationDeg: number): SkPath {
  if (rotationDeg === 0) return path;
  const rotated = path.copy();
  const matrix = Skia.Matrix();
  matrix.translate(centerX, centerY);
  matrix.rotate((rotationDeg * Math.PI) / 180);
  matrix.translate(-centerX, -centerY);
  rotated.transform(matrix);
  return rotated;
}

function makeCircleClip(cx: number, cy: number, radius: number): SkPath {
  const path = Skia.Path.Make();
  path.addCircle(cx, cy, radius);
  return path;
}

type RefractionBand = {
  centerX: number;
  centerY: number;
  width: number;
  height: number;
  rotation: number;
  strokeWidth: number;
  color: string;
  opacity: number;
  blur: number;
};

export function LiquidGlassOrbSkia({
  size = 156,
  variant = 'purple',
  intensity = 'balanced',
  style,
}: LiquidGlassOrbSkiaProps) {
  const palette = useMemo(() => getLiquidGlassOrbPalette(variant), [variant]);
  const scale = useMemo(() => getLiquidGlassOrbIntensityScale(intensity), [intensity]);

  const s = size;
  const cx = s / 2;
  const cy = s / 2;
  const orbR = s * 0.39;
  const glowR = s * 0.48;
  const clipR = orbR * 0.92;

  const orbClip = useMemo(() => makeCircleClip(cx, cy, clipR), [clipR, cx, cy]);

  const refractionBands = useMemo<RefractionBand[]>(
    () => [
      {
        centerX: cx - s * 0.035,
        centerY: cy - s * 0.105,
        width: s * 0.42,
        height: s * 0.105,
        rotation: -16,
        strokeWidth: Math.max(1, s * 0.007),
        color: 'rgba(255,255,255,0.20)',
        opacity: 0.28,
        blur: s * 0.012,
      },
      {
        centerX: cx + s * 0.075,
        centerY: cy + s * 0.075,
        width: s * 0.34,
        height: s * 0.08,
        rotation: 20,
        strokeWidth: Math.max(1, s * 0.006),
        color: variant === 'purple' ? 'rgba(221,214,254,0.18)' : 'rgba(255,255,255,0.16)',
        opacity: 0.22,
        blur: s * 0.014,
      },
      {
        centerX: cx - s * 0.095,
        centerY: cy + s * 0.155,
        width: s * 0.25,
        height: s * 0.055,
        rotation: -10,
        strokeWidth: Math.max(1, s * 0.005),
        color: 'rgba(255,255,255,0.14)',
        opacity: 0.18,
        blur: s * 0.016,
      },
    ],
    [cx, cy, s, variant]
  );

  const bandPaths = useMemo(
    () =>
      refractionBands.map((band) =>
        rotatePath(makeOvalPath(band.centerX, band.centerY, band.width, band.height), cx, cy, band.rotation)
      ),
    [cx, cy, refractionBands]
  );

  const topGlossPath = useMemo(
    () =>
      rotatePath(makeOvalPath(cx - s * 0.04, cy - s * 0.19, s * 0.35, s * 0.095), cx, cy, -11),
    [cx, cy, s]
  );

  return (
    <View
      style={[{ width: size, height: size, backgroundColor: 'transparent' }, style]}
      pointerEvents="none"
    >
      <Canvas style={{ width: size, height: size }}>
        {/* 1 — outer glow */}
        <Group>
          <Circle cx={cx} cy={cy} r={glowR} opacity={0.7 * scale}>
            <RadialGradient
              c={vec(cx, cy)}
              r={glowR}
              colors={[palette.glowA, palette.glowB, 'rgba(0,0,0,0)']}
              positions={[0, 0.54, 1]}
            />
            <Blur blur={s * 0.055} />
          </Circle>
        </Group>

        {/* 2 — back glass volume */}
        <Circle cx={cx} cy={cy} r={orbR} opacity={0.88 * scale}>
          <RadialGradient
            c={vec(cx - s * 0.15, cy - s * 0.17)}
            r={s * 0.56}
            colors={[
              palette.glassHot,
              palette.glassLight,
              palette.glassMid,
              palette.glassDeep,
              palette.glassDark,
            ]}
            positions={[0, 0.18, 0.46, 0.76, 1]}
          />
        </Circle>

        {/* 3 — inner depth shadow */}
        <Circle cx={cx} cy={cy + s * 0.105} r={orbR * 0.88} opacity={0.34 * scale}>
          <RadialGradient
            c={vec(cx, cy + s * 0.17)}
            r={orbR}
            colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.08)', palette.shadow]}
            positions={[0, 0.58, 1]}
          />
        </Circle>

        {/* 4 — liquid refraction bands */}
        <Group clip={orbClip}>
          {bandPaths.map((bandPath, index) => {
            const band = refractionBands[index];
            return (
              <Group key={`band-${index}`}>
                <Path
                  path={bandPath}
                  style="stroke"
                  strokeWidth={band.strokeWidth}
                  color={band.color}
                  opacity={band.opacity * scale}
                  strokeCap="round"
                >
                  <Blur blur={band.blur} />
                </Path>
              </Group>
            );
          })}
        </Group>

        {/* 5 — fresnel rim */}
        <Circle
          cx={cx}
          cy={cy}
          r={orbR}
          style="stroke"
          strokeWidth={Math.max(1, s * 0.006)}
          opacity={0.5 * scale}
        >
          <LinearGradient
            start={vec(cx - orbR, cy - orbR)}
            end={vec(cx + orbR, cy + orbR)}
            colors={[palette.rimA, palette.rimB, palette.rimC, 'rgba(255,255,255,0.32)']}
            positions={[0, 0.35, 0.68, 1]}
          />
        </Circle>

        <Circle
          cx={cx}
          cy={cy}
          r={orbR * 0.94}
          style="stroke"
          strokeWidth={Math.max(1, s * 0.003)}
          color="rgba(255,255,255,0.16)"
          opacity={0.42 * scale}
        />

        {/* 6 — specular highlights */}
        <Group>
          <Circle cx={cx - s * 0.135} cy={cy - s * 0.155} r={s * 0.095} opacity={0.54 * scale}>
            <RadialGradient
              c={vec(cx - s * 0.15, cy - s * 0.17)}
              r={s * 0.105}
              colors={[palette.highlight, palette.highlightSoft, 'rgba(255,255,255,0)']}
              positions={[0, 0.42, 1]}
            />
            <Blur blur={s * 0.006} />
          </Circle>
        </Group>

        <Circle cx={cx + s * 0.135} cy={cy - s * 0.2} r={s * 0.032} opacity={0.38 * scale}>
          <RadialGradient
            c={vec(cx + s * 0.128, cy - s * 0.208)}
            r={s * 0.036}
            colors={['rgba(255,255,255,0.58)', 'rgba(255,255,255,0.12)', 'rgba(255,255,255,0)']}
            positions={[0, 0.48, 1]}
          />
        </Circle>

        {/* 7 — top gloss veil */}
        <Group>
          <Path path={topGlossPath} opacity={0.22 * scale}>
            <LinearGradient
              start={vec(cx - s * 0.175, cy - s * 0.235)}
              end={vec(cx + s * 0.095, cy - s * 0.145)}
              colors={['rgba(255,255,255,0.28)', 'rgba(255,255,255,0.06)', 'rgba(255,255,255,0)']}
              positions={[0, 0.5, 1]}
            />
            <Blur blur={s * 0.014} />
          </Path>
        </Group>
      </Canvas>
    </View>
  );
}

export default LiquidGlassOrbSkia;
