"use strict";

const AUTH_MESSAGES = require("../constants/authMessages");


async function login(req, res) {
    return res.status(501).json({
        success: false,
        message: "Login service is under development.",
    });
}


async function logout(req, res) {
    return res.status(501).json({
        success: false,
        message: "Logout service is under development.",
    });
}


async function getCurrentUser(req, res) {
    return res.status(501).json({
        success: false,
        message: "User profile service is under development.",
    });
}

module.exports = Object.freeze({
    login,
    logout,
    getCurrentUser,
});