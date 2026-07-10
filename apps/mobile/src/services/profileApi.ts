import { AppUser, ClassRecord, StudentProfileView, TeacherProfileView, ParentProfileView, DashboardCard, UserRole } from '../types';

const delay = (ms: number = 300) => new Promise((resolve) => setTimeout(resolve, ms));

const USERS: Record<string, AppUser> = {
  '101': mkUser('101', 'student', 'Lucas Henry'),
  '102': mkUser('102', 'student', 'Sofia Morales'),
  '103': mkUser('103', 'student', 'Henry Conaway'),
  '104': mkUser('104', 'student', 'Daniel Rowell'),
  '105': mkUser('105', 'student', 'Aarav Sharma'),
  '106': mkUser('106', 'student', 'Ananya Iyer'),

  '201': mkUser('201', 'student', 'Aditya Das'),
  '202': mkUser('202', 'student', 'Bhavna Roy'),

  't1': mkUser('t1', 'teacher', 'Mrs. Shradha Sen'),
  't2': mkUser('t2', 'teacher', 'Mr. Rajesh Rawat'),
  't3': mkUser('t3', 'teacher', 'Mrs. Priya Sharma'),

  'p1': mkUser('p1', 'parent', 'Mr. Carlos Morales'),
  'p2': mkUser('p2', 'parent', 'Mr. Ravi Sharma'),
};

function mkUser(id: string, role: UserRole, full_name: string): AppUser {
  return {
    id,
    role,
    full_name,
    account_status: 'active',
    failed_login_attempts: 0,
    account_locked_until: null,
    last_login_at: '2026-07-02T08:00:00Z',
    created_at: '2025-06-01T00:00:00Z',
    updated_at: '2025-06-01T00:00:00Z',
  };
}

const CLASSES: Record<string, ClassRecord> = {
  'c1': { id: 'c1', class_name: 'Standard - 8', section: 'C', created_at: '2025-06-01T00:00:00Z' },
  'c2': { id: 'c2', class_name: 'Standard - 10', section: 'B', created_at: '2025-06-01T00:00:00Z' },
};

const CLASS_TEACHERS = [
  { id: 'ct1', teacher_id: 't1', class_id: 'c1', created_at: '2025-06-01T00:00:00Z' },
  { id: 'ct2', teacher_id: 't3', class_id: 'c1', created_at: '2025-06-01T00:00:00Z' },
  { id: 'ct3', teacher_id: 't2', class_id: 'c2', created_at: '2025-06-01T00:00:00Z' },
];

const PARENT_STUDENTS = [
  { id: 'ps1', parent_id: 'p1', student_id: '102', created_at: '2025-06-01T00:00:00Z' },
  { id: 'ps2', parent_id: 'p2', student_id: '105', created_at: '2025-06-01T00:00:00Z' },
  { id: 'ps3', parent_id: 'p1', student_id: '103', created_at: '2025-06-01T00:00:00Z' },
];

const DASHBOARD_CARDS: DashboardCard[] = [
  { id: 'd1', title: 'My Profile', emoji: '👤', color: '#EFF6FF', route: 'StudentProfile', forRole: ['student'] },
  { id: 'd2', title: 'My Profile', emoji: '👤', color: '#EFF6FF', route: 'TeacherProfile', forRole: ['teacher'] },
  { id: 'd3', title: 'My Profile', emoji: '👤', color: '#EFF6FF', route: 'ParentProfile', forRole: ['parent'] },
  { id: 'd4', title: 'Settings', emoji: '⚙️', color: '#F3F4F6', route: 'Settings', forRole: ['student', 'teacher', 'parent'] },
];

export const ProfileService = {
  getStudentProfile: async (studentId: string): Promise<StudentProfileView | null> => {
    await delay(200);
    const user = USERS[studentId];
    if (!user || user.role !== 'student') return null;

    // TODO: no student→class table in schema doc — confirm the real join,
    // returning empty for now so the UI can still render a placeholder
    return { ...user, classes: [] };
  },

  getTeacherProfile: async (teacherId: string): Promise<TeacherProfileView | null> => {
    await delay(200);
    const user = USERS[teacherId];
    if (!user || user.role !== 'teacher') return null;

    const classIds = CLASS_TEACHERS.filter((row) => row.teacher_id === teacherId).map((row) => row.class_id);
    const classes = classIds.map((id) => CLASSES[id]).filter(Boolean);

    return { ...user, classes };
  },

  getParentProfile: async (parentId: string): Promise<ParentProfileView | null> => {
    await delay(200);
    const user = USERS[parentId];
    if (!user || user.role !== 'parent') return null;

    const childIds = PARENT_STUDENTS.filter((row) => row.parent_id === parentId).map((row) => row.student_id);
    const children = childIds.map((id) => USERS[id]).filter(Boolean);

    return { ...user, children };
  },

  updateFullName: async (
    userId: string,
    fullName: string
  ): Promise<{ success: boolean; message: string }> => {
    await delay(300);
    const user = USERS[userId];
    if (!user) {
      return { success: false, message: 'User not found' };
    }
    if (user.account_status !== 'active') {
      return { success: false, message: 'Account is inactive' };
    }
    const trimmed = fullName.trim();
    if (trimmed.length === 0 || trimmed.length > 100) {
      return { success: false, message: 'Name must be between 1 and 100 characters' };
    }

    user.full_name = trimmed;
    user.updated_at = new Date().toISOString();
    return { success: true, message: 'Profile updated successfully' };
  },
};

export const DashboardService = {
  getDashboardCards: async (role: UserRole): Promise<DashboardCard[]> => {
    await delay(150);
    return DASHBOARD_CARDS.filter((card) => card.forRole.includes(role));
  },
};

export const DEMO_USER_ID_BY_ROLE: Record<'student' | 'teacher' | 'parent', string> = {
  student: '102',
  teacher: 't1',
  parent: 'p1',
};

