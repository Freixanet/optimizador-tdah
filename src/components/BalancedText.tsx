import type { ReactNode } from 'react';
import Balancer from 'react-wrap-balancer';

type BalancedTextProps = {
  children: ReactNode;
};

export default function BalancedText({ children }: BalancedTextProps) {
  return <Balancer preferNative={false}>{children}</Balancer>;
}
