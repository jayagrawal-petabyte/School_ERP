# School Management Portal ERP

This repository contains the School Management Portal ERP application, featuring a monorepo structure with backend services, web frontend, and mobile clients.

---

## Mobile Application (`apps/mobile`)

The mobile application is built using **React Native (Expo SDK 56)** and **TypeScript**. It is located in the `apps/mobile/` directory.

### Completed Module: Attendance Module

The Attendance Module provides features for teachers to manage student daily attendance, view historic logs, and analyze attendance rates.

#### Features Implemented:
1. **Attendance Dashboard (`AttendanceListScreen.tsx`)**:
   - Lists registered classes with real-time student counts.
   - Provides shortcuts to mark attendance, view history, or view reports.
2. **Mark Attendance (`MarkAttendanceScreen.tsx`)**:
   - Color-coded status selectors for Present (**P**), Late (**L**), Absent (**A**), and Early Off (**E**).
   - **Mark All Present** shortcut for fast submission.
   - Real-time tally board calculating marked vs unmarked rosters.
   - Live roster search by name or roll number.
3. **Attendance History (`AttendanceHistoryScreen.tsx`)**:
   - **Class Logs Mode**: Shows a chronological list of dates. Tapping any date card expands it inline to show the roster of **all students** and their marked statuses.
   - **Student Calendar Mode**: Type a student's name (e.g. "Lucas Henry") in the search bar and click Search to switch to a visual monthly grid calendar displaying that student's color-coded attendance indicators.
4. **Attendance Reports (`AttendanceReportsScreen.tsx`)**:
   - Display class average attendance rate inside a styled card.
   - Custom graphical breakdown bars showing the distribution rates.
   - **Critical Attendance Warnings** flagging students whose attendance rate drops below 75%.
   - Student leaderboard sorted by attendance percentage.
5. **Mock Service API Layer (`api.ts`)**:
   - Built a simulated async service layer with mock database.
   - Pre-loaded with static attendance history data (including Lucas Henry's mock calendar logs for May 2023 matching design specs) for instant local testing.

---

### How to Run Locally

1. Navigate to the mobile app directory:
   ```bash
   cd apps/mobile
   ```

2. Start the Expo bundler:
   ```bash
   npm run start
   ```

3. Open on target device:
   - **Android Emulator**: Press `a` in your terminal.
   - **iOS Simulator**: Press `i` in your terminal.
   - **Physical Device**: Download **Expo Go** app and scan the terminal QR code.
   - **Web Browser**: Press `w` in your terminal.
