"use strict";

const bcrypt = require("bcryptjs");

const AUTH_CONFIG = require("../config/auth.config");
const AUTH_MESSAGES = require("../constants/authMessages");

const {
    BCRYPT: { SALT_ROUNDS },
} = AUTH_CONFIG;


async function hashPassword(plainPassword) {
    if (
        typeof plainPassword !== "string" ||
        !plainPassword.trim()
    ) {
        throw new Error(AUTH_MESSAGES.INVALID_REQUEST);
    }

    return bcrypt.hash(
        plainPassword,
        SALT_ROUNDS
    );
}


async function comparePassword(
    plainPassword,
    hashedPassword
) {
    if (
        typeof plainPassword !== "string" ||
        !plainPassword.trim() ||
        typeof hashedPassword !== "string"
    ) {
        throw new Error(AUTH_MESSAGES.INVALID_REQUEST);
    }

    return bcrypt.compare(
        plainPassword,
        hashedPassword
    );
}

module.exports = Object.freeze({
    hashPassword,
    comparePassword,
});