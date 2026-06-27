import React, { useState } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  LogIn,
  LogOut,
  Moon,
  Settings,
  Sun,
  UserRound,
} from 'lucide-react-native';
import GlassSurface from './GlassSurface';
import { FloatingGlassShell, FLOATING_CIRCLE_SIZE } from './FloatingGlassButton';
import { useAppSession, stepHaptic } from '../context/AppSessionContext';
import { useTheme } from '../context/ThemeContext';
import { useAppVariantSwitch } from '../context/AppVariantContext';
import { APP_VARIANT_OPTIONS, getAppVariant } from '../logic/appVariant';
import { signOut } from '../logic/cloudHistory';

type ProfileMenuProps = {
  placement?: 'topRight' | 'bottomLeft';
  floating?: boolean;
};

function ProfileAvatar({ signedIn, floating }: { signedIn: boolean; floating?: boolean }) {
  if (floating) {
    return <UserRound size={20} color={signedIn ? '#4f46e5' : '#525252'} />;
  }

  return (
    <View
      className={`w-9 h-9 rounded-full items-center justify-center ${
        signedIn ? 'bg-indigo-600' : 'bg-neutral-500/10 dark:bg-white/10'
      }`}
    >
      <UserRound size={18} color={signedIn ? '#ffffff' : '#525252'} />
    </View>
  );
}

export default function ProfileMenu({ placement = 'topRight', floating = false }: ProfileMenuProps) {
  const session = useAppSession();
  const { theme, toggleTheme } = useTheme();
  const { onVariantChange } = useAppVariantSwitch();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<'root' | 'settings'>('root');

  const closeMenu = () => {
    setOpen(false);
    setView('root');
  };

  const menuPanelClass =
    placement === 'bottomLeft' ? 'absolute left-0 z-50' : 'absolute top-11 right-0 z-50';
  const menuPanelStyle =
    placement === 'bottomLeft' ? { bottom: FLOATING_CIRCLE_SIZE + 10 } : undefined;

  const trigger = (
    <Pressable
      onPress={() => {
        setOpen((current) => {
          if (current) setView('root');
          return !current;
        });
        stepHaptic();
      }}
      accessibilityRole="button"
      accessibilityLabel={session.cloudSignedIn ? 'Tu cuenta' : 'Cuenta y ajustes'}
      accessibilityState={{ expanded: open }}
      className={floating ? 'active:opacity-80' : 'rounded-xl p-1 active:opacity-80'}
    >
      {floating ? (
        <FloatingGlassShell shape="circle">
          <ProfileAvatar signedIn={session.cloudSignedIn} floating />
        </FloatingGlassShell>
      ) : (
        <ProfileAvatar signedIn={session.cloudSignedIn} />
      )}
    </Pressable>
  );

  const renderMenuContent = () => {
    if (view === 'settings') {
      return (
        <>
          <Pressable
            onPress={() => setView('root')}
            className="flex-row items-center gap-2 px-3 py-3 border-b border-neutral-200/60 dark:border-white/10"
          >
            <ChevronLeft size={16} color="#737373" />
            <Text className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">
              Ajustes
            </Text>
          </Pressable>

          <View className="px-3 py-2.5">
            <Text className="text-[10px] font-bold tracking-widest uppercase text-neutral-400">
              Experiencia
            </Text>
          </View>

          {APP_VARIANT_OPTIONS.map((option) => {
            const isActive = getAppVariant() === option.id;
            return (
              <Pressable
                key={option.id}
                disabled={session.phase === 'loading'}
                onPress={() => {
                  if (isActive) return;
                  closeMenu();
                  onVariantChange(option.id);
                  stepHaptic();
                }}
                className={`px-3 py-2.5 flex-row items-start gap-2 ${
                  isActive ? 'bg-indigo-50 dark:bg-indigo-500/10' : ''
                } ${session.phase === 'loading' ? 'opacity-50' : ''}`}
              >
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                    {option.label}
                  </Text>
                  <Text className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                    {option.hint}
                  </Text>
                </View>
                {isActive ? <Check size={16} color="#4f46e5" /> : null}
              </Pressable>
            );
          })}

          <View className="border-t border-neutral-200/60 dark:border-white/10">
            <Pressable
              onPress={() => {
                toggleTheme();
                stepHaptic();
              }}
              className="px-3 py-2.5 flex-row items-center gap-2.5"
            >
              {theme === 'light' ? <Moon size={16} color="#737373" /> : <Sun size={16} color="#737373" />}
              <Text className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                {theme === 'light' ? 'Modo oscuro' : 'Modo claro'}
              </Text>
            </Pressable>
          </View>
        </>
      );
    }

    return (
      <View className="py-1">
        <Pressable
          onPress={() => setView('settings')}
          className="px-3 py-2.5 flex-row items-center gap-2.5"
        >
          <Settings size={16} color="#737373" />
          <Text className="flex-1 text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Ajustes
          </Text>
          <ChevronRight size={16} color="#a3a3a3" />
        </Pressable>

        {session.cloudSignedIn ? (
          <Pressable
            onPress={() => {
              closeMenu();
              void signOut();
              stepHaptic();
            }}
            className="px-3 py-2.5 flex-row items-center gap-2.5"
          >
            <LogOut size={16} color="#737373" />
            <Text className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Cerrar sesión
            </Text>
          </Pressable>
        ) : session.isCloudSyncConfigured ? (
          <Pressable
            onPress={() => {
              closeMenu();
              session.openAuthSheet();
              stepHaptic();
            }}
            className="px-3 py-2.5 flex-row items-center gap-2.5"
          >
            <LogIn size={16} color="#737373" />
            <Text className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Iniciar sesión
            </Text>
          </Pressable>
        ) : null}
      </View>
    );
  };

  return (
    <View className="relative z-50">
      {trigger}

      {open ? (
        <>
          <Pressable
            style={styles.backdrop}
            onPress={closeMenu}
            accessibilityLabel="Cerrar menú de cuenta"
          />
          <View className={menuPanelClass} style={menuPanelStyle} pointerEvents="box-none">
            <GlassSurface className="w-72 rounded-[20px] shadow-xl">{renderMenuContent()}</GlassSurface>
          </View>
        </>
      ) : null}
    </View>
  );
}

const window = Dimensions.get('window');
const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: -window.height,
    left: -window.width,
    width: window.width * 3,
    height: window.height * 3,
    zIndex: 40,
  },
});
