"use strict";

const jwt = require("jsonwebtoken");

const AUTH_CONFIG = require("../config/auth.config");
const AUTH_MESSAGES = require("../constants/authMessages");

const {
    JWT: { SECRET, EXPIRES_IN },
} = AUTH_CONFIG;


function generateToken(payload) {
    if (
    !payload ||
    typeof payload !== "object" ||
    !String(payload.id).trim() ||
    !String(payload.email).trim() ||
    !String(payload.role).trim()
)   {
        throw new Error(AUTH_MESSAGES.INVALID_REQUEST);
    }

    return jwt.sign(
        {
            id: payload.id,
            email: payload.email,
            role: payload.role,
        },
        SECRET,
        {
            expiresIn: EXPIRES_IN,
        }
    );
}


function verifyToken(token) {
    if (
        typeof token !== "string" ||
        !token.trim()
    ) {
        throw new Error(AUTH_MESSAGES.TOKEN_REQUIRED);
    }

    try {
        return jwt.verify(token, SECRET);
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            throw new Error(AUTH_MESSAGES.TOKEN_EXPIRED);
        }

        throw new Error(AUTH_MESSAGES.INVALID_TOKEN);
    }
}


function decodeToken(token) {
    if (
        typeof token !== "string" ||
        !token.trim()
    ) {
        return null;
    }

    return jwt.decode(token);
}

module.exports = Object.freeze({
    generateToken,
    verifyToken,
    decodeToken,
});