import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  LinearGradient,
  Path,
  RadialGradient,
  Stop,
} from 'react-native-svg';
import LiquidGlassSurface from './LiquidGlassSurface';
import { useTheme } from '../context/ThemeContext';
import { ATOM_SHADING, buildAtomRibbons } from '../logic/atomGeometry';

type AtomCanvasIconProps = {
  className?: string;
  size?: number;
};

export default function AtomCanvasIcon({ size = 112 }: AtomCanvasIconProps) {
  const { isDark } = useTheme();
  const gradientId = React.useId().replace(/:/g, '');
  const geometry = React.useMemo(() => buildAtomRibbons(size), [size]);
  const { cx, cy, coreR, haloR, sphereR, ribbons } = geometry;

  const base = isDark ? '129, 140, 248' : '79, 70, 229';
  const coreLight = isDark ? '#C7D2FE' : '#EEF0FF';
  const coreMid = isDark ? '#6366f1' : '#4f46e5';
  const coreDeep = isDark ? '#312e81' : '#3730a3';
  const orbitNearOpacity = isDark ? 0.92 : 0.88;
  const orbitFarOpacity = isDark ? 0.18 : 0.16;

  const shadowDx = size * ATOM_SHADING.projectedShadowDx;
  const shadowDy = size * ATOM_SHADING.projectedShadowDy;
  const projectedOpacity = isDark
    ? ATOM_SHADING.projectedShadowOpacity.dark
    : ATOM_SHADING.projectedShadowOpacity.light;
  const exteriorDropOpacity = isDark
    ? ATOM_SHADING.exteriorDropOpacity.dark
    : ATOM_SHADING.exteriorDropOpacity.light;
  const orbTint = isDark ? 'rgba(129, 140, 248, 0.14)' : 'rgba(255, 255, 255, 0.42)';

  const coreGradId = `atomCore-${gradientId}`;
  const coreOcclusionGradId = `atomCoreOcclusion-${gradientId}`;

  const sphereDiameter = sphereR * 2;
  const sphereLeft = cx - sphereR;
  const sphereTop = cy - sphereR;

  return (
    <View style={[styles.root, { width: size, height: size }]} collapsable={false}>
      {ATOM_SHADING.enableSphereVolume ? (
        <View
          pointerEvents="none"
          collapsable={false}
          style={[
            styles.orb,
            {
              left: sphereLeft,
              top: sphereTop,
              width: sphereDiameter,
              height: sphereDiameter,
              borderRadius: sphereR,
            },
          ]}
        >
          <LiquidGlassSurface
            style={{ width: sphereDiameter, height: sphereDiameter }}
            borderRadius={sphereR}
            variant="clear"
            tintColor={orbTint}
          >
            <View style={{ width: sphereDiameter, height: sphereDiameter }} />
          </LiquidGlassSurface>
        </View>
      ) : null}

      <View style={styles.svgLayer} collapsable={false}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <Defs>
            <RadialGradient id={`atomHalo-${gradientId}`} cx="50%" cy="50%" rx="50%" ry="50%">
              <Stop offset="0%" stopColor={`rgb(${base})`} stopOpacity={isDark ? 0.22 : 0.16} />
              <Stop offset="65%" stopColor={`rgb(${base})`} stopOpacity={0.04} />
              <Stop offset="100%" stopColor={`rgb(${base})`} stopOpacity={0} />
            </RadialGradient>

            <RadialGradient id={`atomExteriorShadow-${gradientId}`} cx="50%" cy="50%" rx="50%" ry="50%">
              <Stop
                offset="0%"
                stopColor={isDark ? 'rgb(0,0,0)' : 'rgb(30,27,75)'}
                stopOpacity={isDark ? 0.5 : 0.4}
              />
              <Stop offset="100%" stopColor="rgb(0,0,0)" stopOpacity={0} />
            </RadialGradient>

            <RadialGradient
              id={coreGradId}
              gradientUnits="objectBoundingBox"
              cx="36%"
              cy="30%"
              rx="72%"
              ry="72%"
            >
              <Stop offset="0%" stopColor={coreLight} stopOpacity={1} />
              <Stop offset="45%" stopColor={coreMid} stopOpacity={1} />
              <Stop offset="100%" stopColor={coreDeep} stopOpacity={1} />
            </RadialGradient>

            <RadialGradient
              id={coreOcclusionGradId}
              gradientUnits="objectBoundingBox"
              cx="68%"
              cy="72%"
              rx="55%"
              ry="55%"
            >
              <Stop offset="0%" stopColor={isDark ? 'rgb(15,15,35)' : 'rgb(30,27,75)'} stopOpacity={isDark ? 0.55 : 0.45} />
              <Stop offset="100%" stopColor="rgb(0,0,0)" stopOpacity={0} />
            </RadialGradient>

            {ribbons.map((ribbon, i) => (
              <LinearGradient
                key={`orbitGrad-${i}`}
                id={`orbitGrad-${i}-${gradientId}`}
                gradientUnits="userSpaceOnUse"
                x1={ribbon.grad.x1}
                y1={ribbon.grad.y1}
                x2={ribbon.grad.x2}
                y2={ribbon.grad.y2}
              >
                <Stop offset="0%" stopColor={`rgb(${base})`} stopOpacity={orbitFarOpacity} />
                <Stop offset="100%" stopColor={`rgb(${base})`} stopOpacity={orbitNearOpacity} />
              </LinearGradient>
            ))}
          </Defs>

          {ATOM_SHADING.enableSphereVolume && (
            <Ellipse
              cx={cx + sphereR * 0.12}
              cy={cy + sphereR * 0.62}
              rx={sphereR * 0.7}
              ry={sphereR * 0.2}
              fill={`url(#atomExteriorShadow-${gradientId})`}
              opacity={exteriorDropOpacity}
            />
          )}

          <Circle cx={cx} cy={cy} r={haloR} fill={`url(#atomHalo-${gradientId})`} />

          {ribbons.map((ribbon, i) => (
            <Path key={`back-${i}`} d={ribbon.backPath} fill={`url(#orbitGrad-${i}-${gradientId})`} />
          ))}

          {ATOM_SHADING.enableProjectedShadows &&
            ribbons.map((ribbon, i) => (
              <G key={`proj-${i}`} transform={`translate(${shadowDx}, ${shadowDy})`}>
                <Path d={ribbon.frontPath} fill={`rgba(0,0,0,${projectedOpacity})`} />
              </G>
            ))}

          {ribbons.map((ribbon, i) => (
            <Path key={`front-${i}`} d={ribbon.frontPath} fill={`url(#orbitGrad-${i}-${gradientId})`} />
          ))}

          <Circle cx={cx} cy={cy} r={coreR} fill={`url(#${coreGradId})`} />
          <Circle cx={cx} cy={cy} r={coreR} fill={`url(#${coreOcclusionGradId})`} />
          <Circle
            cx={cx - coreR * 0.3}
            cy={cy - coreR * 0.34}
            r={coreR * 0.36}
            fill={isDark ? 'rgba(255,255,255,0.42)' : 'rgba(255,255,255,0.68)'}
          />
        </Svg>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'relative',
  },
  orb: {
    position: 'absolute',
    overflow: 'hidden',
  },
  svgLayer: {
    ...StyleSheet.absoluteFill,
  },
});
