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

### In Progress: Profile & Dashboard Module (Assigned to: Krishna Karanwal)

The Profile & Dashboard module provides the data layer for Student, Teacher, and Parent profiles, role-based dashboard cards, and now connects real login to the Home Dashboard. Dedicated Profile/Settings/Edit Profile screens are pending.

#### Implemented so far:
1. **User & Profile Types (`types/index.ts`)**:
   - `AppUser` type matching the `users` table schema (id, role, full_name, account_status, timestamps).
   - `TeacherProfileView` and `ParentProfileView`, joining teacher-to-classes and parent-to-children relations.
   - `StudentProfileView` scaffolded with a placeholder class join, pending confirmation of the student-class relation in the schema.
   - `DashboardCard` type for role-based dashboard grid items.
2. **Mock Service Layer (`profileApi.ts`)**:
   - `ProfileService.getStudentProfile`, `getTeacherProfile`, `getParentProfile` — return role-specific profile data with related classes/children.
   - `ProfileService.updateFullName` — validates and updates a user's name (mock write, follows Supabase self-edit assumption pending RLS confirmation).
   - `DashboardService.getDashboardCards` — returns dashboard cards filtered by user role.
   - `AuthService.login` — looks up a real sample user by identifier + password instead of a length-only mock check. Sample credentials provided below for Student, Teacher, and Parent roles.
   - Settings intentionally excluded from this layer — handled as local device preferences, not backend-persisted.
3. **Login & Dashboard Integration**:
   - Fixed routing so Parent logins land on the real Home Dashboard instead of the old placeholder screen (previously only Student/Teacher did).
   - Removed the manual role-switcher toggle when arriving via real login — dashboard now locks to the actual logged-in role. Toggle still available for dev/testing when Home is opened directly.
   - Added a **My Account** section (My Profile, Settings cards) sourced live from `DashboardService`.
   - Dashboard greeting name now pulled from `ProfileService` using the logged-in user's real profile.

#### Test credentials:
| Role | Email | Password |
|---|---|---|
| Student | sofia.morales@school.edu | sofia1234 |
| Student | lucas.henry@school.edu | lucas1234 |
| Teacher | shradha.sen@school.edu | shradha1234 |
| Teacher | rajesh.rawat@school.edu | rajesh1234 |
| Parent | carlos.morales@gmail.com | carlos1234 |
| Parent | ravi.sharma@gmail.com | ravi1234 |

#### Pending:
- Student, Teacher, Parent Profile screens, Settings screen, Edit Profile screen.
- Confirm student-class relation in schema.

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
