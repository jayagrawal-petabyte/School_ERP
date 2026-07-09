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
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
    const key = serviceRoleKey || process.env.SUPABASE_ANON_KEY;
    const client = createClient(process.env.SUPABASE_URL, key);

    globalThis.__examsSupabaseClient = client;
    globalThis.__examsResultSupabaseClient = client;
    globalThis.__examsRelationshipSupabaseClient = client;

    return client;
  } catch {
    return null;
  }
};

const runQuery = async (queryBuilder) => {
  if (!queryBuilder) return { data: [], error: null };

  try {
    // already resolved response
    if (isResponseLike(queryBuilder)) {
      return queryBuilder;
    }

    // Supabase builder with maybeSingle/single
    if (typeof queryBuilder.maybeSingle === "function") {
      const res = await queryBuilder.maybeSingle();
      return normalizeResponse(res);
    }

    if (typeof queryBuilder.single === "function") {
      const res = await queryBuilder.single();
      return normalizeResponse(res);
    }

    // normal promise (select/in/etc.)
    if (typeof queryBuilder.then === "function") {
      const res = await queryBuilder;
      return normalizeResponse(res);
    }

    return normalizeResponse(null);
  } catch (error) {
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