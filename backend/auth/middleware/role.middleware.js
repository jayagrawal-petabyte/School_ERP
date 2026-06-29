"use strict";

const AUTH_MESSAGES = require("../constants/authMessages");


function authorizeRoles(...allowedRoles) {
    if (allowedRoles.length === 0) {
        throw new Error(
            AUTH_MESSAGES.INVALID_ROLE_CONFIGURATION
        );
    }

    return function (req, res, next) {
        const { user } = req;

        if (!user) {
            return res.status(401).json({
                success: false,
                message: AUTH_MESSAGES.UNAUTHORIZED,
            });
        }

        if (
            !allowedRoles.includes(
                String(user.role)
            )
        ) {
            return res.status(403).json({
                success: false,
                message: AUTH_MESSAGES.FORBIDDEN,
            });
        }

        next();
    };
}

module.exports = Object.freeze({
    authorizeRoles,
});