const test = require('node:test');
const assert = require('node:assert/strict');

const { runQuery, getSupabaseClient } = require('../utils/supabaseClient');

test('runQuery normalizes thrown query errors into a response-like object', async () => {
  const response = await runQuery({
    maybeSingle: async () => {
      throw new Error('supabase exploded');
    },
  });

  assert.equal(response.data, null);
  assert.equal(response.error instanceof Error, true);
  assert.match(response.error.message, /supabase exploded/);
});

test('runQuery preserves existing response objects', async () => {
  const existingResponse = { data: [{ id: '1' }], error: null };
  const response = await runQuery(existingResponse);

  assert.equal(response, existingResponse);
});

test('getSupabaseClient returns null when Supabase is not configured', () => {
  delete process.env.SUPABASE_URL;
  delete process.env.SUPABASE_ANON_KEY;
  delete globalThis.__examsSupabaseClient;
  delete globalThis.__examsResultSupabaseClient;
  delete globalThis.__examsRelationshipSupabaseClient;

  assert.equal(getSupabaseClient(), null);
});
