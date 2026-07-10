import { AppUser, StudentProfileView, TeacherProfileView, ParentProfileView, DashboardCard, UserRole } from '../types';
import { API_CONFIG, getAuthHeaders } from '../config/apiConfig';

// Normalize backend camelCase fields → snake_case fields expected by the UI
const mapUser = (raw: any): AppUser => ({
  id: raw.id,
  role: raw.role,
  full_name: raw.fullName || raw.full_name || '',
  account_status: raw.accountStatus || raw.account_status || 'active',
  failed_login_attempts: raw.failedLoginAttempts ?? raw.failed_login_attempts ?? 0,
  account_locked_until: raw.accountLockedUntil ?? raw.account_locked_until ?? null,
  last_login_at: raw.lastLoginAt || raw.last_login_at || null,
  created_at: raw.createdAt || raw.created_at || '',
  updated_at: raw.updatedAt || raw.updated_at || '',
});

const DASHBOARD_CARDS: DashboardCard[] = [
  { id: 'd1', title: 'My Profile', emoji: '👤', color: '#EFF6FF', route: 'StudentProfile', forRole: ['student'] },
  { id: 'd2', title: 'My Profile', emoji: '👤', color: '#EFF6FF', route: 'TeacherProfile', forRole: ['teacher'] },
  { id: 'd3', title: 'My Profile', emoji: '👤', color: '#EFF6FF', route: 'ParentProfile', forRole: ['parent'] },
  { id: 'd4', title: 'Settings', emoji: '⚙️', color: '#F3F4F6', route: 'Settings', forRole: ['student', 'teacher', 'parent'] },
];

export const ProfileService = {
  getStudentProfile: async (studentId: string): Promise<StudentProfileView | null> => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/users/students/${studentId}`, { method: 'GET', headers });
      const raw = response.ok
        ? (await response.json()).data
        : (await (await fetch(`${API_CONFIG.BASE_URL}/api/users/${studentId}`, { method: 'GET', headers })).json()).data;
      if (!raw) return null;
      return { ...mapUser(raw), classes: raw.classes || [] } as StudentProfileView;
    } catch (error) {
      console.error('Error fetching student profile:', error);
      return null;
    }
  },

  getTeacherProfile: async (teacherId: string): Promise<TeacherProfileView | null> => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/users/teachers/${teacherId}`, { method: 'GET', headers });
      const raw = response.ok
        ? (await response.json()).data
        : (await (await fetch(`${API_CONFIG.BASE_URL}/api/users/${teacherId}`, { method: 'GET', headers })).json()).data;
      if (!raw) return null;
      return { ...mapUser(raw), classes: raw.classes || [] } as TeacherProfileView;
    } catch (error) {
      console.error('Error fetching teacher profile:', error);
      return null;
    }
  },

  getParentProfile: async (parentId: string): Promise<ParentProfileView | null> => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/users/parents/${parentId}`, { method: 'GET', headers });
      const raw = response.ok
        ? (await response.json()).data
        : (await (await fetch(`${API_CONFIG.BASE_URL}/api/users/${parentId}`, { method: 'GET', headers })).json()).data;
      if (!raw) return null;
      return { ...mapUser(raw), children: raw.children || [] } as ParentProfileView;
    } catch (error) {
      console.error('Error fetching parent profile:', error);
      return null;
    }
  },

  updateFullName: async (
    userId: string,
    fullName: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/users/${userId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ fullName }),
      });
      if (!response.ok) return { success: false, message: 'Failed to update profile' };
      return { success: true, message: 'Profile updated successfully' };
    } catch (error: any) {
      console.error('Error updating profile:', error);
      return { success: false, message: error.message || 'Error occurred.' };
    }
  },
};

export const DashboardService = {
  getDashboardCards: async (role: UserRole): Promise<DashboardCard[]> => {
    return DASHBOARD_CARDS.filter((card) => card.forRole.includes(role));
  },
};

export const DEMO_USER_ID_BY_ROLE: Record<'student' | 'teacher' | 'parent', string> = {
  student: '102',
  teacher: 't1',
  parent: 'p1',
};

