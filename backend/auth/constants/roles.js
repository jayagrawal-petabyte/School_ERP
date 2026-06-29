

"use strict";


  /**Object.freeze() prevents accidental modification at runtime.*/
 
const ROLES = Object.freeze({
    ADMIN: "Admin",
    TEACHER: "Teacher",
    STUDENT: "Student",
    PARENT: "Parent",
});

module.exports = ROLES;