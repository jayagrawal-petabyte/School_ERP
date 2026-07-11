"use strict";

const {
    getClientForUser,
} = require("../../services/database.service");

const AUTH_MESSAGES = require("../constants/authMessages");

async function authenticateToken(req, res, next) {
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
        const supabase = getClientForUser(token);

        const {
            data,
            error,
        } = await supabase.auth.getUser(token);

        if (error || !data?.user) {
            return res.status(401).json({
                success: false,
                message: AUTH_MESSAGES.INVALID_TOKEN,
            });
        }

        req.user = data.user;
        req.token = token;

        return next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message:
                error.message ||
                AUTH_MESSAGES.INVALID_TOKEN,
        });
    }
}

module.exports = Object.freeze({
    authenticateToken,
});