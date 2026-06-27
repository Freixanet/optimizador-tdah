import React from 'react';
import { useAppSession } from '../context/AppSessionContext';
import InputScreen from '../screens/InputScreen';
import LoadingScreen from '../screens/LoadingScreen';
import ResultScreen from '../screens/ResultScreen';
import ClassicInputScreen from '../screens/classic/ClassicInputScreen';
import ClassicResultScreen from '../screens/classic/ClassicResultScreen';

export function ComprensionPhaseRouter() {
  const { phase } = useAppSession();

  if (phase === 'loading') return <LoadingScreen />;
  if (phase === 'result') return <ResultScreen />;
  return <InputScreen />;
}

export function ClassicPhaseRouter() {
  const { phase } = useAppSession();

  if (phase === 'loading') return <LoadingScreen />;
  if (phase === 'result') return <ClassicResultScreen />;
  return <ClassicInputScreen />;
}
