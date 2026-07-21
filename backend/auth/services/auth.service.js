"use strict";

const { createClient } = require("@supabase/supabase-js");

const DATABASE_CONFIG = require("../../config/database.config");
const AUTH_MESSAGES = require("../constants/authMessages");

const {
    SUPABASE: {
        URL,
        ANON_KEY,
    },
} = DATABASE_CONFIG;


const supabase = createClient(
    URL,
    ANON_KEY
);

const FAILED_ATTEMPTS = new Map();
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes lockout
const MAX_TRACKED_EMAILS = 10000; // Memory cap to prevent DoS via email enumeration

function checkRateLimit(email) {
    const key = String(email || '').toLowerCase().trim();
    if (!key) return;

    const record = FAILED_ATTEMPTS.get(key);
    if (!record) return;

    if (Date.now() > record.resetAt) {
        FAILED_ATTEMPTS.delete(key);
        return;
    }

    if (record.count >= MAX_FAILED_ATTEMPTS) {
        const error = new Error(
            "Too many failed login attempts. Account temporarily locked. Please try again after 15 minutes."
        );
        error.statusCode = 429;
        throw error;
    }
}

function recordFailedAttempt(email) {
    const key = String(email || '').toLowerCase().trim();
    if (!key) return;

    const now = Date.now();
    const record = FAILED_ATTEMPTS.get(key);

    if (!record || now > record.resetAt) {
        // Before adding a new entry, enforce memory cap
        if (!FAILED_ATTEMPTS.has(key) && FAILED_ATTEMPTS.size >= MAX_TRACKED_EMAILS) {
            // Opportunistic cleanup: purge expired entries first
            for (const [k, v] of FAILED_ATTEMPTS.entries()) {
                if (now > v.resetAt) {
                    FAILED_ATTEMPTS.delete(k);
                }
            }
            // If still at cap, evict the oldest entry (first inserted)
            if (FAILED_ATTEMPTS.size >= MAX_TRACKED_EMAILS) {
                const oldestKey = FAILED_ATTEMPTS.keys().next().value;
                FAILED_ATTEMPTS.delete(oldestKey);
            }
        }
        FAILED_ATTEMPTS.set(key, { count: 1, resetAt: now + LOCKOUT_MS });
    } else {
        record.count += 1;
    }
}

function clearFailedAttempts(email) {
    const key = String(email || '').toLowerCase().trim();
    if (!key) return;
    FAILED_ATTEMPTS.delete(key);
}

/**
 * Handle user login.
 */
async function login(credentials) {
    if (!credentials) {
        const error = new Error(
            AUTH_MESSAGES.INVALID_REQUEST
        );

        error.statusCode = 400;

        throw error;
    }

    const {
        email,
        password,
    } = credentials;

    if (!email) {
        const error = new Error(
            AUTH_MESSAGES.EMAIL_REQUIRED
        );

        error.statusCode = 400;

        throw error;
    }

    if (!password) {
        const error = new Error(
            AUTH_MESSAGES.PASSWORD_REQUIRED
        );

        error.statusCode = 400;

        throw error;
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    checkRateLimit(normalizedEmail);

    const {
        data,
        error,
    } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
    });

    if (error) {
        recordFailedAttempt(normalizedEmail);
        error.statusCode = error.status || 401;
        throw error;
    }

    clearFailedAttempts(normalizedEmail);

    return {
        message: AUTH_MESSAGES.LOGIN_SUCCESS,
        user: data.user,
        accessToken: data.session?.access_token,
        refreshToken: data.session?.refresh_token,
    };
}

/**
 * Handle user logout.
 */
async function logout(user) {
    if (!user) {
        const error = new Error(
            AUTH_MESSAGES.UNAUTHORIZED
        );

        error.statusCode = 401;

        throw error;
    }

    return {
        message: AUTH_MESSAGES.LOGOUT_SUCCESS,
    };
}

/**
 * Get authenticated user.
 */
async function getCurrentUser(user) {
    if (!user) {
        const error = new Error(
            AUTH_MESSAGES.UNAUTHORIZED
        );

        error.statusCode = 401;

        throw error;
    }

    return user;
}

module.exports = Object.freeze({
    login,
    logout,
    getCurrentUser,
});