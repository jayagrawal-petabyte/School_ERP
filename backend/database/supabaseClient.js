"use strict";

const { createClient } = require("@supabase/supabase-js");
const DATABASE_CONFIG = require("../config/database.config");

const {
  SUPABASE: { URL, ANON_KEY },
} = DATABASE_CONFIG;

if (!URL) {
  throw new Error("SUPABASE_URL environment variable is not configured.");
}

if (!ANON_KEY) {
  throw new Error("SUPABASE_ANON_KEY environment variable is not configured.");
}

const supabase = createClient(URL, ANON_KEY);

module.exports = supabase;
