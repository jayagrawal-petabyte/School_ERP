
export const ROLES = [
  {
    key: 'student',
    label: 'Student',
    icon: '🎓',
    accent: '#4F46E5',
    sub: 'Access your student dashboard',
    requiresMFA: false,
  },
  {
    key: 'teacher',
    label: 'Teacher',
    icon: '📚',
    accent: '#10B981',
    sub: 'Access your teacher dashboard',
    requiresMFA: false,
  },
  {
    key: 'parent',
    label: 'Parent',
    icon: '👪',
    accent: '#F59E0B',
    sub: "Track your child's progress",
    requiresMFA: false,
  },
  {
    key: 'admin',
    label: 'Admin',
    icon: '🛡️',
    accent: '#EF4444',
    sub: 'Admin portal — authorised access only',
    requiresMFA: true, 
  },
];

export const SCREEN = {
  LOGIN: 'LOGIN',
  FORGOT: 'FORGOT',
  OTP: 'OTP',
  NEW_PASSWORD: 'NEW_PASSWORD',
  SUCCESS: 'SUCCESS',
};

export const COLORS = {
  background: '#F8FAFC',
  surface: '#FFFFFF',
  border: '#CBD5E1',
  borderLight: '#E2E8F0',
  textPrimary: '#1A2340',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  error: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
  tabBg: '#E8EDF5',
};

export const SECURITY = {
  MAX_LOGIN_ATTEMPTS: 5,       
  LOCKOUT_DURATION_MS: 300000,
  SESSION_TIMEOUT_MS: 1800000, 
  OTP_EXPIRY_SECONDS: 300,     
  MIN_PASSWORD_LENGTH: 8,
  OTP_RESEND_COOLDOWN: 45,    
};
