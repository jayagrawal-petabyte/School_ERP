# School Management Portal ERP

This repository contains the School Management Portal ERP application, featuring a monorepo structure with backend services, web frontend, and mobile clients.

---

## Mobile Application (`apps/mobile`)

The mobile application is built using **React Native (Expo SDK 56)** and **TypeScript**. It is located in the `apps/mobile/` directory.

### Completed Module: Attendance Module (Assigned to: Durgesh Narayan Nayak)

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

---

### Completed Module: Assignments Module (Assigned to: Stuti)

The Assignments Module provides student task-tracking and submission features.

#### Features Implemented:
1. **Central Dashboard Integration (`HomeScreen.tsx`)**:
   - Implemented the central hub view with profile greetings, search, and Academics grid.
   - Integrated plug-and-play triggers for Attendance and Assignments modules.
2. **Assignment List (`AssignmentListScreen.tsx`)**:
   - Lists assignments with category filtering tabs (**All**, **Pending**, **Submitted**, **Graded**).
   - Search bar for quick filtering.
   - Displays due dates and grades.
3. **Assignment Details (`AssignmentDetailsScreen.tsx`)**:
   - Shows teacher name, due dates, description guidelines, and reference files.
   - Renders visual submission receipts and graded evaluation cards (score and teacher feedback) for completed assignments.
4. **Submit Assignment (`SubmitAssignmentScreen.tsx`)**:
   - Interactive remarks input box.
   - Simulated network file upload interface featuring an animated upload progress bar (0% to 100%).
   - Validation checks and successful submit alerts that auto-refresh the parent views.

---

### Service API Layer (`api.ts`)
- Configured a simulated network client database with simulated delay.
- Pre-loaded with static attendance history (including May 2023 logs) and assignment mock states (algebra, physics reports, chemistry mechanisms) for instant offline testing.

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
