import { UserRole } from '../types';

const delay = (ms: number = 300) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const LOGIN_CREDENTIALS: Record<
  string,
  {
    userId: string;
    password: string;
    role: UserRole;
  }
> = {
  'sofia.morales@school.edu': {
    userId: '102',
    password: 'sofia1234',
    role: 'student',
  },
  'lucas.henry@school.edu': {
    userId: '101',
    password: 'lucas1234',
    role: 'student',
  },
  'shradha.sen@school.edu': {
    userId: 't1',
    password: 'shradha1234',
    role: 'teacher',
  },
  'rajesh.rawat@school.edu': {
    userId: 't2',
    password: 'rajesh1234',
    role: 'teacher',
  },
  'carlos.morales@gmail.com': {
    userId: 'p1',
    password: 'carlos1234',
    role: 'parent',
  },
  'ravi.sharma@gmail.com': {
    userId: 'p2',
    password: 'ravi1234',
    role: 'parent',
  },
};

const authApi = {
  login: async (
    identifier: string,
    password: string,
    role: string
  ) => {
    await delay();

    const record =
      LOGIN_CREDENTIALS[identifier.toLowerCase().trim()];

    if (!record || record.password !== password) {
      return {
        success: false,
        message: 'Invalid identifier or password',
      };
    }

    if (record.role !== role) {
      return {
        success: false,
        role: record.role,
        message: `This account belongs to ${record.role}`,
      };
    }

    return {
      success: true,
      userId: record.userId,
      role: record.role,
      message: 'Login successful',
    };
  },

  forgotPassword: async (_identifier: string) => {
    await delay();

    return {
      success: true,
      message: 'OTP sent successfully',
    };
  },

  verifyOTP: async (_identifier: string, otp: string) => {
    await delay();

    if (otp === '123456') {
      return {
        success: true,
        message: 'OTP verified',
      };
    }

    return {
      success: false,
      message: 'Invalid OTP',
    };
  },

 resetPassword: async (
  _identifier: string,
  _newPassword: string
) => {
    await delay();

    return {
      success: true,
      message: 'Password reset successfully',
    };
  },

  logout: async () => {
    await delay();

    return {
      success: true,
    };
  },
};

export default authApi;