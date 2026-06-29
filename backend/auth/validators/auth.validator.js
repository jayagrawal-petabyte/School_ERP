"use strict";

const {
    body,
    header,
    validationResult,
} = require("express-validator");

const AUTH_MESSAGES = require("../constants/authMessages");


const loginValidationRules = [
    body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required.")
        .bail()
        .isEmail()
        .withMessage("Please provide a valid email address.")
        .normalizeEmail(),

    body("password")
        .trim()
        .notEmpty()
        .withMessage("Password is required.")
        .bail()
        .isString()
        .withMessage("Password must be a valid string."),
];


const authorizationValidationRules = [
    header("authorization")
        .notEmpty()
        .withMessage(AUTH_MESSAGES.TOKEN_REQUIRED)
        .bail()
        .matches(/^Bearer\s.+$/i)
        .withMessage(AUTH_MESSAGES.INVALID_TOKEN),
];


function validateRequest(req, res, next) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const firstError = errors.array({
            onlyFirstError: true,
        })[0];

        return res.status(400).json({
            success: false,
            message: firstError.msg,
        });
    }

    next();
}

module.exports = Object.freeze({
    loginValidationRules,
    authorizationValidationRules,
    validateRequest,
});