import type { HistoryEntry, HistoryStore } from './history';
import { isNativeShell } from './nativeShell';
import { supabase } from './supabase';

function authRedirectUrl() {
  if (isNativeShell()) return 'com.nucleo.app://login-callback';
  return window.location.origin;
}

type CloudMap = {
  id: string;
  title: string;
  category: string | null;
  pinned_at: string | null;
  source_type: HistoryEntry['sourceType'];
  session: HistoryEntry['session'];
  created_at: string;
  updated_at: string;
};

function toCloudMap(entry: HistoryEntry) {
  return {
    id: entry.id,
    title: entry.title,
    category: entry.category ?? null,
    pinned_at: entry.pinnedAt ? new Date(entry.pinnedAt).toISOString() : null,
    source_type: entry.sourceType,
    session: entry.session,
    created_at: new Date(entry.createdAt).toISOString(),
    updated_at: new Date(entry.updatedAt).toISOString(),
  };
}

function fromCloudMap(map: CloudMap): HistoryEntry {
  return {
    id: map.id,
    title: map.title,
    category: map.category ?? undefined,
    pinned: Boolean(map.pinned_at),
    pinnedAt: map.pinned_at ? new Date(map.pinned_at).getTime() : undefined,
    sourceType: map.source_type,
    session: map.session,
    createdAt: new Date(map.created_at).getTime(),
    updatedAt: new Date(map.updated_at).getTime(),
  };
}

export async function signInWith(provider: 'google' | 'apple') {
  if (!supabase) throw new Error('La sincronización todavía no está configurada.');
  return supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: authRedirectUrl() },
  });
}

export async function signInWithPassword(email: string, password: string) {
  if (!supabase) throw new Error('La sincronización todavía no está configurada.');
  const { error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });
  if (error) throw error;
}

export async function signUpWithPassword(email: string, password: string) {
  if (!supabase) throw new Error('La sincronización todavía no está configurada.');
  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
  });
  if (error) throw error;
  if (!data.session) {
    throw new Error('Revisa tu email para confirmar la cuenta, o usa Google para entrar al instante.');
  }
}

export async function signOut() {
  if (supabase) await supabase.auth.signOut();
}

/**
 * One-time, idempotent migration: a map keeps its existing id and server data
 * wins only when it has a newer updated_at timestamp.
 */
export async function migrateLocalHistory(store: HistoryStore) {
  if (!supabase || store.entries.length === 0) return;
  const { error } = await supabase.from('maps').upsert(
    store.entries.map(toCloudMap),
    { onConflict: 'id', ignoreDuplicates: false }
  );
  if (error) throw error;
}

export async function pullCloudHistory(): Promise<HistoryEntry[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('maps')
    .select('id,title,category,pinned_at,source_type,session,created_at,updated_at')
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return (data as CloudMap[]).map(fromCloudMap);
}

export async function pushHistoryEntry(entry: HistoryEntry) {
  if (!supabase) return;
  const { error } = await supabase.from('maps').upsert(toCloudMap(entry), { onConflict: 'id' });
  if (error) throw error;
}

export async function deleteCloudHistoryEntry(id: string) {
  if (!supabase) return;
  const { error } = await supabase.from('maps').delete().eq('id', id);
  if (error) throw error;
}
