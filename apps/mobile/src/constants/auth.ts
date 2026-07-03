export interface Role {
  key: string;
  label: string;
  icon: string;
  accent: string;
  sub: string;
  requiresMFA: boolean;
}

export const ROLES: Role[] = [
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
} as const;

export interface SecurityConfig {
  MAX_LOGIN_ATTEMPTS: number;
  LOCKOUT_DURATION_MS: number;
  SESSION_TIMEOUT_MS: number;
  OTP_EXPIRY_SECONDS: number;
  MIN_PASSWORD_LENGTH: number;
  OTP_RESEND_COOLDOWN: number;
}

export const SECURITY: SecurityConfig = {
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION_MS: 300000,
  SESSION_TIMEOUT_MS: 1800000,
  OTP_EXPIRY_SECONDS: 300,
  MIN_PASSWORD_LENGTH: 8,
  OTP_RESEND_COOLDOWN: 45,
};