"use strict";

const getSupabaseClient = () => {
  if (globalThis.__examsResultSupabaseClient) {
    return globalThis.__examsResultSupabaseClient;
  }

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    return null;
  }

  try {
    const { createClient } = require('@supabase/supabase-js');
    const client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
    globalThis.__examsResultSupabaseClient = client;
    return client;
  } catch (error) {
    return null;
  }
};

const runQuery = async (queryBuilder) => {
  if (!queryBuilder) {
    return { data: [], error: null };
  }

  if (typeof queryBuilder.then === 'function') {
    return queryBuilder.then((result) => result);
  }

  if (Object.prototype.hasOwnProperty.call(queryBuilder, 'data') || Object.prototype.hasOwnProperty.call(queryBuilder, 'error')) {
    return queryBuilder;
  }

  if (typeof queryBuilder.maybeSingle === 'function') {
    return queryBuilder.maybeSingle();
  }

  return queryBuilder;
};

module.exports = {
  getSupabaseClient,
  runQuery,
};
