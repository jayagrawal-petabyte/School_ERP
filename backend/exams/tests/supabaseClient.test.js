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
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  delete globalThis.__examsSupabaseClient;
  delete globalThis.__examsResultSupabaseClient;
  delete globalThis.__examsRelationshipSupabaseClient;

  assert.equal(getSupabaseClient(), null);
});

test('getSupabaseClient prefers the service role key when available', () => {
  process.env.SUPABASE_URL = 'https://example.supabase.co';
  process.env.SUPABASE_ANON_KEY = 'anon-key';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key';
  delete globalThis.__examsSupabaseClient;
  delete globalThis.__examsResultSupabaseClient;
  delete globalThis.__examsRelationshipSupabaseClient;

  const modulePath = require.resolve('../utils/supabaseClient');
  delete require.cache[modulePath];

  const originalLoad = require('module')._load;
  let captured = null;

  require('module')._load = function patchedLoad(request, parent, isMain) {
    if (request === '@supabase/supabase-js') {
      return {
        createClient: (url, key) => {
          captured = { url, key };
          return { url, key };
        },
      };
    }

    return originalLoad.apply(this, arguments);
  };

  try {
    const { getSupabaseClient } = require('../utils/supabaseClient');
    const client = getSupabaseClient();

    assert.equal(client.key, 'service-role-key');
    assert.equal(captured.key, 'service-role-key');
  } finally {
    require('module')._load = originalLoad;
    delete require.cache[modulePath];
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    delete globalThis.__examsSupabaseClient;
    delete globalThis.__examsResultSupabaseClient;
    delete globalThis.__examsRelationshipSupabaseClient;
  }
});
