import { getAppVariant } from './appVariant';
import ClassicApp from './ClassicApp';
import ComprensionApp from './ComprensionApp';

export default function App() {
  return getAppVariant() === 'comprension' ? <ComprensionApp /> : <ClassicApp />;
}
