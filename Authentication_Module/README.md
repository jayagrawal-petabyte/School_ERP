# School Management Portal ERP

This project contains the mobile application for the School Management Portal ERP, developed to provide a secure authentication system and role-based access for students, teachers, parents, and administrators.

## Mobile Application (`apps/mobile`)

The mobile application is developed using **React Native (Expo)** and **JavaScript**. 

## Authentication & User Management Module

ASSIGNED TO : Abhinav Singh Bhadauria

This module is responsible for managing user authentication and access control within the School Management Portal ERP application. It ensures that only authorized users can access the application while providing a secure and user-friendly login experience.

The module also handles password recovery, session validation, role-based authentication, and administrator verification.

---

## Features

### User Login
- Login using Email ID or Mobile Number.
- Separate access for Student, Teacher, Parent, and Admin.
- Input validation before authentication.
- Invalid login attempt tracking.
- Temporary account lock after multiple failed login attempts.

### Forgot Password
- Recover account using registered Email or Mobile Number.
- OTP verification before password reset.
- Create a new password after successful verification.

### Multi-Factor Authentication (Admin)
- Additional OTP verification for Administrator accounts.
- Prevents direct dashboard access without completing verification.

### Session Management
- Splash screen checks for an existing user session.
- Automatically redirects logged-in users to the dashboard.
- Redirects new users to the login screen.

### Security
- Password strength validation.
- Input sanitization.
- Email and mobile number validation.
- Secure token storage.
- Session timeout handling.

---

## Screens Included

- Splash Screen
- Login Screen
- Forgot Password
- OTP Verification Screen
- New Password Screen
- Password Success Screen
- Admin MFA Screen
- Dashboard

---

## Folder Structure

```
src
│
├── components
├── constants
├── hooks
├── navigation
├── screens
└── utils
```

---

## Technologies Used

- React Native
- Expo
- JavaScript
- React Navigation

---


## Current Progress

✔ Login Interface

✔ Forgot Password Flow

✔ OTP Verification

✔ Password Reset

✔ Admin MFA

✔ Role-Based Authentication

✔ Session Management

✔ Secure Token Storage

---
## Running the Application

Install the required packages:

```bash
npm install
```

Start the Expo development server:

```bash
npx expo start
```

Run the application using:

- Android Emulator
- iOS Simulator
- Expo Go
- Web Browser

---

