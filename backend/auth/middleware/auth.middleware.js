"use strict";

const { verifyToken } = require("../utils/jwt");
const AUTH_MESSAGES = require("../constants/authMessages");


function authenticateToken(req, res, next) {
    const authorizationHeader = req.get("Authorization");

    if (!authorizationHeader) {
        return res.status(401).json({
            success: false,
            message: AUTH_MESSAGES.TOKEN_REQUIRED,
        });
    }

    const [scheme, token] = authorizationHeader.split(" ");

    if (
        scheme?.toLowerCase() !== "bearer" ||
        !token?.trim()
    ) {
        return res.status(401).json({
            success: false,
            message: AUTH_MESSAGES.INVALID_TOKEN,
        });
    }

    try {
        const decodedToken = verifyToken(token);

        req.user = decodedToken;

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: error.message,
        });
    }
}

module.exports = Object.freeze({
    authenticateToken,
});