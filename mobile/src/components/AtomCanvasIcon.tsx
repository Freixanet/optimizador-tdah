import React from 'react';
import QuantumOrbView from './QuantumOrbView';

type AtomCanvasIconProps = {
  className?: string;
  size?: number;
  interactive?: boolean;
};

export default function AtomCanvasIcon({ size = 64, interactive = false }: AtomCanvasIconProps) {
  return <QuantumOrbView size={size} interactive={interactive} />;
}
