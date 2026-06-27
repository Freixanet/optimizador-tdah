import React from 'react';
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
import { useTheme } from '../context/ThemeContext';
import { ATOM_SHADING, buildAtomRibbons } from '../logic/atomGeometry';

type AtomCanvasIconProps = {
  className?: string;
  size?: number;
};

export default function AtomCanvasIcon({ size = 112 }: AtomCanvasIconProps) {
  const { isDark } = useTheme();
  const geometry = React.useMemo(() => buildAtomRibbons(size), [size]);
  const { cx, cy, coreR, haloR, sphereR, ribbons, rim, sphereLight } = geometry;

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
  const sphereBodyOpacity = isDark
    ? ATOM_SHADING.sphereBodyShadowOpacity.dark
    : ATOM_SHADING.sphereBodyShadowOpacity.light;
  const sphereDiffuseOpacity = isDark
    ? ATOM_SHADING.sphereDiffuseOpacity.dark
    : ATOM_SHADING.sphereDiffuseOpacity.light;
  const sphereHighlightOpacity = isDark
    ? ATOM_SHADING.sphereHighlightOpacity.dark
    : ATOM_SHADING.sphereHighlightOpacity.light;
  const sphereRimOpacity = isDark ? ATOM_SHADING.sphereRimOpacity.dark : ATOM_SHADING.sphereRimOpacity.light;
  const rimFill = `rgba(255,255,255,${sphereRimOpacity})`;

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Defs>
        <RadialGradient id="atomHalo" cx="50%" cy="50%" rx="50%" ry="50%">
          <Stop offset="0%" stopColor={`rgb(${base})`} stopOpacity={isDark ? 0.22 : 0.16} />
          <Stop offset="65%" stopColor={`rgb(${base})`} stopOpacity={0.04} />
          <Stop offset="100%" stopColor={`rgb(${base})`} stopOpacity={0} />
        </RadialGradient>

        <RadialGradient id="atomExteriorShadow" cx="50%" cy="50%" rx="50%" ry="50%">
          <Stop
            offset="0%"
            stopColor={isDark ? 'rgb(0,0,0)' : 'rgb(30,27,75)'}
            stopOpacity={isDark ? 0.5 : 0.4}
          />
          <Stop offset="100%" stopColor="rgb(0,0,0)" stopOpacity={0} />
        </RadialGradient>

        <LinearGradient id="atomSphereBody" x1="25%" y1="22%" x2="78%" y2="82%">
          <Stop offset="0%" stopColor="rgb(255,255,255)" stopOpacity={sphereBodyOpacity * 0.9} />
          <Stop offset="55%" stopColor="rgb(255,255,255)" stopOpacity={0} />
          <Stop offset="100%" stopColor="rgb(0,0,0)" stopOpacity={sphereBodyOpacity * 0.5} />
        </LinearGradient>

        <RadialGradient
          id="atomSphereDiffuse"
          gradientUnits="userSpaceOnUse"
          cx={sphereLight.diffuseCx}
          cy={sphereLight.diffuseCy}
          r={sphereLight.diffuseR}
          fx={sphereLight.diffuseCx}
          fy={sphereLight.diffuseCy}
        >
          <Stop offset="0%" stopColor="rgb(255,255,255)" stopOpacity={sphereDiffuseOpacity} />
          <Stop offset="50%" stopColor="rgb(255,255,255)" stopOpacity={sphereDiffuseOpacity * 0.35} />
          <Stop offset="100%" stopColor="rgb(255,255,255)" stopOpacity={0} />
        </RadialGradient>

        <RadialGradient
          id="atomSphereHighlight"
          gradientUnits="userSpaceOnUse"
          cx={sphereLight.specCx}
          cy={sphereLight.specCy}
          r={sphereLight.specR}
          fx={sphereLight.specCx}
          fy={sphereLight.specCy}
        >
          <Stop offset="0%" stopColor="rgb(255,255,255)" stopOpacity={sphereHighlightOpacity} />
          <Stop offset="45%" stopColor="rgb(255,255,255)" stopOpacity={sphereHighlightOpacity * 0.2} />
          <Stop offset="100%" stopColor="rgb(255,255,255)" stopOpacity={0} />
        </RadialGradient>

        <RadialGradient id="atomContactShadow" cx="50%" cy="50%" rx="50%" ry="50%">
          <Stop offset="0%" stopColor={isDark ? 'rgba(0,0,0,0.35)' : 'rgba(30,27,75,0.22)'} />
          <Stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </RadialGradient>

        <RadialGradient id="atomCore" cx="36%" cy="30%" rx="72%" ry="72%">
          <Stop offset="0%" stopColor={coreLight} />
          <Stop offset="45%" stopColor={coreMid} />
          <Stop offset="100%" stopColor={coreDeep} />
        </RadialGradient>

        <RadialGradient id="atomCoreOcclusion" cx="68%" cy="72%" rx="55%" ry="55%">
          <Stop offset="0%" stopColor={isDark ? 'rgba(15,15,35,0.55)' : 'rgba(30,27,75,0.45)'} />
          <Stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </RadialGradient>

        {ribbons.map((ribbon, i) => (
          <LinearGradient
            key={`orbitGrad-${i}`}
            id={`orbitGrad-${i}`}
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
          fill="url(#atomExteriorShadow)"
          opacity={exteriorDropOpacity}
        />
      )}

      <Circle cx={cx} cy={cy} r={haloR} fill="url(#atomHalo)" />

      {ATOM_SHADING.enableSphereVolume && (
        <>
          <Circle cx={cx} cy={cy} r={sphereR} fill="url(#atomSphereBody)" />
          <Circle cx={cx} cy={cy} r={sphereR} fill="url(#atomSphereDiffuse)" />
          {rim.strokes.map((stroke, i) => (
            <Path
              key={`rim-${i}`}
              d={stroke.d}
              stroke={rimFill}
              strokeWidth={stroke.width}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
        </>
      )}

      {ribbons.map((ribbon, i) => (
        <Path key={`back-${i}`} d={ribbon.backPath} fill={`url(#orbitGrad-${i})`} />
      ))}

      {ATOM_SHADING.enableProjectedShadows &&
        ribbons.map((ribbon, i) => (
          <G key={`proj-${i}`} transform={`translate(${shadowDx}, ${shadowDy})`}>
            <Path d={ribbon.frontPath} fill={`rgba(0,0,0,${projectedOpacity})`} />
          </G>
        ))}

      <Ellipse
        cx={cx}
        cy={cy + coreR * 0.4}
        rx={coreR * 1.2}
        ry={coreR * 0.38}
        fill="url(#atomContactShadow)"
      />

      <Circle cx={cx} cy={cy} r={coreR} fill="url(#atomCore)" />
      <Circle cx={cx} cy={cy} r={coreR} fill="url(#atomCoreOcclusion)" />
      <Circle
        cx={cx - coreR * 0.3}
        cy={cy - coreR * 0.34}
        r={coreR * 0.36}
        fill={isDark ? 'rgba(255,255,255,0.42)' : 'rgba(255,255,255,0.68)'}
      />

      {ribbons.map((ribbon, i) => (
        <Path key={`front-${i}`} d={ribbon.frontPath} fill={`url(#orbitGrad-${i})`} />
      ))}

      {ATOM_SHADING.enableSphereVolume && (
        <Circle cx={cx} cy={cy} r={sphereR} fill="url(#atomSphereHighlight)" />
      )}
    </Svg>
  );
}
