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



Provides authorization roles division (Teacher vs Student) and a student leave application workflow.

#### Features Implemented:
1. **Interactive Role Switcher (`HomeScreen.tsx`)**:
   - Added a segment tab switcher at the top of the Home Dashboard to toggle between **Teacher Panel** and **Student Panel**.
   - Greeting text and name dynamically adjusts (e.g. Mrs. Shradha Sen for Teacher, Sofia Morales for Student).
2. **Role-Based Navigation Routing**:
   - **Teacher Panel**: Tapping "Attendance" navigates to the class listing dashboard to manage or mark logs.
   - **Student Panel**: Tapping "Attendance" navigates directly to a locked monthly calendar view of that student's own attendance, preventing search modifications.
   - **Academics Grid**: Grid items render dynamically based on role (showing "Apply Leave" for students, and hiding it for teachers).
3. **Leave Requests Screen (`LeaveRequestScreen.tsx`)**:
   - Form to select Leave Type (Sick, Casual, Family Event, Other), fill date ranges, and input explanation reason.
   - History logs tab displaying previous requests, dates, and color-coded status badges (Approved in Green, Pending in Amber, Rejected in Red).
4. **Mock API Integration (`api.ts`)**:
   - Exposed `submitLeaveRequest` and `getLeaveRequests` client actions to manipulate the mock database locally.

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

### Completed Module: Profile & Dashboard Module (Assigned to: Krishna Karanwal)

The Profile & Dashboard module provides Student, Teacher, and Parent profile screens, Edit Profile, Settings, role-based dashboard cards, and connects real login to the Home Dashboard.

#### Features Implemented:
1. **User & Profile Types (`types/index.ts`)**:
   - `AppUser` type matching the `users` table schema (id, role, full_name, account_status, timestamps).
   - `TeacherProfileView` and `ParentProfileView`, joining teacher-to-classes and parent-to-children relations.
   - `StudentProfileView` scaffolded with a placeholder class join, pending confirmation of the student-class relation in the schema.
   - `DashboardCard` type for role-based dashboard grid items.
2. **Service Layer (`profileApi.ts`)**:
   - `ProfileService.getStudentProfile`, `getTeacherProfile`, `getParentProfile`, `updateFullName` — profile read/write per role.
   - `DashboardService.getDashboardCards` — dashboard cards filtered by user role.
   - `AuthService.login` — looks up a real sample user by identifier + password. Sample credentials below.
3. **Profile Screens (`StudentProfileScreen.tsx`, `TeacherProfileScreen.tsx`, `ParentProfileScreen.tsx`)**:
   - Unified header design across all three roles, account details, status, class/children info.
   - Parent Profile links to each child's own Student Profile.
4. **Edit Profile (`EditProfileScreen.tsx`)**: Shared across all three roles, saves through `ProfileService`.
5. **Settings (`SettingsScreen.tsx`)**: Notification and email alert toggles with save confirmation. Local device preferences only — no backend table for this.
6. **Login & Dashboard Integration**:
   - All three roles route to the real Home Dashboard on login; role-switcher toggle only shows in dev mode (no login).
   - Dashboard search bar filters Academics and My Account cards live.
   - Dashboard greeting name loads from `ProfileService`, with a loading skeleton instead of a flicker.

#### Test credentials:
| Role | Email | Password |
|---|---|---|
| Student | sofia.morales@school.edu | sofia1234 |
| Student | lucas.henry@school.edu | lucas1234 |
| Teacher | shradha.sen@school.edu | shradha1234 |
| Teacher | rajesh.rawat@school.edu | rajesh1234 |
| Parent | carlos.morales@gmail.com | carlos1234 |
| Parent | ravi.sharma@gmail.com | ravi1234 |

#### Known gaps:
- Student-class relation not yet confirmed in schema — `StudentProfileView.classes` is currently empty.
- Settings preferences reset on app restart (no persistent storage wired up).

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
