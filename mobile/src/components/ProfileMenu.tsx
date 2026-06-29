import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Dimensions, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  Check,
  ChevronLeft,
  LogIn,
  LogOut,
  Moon,
  Settings,
  Sun,
} from 'lucide-react-native';
import ProfileAvatar from './ProfileAvatar';
import GlassSurface from './GlassSurface';
import { FloatingGlassShell, FLOATING_CIRCLE_SIZE } from './FloatingGlassButton';
import { useAppSession, stepHaptic } from '../context/AppSessionContext';
import { useTheme } from '../context/ThemeContext';
import { useAppVariantSwitch } from '../context/AppVariantContext';
import { APP_VARIANT_OPTIONS, getAppVariant } from '../logic/appVariant';

type ProfileMenuProps = {
  placement?: 'topRight' | 'bottomLeft';
  floating?: boolean;
};

const MENU_WIDTH = 168;
const MENU_GAP = 10;
const SCREEN = Dimensions.get('window');

type MenuAnchor = {
  left: number;
  top: number;
  width: number;
  height: number;
};

export default function ProfileMenu({ placement = 'topRight', floating = false }: ProfileMenuProps) {
  const session = useAppSession();
  const { theme, toggleTheme } = useTheme();
  const { onVariantChange } = useAppVariantSwitch();
  const anchorRef = useRef<View>(null);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<'root' | 'settings'>('root');
  const [anchor, setAnchor] = useState<MenuAnchor | null>(null);

  const closeMenu = useCallback(() => {
    setOpen(false);
    setView('root');
  }, []);

  const updateAnchor = useCallback(() => {
    anchorRef.current?.measureInWindow((left, top, width, height) => {
      setAnchor({ left, top, width, height });
    });
  }, []);

  useEffect(() => {
    if (!open) {
      setAnchor(null);
      return;
    }
    updateAnchor();
  }, [open, updateAnchor]);

  const menuPosition = anchor
    ? placement === 'bottomLeft'
      ? {
          left: Math.max(12, Math.min(anchor.left, SCREEN.width - MENU_WIDTH - 12)),
          bottom: SCREEN.height - anchor.top + MENU_GAP,
        }
      : {
          left: Math.max(
            12,
            Math.min(anchor.left + anchor.width - MENU_WIDTH, SCREEN.width - MENU_WIDTH - 12)
          ),
          top: anchor.top + anchor.height + MENU_GAP,
        }
    : null;

  const menuIconColor = '#ffffff';
  const iconStroke = 2.25;

  const renderMenuContent = () => {
    if (view === 'settings') {
      return (
        <View className="py-2 px-2">
          <Pressable
            onPress={() => setView('root')}
            className="flex-row items-center gap-2.5 px-2.5 py-3.5 -mx-2 -mt-2 border-b border-neutral-200/60 dark:border-white/10"
          >
            <ChevronLeft size={20} color={menuIconColor} strokeWidth={iconStroke} />
            <Text className="text-base font-semibold text-neutral-700 dark:text-neutral-200">
              Ajustes
            </Text>
          </Pressable>

          <View className="px-2.5 py-2">
            <Text className="text-[11px] font-bold tracking-widest uppercase text-neutral-400">
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
                className={`px-2.5 py-3 flex-row items-start gap-2.5 rounded-[14px] ${
                  isActive ? 'bg-indigo-50 dark:bg-indigo-500/10' : ''
                } ${session.phase === 'loading' ? 'opacity-50' : ''}`}
              >
                <View className="flex-1 min-w-0">
                  <Text className="text-base font-semibold text-neutral-800 dark:text-neutral-200">
                    {option.label}
                  </Text>
                  <Text className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
                    {option.hint}
                  </Text>
                </View>
                {isActive ? <Check size={20} color="#4f46e5" /> : null}
              </Pressable>
            );
          })}

          <View className="border-t border-neutral-200/60 dark:border-white/10">
            <Pressable
              onPress={() => {
                toggleTheme();
                stepHaptic();
              }}
              className="px-2.5 py-3.5 flex-row items-center gap-3 rounded-[14px] active:bg-neutral-100/70 dark:active:bg-white/[0.06]"
            >
              {theme === 'light' ? (
                <Moon size={20} color={menuIconColor} strokeWidth={iconStroke} />
              ) : (
                <Sun size={20} color={menuIconColor} strokeWidth={iconStroke} />
              )}
              <Text className="text-base font-semibold text-neutral-700 dark:text-neutral-300">
                {theme === 'light' ? 'Modo oscuro' : 'Modo claro'}
              </Text>
            </Pressable>
          </View>
        </View>
      );
    }

    return (
      <View className="py-2 px-2">
        <Pressable
          onPress={() => setView('settings')}
          className="px-2.5 py-4 flex-row items-center gap-3 rounded-[14px] active:bg-neutral-100/70 dark:active:bg-white/[0.06]"
        >
          <Settings size={20} color={menuIconColor} strokeWidth={iconStroke} />
          <Text className="flex-1 text-base font-semibold text-neutral-700 dark:text-neutral-300">
            Ajustes
          </Text>
        </Pressable>

        {session.cloudSignedIn ? (
          <Pressable
            onPress={() => {
              closeMenu();
              void session.handleSignOut();
              stepHaptic();
            }}
            className="px-2.5 py-4 flex-row items-center gap-3 rounded-[14px] active:bg-neutral-100/70 dark:active:bg-white/[0.06]"
          >
            <LogOut size={20} color={menuIconColor} strokeWidth={iconStroke} />
            <Text className="text-base font-semibold text-neutral-700 dark:text-neutral-300">
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
            className="px-2.5 py-4 flex-row items-center gap-3 rounded-[14px] active:bg-neutral-100/70 dark:active:bg-white/[0.06]"
          >
            <LogIn size={20} color={menuIconColor} strokeWidth={iconStroke} />
            <Text className="text-base font-semibold text-neutral-700 dark:text-neutral-300">
              Iniciar sesión
            </Text>
          </Pressable>
        ) : null}
      </View>
    );
  };

  return (
    <>
      <View ref={anchorRef} collapsable={false} className="relative z-50">
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
            <FloatingGlassShell shape="circle" size={FLOATING_CIRCLE_SIZE} prominent>
              <ProfileAvatar
                signedIn={session.cloudSignedIn}
                avatarUrl={session.cloudUserAvatarUrl}
                floating
              />
            </FloatingGlassShell>
          ) : (
            <ProfileAvatar
              signedIn={session.cloudSignedIn}
              avatarUrl={session.cloudUserAvatarUrl}
            />
          )}
        </Pressable>
      </View>

      <Modal visible={open} transparent animationType="fade" onRequestClose={closeMenu}>
        <View style={styles.modalRoot}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={closeMenu}
            accessibilityLabel="Cerrar menú de cuenta"
          />
          {menuPosition ? (
            <View
              pointerEvents="box-none"
              style={[styles.menuHost, menuPosition, { width: MENU_WIDTH }]}
              accessibilityRole="menu"
            >
              <GlassSurface liquid borderRadius={20} className="rounded-[20px] shadow-xl">
                {renderMenuContent()}
              </GlassSurface>
            </View>
          ) : null}
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  menuHost: {
    position: 'absolute',
  },
});
