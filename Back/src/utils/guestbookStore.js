import { readJsonFile, addItemToFile, writeJsonFile } from './fileStorage.js';
import { isRedisConfigured, redis, redisPipeline } from './redis.js';

// Guestbook persistence. Uses Upstash Redis when configured (required on Vercel,
// whose filesystem is read-only) and falls back to data/guestbook.json otherwise.
const FILE = 'guestbook.json';
const LIST_KEY = 'guestbook:entries';
const RATE_PREFIX = 'guestbook:rate:';

const parse = (raw) => {
  try {
    return JSON.parse(raw);
  } catch (error) {
    return null;
  }
};

const loadFileEntries = () => {
  const entries = readJsonFile(FILE);
  return Array.isArray(entries) ? entries : [];
};

/** Newest first. */
export async function listEntries(limit) {
  if (isRedisConfigured()) {
    const raw = await redis('LRANGE', LIST_KEY, 0, limit - 1);
    return (raw || []).map(parse).filter(Boolean);
  }
  return loadFileEntries().slice(0, limit);
}

/** Adds a note and keeps only the newest `maxStored`. */
export async function addEntry(fields, maxStored) {
  if (isRedisConfigured()) {
    const entry = { id: Date.now(), createdAt: new Date().toISOString(), ...fields };
    await redisPipeline([
      ['LPUSH', LIST_KEY, JSON.stringify(entry)],
      ['LTRIM', LIST_KEY, 0, maxStored - 1]
    ]);
    return entry;
  }

  const entry = addItemToFile(FILE, fields);
  const entries = loadFileEntries();
  if (entries.length > maxStored) {
    writeJsonFile(FILE, entries.slice(0, maxStored));
  }
  return entry;
}

/** @returns {Promise<boolean>} false when no note has that id */
export async function removeEntry(id) {
  if (isRedisConfigured()) {
    const raw = (await redis('LRANGE', LIST_KEY, 0, -1)) || [];
    const match = raw.find((item) => parse(item)?.id === id);
    if (!match) return false;
    await redis('LREM', LIST_KEY, 1, match);
    return true;
  }

  const entries = loadFileEntries();
  const remaining = entries.filter((entry) => entry.id !== id);
  if (remaining.length === entries.length) return false;
  writeJsonFile(FILE, remaining);
  return true;
}

// Fallback rate limiting for local/single-server use. Serverless instances don't
// share memory, which is why Redis is used whenever it is available.
const recentPosts = new Map();

/**
 * Counts one attempt for `ip` and says whether it went over the limit.
 * @returns {Promise<boolean>} true when the caller should be rejected
 */
export async function hitRateLimit(ip, max, windowMs) {
  if (isRedisConfigured()) {
    const key = `${RATE_PREFIX}${ip}`;
    const count = await redis('INCR', key);
    if (count === 1) await redis('PEXPIRE', key, windowMs);
    return count > max;
  }

  const now = Date.now();
  const recent = (recentPosts.get(ip) || []).filter((at) => now - at < windowMs);
  recent.push(now);
  recentPosts.set(ip, recent);

  // Keep the map from growing forever
  if (recentPosts.size > 5000) {
    for (const [key, stamps] of recentPosts) {
      if (!stamps.some((at) => now - at < windowMs)) recentPosts.delete(key);
    }
  }

  return recent.length > max;
}

export const storageBackend = () => (isRedisConfigured() ? 'redis' : 'file');
