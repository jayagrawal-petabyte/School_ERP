"use strict";

const express = require("express");

const authController = require("../controllers/auth.controller");

const {
    loginValidationRules,
    authorizationValidationRules,
    validateRequest,
} = require("../validators/auth.validator");

const {
    authenticateToken,
} = require("../middleware/auth.middleware");

const router = express.Router();

//user login
router.post(
    "/login",
    loginValidationRules,
    validateRequest,
    authController.login
);

//user logout
router.post(
    "/logout",
    authorizationValidationRules,
    validateRequest,
    authenticateToken,
    authController.logout
);


router.get(
    "/me",
    authorizationValidationRules,
    validateRequest,
    authenticateToken,
    authController.getCurrentUser
);

module.exports = Object.freeze(router);