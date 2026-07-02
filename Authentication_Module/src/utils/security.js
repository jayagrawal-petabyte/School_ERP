import { SECURITY } from '../constants';

export const sanitizeInput = (input = '') => {
  return input
    .replace(/[<>'"`;]/g, '')          
    .replace(/(\b)(on\S+)(\s*)=/gi, '') 
    .replace(/(javascript|vbscript):/gi, '') 
    .replace(/--/g, '')                
    .replace(/\/\*/g, '')              
    .trim();
};

export const isValidEmail = (email = '') => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(sanitizeInput(email));
};


export const isValidPhone = (phone = '') => {
  const cleaned = phone.replace(/\D/g, '');
  return /^[6-9]\d{9}$/.test(cleaned); 
};


export const isValidIdentifier = (value = '') => {
  return isValidEmail(value) || isValidPhone(value);
};


export const getPasswordStrength = (password = '') => {
  let score = 0;
  if (password.length >= SECURITY.MIN_PASSWORD_LENGTH) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const map = [
    { label: '',       color: '#E2E8F0', width: '0%' },
    { label: 'Weak',   color: '#EF4444', width: '25%' },
    { label: 'Fair',   color: '#F59E0B', width: '50%' },
    { label: 'Good',   color: '#4F46E5', width: '75%' },
    { label: 'Strong', color: '#10B981', width: '100%' },
  ];
  return map[score];
};


export const validatePassword = (password = '') => {
  const errors = [];
  if (password.length < SECURITY.MIN_PASSWORD_LENGTH)
    errors.push(`At least ${SECURITY.MIN_PASSWORD_LENGTH} characters`);
  if (!/[A-Z]/.test(password))
    errors.push('At least one uppercase letter');
  if (!/[0-9]/.test(password))
    errors.push('At least one number');
  if (!/[^A-Za-z0-9]/.test(password))
    errors.push('At least one special character');
  return errors;
};


const loginAttempts = {};

export const recordFailedAttempt = (identifier) => {
  const key = identifier.toLowerCase();
  if (!loginAttempts[key]) {
    loginAttempts[key] = { count: 0, lockedUntil: null };
  }
  loginAttempts[key].count += 1;
  if (loginAttempts[key].count >= SECURITY.MAX_LOGIN_ATTEMPTS) {
    loginAttempts[key].lockedUntil = Date.now() + SECURITY.LOCKOUT_DURATION_MS;
  }
};

export const isAccountLocked = (identifier) => {
  const key = identifier.toLowerCase();
  const record = loginAttempts[key];
  if (!record) return false;
  if (record.lockedUntil && Date.now() < record.lockedUntil) return true;
  if (record.lockedUntil && Date.now() >= record.lockedUntil) {
    loginAttempts[key] = { count: 0, lockedUntil: null };
    return false;
  }
  return false;
};

export const getRemainingLockoutTime = (identifier) => {
  const key = identifier.toLowerCase();
  const record = loginAttempts[key];
  if (!record || !record.lockedUntil) return 0;
  const remaining = record.lockedUntil - Date.now();
  return remaining > 0 ? Math.ceil(remaining / 1000) : 0;
};

export const resetLoginAttempts = (identifier) => {
  const key = identifier.toLowerCase();
  loginAttempts[key] = { count: 0, lockedUntil: null };
};

export const getRemainingAttempts = (identifier) => {
  const key = identifier.toLowerCase();
  const record = loginAttempts[key];
  if (!record) return SECURITY.MAX_LOGIN_ATTEMPTS;
  return Math.max(0, SECURITY.MAX_LOGIN_ATTEMPTS - record.count);
};

export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};


const tokenStore = {};

export const storeToken = async (key, value) => {
  
  tokenStore[key] = value;
};

export const getToken = async (key) => {
 
  return tokenStore[key] || null;
};

export const removeToken = async (key) => {

  delete tokenStore[key];
};

export const clearAllTokens = async () => {
  Object.keys(tokenStore).forEach((k) => delete tokenStore[k]);
};
