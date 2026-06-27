import React, { createContext, useContext } from 'react';
import type { AppVariant } from '../logic/appVariant';

type AppVariantContextValue = {
  onVariantChange: (variant: AppVariant) => void;
};

const AppVariantContext = createContext<AppVariantContextValue | null>(null);

export function AppVariantProvider({
  children,
  onVariantChange,
}: {
  children: React.ReactNode;
  onVariantChange: (variant: AppVariant) => void;
}) {
  return (
    <AppVariantContext.Provider value={{ onVariantChange }}>{children}</AppVariantContext.Provider>
  );
}

export function useAppVariantSwitch() {
  const context = useContext(AppVariantContext);
  if (!context) throw new Error('useAppVariantSwitch must be used within AppVariantProvider');
  return context;
}
