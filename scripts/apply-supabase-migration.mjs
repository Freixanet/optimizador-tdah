#!/usr/bin/env node
/**
 * Applies the initial maps migration via Supabase SQL API (service role).
 * Usage: node scripts/apply-supabase-migration.mjs --url URL --service-key KEY
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const args = process.argv.slice(2);
function get(flag) {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : undefined;
}

const url = get('--url');
const serviceKey = get('--service-key');

if (!url || !serviceKey) {
  console.error('Usage: node scripts/apply-supabase-migration.mjs --url URL --service-key KEY');
  process.exit(1);
}

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const sql = readFileSync(
  join(root, 'supabase/migrations/20260621_initial_sync.sql'),
  'utf8'
);

const response = await fetch(`${url.replace(/\/$/, '')}/rest/v1/rpc`, {
  method: 'POST',
  headers: {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({}),
}).catch(() => null);

// Supabase exposes SQL only through dashboard or direct postgres connection.
// Use the pg-meta query endpoint available on hosted projects.
const queryResponse = await fetch(`${url.replace(/\/$/, '')}/pg/query`, {
  method: 'POST',
  headers: {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ query: sql }),
});

if (!queryResponse.ok) {
  const detail = await queryResponse.text();
  console.error('No se pudo aplicar la migración automáticamente.');
  console.error(`HTTP ${queryResponse.status}: ${detail}`);
  console.error('\nCopia el SQL de supabase/migrations/20260621_initial_sync.sql');
  console.error('y ejecútalo en Supabase → SQL Editor.');
  process.exit(1);
}

console.log('Migración aplicada correctamente.');
