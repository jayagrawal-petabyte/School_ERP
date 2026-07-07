'use strict';

/**
 * Lightweight in-memory TTL cache for the reports module.
 * Zero external dependencies — uses a plain Map with timestamps.
 *
 * Security note: cache keys that include a user or class scope are
 * intentionally namespaced so different users never share cached data.
 */

const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes

// Hard cap on cache entries to prevent unbounded memory growth.
// If hit, the oldest entry is evicted first.
const MAX_ENTRIES = 500;

const store = new Map();

/**
 * Get a value from the cache.
 * Returns `undefined` if the key doesn't exist or has expired.
 * @param {string} key
 * @returns {any|undefined}
 */
function get(key) {
    if (typeof key !== 'string' || !key) return undefined;

    const entry = store.get(key);
    if (!entry) return undefined;

    if (Date.now() > entry.expiresAt) {
        store.delete(key);
        return undefined;
    }

    // Deep-clone to prevent callers from mutating cached data (cache poisoning)
    try {
        return JSON.parse(JSON.stringify(entry.value));
    } catch (err) {
        // If it can't be cloned (e.g. BigInt or circular ref), treat as cache miss
        store.delete(key);
        return undefined;
    }
}

/**
 * Set a value in the cache.
 * @param {string} key
 * @param {any} value
 * @param {number} [ttlMs] - TTL in milliseconds, defaults to 5 minutes
 */
function set(key, value, ttlMs = DEFAULT_TTL_MS) {
    if (typeof key !== 'string' || !key) return;

    let clonedValue;
    try {
        clonedValue = JSON.parse(JSON.stringify(value));
    } catch (err) {
        // Skip caching if value is not serializable
        return;
    }

    // Evict oldest entry if we hit the size cap
    if (store.size >= MAX_ENTRIES && !store.has(key)) {
        const oldestKey = store.keys().next().value;
        store.delete(oldestKey);
    }

    // Deep-clone to isolate cached data from the original object reference
    store.set(key, {
        value: clonedValue,
        expiresAt: Date.now() + ttlMs,
    });
}

/**
 * Manually invalidate a cache entry.
 * @param {string} key
 */
function invalidate(key) {
    store.delete(key);
}

/**
 * Clear all cache entries. Useful for testing.
 */
function clear() {
    store.clear();
}

module.exports = { get, set, invalidate, clear };
