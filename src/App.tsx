import { useEffect } from 'react';
import { getAppVariant } from './appVariant';
import ClassicApp from './ClassicApp';
import ComprensionApp from './ComprensionApp';
import { initNativeShell } from './nativeShell';

export default function App() {
  useEffect(() => {
    void initNativeShell();
  }, []);

  return getAppVariant() === 'comprension' ? <ComprensionApp /> : <ClassicApp />;
}
