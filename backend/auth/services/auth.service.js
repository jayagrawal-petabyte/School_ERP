"use strict";

//Handle login user
async function login(credentials) {
    throw new Error("Login service is under development.");
}

//Handle logout user
async function logout(user) {
    throw new Error("Logout service is under development.");
}


async function getCurrentUser(userId) {
    throw new Error("User profile service is under development.");
}

module.exports = Object.freeze({
    login,
    logout,
    getCurrentUser,
});