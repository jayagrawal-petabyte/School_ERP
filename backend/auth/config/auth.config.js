"use strict";



const AUTH_CONFIG = Object.freeze({

    /* JWT Configuration */
    JWT: {
        SECRET: process.env.JWT_SECRET,
        EXPIRES_IN: process.env.JWT_EXPIRES_IN || "1h",
    },

    /* bcrypt Configuration */
    BCRYPT: {
        SALT_ROUNDS: Number(process.env.BCRYPT_SALT_ROUNDS) || 10,
    },

    /* Account Security */
    ACCOUNT_SECURITY: {
        MAX_FAILED_ATTEMPTS: 5,
        ACCOUNT_LOCK_DURATION_MINUTES: 5,
    },

});

module.exports = AUTH_CONFIG;