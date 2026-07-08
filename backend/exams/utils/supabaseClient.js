"use strict";

const createSupabaseError = (error) => {
  if (error instanceof Error) return error;
  if (error?.message) return new Error(error.message);
  if (typeof error === "string") return new Error(error);
  return new Error("Unknown Supabase query error");
};

const isResponseLike = (value) =>
  value && typeof value === "object" && ("data" in value || "error" in value);

const normalizeResponse = (result) => {
  if (isResponseLike(result)) return result;
  return { data: result ?? null, error: null };
};

const getSupabaseClient = () => {
  const cached =
    globalThis.__examsSupabaseClient ||
    globalThis.__examsResultSupabaseClient ||
    globalThis.__examsRelationshipSupabaseClient ||
    globalThis.supabase;

  if (cached) return cached;

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    return null;
  }

  try {
    const { createClient } = require("@supabase/supabase-js");
    const client = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );

    globalThis.__examsSupabaseClient = client;
    globalThis.__examsResultSupabaseClient = client;
    globalThis.__examsRelationshipSupabaseClient = client;

    return client;
  } catch {
    return null;
  }
};

const runQuery = async (queryBuilder) => {
  console.log('[SupabaseClient] runQuery - Executing query');
  if (!queryBuilder) {
    console.log('[SupabaseClient] runQuery - Query builder is null');
    return { data: [], error: null };
  }

  try {
    // already resolved response
    if (isResponseLike(queryBuilder)) {
      console.log('[SupabaseClient] runQuery - Already resolved response');
      return queryBuilder;
    }

    // Supabase builder with maybeSingle/single
    if (typeof queryBuilder.maybeSingle === "function") {
      console.log('[SupabaseClient] runQuery - Calling maybeSingle()');
      const res = await queryBuilder.maybeSingle();
      console.log('[SupabaseClient] runQuery - maybeSingle response:', res);
      return normalizeResponse(res);
    }

    if (typeof queryBuilder.single === "function") {
      console.log('[SupabaseClient] runQuery - Calling single()');
      const res = await queryBuilder.single();
      console.log('[SupabaseClient] runQuery - single response:', res);
      return normalizeResponse(res);
    }

    // normal promise (select/in/etc.)
    if (typeof queryBuilder.then === "function") {
      console.log('[SupabaseClient] runQuery - Awaiting promise');
      const res = await queryBuilder;
      console.log('[SupabaseClient] runQuery - Promise response:', res);
      return normalizeResponse(res);
    }

    console.log('[SupabaseClient] runQuery - Unknown query type');
    return normalizeResponse(null);
  } catch (error) {
    console.error('[SupabaseClient] runQuery - Error:', error);
    return {
      data: null,
      error: createSupabaseError(error),
    };
  }
};

module.exports = {
  getSupabaseClient,
  runQuery,
};